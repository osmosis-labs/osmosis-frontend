import {
  Bridge,
  BridgeAsset,
  BridgeChain,
  BridgeError,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
} from "@osmosis-labs/bridge";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import { CoinPretty, Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
import { getNomicRelayerUrl, isNil } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce, useUnmount } from "react-use";
import { Address, createPublicClient, http } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { BaseError } from "wagmi";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { IS_TESTNET } from "~/config";
import { useEvmWalletAccount, useSendEvmTransaction } from "~/hooks/evm-wallet";
import { useTranslation } from "~/hooks/language";
import { useStore } from "~/stores";
import { getWagmiToastErrorMessage } from "~/utils/ethereum";
import { api, RouterInputs } from "~/utils/trpc";

const refetchInterval = 30 * 1000; // 30 seconds

export type BridgeQuote = ReturnType<typeof useBridgeQuotes>;

/**
 * Sends and collects bridge qoutes from multiple bridge providers given
 * the from and to chain & asset info. Defaults selection to the cheapest quote.
 *
 * Includes utilities for selecting a preferred quote,
 * and sending the transaction for the
 * currently selected quote.
 */
export const useBridgeQuotes = ({
  direction,

  inputAmount: inputAmountRaw,

  fromAddress,
  fromChain,
  fromAsset,

  toAddress,
  toAsset,
  toChain,

  bridges,

  onRequestClose,
  onTransfer: onTransferProp,
}: {
  direction: "deposit" | "withdraw";

  inputAmount: string;

  fromAsset:
    | (BridgeAsset & {
        amount: CoinPretty;
        imageUrl: string | undefined;
        isUnstable: boolean;
      })
    | undefined;
  fromChain: (BridgeChain & { prettyName: string }) | undefined;
  fromAddress: string | undefined;

  toAsset:
    | (BridgeAsset & { imageUrl: string | undefined; isUnstable: boolean })
    | undefined;
  toChain: (BridgeChain & { prettyName: string }) | undefined;
  toAddress: string | undefined;

  bridges: Bridge[];

  onRequestClose: () => void;
  onTransfer?: () => void;
}) => {
  const { accountStore, transferHistoryStore, queriesStore } = useStore();
  const {
    connector: evmConnector,
    address: evmAddress,
    isConnected: isEvmWalletConnected,
    chainId: currentEvmChainId,
    chain: currentEvmChain,
  } = useEvmWalletAccount();
  const { sendTransactionAsync, isLoading: isEthTxPending } =
    useSendEvmTransaction();
  const { t } = useTranslation();
  const [isBroadcastingTx, setIsBroadcastingTx] = useState(false);

  const isDeposit = direction === "deposit";
  const isWithdraw = direction === "withdraw";

  const quoteParams: Partial<
    Omit<
      RouterInputs["bridgeTransfer"]["getQuoteByBridge"],
      "bridge" | "fromAmount"
    >
  > = useMemo(
    () => ({
      fromAddress,
      fromAsset,
      fromChain,
      toAddress,
      toAsset,
      toChain,
    }),
    [fromAddress, fromAsset, fromChain, toAddress, toAsset, toChain]
  );

  const [selectedBridgeProvider, setSelectedBridgeProvider] =
    useState<Bridge | null>(null);
  const [isBridgeProviderControlledMode, setBridgeProviderControlledMode] =
    useState(false);

  const onChangeBridgeProvider = useCallback((bridge: Bridge) => {
    setSelectedBridgeProvider(bridge);
    setBridgeProviderControlledMode(true);
  }, []);

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
  /** NOTE: Debounced amount. */
  const inputAmount = useMemo(
    () =>
      new Dec(debouncedInputValue === "" ? "0" : debouncedInputValue)
        .mul(
          // CoinPretty only accepts whole amounts
          DecUtils.getTenExponentNInPrecisionRange(fromAsset?.decimals ?? 0)
        )
        .truncate(),
    [debouncedInputValue, fromAsset?.decimals]
  );
  const availableBalance = fromAsset?.amount;
  const inputCoin = useMemo(
    () =>
      availableBalance
        ? new CoinPretty(availableBalance.currency, inputAmount)
        : undefined,
    [availableBalance, inputAmount]
  );

  const isInsufficientBal =
    availableBalance &&
    inputCoin &&
    inputCoin.toDec().gt(availableBalance.toDec());

  const isTxPending = (() => {
    if (!fromChain) return false;
    if (fromChain.chainType === "cosmos") {
      return Boolean(
        accountStore.getWallet(fromChain.chainId)?.txTypeInProgress
      );
    } else if (fromChain.chainType === "evm") {
      return isEthTxPending || isBroadcastingTx;
    }
    return false;
  })();

  const quoteResults = api.useQueries((t) =>
    bridges.map((bridge) =>
      t.bridgeTransfer.getQuoteByBridge(
        {
          ...(quoteParams as Required<typeof quoteParams>),
          bridge,
          fromAmount: inputAmount.toString(),
        },
        {
          enabled:
            // ensure new quote queries are not sent in bg when tx is being approved
            !isTxPending &&
            inputAmount.isPositive() &&
            Object.values(quoteParams).every((param) => !isNil(param)) &&
            !isInsufficientBal &&
            // must have balance amount loaded, even if 0
            Boolean(availableBalance),
          staleTime: 5_000,
          cacheTime: 5_000,
          // Disable retries, as useQueries
          // will block successful quotes from being returned
          // if failed quotes are being returned
          // until retry starts returning false.
          // This causes slow UX even though there's a
          // quote that the user can use.
          retry: false,

          refetchInterval, // 30 seconds

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
              totalFeeFiatValue,
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
              gasCost: estimatedGasFee?.amount.maxDecimals(8),
              transferFee: transferFee.amount.maxDecimals(8),
              expectedOutput: expectedOutput.amount,
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
              totalFeeFiatValue,
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

  const successfulQuotes = useMemo(() => {
    return quoteResults.filter(
      (
        quote
      ): quote is typeof quote & { data: NonNullable<typeof quote.data> } =>
        quote.isSuccess && !isNil(quote.data)
    );
  }, [quoteResults]);

  const erroredQuotes = useMemo(() => {
    return quoteResults.filter(({ isError }) => isError);
  }, [quoteResults]);

  const selectedQuoteQuery = useMemo(() => {
    return successfulQuotes.find(
      ({ data: quote }) => quote?.provider.id === selectedBridgeProvider
    );
  }, [selectedBridgeProvider, successfulQuotes]);

  const selectedQuote = useMemo(() => {
    return selectedQuoteQuery?.data;
  }, [selectedQuoteQuery]);

  const numSucceeded = successfulQuotes.length;
  const isOneSuccessful = Boolean(numSucceeded);
  const isAllSuccessful = numSucceeded === bridges.length;
  const isOneErrored = Boolean(erroredQuotes.length);

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
      .filter(
        (quoteResult) => Boolean(quoteResult.isFetched) && !quoteResult.isError
      )
      // Sort by response time. The fastest and highest quality quote will be first.
      .sort((a, b) => {
        // This means the quote is for a basic IBC transfer:
        // Prefer IBC provider over others since its status source provider
        // offers a more real time UX compared to other bridge route provider's
        // status endpoints, which rely on indexing chains and come with a delay.
        if (a.data?.provider.id === "IBC") return -1;

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
      !isTxPending &&
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
    isTxPending,
  ]);

  const isInsufficientFee = useMemo(() => {
    if (someError?.message.includes("InsufficientAmountError" as BridgeError))
      return true;

    if (!inputCoin || !selectedQuote || !selectedQuote.gasCost) return false;

    const inputDenom = inputCoin.toCoin().denom;
    const gasDenom = selectedQuote.gasCost.toCoin().denom;
    const feeDenom = selectedQuote.transferFee.toCoin().denom;
    const inputAmount = inputCoin.toDec();

    let totalFeeCoinAmount = new Dec(0);
    if (inputDenom === gasDenom) {
      totalFeeCoinAmount = totalFeeCoinAmount.add(
        selectedQuote.gasCost.toDec()
      );
    }
    if (inputDenom === feeDenom) {
      totalFeeCoinAmount = totalFeeCoinAmount.add(
        selectedQuote.transferFee.toDec()
      );
    }

    if (inputDenom === gasDenom || inputDenom === feeDenom) {
      const maxAmount = inputAmount.sub(totalFeeCoinAmount);

      if (maxAmount.isNegative() || maxAmount.isZero()) return true;
    }

    return false;
  }, [someError, inputCoin, selectedQuote]);

  const bridgeTransaction =
    api.bridgeTransfer.getTransactionRequestByBridge.useQuery(
      {
        ...(quoteParams as Required<typeof quoteParams>),
        fromAmount: inputAmount.toString(),
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
          inputAmount.isPositive() &&
          !isInsufficientBal &&
          !isInsufficientFee &&
          Object.values(quoteParams).every((param) => !isNil(param)),
        refetchInterval: 30 * 1000, // 30 seconds
      }
    );

  useUnmount(() => {
    setSelectedBridgeProvider(null);
    setBridgeProviderControlledMode(false);
  });

  const [transferInitiated, setTransferInitiated] = useState(false);
  const trackTransferStatus = useCallback(
    ({
      sendTxHash,
      quote,
      nomicCheckpointIndex,
    }: {
      sendTxHash: string;
      quote: NonNullable<typeof selectedQuote>["quote"];
      nomicCheckpointIndex?: number;
    }) => {
      if (quote.provider.id === "Nomic" && isNil(nomicCheckpointIndex)) {
        throw new Error(
          "Nomic checkpoint index is required. Skipping tracking."
        );
      }

      if (
        inputAmountRaw !== "" &&
        availableBalance &&
        inputCoin &&
        fromAsset &&
        toAsset &&
        fromChain &&
        toChain &&
        fromAddress &&
        toAddress
      ) {
        transferHistoryStore.pushTxNow({
          createdAtUnix: dayjs().unix(),
          direction,
          fromAsset: {
            ...fromAsset,
            amount: inputCoin.trim(true).toCoin().amount,
          },
          fromAddress,
          toAddress,
          fromChain,
          toChain,
          toAsset,
          provider: quote.provider.id,
          osmoBech32Address: (isWithdraw ? fromAddress : toAddress) ?? "", // use osmosis account for account keys (vs any EVM account),
          sendTxHash,
          status: "pending",
          type: "bridge-transfer",
          estimatedArrivalUnix: dayjs().unix() + quote.estimatedTime,
          networkFee: quote.estimatedGasFee
            ? {
                address: quote.estimatedGasFee.amount.currency.coinMinimalDenom,
                denom: quote.estimatedGasFee.amount.currency.coinDenom,
                decimals: quote.estimatedGasFee.amount.currency.coinDecimals,
                amount: quote.estimatedGasFee.amount.toCoin().amount,
              }
            : undefined,
          providerFee: quote.transferFee
            ? {
                denom: quote.transferFee.amount.currency.coinDenom,
                address: quote.transferFee.amount.currency.coinMinimalDenom,
                decimals: quote.transferFee.amount.currency.coinDecimals,
                amount: quote.transferFee.amount.toCoin().amount,
              }
            : undefined,
          nomicCheckpointIndex,
        });
      }
    },
    [
      availableBalance,
      direction,
      fromAddress,
      fromAsset,
      fromChain,
      inputAmountRaw,
      inputCoin,
      isWithdraw,
      toAddress,
      toAsset,
      toChain,
      transferHistoryStore,
    ]
  );

  // close modal when initial transaction is committed
  useEffect(() => {
    if (transferInitiated && !isTxPending) {
      onRequestClose();
    }
  }, [isTxPending, onRequestClose, transferInitiated]);

  const [isApprovingToken, setIsApprovingToken] = useState(false);
  const signAndBroadcastEvmTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    if (!isEvmWalletConnected || !evmAddress || !evmConnector)
      throw new Error("No ETH wallet account is connected");

    const transactionRequest =
      quote.transactionRequest as EvmBridgeTransactionRequest;
    try {
      const publicClient = createPublicClient({
        transport: http(),
        chain: currentEvmChain,
      });

      /**
       * This occurs when users haven't given permission to the bridge smart contract to use their tokens.
       */
      if (transactionRequest.approvalTransactionRequest) {
        setIsApprovingToken(true);

        const approveTxHash = await sendTransactionAsync(
          {
            to: transactionRequest.approvalTransactionRequest.to as Address,
            account: evmAddress,
            data: transactionRequest.approvalTransactionRequest.data as Address,
          },
          {
            onError: () => {
              setIsApprovingToken(false);
            },
          }
        );

        await waitForTransactionReceipt(publicClient, {
          hash: approveTxHash,
        });

        for (const quoteResult of quoteResults) {
          await quoteResult.refetch();
        }
        setIsApprovingToken(false);
      }

      const sendTxHash = await sendTransactionAsync({
        to: transactionRequest.to,
        account: evmAddress,
        value: transactionRequest?.value
          ? BigInt(transactionRequest.value)
          : undefined,
        data: transactionRequest.data,
        gas: transactionRequest.gas
          ? BigInt(transactionRequest.gas)
          : undefined,
        gasPrice: transactionRequest.gasPrice
          ? BigInt(transactionRequest.gasPrice)
          : undefined,
        maxFeePerGas: transactionRequest.maxFeePerGas
          ? BigInt(transactionRequest.maxFeePerGas)
          : undefined,
        maxPriorityFeePerGas: transactionRequest.maxPriorityFeePerGas
          ? BigInt(transactionRequest.maxPriorityFeePerGas)
          : undefined,
      });

      setIsBroadcastingTx(true);

      await waitForTransactionReceipt(publicClient, {
        hash: sendTxHash,
      });

      trackTransferStatus({
        quote,
        sendTxHash,
      });

      // TODO: Investigate if this is still needed
      //   setLastDepositAccountEvmAddress(ethWalletClient.accountAddress!);

      onTransferProp?.();
      setTransferInitiated(true);
    } catch (e) {
      const error = e as BaseError;
      const toastContent = getWagmiToastErrorMessage({
        error,
        t,
        walletName: evmConnector.name,
      });
      displayToast(toastContent, ToastType.ERROR);
    } finally {
      setIsApprovingToken(false);
      setIsBroadcastingTx(false);
    }
  };

  const signAndBroadcastCosmosTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    if (!fromChain || fromChain?.chainType !== "cosmos") {
      throw new Error("Initiating chain is not cosmos");
    }
    const transactionRequest =
      quote.transactionRequest as CosmosBridgeTransactionRequest;
    const gasFee = transactionRequest.gasFee;
    let nomicCheckpointIndex: number | undefined;

    return accountStore.signAndBroadcast(
      fromChain.chainId,
      `${fromChain.chainId}:${fromAsset?.denom} -> ${toChain?.chainId}:${toAsset?.denom}`,
      transactionRequest.msgs,
      "",
      // Setting the fee from the transaction request
      // ensures the user is using the same fee token & amount as seen in the quote.
      // If not present, it will be estimated & the token will be chosen by our logic.
      gasFee
        ? {
            gas: gasFee.gas,
            amount: [
              {
                denom: gasFee.denom,
                amount: gasFee.amount,
              },
            ],
          }
        : undefined,
      {
        preferNoSetFee: Boolean(gasFee),
      },
      {
        /**
         * This is a special case for Nomic withdrawals
         * We need to get the checkpoint index in order to track the transaction
         */
        onSign: async () => {
          if (quote.provider.id !== "Nomic") return;

          const { getCheckpoint } = await import("nomic-bitcoin");
          const { index } = await getCheckpoint({
            relayers: getNomicRelayerUrl({
              env: IS_TESTNET ? "testnet" : "mainnet",
            }),
          });
          /** Add one since the current transfer is not included in the current index */
          nomicCheckpointIndex = index + 1;
        },
        onBroadcastFailed: () => setIsBroadcastingTx(false),
        onBroadcasted: () => setIsBroadcastingTx(true),

        onFulfill: (tx: DeliverTxResponse) => {
          if (tx.code == null || tx.code === 0) {
            const queries = queriesStore.get(fromChain.chainId);

            // After succeeding to send token, refresh the balance.
            const queryBalance = queries.queryBalances
              // If we get here destination address is defined
              .getQueryBech32Address(toAddress!)
              .balances.find((bal) => {
                return (
                  bal.currency.coinMinimalDenom ===
                  availableBalance?.currency.coinMinimalDenom
                );
              });

            if (queryBalance) {
              queryBalance.fetch();
            }

            trackTransferStatus({
              sendTxHash: tx.transactionHash,
              quote,
              nomicCheckpointIndex,
            });

            onTransferProp?.();
            setTransferInitiated(true);
          } else {
            setIsBroadcastingTx(false);
          }
        },
      }
    );
  };

  const onTransfer = async () => {
    const transactionRequest =
      selectedQuote?.transactionRequest ??
      bridgeTransaction.data?.transactionRequest;
    const quote = selectedQuote?.quote;

    if (!transactionRequest || !quote) {
      console.error("No quote or transaction to use for transfer");
      return;
    }

    const tx =
      transactionRequest.type === "evm"
        ? signAndBroadcastEvmTx({ ...quote, transactionRequest })
        : signAndBroadcastCosmosTx({ ...quote, transactionRequest });

    await tx.catch((e) => {
      console.error(transactionRequest.type, "transaction failed", e);
      throw e;
    });
  };

  const hasNoQuotes = someError?.message.includes(
    "NoQuotesError" as BridgeError
  );
  const noAccountFound = someError?.message.includes(
    "AccountNotFoundError" as BridgeError
  );
  const warnUserOfSlippage = selectedQuote?.isSlippageTooHigh;
  const warnUserOfPriceImpact = selectedQuote?.isPriceImpactTooHigh;
  const isCorrectEvmChainSelected =
    fromChain?.chainType === "evm"
      ? currentEvmChainId === fromChain?.chainId
      : true;

  const isWrongEvmChainSelected =
    isDeposit && !isCorrectEvmChainSelected && fromChain?.chainType === "evm";

  let errorBoxMessage: { heading: string; description: string } | undefined;
  if (isInsufficientFee) {
    errorBoxMessage = {
      heading: t("transfer.insufficientFundsForFees"),
      description: t("transfer.youNeedFundsToPay", {
        chain: (isWithdraw ? toChain?.prettyName : fromChain?.prettyName) ?? "",
      }),
    };
  } else if (hasNoQuotes) {
    errorBoxMessage = {
      heading: isWithdraw
        ? t("transfer.assetWithdrawalsUnavailable", {
            asset: toAsset?.denom ?? "",
          })
        : t("transfer.assetsDepositsUnavailable", {
            asset: toAsset?.denom ?? "",
          }),
      description: isWithdraw
        ? t("transfer.noAvailableWithdrawals")
        : t("transfer.noAvailableDeposits"),
    };
  } else if (noAccountFound) {
    errorBoxMessage = {
      heading: t("transfer.accountNotFound"),
      description: t("transfer.sendFundsToAccount", {
        chain: (isWithdraw ? toChain?.prettyName : fromChain?.prettyName) ?? "",
        asset: (isWithdraw ? toAsset?.denom : fromAsset?.denom) ?? "",
      }),
    };
  } else if (bridgeTransaction.error || Boolean(someError)) {
    errorBoxMessage = {
      heading: t("transfer.somethingIsntWorking"),
      description: t("transfer.sorryForTheInconvenience"),
    };
  }

  let warningBoxMessage: { heading: string; description: string } | undefined;
  if (toAsset?.isUnstable) {
    warningBoxMessage = {
      heading: t("transfer.assetIsCurrentlyUnstable", { asset: toAsset.denom }),
      description: t("transfer.transferWillLikelyTakeLonger"),
    };
  }

  /** User can interact with any of the controls on the modal. */
  const isLoadingBridgeQuote =
    (!isOneSuccessful ||
      quoteResults.every((quoteResult) => quoteResult.isLoading)) &&
    quoteResults.some((quoteResult) => quoteResult.fetchStatus !== "idle");
  const isLoadingAnyBridgeQuote = quoteResults.some(
    (quoteResult) => quoteResult.isLoading && quoteResult.fetchStatus !== "idle"
  );
  const isLoadingBridgeTransaction =
    bridgeTransaction.isLoading && bridgeTransaction.fetchStatus !== "idle";
  const isFromWalletConnected =
    fromChain?.chainType === "evm"
      ? isEvmWalletConnected
      : fromChain?.chainType === "cosmos"
      ? accountStore.getWallet(fromChain.chainId)?.isWalletConnected ?? false
      : false;
  const isDepositReady = isDeposit && isFromWalletConnected;
  const isWithdrawReady = direction === "withdraw";
  const userCanAdvance =
    (isDepositReady || isWithdrawReady) &&
    !isInsufficientFee &&
    !isInsufficientBal &&
    !isLoadingBridgeQuote &&
    !isLoadingBridgeTransaction &&
    !isTxPending &&
    !errorBoxMessage &&
    Boolean(selectedQuote);

  let buttonText: string;
  if (warnUserOfSlippage || warnUserOfPriceImpact) {
    buttonText = t("assets.transfer.transferAnyway");
  } else {
    buttonText =
      direction === "deposit"
        ? t("transfer.reviewDeposit")
        : t("transfer.reviewWithdraw");
  }

  let txButtonText: string | undefined;
  if (isApprovingToken) {
    txButtonText = t("assets.transfer.approving");
  } else if (isBroadcastingTx) {
    txButtonText = t("assets.transfer.sending");
  } else if (isTxPending) {
    txButtonText = t("assets.transfer.approveInWallet");
  }

  if (selectedQuote && !selectedQuote.expectedOutput) {
    throw new Error("Expected output is not defined.");
  }

  return {
    enabled: Boolean(bridges.length),

    txButtonText,
    buttonText,
    errorBoxMessage,
    warningBoxMessage,

    userCanAdvance,
    isTxPending,
    isApprovingToken,
    onTransfer,
    isWrongEvmChainSelected,

    isInsufficientFee,
    isInsufficientBal,
    warnUserOfSlippage,
    warnUserOfPriceImpact,

    successfulQuotes,
    isAllQuotesSuccessful: isAllSuccessful,
    selectedBridgeProvider,
    setSelectedBridgeProvider: onChangeBridgeProvider,

    selectedQuote,
    selectedQuoteUpdatedAt: selectedQuoteQuery?.dataUpdatedAt,
    refetchInterval,
    isLoadingBridgeQuote,
    isLoadingAnyBridgeQuote,
    isRefetchingQuote: selectedQuoteQuery?.isRefetching ?? false,
  };
};
