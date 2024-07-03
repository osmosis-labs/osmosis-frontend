import { CoinPretty, Dec, DecUtils, RatePretty } from "@keplr-wallet/unit";
import {
  Bridge,
  BridgeAsset,
  BridgeChain,
  BridgeError,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  GetTransferStatusParams,
} from "@osmosis-labs/bridge";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import { isNil } from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce, useUnmount } from "react-use";
import { Address } from "viem";
import { BaseError } from "wagmi";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useChainDisplayInfo } from "~/components/chain/use-chain-display-info";
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

  bridges = ["Axelar", "Skip", "Squid", "IBC"],

  onRequestClose,
  onTransfer: onTransferProp,
}: {
  direction: "deposit" | "withdraw";

  inputAmount: string;

  fromAsset: (BridgeAsset & { amount: CoinPretty }) | undefined;
  fromChain: BridgeChain | undefined;
  fromAddress: string | undefined;

  toAsset: BridgeAsset | undefined;
  toChain: BridgeChain | undefined;
  toAddress: string | undefined;

  bridges?: Bridge[];

  onRequestClose: () => void;
  onTransfer?: () => void;
}) => {
  const { accountStore, transferHistoryStore, queriesStore } = useStore();
  const {
    connector: evmConnector,
    address: evmAddress,
    isConnected: isEvmWalletConnected,
    chainId: currentEvmChainId,
  } = useEvmWalletAccount();
  const { sendTransactionAsync, isLoading: isEthTxPending } =
    useSendEvmTransaction();
  const { t } = useTranslation();

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
  const inputAmount = new Dec(
    debouncedInputValue === "" ? "0" : debouncedInputValue
  ).mul(
    // CoinPretty only accepts whole amounts
    DecUtils.getTenExponentNInPrecisionRange(toAsset?.decimals ?? 0)
  );

  const availableBalance = fromAsset?.amount;

  const isInsufficientBal =
    inputAmountRaw !== "" &&
    availableBalance &&
    new CoinPretty(availableBalance.currency, inputAmount)
      .toDec()
      .gt(availableBalance.toDec());

  const quoteResults = api.useQueries((t) =>
    bridges.map((bridge) =>
      t.bridgeTransfer.getQuoteByBridge(
        {
          ...(quoteParams as Required<typeof quoteParams>),
          bridge,
          fromAmount: inputAmount.truncate().toString(),
        },
        {
          enabled:
            inputAmount.gt(new Dec(0)) &&
            Object.values(quoteParams).every((param) => !isNil(param)) &&
            !isInsufficientBal,
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
  const amountOfErrors = erroredQuotes.length;
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

  const isInsufficientFee =
    inputAmountRaw !== "" &&
    availableBalance &&
    selectedQuote?.transferFee !== undefined &&
    selectedQuote?.transferFee.denom === availableBalance.denom && // make sure the fee is in the same denom as the asset
    new CoinPretty(availableBalance.currency, inputAmount)
      .toDec()
      .sub(availableBalance?.toDec() ?? new Dec(0)) // subtract by available balance to get the maximum transfer amount
      .abs()
      .lt(selectedQuote?.transferFee.toDec());

  const bridgeTransaction =
    api.bridgeTransfer.getTransactionRequestByBridge.useQuery(
      {
        ...(quoteParams as Required<typeof quoteParams>),
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
    (providerId: Bridge, params: GetTransferStatusParams) => {
      if (inputAmountRaw !== "" && availableBalance) {
        transferHistoryStore.pushTxNow(
          `${providerId}${JSON.stringify(params)}`,
          new CoinPretty(availableBalance.currency, inputAmount)
            .trim(true)
            .toString(),
          isWithdraw,
          toAddress ?? "" // use osmosis account (destinationAddress) for account keys (vs any EVM account)
        );
      }
    },
    [
      availableBalance,
      toAddress,
      inputAmount,
      inputAmountRaw,
      isWithdraw,
      transferHistoryStore,
    ]
  );

  const isTxPending = (() => {
    if (!fromChain) return false;
    return fromChain.chainType === "cosmos"
      ? accountStore.getWallet(fromChain.chainId)?.txTypeInProgress !== ""
      : isEthTxPending;
  })();

  // close modal when initial eth transaction is committed
  useEffect(() => {
    if (transferInitiated && !isTxPending) {
      onRequestClose();
    }
  }, [isTxPending, onRequestClose, transferInitiated]);

  const [isApprovingToken, setIsApprovingToken] = useState(false);
  const handleEvmTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    if (!isEvmWalletConnected || !evmAddress || !evmConnector)
      throw new Error("No ETH wallet account is connected");

    const transactionRequest =
      quote.transactionRequest as EvmBridgeTransactionRequest;
    try {
      /**
       * This occurs when users haven't given permission to the bridge smart contract to use their tokens.
       */
      if (transactionRequest.approvalTransactionRequest) {
        setIsApprovingToken(true);

        await sendTransactionAsync({
          to: transactionRequest.approvalTransactionRequest.to as Address,
          account: evmAddress,
          data: transactionRequest.approvalTransactionRequest.data as Address,
        });

        setIsApprovingToken(false);

        for (const quoteResult of quoteResults) {
          await quoteResult.refetch();
        }

        return;
      }

      const txHash = await sendTransactionAsync({
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

      trackTransferStatus(quote.provider.id, {
        sendTxHash: txHash as string,
        fromChainId: quote.fromChain.chainId,
        toChainId: quote.toChain.chainId,
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
    }
  };

  const handleCosmosTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    if (!fromChain || fromChain?.chainType !== "cosmos") {
      throw new Error("Initiating chain is not cosmos");
    }
    const transactionRequest =
      quote.transactionRequest as CosmosBridgeTransactionRequest;
    return accountStore.signAndBroadcast(
      fromChain.chainId,
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

          trackTransferStatus(quote.provider.id, {
            sendTxHash: tx.transactionHash,
            fromChainId: quote.fromChain.chainId,
            toChainId: quote.toChain.chainId,
          });

          onTransferProp?.();
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

    const tx =
      transactionRequest.type === "evm"
        ? handleEvmTx({ ...quote, transactionRequest })
        : handleCosmosTx({ ...quote, transactionRequest });

    await tx.catch((e) => {
      console.error(transactionRequest.type, "transaction failed", e);
      throw e;
    });
  };

  const hasNoQuotes = someError?.message.includes(
    "NoQuotesError" as BridgeError
  );
  const warnUserOfSlippage = selectedQuote?.isSlippageTooHigh;
  const warnUserOfPriceImpact = selectedQuote?.isPriceImpactTooHigh;
  const isCorrectEvmChainSelected =
    fromChain?.chainType === "evm"
      ? currentEvmChainId === fromChain?.chainId
      : true;

  let buttonErrorMessage: string | undefined;
  if (!fromAddress) {
    buttonErrorMessage = t("assets.transfer.errors.missingAddress");
  } else if (hasNoQuotes) {
    buttonErrorMessage = t("assets.transfer.errors.noQuotesAvailable");
  } else if (!isEvmWalletConnected && fromChain?.chainType === "evm") {
    buttonErrorMessage = t("assets.transfer.errors.reconnectWallet", {
      walletName: evmConnector?.name ?? "EVM Wallet",
    });
  } else if (
    isDeposit &&
    !isCorrectEvmChainSelected &&
    fromChain?.chainType === "evm"
  ) {
    buttonErrorMessage = t("assets.transfer.errors.wrongNetworkInWallet", {
      walletName: evmConnector?.name ?? "EVM Wallet",
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
  const isWithdrawReady = isWithdraw && !isTxPending;
  const isWalletConnected =
    fromChain?.chainType === "evm"
      ? isEvmWalletConnected
      : fromChain?.chainId
      ? accountStore.getWallet(fromChain.chainId)?.isWalletConnected ?? false
      : false;
  const isDepositReady =
    isDeposit &&
    isWalletConnected &&
    isCorrectEvmChainSelected &&
    !isLoadingBridgeQuote &&
    !isTxPending;
  const userCanInteract = isDepositReady || isWithdrawReady;

  let buttonText: string;
  if (buttonErrorMessage) {
    buttonText = buttonErrorMessage;
  } else if (warnUserOfSlippage || warnUserOfPriceImpact) {
    buttonText = t("assets.transfer.transferAnyway");
  } else if (isApprovingToken) {
    buttonText = t("assets.transfer.approving");
  } else if (isTxPending) {
    buttonText = t("assets.transfer.sending");
  } else if (
    selectedQuote?.quote?.transactionRequest?.type === "evm" &&
    selectedQuote?.quote?.transactionRequest.approvalTransactionRequest &&
    !isEthTxPending
  ) {
    buttonText = t("assets.transfer.givePermission");
  } else {
    buttonText =
      direction === "deposit"
        ? t("transfer.reviewDeposit")
        : t("transfer.reviewWithdraw");
  }

  if (selectedQuote && !selectedQuote.expectedOutput) {
    throw new Error("Expected output is not defined.");
  }

  const fromChainInfo = useChainDisplayInfo(fromChain?.chainId);
  const toChainInfo = useChainDisplayInfo(toChain?.chainId);

  return {
    buttonText,
    buttonErrorMessage,

    selectedQuoteUpdatedAt: selectedQuoteQuery?.dataUpdatedAt,
    refetchInterval,

    userCanInteract,
    isTxPending,
    isApprovingToken,
    onTransfer,

    isInsufficientFee,
    isInsufficientBal,
    warnUserOfSlippage,
    warnUserOfPriceImpact,

    fromChainInfo,
    toChainInfo,

    successfulQuotes,
    selectedBridgeProvider,
    setSelectedBridgeProvider: onChangeBridgeProvider,

    selectedQuote,
    isLoadingBridgeQuote,
    isLoadingBridgeTransaction,
    isRefetchingQuote: selectedQuoteQuery?.isRefetching ?? false,
  };
};
