import { CoinPretty, Dec, DecUtils, RatePretty } from "@keplr-wallet/unit";
import {
  Bridge,
  BridgeAsset,
  BridgeChain,
  GetTransferStatusParams,
} from "@osmosis-labs/bridge";
import { BridgeTransactionDirection } from "@osmosis-labs/types";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce, useUnmount } from "react-use";

import { useTranslation } from "~/hooks/language";
import { useStore } from "~/stores";
import { api, RouterInputs } from "~/utils/trpc";

export const useBridgeQuote = ({
  direction,

  inputAmount: inputAmountRaw,

  sourceAddress,
  sourceChain,
  sourceAsset,

  destinationAddress,
  destinationAsset,
  destinationChain,

  bridges = ["Axelar", "Skip", "Squid", "IBC"],
}: {
  direction: BridgeTransactionDirection;

  inputAmount: string;

  sourceAsset: BridgeAsset & { amount: CoinPretty };
  sourceChain: BridgeChain;
  sourceAddress: string;

  destinationAsset: BridgeAsset;
  destinationChain: BridgeChain;
  destinationAddress: string;

  bridges?: Bridge[];
}) => {
  const { transferHistoryStore } = useStore();
  const { t } = useTranslation();

  // In the context of Osmosis, this refers to the Osmosis chain.
  const destinationPath = {
    address: destinationAddress,
    asset: destinationAsset,
    chain: destinationChain,
  };

  const counterpartyPath = {
    address: sourceAddress,
    asset: sourceAsset,
    chain: sourceChain,
  };

  const isDeposit = direction === "deposit";
  const isWithdraw = direction === "withdraw";

  const quoteParams: Omit<
    RouterInputs["bridgeTransfer"]["getQuoteByBridge"],
    "bridge" | "fromAmount"
  > = {
    fromAddress: isDeposit ? counterpartyPath.address : destinationPath.address,
    fromAsset: isDeposit ? counterpartyPath.asset : destinationPath.asset,
    fromChain: isDeposit ? counterpartyPath.chain : destinationPath.chain,
    toAddress: isDeposit ? destinationPath.address : counterpartyPath.address,
    toAsset: isDeposit ? destinationPath.asset : counterpartyPath.asset,
    toChain: isDeposit ? destinationPath.chain : counterpartyPath.chain,
  };

  const [selectedBridgeProvider, setSelectedBridgeProvider] =
    useState<Bridge | null>(null);
  const [isBridgeProviderControlledMode, setBridgeProviderControlledMode] =
    useState(false);

  // Input
  const [debouncedInputValue, setDebouncedInputValue] =
    useState(inputAmountRaw);
  useDebounce(
    () => {
      setDebouncedInputValue(inputAmountRaw);
      // Every time the input amount changes, deactivate the controlled mode.
      // Best quotes will be selected automatically.
      setBridgeProviderControlledMode(false);
    },
    300,
    [inputAmountRaw]
  );
  const inputAmount = new Dec(
    debouncedInputValue === "" ? "0" : debouncedInputValue
  ).mul(
    // CoinPretty only accepts whole amounts
    DecUtils.getTenExponentNInPrecisionRange(destinationAsset.decimals)
  );

  const quoteResults = api.useQueries((t) =>
    bridges.map((bridge) =>
      t.bridgeTransfer.getQuoteByBridge(
        {
          ...quoteParams,
          bridge,
          fromAmount: inputAmount.truncate().toString(),
        },
        {
          enabled:
            inputAmount.gt(new Dec(0)) && counterpartyPath.address !== "",
          staleTime: 5_000,
          cacheTime: 5_000,
          // Disable retries, as useQueries
          // will block successful quotes from being returned
          // if failed quotes are being returned
          // until retry starts returning false.
          // This causes slow UX even though there's a
          // quote that the user can use.
          retry: false,

          refetchInterval: 30 * 1000, // 30 seconds

          select: ({ quote }) => {
            const {
              estimatedGasFee,
              transferFee,
              estimatedTime,
              expectedOutput,
              transactionRequest,
              provider,
              fromChain,
              toChain,
              input,
            } = quote;

            const priceImpact = new RatePretty(
              new Dec(expectedOutput.priceImpact)
            );
            const expectedOutputFiatDec = expectedOutput.fiatValue.toDec();
            const inputFiatDec = input.fiatValue.toDec();

            let transferSlippage: Dec;
            if (expectedOutputFiatDec.gt(inputFiatDec)) {
              // if expected output is greater than input, assume slippage is 0%
              transferSlippage = new Dec(0);
            } else if (expectedOutputFiatDec.lt(new Dec(0))) {
              // if expected output is negative, assume slippage is 100%
              transferSlippage = new Dec(1);
            } else {
              transferSlippage = new Dec(1).sub(
                expectedOutputFiatDec.quo(inputFiatDec)
              );
            }

            return {
              gasCost: estimatedGasFee
                ? new CoinPretty(
                    {
                      coinDecimals: estimatedGasFee.decimals,
                      coinDenom: estimatedGasFee.denom,
                      coinMinimalDenom: estimatedGasFee.sourceDenom,
                    },
                    new Dec(estimatedGasFee.amount)
                  ).maxDecimals(8)
                : undefined,

              transferFee: new CoinPretty(
                {
                  coinDecimals: transferFee.decimals,
                  coinDenom: transferFee.denom,
                  coinMinimalDenom: transferFee.sourceDenom,
                },
                new Dec(transferFee.amount)
              ).maxDecimals(8),

              expectedOutput: new CoinPretty(
                {
                  coinDecimals: expectedOutput.decimals,
                  coinDenom: expectedOutput.denom,
                  coinMinimalDenom: expectedOutput.sourceDenom,
                },
                new Dec(expectedOutput.amount)
              ),

              expectedOutputFiat: expectedOutput.fiatValue,
              transferFeeFiat: transferFee.fiatValue,
              gasCostFiat: estimatedGasFee?.fiatValue,
              estimatedTime: dayjs.duration({
                seconds: estimatedTime,
              }),
              responseTime: dayjs(),
              quote,
              transactionRequest,
              priceImpact,
              provider,
              fromChain,
              toChain,
              isSlippageTooHigh: transferSlippage.gt(new Dec(0.06)), // warn if expected output is less than 6% of input amount
              isPriceImpactTooHigh: priceImpact.toDec().gte(new Dec(0.1)), // warn if price impact is greater than 10%.
            };
          },

          // prevent batching so that fast routers can
          // return requests faster than the slowest router
          trpc: {
            context: {
              skipBatch: true,
            },
          },
        }
      )
    )
  );

  const selectedQuote = useMemo(() => {
    return quoteResults?.find(
      ({ data: quote }) => quote?.provider.id === selectedBridgeProvider
    )?.data;
  }, [quoteResults, selectedBridgeProvider]);

  const numSucceeded = quoteResults.filter(({ isSuccess }) => isSuccess).length;
  const isOneSuccessful = Boolean(numSucceeded);
  const amountOfErrors = quoteResults.filter(({ isError }) => isError).length;
  const isOneErrored = Boolean(amountOfErrors);

  // if none have returned a resulting quote, find some error
  const someError = useMemo(
    () =>
      !isOneSuccessful &&
      isOneErrored &&
      quoteResults.every(({ isLoading }) => !isLoading)
        ? quoteResults.find((quoteResult) => Boolean(quoteResult.error))?.error
        : undefined,
    [isOneSuccessful, isOneErrored, quoteResults]
  );

  useEffect(() => {
    const quoteResults_ = [...quoteResults];

    const bestQuote = quoteResults_
      // only those that have fetched
      .filter((quoteResult) => Boolean(quoteResult.isFetched))
      // Sort by response time. The fastest and highest quality quote will be first.
      .sort((a, b) => {
        if (a.data?.responseTime.isBefore(b.data?.responseTime)) {
          return 1;
        }
        if (a.data?.responseTime.isAfter(b.data?.responseTime)) {
          return -1;
        }
        return 0;
      })
      // only those that have returned a result without error
      .map(({ data }) => data)
      // only the best quote data
      .reduce((bestAcc, cur) => {
        if (!bestAcc) return cur;
        if (
          !!cur &&
          bestAcc.expectedOutput.toDec().lt(cur.expectedOutput.toDec())
        ) {
          return cur;
        }
        return bestAcc;
      }, undefined);

    // If the selected bridge provider is not found in the results, select the best quote provider
    const isBridgeProviderNotFound = !quoteResults_.some(
      ({ data }) => data?.provider.id === selectedBridgeProvider
    );

    if (
      !!bestQuote &&
      ((bestQuote?.provider.id !== selectedBridgeProvider &&
        !isBridgeProviderControlledMode) ||
        isBridgeProviderNotFound)
    ) {
      setSelectedBridgeProvider(bestQuote.provider.id);
    }
  }, [
    selectedQuote,
    quoteResults,
    selectedBridgeProvider,
    isBridgeProviderControlledMode,
  ]);

  const availableBalance = sourceAsset.amount;

  const isInsufficientFee =
    inputAmountRaw !== "" &&
    selectedQuote?.transferFee !== undefined &&
    selectedQuote?.transferFee.denom === availableBalance.denom && // make sure the fee is in the same denom as the asset
    new CoinPretty(availableBalance.currency, inputAmount)
      .toDec()
      .sub(availableBalance?.toDec() ?? new Dec(0)) // subtract by available balance to get the maximum transfer amount
      .abs()
      .lt(selectedQuote?.transferFee.toDec());

  const isInsufficientBal =
    inputAmountRaw !== "" &&
    availableBalance &&
    new CoinPretty(availableBalance.currency, inputAmount)
      .toDec()
      .gt(availableBalance.toDec());

  const bridgeTransaction =
    api.bridgeTransfer.getTransactionRequestByBridge.useQuery(
      {
        ...quoteParams,
        fromAmount: inputAmount.truncate().toString(),
        bridge: selectedBridgeProvider!,
      },
      {
        /**
         * If there is no transaction request data, fetch it.
         */
        enabled:
          Boolean(selectedQuote) &&
          Boolean(selectedBridgeProvider) &&
          !selectedQuote?.transactionRequest &&
          inputAmount.gt(new Dec(0)) &&
          !isInsufficientBal &&
          !isInsufficientFee,
        refetchInterval: 30 * 1000, // 30 seconds
      }
    );

  useUnmount(() => {
    setSelectedBridgeProvider(null);
    setBridgeProviderControlledMode(false);
  });

  const [transferInitiated, setTransferInitiated] = useState(false);
  const trackTransferStatus = useCallback(
    (providerId: Bridge, params: GetTransferStatusParams) => {
      if (inputAmountRaw !== "") {
        transferHistoryStore.pushTxNow(
          `${providerId}${JSON.stringify(params)}`,
          new CoinPretty(availableBalance.currency, inputAmount)
            .trim(true)
            .toString(),
          isWithdraw,
          destinationAddress ?? "" // use osmosis account (destinationAddress) for account keys (vs any EVM account)
        );
      }
    },
    [
      availableBalance.currency,
      destinationAddress,
      inputAmount,
      inputAmountRaw,
      isWithdraw,
      nonIbcBridgeHistoryStore,
    ]
  );

  const [isApprovingToken, setIsApprovingToken] = useState(false);

  // close modal when initial eth transaction is committed
  const isSendTxPending = isWithdraw
    ? osmosisAccount?.txTypeInProgress !== ""
    : isEthTxPending;
  useEffect(() => {
    if (transferInitiated && !isSendTxPending) {
      onRequestClose();
    }
  }, [
    transferInitiated,
    isSendTxPending,
    osmosisAccount?.txTypeInProgress,
    isEthTxPending,
    onRequestClose,
  ]);

  const handleEvmTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    if (!ethWalletClient) throw new Error("No ETH wallet client found");

    const transactionRequest =
      quote.transactionRequest as EvmBridgeTransactionRequest;
    try {
      /**
       * This occurs when users haven't given permission to the bridge smart contract to use their tokens.
       */
      if (transactionRequest.approvalTransactionRequest) {
        setIsApprovingToken(true);

        await ethWalletClient.send({
          method: "eth_sendTransaction",
          params: [
            {
              to: transactionRequest.approvalTransactionRequest.to,
              from: ethWalletClient.accountAddress,
              data: transactionRequest.approvalTransactionRequest.data,
            },
          ],
        });

        await new Promise((resolve, reject) => {
          const onConfirmed = () => {
            setIsApprovingToken(false);
            clearEvents();
            resolve(void 0);
          };
          const onFailed = () => {
            setIsApprovingToken(false);
            clearEvents();
            reject(void 0);
          };

          const clearEvents = () => {
            ethWalletClient.txStatusEventEmitter!.removeListener(
              "confirmed",
              onConfirmed
            );
            ethWalletClient.txStatusEventEmitter!.removeListener(
              "failed",
              onFailed
            );
          };
          ethWalletClient.txStatusEventEmitter!.on("confirmed", onConfirmed);
          ethWalletClient.txStatusEventEmitter!.on("failed", onFailed);
        });

        for (const quoteResult of quoteResults) {
          await quoteResult.refetch();
        }

        return;
      }

      const txHash = await ethWalletClient.send({
        method: "eth_sendTransaction",
        params: [
          {
            to: transactionRequest.to,
            from: ethWalletClient.accountAddress,
            value: transactionRequest?.value
              ? transactionRequest.value
              : undefined,
            data: transactionRequest.data,
            gas: transactionRequest.gas,
            gasPrice: transactionRequest.gasPrice,
            maxFeePerGas: transactionRequest.maxFeePerGas,
            maxPriorityFeePerGas: transactionRequest.maxPriorityFeePerGas,
          },
        ],
      });

      await new Promise((resolve, reject) => {
        const onConfirm = () => {
          trackTransferStatus(quote.provider.id, {
            sendTxHash: txHash as string,
            fromChainId: quote.fromChain.chainId,
            toChainId: quote.toChain.chainId,
          });
          setLastDepositAccountEvmAddress(ethWalletClient.accountAddress!);

          if (isWithdraw) {
            withdrawAmountConfig.setAmount("");
          } else {
            setDepositAmount("");
          }
          setTransferInitiated(true);

          clearEvents();
          resolve(void 0);
        };

        const onFailed = () => {
          clearEvents();
          reject(void 0);
        };

        const clearEvents = () => {
          ethWalletClient.txStatusEventEmitter!.removeListener(
            "confirmed",
            onConfirm
          );
          ethWalletClient.txStatusEventEmitter!.removeListener(
            "failed",
            onFailed
          );
        };

        ethWalletClient.txStatusEventEmitter!.on("confirmed", onConfirm);
        ethWalletClient.txStatusEventEmitter!.on("failed", onFailed);
      });
    } catch (e) {
      const msg = ethWalletClient.displayError?.(e);
      if (typeof msg === "string") {
        displayToast(
          {
            titleTranslationKey: "transactionFailed",
            captionTranslationKey: msg,
          },
          ToastType.ERROR
        );
      } else if (msg) {
        displayToast(msg, ToastType.ERROR);
      } else {
        console.error(e);
      }
    }
  };

  const handleCosmosTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    const transactionRequest =
      quote.transactionRequest as CosmosBridgeTransactionRequest;
    return accountStore.signAndBroadcast(
      osmosisChainId, // Osmosis chain id. For now all Cosmos transactions will come from Osmosis
      transactionRequest.msgTypeUrl,
      [
        {
          typeUrl: transactionRequest.msgTypeUrl,
          value: transactionRequest.msg,
        },
      ],
      "",
      undefined,
      undefined,
      (tx: DeliverTxResponse) => {
        if (tx.code == null || tx.code === 0) {
          const queries = queriesStore.get(osmosisChainId);

          // After succeeding to send token, refresh the balance.
          const queryBalance = queries.queryBalances
            .getQueryBech32Address(osmosisAddress)
            .balances.find((bal) => {
              return (
                bal.currency.coinMinimalDenom ===
                assetToBridge.balance.currency.coinMinimalDenom
              );
            });

          if (queryBalance) {
            queryBalance.fetch();
          }

          trackTransferStatus(quote.provider.id, {
            sendTxHash: tx.transactionHash,
            fromChainId: quote.fromChain.chainId,
            toChainId: quote.toChain.chainId,
          });

          if (isWithdraw) {
            withdrawAmountConfig.setAmount("");
          } else {
            setDepositAmount("");
          }
          setTransferInitiated(true);
        }
      }
    );
  };

  const onTransfer = async () => {
    const transactionRequest =
      selectedQuote?.transactionRequest ??
      bridgeTransaction.data?.transactionRequest;
    const quote = selectedQuote?.quote;

    if (!transactionRequest || !quote) return;

    try {
      if (transactionRequest.type === "evm") {
        await handleEvmTx({ ...quote, transactionRequest });
      } else if (transactionRequest.type === "cosmos") {
        await handleCosmosTx({
          ...quote,
          transactionRequest,
        });
      }
    } catch (e) {}
  };

  const hasNoQuotes = someError?.message.includes(
    "NoQuotesError" as BridgeError
  );
  const warnUserOfSlippage = selectedQuote?.isSlippageTooHigh;
  const warnUserOfPriceImpact = selectedQuote?.isPriceImpactTooHigh;

  let buttonErrorMessage: string | undefined;
  if (!counterpartyAddress) {
    buttonErrorMessage = t("assets.transfer.errors.missingAddress");
  } else if (!isCounterpartyAddressValid) {
    buttonErrorMessage = t("assets.transfer.errors.invalidAddress");
  } else if (hasNoQuotes) {
    buttonErrorMessage = t("assets.transfer.errors.noQuotesAvailable");
  } else if (userDisconnectedEthWallet) {
    buttonErrorMessage = t("assets.transfer.errors.reconnectWallet", {
      walletName: ethWalletClient?.displayInfo.displayName ?? "Unknown",
    });
  } else if (isDeposit && !isCorrectChainSelected) {
    buttonErrorMessage = t("assets.transfer.errors.wrongNetworkInWallet", {
      walletName: ethWalletClient?.displayInfo.displayName ?? "Unknown",
    });
  } else if (Boolean(someError)) {
    buttonErrorMessage = t("assets.transfer.errors.unexpectedError");
  } else if (bridgeTransaction.error) {
    buttonErrorMessage = t("assets.transfer.errors.transactionError");
  } else if (isInsufficientFee) {
    buttonErrorMessage = t("assets.transfer.errors.insufficientFee");
  } else if (isInsufficientBal) {
    buttonErrorMessage = t("assets.transfer.errors.insufficientBal");
  }

  /** User can interact with any of the controls on the modal. */
  const isLoadingBridgeQuote =
    (!isOneSuccessful ||
      quoteResults.every((quoteResult) => quoteResult.isLoading)) &&
    quoteResults.some((quoteResult) => quoteResult.fetchStatus !== "idle");
  const isLoadingBridgeTransaction =
    bridgeTransaction.isLoading && bridgeTransaction.fetchStatus !== "idle";
  const isWithdrawReady = isWithdraw && osmosisAccount?.txTypeInProgress === "";
  const isDepositReady =
    isDeposit &&
    !userDisconnectedEthWallet &&
    isCorrectChainSelected &&
    !isLoadingBridgeQuote &&
    !isEthTxPending;
  const userCanInteract = isDepositReady || isWithdrawReady;

  let buttonText: string;
  if (buttonErrorMessage) {
    buttonText = buttonErrorMessage;
  } else if (isLoadingBridgeQuote || isLoadingBridgeTransaction) {
    buttonText = `${t("assets.transfer.loading")}...`;
  } else if (warnUserOfSlippage || warnUserOfPriceImpact) {
    buttonText = t("assets.transfer.transferAnyway");
  } else if (isApprovingToken) {
    buttonText = t("assets.transfer.approving");
  } else if (isSendTxPending) {
    buttonText = t("assets.transfer.sending");
  } else if (
    selectedQuote?.quote?.transactionRequest?.type === "evm" &&
    selectedQuote?.quote?.transactionRequest.approvalTransactionRequest &&
    !isEthTxPending
  ) {
    buttonText = t("assets.transfer.givePermission");
  } else if (isWithdraw) {
    buttonText = t("assets.transfer.titleWithdraw", {
      coinDenom: originCurrency.coinDenom,
    });
  } else {
    buttonText = t("assets.transfer.titleDeposit", {
      coinDenom: originCurrency.coinDenom,
    });
  }

  if (selectedQuote && !selectedQuote.expectedOutput) {
    throw new Error("Expected output is not defined.");
  }
};
