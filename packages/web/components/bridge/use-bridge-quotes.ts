import {
  Bridge,
  BridgeAsset,
  BridgeChain,
  BridgeError,
  CosmosBridgeTransactionRequest,
  EvmBridgeTransactionRequest,
  SolanaBridgeTransactionRequest,
  TxSnapshot,
} from "@osmosis-labs/bridge";
import { DeliverTxResponse } from "@osmosis-labs/stores";
import { CoinPretty, Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
import {
  getEvmRpcTransport,
  getNomicRelayerUrl,
  isNil,
} from "@osmosis-labs/utils";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce, useUnmount } from "react-use";
import { Address, createPublicClient } from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { BaseError } from "wagmi";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import {
  deriveMemoFlags,
  LossFigures,
  needsAcknowledgement,
  normalizePriceImpact,
} from "~/components/bridge/loss-acknowledgement";
import { isSourceWalletConnected } from "~/components/bridge/source-wallet";
import { useLossAcknowledgement } from "~/components/bridge/use-loss-acknowledgement";
import {
  getChainBalance,
  getMultiTxErrorToastContent,
  useMultiTxFinalStep,
  waitForSkipStepArrival,
} from "~/components/bridge/use-multi-tx-step";
import { IS_TESTNET } from "~/config";
import { SOLANA_RPC_OVERWRITE } from "~/config/env";
import { ChainList } from "~/config/generated/chain-list";
import { HighPriceImpactGate, HighSlippageGate } from "~/config/trade-warnings";
import { useEvmWalletAccount, useSendEvmTransaction } from "~/hooks/evm-wallet";
import { useTranslation } from "~/hooks/language";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import {
  getPhantomProvider,
  usePhantomWallet,
} from "~/hooks/use-phantom-wallet";
import { useStore } from "~/stores";
import { isSameCoinDenom } from "~/utils/denom";
import { INSUFFICIENT_FEE_TOKENS_OSMOSIS_MARKER } from "~/utils/error";
import { getWagmiToastErrorMessage } from "~/utils/ethereum";
import { extractFeeDetailsFromError } from "~/utils/parse-fee";
import {
  classifySolanaSimulation,
  clientSolanaRpc,
  waitForSolanaSignature,
} from "~/utils/solana";
import { api, RouterInputs } from "~/utils/trpc";

const refetchInterval = 30 * 1000; // 30 seconds

/** An EVM transaction that was mined but reverted: it definitively failed
 *  on-chain, unlike a receipt timeout, where the tx may still land. */
class EvmTxRevertedError extends Error {
  constructor(readonly txHash: Address) {
    super(`Transaction ${txHash} reverted on-chain`);
  }
}

/** A Solana transaction that definitively moved nothing: it executed with
 *  an error, or its blockhash expired before it landed. */
class SolanaTxFailedError extends Error {
  constructor(readonly txHash: string, readonly outcome: "failed" | "dropped") {
    super(
      outcome === "failed"
        ? `Solana transaction ${txHash} failed on-chain`
        : `Solana transaction ${txHash} expired before landing`
    );
  }
}

/** A pre-signing simulation showed the Solana transaction can only fail:
 *  the payer lacks SOL for fees or rent, or its blockhash has expired.
 *  Raised BEFORE the wallet opens, so nothing has been signed. */
class SolanaPreflightError extends Error {
  constructor(readonly reason: "needs-sol" | "expired") {
    super(
      reason === "needs-sol"
        ? "Solana fee payer cannot cover the network fee or rent"
        : "Solana transaction blockhash has expired"
    );
  }
}

/** Phantom (like EIP-1193 wallets) rejects a declined signature with 4001. */
const isWalletRejection = (e: unknown) =>
  typeof e === "object" &&
  e !== null &&
  "code" in e &&
  (e as { code: unknown }).code === 4001;

/** Toast for a failed Solana signing attempt, before or after the wallet
 *  opened. Actionable causes get their own copy; the rest stay generic. */
const getSolanaErrorToastContent = (e: unknown) => {
  if (e instanceof SolanaPreflightError) {
    return e.reason === "needs-sol"
      ? {
          titleTranslationKey: "transfer.insufficientFundsForFees",
          captionTranslationKey: "transfer.solanaNeedsSol",
        }
      : {
          titleTranslationKey: "transfer.quoteUpdatedTitle",
          captionTranslationKey: "transfer.quoteUpdatedCaption",
        };
  }
  if (isWalletRejection(e)) {
    return {
      titleTranslationKey: "transactionFailed",
      captionTranslationKey: "requestRejected",
    };
  }
  return {
    titleTranslationKey: "transfer.somethingIsntWorking",
    captionTranslationKey: "transfer.sorryForTheInconvenience",
  };
};

/** Display denom of a chain's fee token (e.g. USDC.n for uusdc on noble-1),
 *  for user-facing copy; falls back to the minimal denom when unknown. */
const displayFeeDenom = (chainId: string, minimalDenom: string) =>
  ChainList.find((c) => c.chain_id === chainId)?.feeCurrencies.find(
    (fc) => fc.coinMinimalDenom === minimalDenom
  )?.coinDenom ?? minimalDenom;

// For simulating, sending (when Phantom lacks signAndSendTransaction) and
// watching Solana transactions: the configured domain-restricted production
// RPC, else the public node the Wormhole redeem flow uses. None of these
// calls are indexed queries, which publicnode would reject.
const SOLANA_RPC =
  SOLANA_RPC_OVERWRITE?.trim() || "https://solana-rpc.publicnode.com";

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
  const { address: phantomAddress } = usePhantomWallet();
  const { t } = useTranslation();
  const [isBroadcastingTx, setIsBroadcastingTx] = useState(false);
  /**
   * Phase of an in-flight multi-transaction transfer:
   * - "preflight": validating the intermediate signer (may pop wallet
   *   prompts) before anything irreversible
   * - "waiting-arrival": first tx sent; polling until the funds reach the
   *   intermediate chain
   * - "step2-signing": prompting the wallet for the final step
   */
  const [multiTxPhase, setMultiTxPhase] = useState<
    "preflight" | "waiting-arrival" | "step2-signing" | undefined
  >();
  // Synchronous re-entry guard for the multi-tx flow: multiTxPhase only
  // commits on the next render, so two rapid confirms could both pass a
  // state-based check and broadcast the first transaction twice.
  const multiTxInFlightRef = useRef(false);
  // Same synchronous guard for single-tx Solana signing: React state only
  // commits on the next render, so two Confirm clicks in one frame would
  // both reach Phantom, and a quote refresh between them could yield two
  // distinct transactions that both land.
  const solanaTxInFlightRef = useRef(false);
  // Covers the Phantom prompt itself, so Confirm stays disabled while the
  // wallet is open. EVM gets this from wagmi's pending state; Solana has no
  // equivalent, and `isBroadcastingTx` only starts once the wallet returns.
  const [isAwaitingSolanaSignature, setIsAwaitingSolanaSignature] =
    useState(false);
  const isMountedRef = useRef(true);
  useUnmount(() => {
    isMountedRef.current = false;
  });

  const isDeposit = direction === "deposit";
  const isWithdraw = direction === "withdraw";

  const featureFlags = useFeatureFlags();
  /**
   * Multi-tx routes end with a step signed by the user's cosmos wallet on an
   * intermediate chain (e.g. noble-1), so only request them when that wallet
   * is connected — it's the Osmosis-side account, which chain-suggests the
   * intermediate chain at signing time.
   */
  const cosmosSideChain = isWithdraw ? fromChain : toChain;
  const allowMultiTx =
    featureFlags.multiTxBridgeRoutes === true &&
    // deposits only: the executor supports exactly an EVM first tx followed
    // by one cosmos step, so a multi-tx withdraw route would quote (and
    // render its steps badge) only to be refused at Confirm
    !isWithdraw &&
    cosmosSideChain?.chainType === "cosmos" &&
    Boolean(accountStore.getWallet(cosmosSideChain.chainId)?.isWalletConnected);

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
      allowMultiTx,
    }),
    [
      fromAddress,
      fromAsset,
      fromChain,
      toAddress,
      toAsset,
      toChain,
      allowMultiTx,
    ]
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
    } else if (fromChain.chainType === "solana") {
      return isAwaitingSolanaSignature || isBroadcastingTx;
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
            // or while a multi-tx transfer is mid-flow
            !multiTxPhase &&
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
              intermediateGasFees,
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

            // The network fee shown must cover every transaction the user
            // signs, not just the first: fold the intermediate steps' fees
            // (e.g. uusdc on noble-1 for a multi-tx route) into the fiat
            // total and expose their coin amounts for the fee breakdown.
            let gasCostFiat = estimatedGasFee?.fiatValue;
            for (const fee of intermediateGasFees ?? []) {
              if (fee.fiatValue) {
                gasCostFiat = gasCostFiat?.add(fee.fiatValue) ?? fee.fiatValue;
              }
            }
            const intermediateGasCosts = (intermediateGasFees ?? []).map(
              (fee) => fee.amount.maxDecimals(8)
            );

            // Nomic, whose quotes bundle an Osmosis swap, reports price impact
            // as a negative fraction, Squid as positive.
            // Normalize to magnitude so the gate comparison and the re-arm
            // math work regardless of the provider's sign convention.
            const priceImpact = new RatePretty(
              normalizePriceImpact(new Dec(expectedOutput.priceImpact))
            );

            // Handle cases where fiat values might be undefined
            const expectedOutputFiatDec = expectedOutput.fiatValue?.toDec();
            const inputFiatDec = input.fiatValue?.toDec();

            // Total end-to-end value loss of the transfer as a fraction of the
            // input (1 - output/input). This is the all-in figure — it bundles
            // provider/bridge fees, gas, any bundled swap's price impact, and
            // exchange-rate spread — not swap slippage in the AMM sense.
            let transferSlippage: Dec;
            if (!expectedOutputFiatDec || !inputFiatDec) {
              // If we don't have fiat values, use actual token amounts for slippage calculation
              const expectedOutputAmount = expectedOutput.amount.toDec();
              const inputAmount = input.amount.toDec();

              if (expectedOutputAmount.gt(inputAmount)) {
                // if expected output is greater than input, assume slippage is 0%
                transferSlippage = new Dec(0);
              } else if (expectedOutputAmount.lte(new Dec(0))) {
                // if expected output is zero or negative, assume slippage is 100%
                transferSlippage = new Dec(1);
              } else {
                transferSlippage = new Dec(1).sub(
                  expectedOutputAmount.quo(inputAmount)
                );
              }
            } else if (expectedOutputFiatDec.gt(inputFiatDec)) {
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
              intermediateGasCosts,
              transferFee: transferFee.amount.maxDecimals(8),
              // fee charged on top of the input amount, so max-amount
              // inputs must leave room for it in the user's balance
              isAdditiveFee: transferFee.isAdditive === true,
              expectedOutput: expectedOutput.amount,
              expectedOutputFiat: expectedOutput.fiatValue,
              transferFeeFiat: transferFee.fiatValue,
              gasCostFiat,
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
              transferSlippage,
              isSlippageTooHigh: transferSlippage.gt(HighSlippageGate),
              isPriceImpactTooHigh: priceImpact
                .toDec()
                .gte(HighPriceImpactGate),
              // the quote bundles an Osmosis swap whose price impact could not
              // be determined — the loss is unknown, which must warn, not pass
              isSwapImpactUnknown: expectedOutput.priceImpactUnknown === true,
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

  /**
   * Live loss figures for the selected quote — the input to the frozen-basis
   * acknowledgement model. See `loss-acknowledgement.ts`.
   */
  const currentLossFigures: LossFigures | undefined = useMemo(() => {
    if (!selectedQuote) return undefined;
    return {
      providerId: selectedQuote.provider.id,
      fromChainId: fromChain?.chainId,
      toChainId: toChain?.chainId,
      fromAssetAddress: fromAsset?.address,
      toAssetAddress: toAsset?.address,
      inputAmount: inputAmount.toString(),
      slippage: selectedQuote.transferSlippage,
      priceImpact: selectedQuote.priceImpact.toDec(),
      warnSlippage: selectedQuote.isSlippageTooHigh,
      warnPriceImpact: selectedQuote.isPriceImpactTooHigh,
      swapImpactUnknown: selectedQuote.isSwapImpactUnknown,
    };
  }, [
    selectedQuote,
    fromChain?.chainId,
    toChain?.chainId,
    fromAsset?.address,
    toAsset?.address,
    inputAmount,
  ]);

  const {
    acknowledgedBasis,
    hasAcknowledgedLoss,
    setLossAcknowledged,
    warningNeedsAcknowledgement,
  } = useLossAcknowledgement(currentLossFigures);

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

  // Check if value loss during transfer is too high (Skip bridge specific)
  // Skip returns InsufficientAmountError when USD value difference is too large
  const isValueLossTooHigh = useMemo(() => {
    if (!someError?.message) return false;

    const errorMsg = someError.message.toLowerCase();
    return (
      errorMsg.includes("insufficientamounterror") &&
      errorMsg.includes("difference in usd value") &&
      errorMsg.includes("too large")
    );
  }, [someError]);

  // Check if transfer amount is insufficient to cover bridge/network fees
  // This combines two checks:
  // 1. Bridge provider errors (server-side) - when bridge returns InsufficientAmountError
  // 2. Client-side calculation - when input amount minus fees is <= 0
  const isInsufficientFee = useMemo(() => {
    // First check it's not the value loss error (handled separately)
    const errorMsg = someError?.message.toLowerCase() ?? "";
    if (
      errorMsg.includes("insufficientamounterror") &&
      errorMsg.includes("difference in usd value")
    ) {
      return false; // This is value loss, not insufficient fee
    }

    // Check for bridge provider error responses
    // These errors come from the getQuoteByBridge edge function
    if (someError?.message.includes("InsufficientAmountError" as BridgeError))
      return true;

    // Check for specific error message patterns from various bridge providers
    if (
      errorMsg.includes("input amount is too low to cover") ||
      errorMsg.includes("amount is too low") ||
      errorMsg.includes("insufficient amount")
    ) {
      return true;
    }

    // Client-side calculation: check if user has enough to cover fees
    if (!inputCoin || !selectedQuote || !selectedQuote.gasCost) return false;

    const isGasSameAsset = isSameCoinDenom(inputCoin, selectedQuote.gasCost);
    const isFeeSameAsset = isSameCoinDenom(
      inputCoin,
      selectedQuote.transferFee
    );
    const inputAmount = inputCoin.toDec();

    // Additive fees (e.g. Skip EVM bridge fees) are charged on top of the input,
    // so the wallet must fund input + fee + gas. Compare that against the
    // balance rather than deducting from the input — otherwise a manual amount
    // (or a max on a dust balance) passes validation but fails at signing.
    // Cross-denom coverage (native fee/gas vs a token input) is tracked in
    // MTN-216.
    if (selectedQuote.isAdditiveFee && availableBalance) {
      let requiredAmount = inputAmount;
      if (isFeeSameAsset) {
        requiredAmount = requiredAmount.add(selectedQuote.transferFee.toDec());
      }
      if (isGasSameAsset) {
        requiredAmount = requiredAmount.add(selectedQuote.gasCost.toDec());
      }
      return requiredAmount.gt(availableBalance.toDec());
    }

    let totalFeeCoinAmount = new Dec(0);
    if (isGasSameAsset) {
      totalFeeCoinAmount = totalFeeCoinAmount.add(
        selectedQuote.gasCost.toDec()
      );
    }
    if (isFeeSameAsset) {
      totalFeeCoinAmount = totalFeeCoinAmount.add(
        selectedQuote.transferFee.toDec()
      );
    }

    if (isGasSameAsset || isFeeSameAsset) {
      const maxAmount = inputAmount.sub(totalFeeCoinAmount);

      if (maxAmount.isNegative() || maxAmount.isZero()) return true;
    }

    return false;
  }, [someError, inputCoin, selectedQuote, availableBalance]);

  // Extract fee details from error message if available (for bridge amount errors)
  const insufficientFeeDetails = useMemo(() => {
    if (!isInsufficientFee || !someError?.message) return null;
    return extractFeeDetailsFromError(someError.message);
  }, [isInsufficientFee, someError]);

  // Server (`getQuoteByBridge`) tags Osmosis-source withdrawals that fail
  // because the user's account holds no fee token with sufficient balance with
  // the `INSUFFICIENT_FEE_TOKENS_OSMOSIS_MARKER` marker so we can render the
  // dedicated shared warning instead of the generic "Something isn't working"
  // box.
  const hasInsufficientFeeTokensForOsmosis = useMemo(() => {
    return (
      someError?.message?.includes(INSUFFICIENT_FEE_TOKENS_OSMOSIS_MARKER) ??
      false
    );
  }, [someError]);

  const isInvalidAddress = useMemo(() => {
    return someError?.message.includes("taproot");
  }, [someError]);

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
          !isValueLossTooHigh &&
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
      pendingStep,
    }: {
      sendTxHash: string;
      quote: NonNullable<typeof selectedQuote>["quote"];
      nomicCheckpointIndex?: number;
      /** Set for multi-tx transfers still awaiting a later user-signed step. */
      pendingStep?: TxSnapshot["pendingStep"];
    }): boolean => {
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
          pendingStep,
        });
        return true;
      }
      // Reports whether the entry was actually recorded: the multi-tx flow
      // must know, since its final step refuses to sign without a persisted
      // record to guard against double-signing.
      return false;
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
  const { getIntermediateAccount, signFinalStep } = useMultiTxFinalStep();

  /** Signs and broadcasts an EVM bridge tx — including any required ERC20
   *  approval — resolving with the tx hash once it's included in a block. */
  const sendEvmBridgeTx = async (
    transactionRequest: EvmBridgeTransactionRequest,
    /** Called with the tx hash as soon as the wallet broadcasts, before the
     *  receipt is awaited. */
    onBroadcast?: (txHash: Address) => void
  ): Promise<Address> => {
    if (!isEvmWalletConnected || !evmAddress || !evmConnector)
      throw new Error("No ETH wallet account is connected");
    if (!currentEvmChain)
      throw new Error("No EVM chain selected or chain is unsupported");

    const publicClient = createPublicClient({
      transport: getEvmRpcTransport(currentEvmChain),
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

      const approvalReceipt = await waitForTransactionReceipt(publicClient, {
        hash: approveTxHash,
      });
      if (approvalReceipt.status === "reverted") {
        throw new EvmTxRevertedError(approveTxHash);
      }

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
      gas: transactionRequest.gas ? BigInt(transactionRequest.gas) : undefined,
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

    // The tx is on its way the moment the wallet returns a hash: give the
    // caller the chance to persist it BEFORE waiting on the receipt, so
    // closing the app during confirmation can't lose the record.
    onBroadcast?.(sendTxHash);

    setIsBroadcastingTx(true);

    // viem RETURNS (not throws) for a tx that reverted on-chain. A reverted
    // first step must surface as a failure — for multi-tx transfers the
    // entry was already persisted at broadcast, and without this it would
    // sit "pending" forever with a Continue that can never work.
    const receipt = await waitForTransactionReceipt(publicClient, {
      hash: sendTxHash,
    });
    if (receipt.status === "reverted") {
      throw new EvmTxRevertedError(sendTxHash);
    }

    return sendTxHash;
  };

  /**
   * EVM transactions carry no auth-memo field (`EvmBridgeTransactionRequest`
   * is only to/data/value/gas), so the warn-accept memo stamp (MTN-137)
   * cannot be recorded on this path. The acknowledgement gate itself still
   * applies — only the on-chain forensic proof is unavailable.
   */
  const signAndBroadcastEvmTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    const transactionRequest =
      quote.transactionRequest as EvmBridgeTransactionRequest;
    try {
      const sendTxHash = await sendEvmBridgeTx(transactionRequest);

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
        walletName: evmConnector?.name ?? "",
      });
      displayToast(toastContent, ToastType.ERROR);
    } finally {
      setIsApprovingToken(false);
      setIsBroadcastingTx(false);
    }
  };

  /**
   * Executes a multi-transaction route. The intermediate signer is
   * preflighted BEFORE the irreversible first transaction: the wallet must
   * connect on the intermediate chain, its account there must match the
   * address the quote's transactions were built against, and the final
   * step's fee token must be funded when it isn't paid from the arriving
   * funds. Then: sign the first tx (EVM, or Solana via Phantom), wait for
   * the funds to reach the
   * intermediate chain, and rebuild + sign the final step there. Closing
   * the modal mid-flow is safe: the transfer persists with its pending step
   * and can be resumed from history.
   */
  const signAndBroadcastMultiTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"],
    transactionSteps: NonNullable<
      NonNullable<typeof selectedQuote>["quote"]["transactionSteps"]
    >
  ) => {
    const [firstStep, ...laterSteps] = transactionSteps;
    const finalStep = laterSteps[0];
    // Multi-tx routes Skip returns today have one first step signed on the
    // source chain (an EVM burn, or a Solana burn signed with Phantom) and
    // one final cosmos step; refuse anything else rather than executing a
    // partial route.
    if (
      (firstStep.type !== "evm" && firstStep.type !== "solana") ||
      laterSteps.length !== 1 ||
      finalStep.type !== "cosmos" ||
      typeof finalStep.chainId !== "string"
    ) {
      displayToast(
        {
          titleTranslationKey: "transfer.somethingIsntWorking",
          captionTranslationKey: "transfer.sorryForTheInconvenience",
        },
        ToastType.ERROR
      );
      return;
    }
    const finalStepChainId = finalStep.chainId;
    const finalStepPrettyName =
      ChainList.find((c) => c.chain_id === finalStepChainId)?.prettyName ??
      finalStepChainId;
    // set the moment the first tx leaves the wallet: the error handling
    // below must know whether an entry keyed on it was already persisted
    let firstStepBroadcastHash: string | undefined;

    try {
      // ---- Preflight the intermediate signer; nothing irreversible yet ----
      // Enter the flow state immediately: the preflight can pop wallet
      // prompts (chain connect), and the review screen hides its exit and
      // disables Confirm while a phase is set.
      setMultiTxPhase("preflight");
      const senderAddress = await getIntermediateAccount(finalStepChainId);
      // The quote's transactions were built against a derived intermediate
      // address. If the wallet can't provide an account there, or provides a
      // DIFFERENT one, the first tx would route funds through an account the
      // user doesn't control — abort before anything is sent.
      const draftSender = (
        finalStep.msgs[0]?.value as { sender?: string } | undefined
      )?.sender;
      if (!senderAddress || !draftSender || draftSender !== senderAddress) {
        displayToast(
          {
            titleTranslationKey: "transfer.multiTxWrongAccountTitle",
            captionTranslationKey: [
              "transfer.multiTxWrongAccount",
              { chain: finalStepPrettyName },
            ],
          },
          ToastType.ERROR
        );
        return;
      }
      // The funds this step will move on the intermediate chain: the token
      // of the drafted final msg (same chain and minimal denom as the fee).
      const draftToken = (
        finalStep.msgs[0]?.value as
          | { token?: { denom?: string; amount?: string } }
          | undefined
      )?.token;

      // When the final step's fee isn't paid from the arriving funds (fee
      // denom differs from the token the step moves, e.g. INJ on
      // Injective), the account there must already hold the fee token. When
      // they match, no balance to check yet: the fee is sized to the
      // route's fee reserve when the step is built for signing.
      const stepGasFee = finalStep.gasFee;
      if (stepGasFee && stepGasFee.denom !== draftToken?.denom) {
        const balance = await getChainBalance({
          chainId: finalStepChainId,
          address: senderAddress,
          denom: stepGasFee.denom,
        });
        // Fail closed on an unreadable balance: this runs BEFORE anything
        // irreversible and is cheap to retry, so not knowing whether the
        // fee token is funded must block, not proceed.
        if (balance === undefined) {
          displayToast(
            {
              titleTranslationKey: "transfer.somethingIsntWorking",
              captionTranslationKey: "transfer.sorryForTheInconvenience",
            },
            ToastType.ERROR
          );
          return;
        }
        if (balance < BigInt(stepGasFee.amount)) {
          displayToast(
            {
              titleTranslationKey: "transfer.insufficientFundsForFees",
              captionTranslationKey: [
                "transfer.multiTxGasWarning",
                {
                  denom: displayFeeDenom(finalStepChainId, stepGasFee.denom),
                  chain: finalStepPrettyName,
                },
              ],
            },
            ToastType.ERROR
          );
          return;
        }
      }

      // draftToken also feeds the resume-time sanity check. Replay
      // protection does NOT come from balances (shared state that changes
      // for unrelated reasons): it comes from the persisted history store,
      // which the signing session updates at final-step broadcast and any
      // stale session re-reads before signing (syncPendingStepFromStorage).

      // ---- Step 1: the source-chain transaction (EVM or Solana) ----
      // Persist the resumable entry (with the quoted route, so the final
      // step can be rebuilt after a reload) the moment the wallet returns a
      // hash: the funds are en route from broadcast, so waiting for the
      // receipt to record it would lose the resume record if the app
      // closes during confirmation.
      let entryRecorded = false;
      const onFirstStepBroadcast = (broadcastHash: string) => {
        firstStepBroadcastHash = broadcastHash;
        entryRecorded = trackTransferStatus({
          quote,
          sendTxHash: broadcastHash,
          pendingStep: {
            chainId: finalStepChainId,
            prettyName: finalStepPrettyName,
            stepIndex: 2,
            totalSteps: transactionSteps.length,
            priorStepTxHash: broadcastHash,
            routeData: quote.multiTxRouteData,
            intermediateAddress: senderAddress,
            expectedArrival:
              draftToken?.denom && draftToken?.amount
                ? { denom: draftToken.denom, amount: draftToken.amount }
                : undefined,
          },
        });
      };
      const sendTxHash =
        firstStep.type === "evm"
          ? await sendEvmBridgeTx(firstStep, onFirstStepBroadcast)
          : await sendSolanaBridgeTx(firstStep, onFirstStepBroadcast);
      setIsBroadcastingTx(false);

      // The persisted entry is the replay guard the final step refuses to
      // sign without, and the only recovery surface if this session ends:
      // if it wasn't recorded, say so loudly instead of dead-ending later.
      if (!entryRecorded) {
        console.error("Multi-tx transfer entry was not recorded at broadcast");
        displayToast(
          {
            titleTranslationKey: "transfer.somethingIsntWorking",
            captionTranslationKey: [
              "transfer.multiTxRecordFailed",
              { chain: finalStepPrettyName },
            ],
          },
          ToastType.ERROR
        );
        return;
      }
      // ...and durable, not just in memory: the final step's signing guard
      // reads PERSISTED storage, and storage is the only recovery surface
      // if this session ends. The autorun persist is fire-and-forget, so
      // await an explicit write before relying on it.
      try {
        await transferHistoryStore.persistNow();
      } catch (e) {
        console.error("Multi-tx transfer entry could not be persisted", e);
        displayToast(
          {
            titleTranslationKey: "transfer.somethingIsntWorking",
            captionTranslationKey: [
              "transfer.multiTxRecordFailed",
              { chain: finalStepPrettyName },
            ],
          },
          ToastType.ERROR
        );
        return;
      }

      setMultiTxPhase("waiting-arrival");
      const arrival = await waitForSkipStepArrival({
        chainId: String(fromChain?.chainId ?? firstStep.chainId),
        txHash: sendTxHash,
        isActive: () => isMountedRef.current,
      });
      // the user closed the modal: leave the resumable entry in history
      if (arrival === "aborted" || arrival === "pending") return;
      if (arrival === "failed") {
        transferHistoryStore.receiveNewTxStatus(
          sendTxHash,
          "failed",
          undefined
        );
        return;
      }

      // ---- Step 2: the intermediate-chain transaction ----
      setMultiTxPhase("step2-signing");
      await signFinalStep({
        bridge: quote.provider.id,
        quoteParams: {
          ...(quoteParams as Required<typeof quoteParams>),
          fromAmount: quote.input.amount.toCoin().amount,
        },
        stepChainId: finalStepChainId,
        senderAddress,
        routeData: quote.multiTxRouteData,
        priorStepTxHash: sendTxHash,
        onBroadcasted: () => setIsBroadcastingTx(true),
        onBroadcastFailed: () => setIsBroadcastingTx(false),
        onFulfilled: () => {
          onTransferProp?.();
          setTransferInitiated(true);
        },
      });
    } catch (e) {
      // A first tx that definitively failed (an EVM revert, or a Solana tx
      // that errored or expired before landing) moved nothing: the entry
      // persisted at broadcast must not stay "pending" with a Continue that
      // can never work.
      if (
        (e instanceof EvmTxRevertedError || e instanceof SolanaTxFailedError) &&
        e.txHash === firstStepBroadcastHash
      ) {
        transferHistoryStore.receiveNewTxStatus(e.txHash, "failed", undefined);
      }
      // Named multi-tx failures (route expired, fee shortfall) carry
      // specific recovery copy shared with the resume flow; the funds are
      // on the intermediate chain and the entry stays resumable from
      // history. Everything else gets the wallet-error mapping for the wallet
      // that was signing (Phantom errors are not wagmi errors).
      const multiTxToast = getMultiTxErrorToastContent(e, finalStepPrettyName);
      displayToast(
        multiTxToast ??
          (firstStep.type === "solana"
            ? getSolanaErrorToastContent(e)
            : getWagmiToastErrorMessage({
                error: e as BaseError,
                t,
                walletName: evmConnector?.name ?? "",
              })),
        ToastType.ERROR
      );
      if (e instanceof SolanaPreflightError && e.reason === "expired") {
        for (const quoteResult of quoteResults) void quoteResult.refetch();
      }
    } finally {
      setIsApprovingToken(false);
      setIsBroadcastingTx(false);
      setMultiTxPhase(undefined);
    }
  };

  /**
   * Signs and sends a Skip-built Solana transaction with Phantom, resolving
   * with its signature once it has landed. The Solana counterpart of
   * `sendEvmBridgeTx`: `onBroadcast` fires the moment the wallet submits it,
   * before confirmation, so callers can persist it.
   *
   * Throws `SolanaTxFailedError` only when the outcome is definite (failed
   * on-chain, or dropped with an expired blockhash). An outcome it cannot
   * prove within the watch resolves normally, and the caller's own status
   * tracking takes over: treating "can't tell yet" as a failure would mark
   * a transfer failed that may still land.
   */
  const sendSolanaBridgeTx = async (
    transactionRequest: SolanaBridgeTransactionRequest,
    onBroadcast?: (signature: string) => void
  ): Promise<string> => {
    const phantom = getPhantomProvider();
    if (!phantom || !phantomAddress) {
      throw new Error("No Phantom wallet connected");
    }
    // The Skip-built transaction is bound to a specific signer. If the user
    // switched Phantom accounts after this quote was built, the refreshed
    // quote (keyed on fromAddress) replaces it momentarily; never ask the
    // wrong account to sign.
    if (transactionRequest.signerAddress !== phantomAddress) {
      throw new Error(
        "Connected Phantom account does not match the quoted signer"
      );
    }

    const { Connection, Transaction, VersionedTransaction } = await import(
      "@solana/web3.js"
    );
    const txBytes = Buffer.from(transactionRequest.txBase64, "base64");
    let solanaTx: unknown;
    let recentBlockhash: string | undefined;
    try {
      const versioned = VersionedTransaction.deserialize(txBytes);
      solanaTx = versioned;
      recentBlockhash = versioned.message.recentBlockhash;
    } catch {
      const legacy = Transaction.from(txBytes);
      solanaTx = legacy;
      recentBlockhash = legacy.recentBlockhash ?? undefined;
    }

    // Preflight by simulation BEFORE opening the wallet: a payer without SOL
    // (the burn also funds rent for the account it creates, which the quoted
    // fee excludes) or an expired blockhash can only fail, and opening
    // Phantom for it wastes the user's time. Signature checks are skipped
    // since the user has not signed yet. An unanswerable simulation is not a
    // reason to block: Phantom simulates again before signing.
    const simulation = await clientSolanaRpc<{
      value?: { err?: unknown; logs?: string[] | null };
    }>(
      "simulateTransaction",
      [
        transactionRequest.txBase64,
        {
          encoding: "base64",
          sigVerify: false,
          replaceRecentBlockhash: false,
          commitment: "processed",
        },
      ],
      [SOLANA_RPC]
    ).catch(() => undefined);
    if (simulation?.value) {
      const preflight = classifySolanaSimulation(
        simulation.value.err,
        simulation.value.logs
      );
      if (preflight !== "ok") throw new SolanaPreflightError(preflight);
    }

    const connection = new Connection(SOLANA_RPC, "confirmed");
    let signature: string;
    if (phantom.signAndSendTransaction) {
      ({ signature } = await phantom.signAndSendTransaction(solanaTx));
    } else if (phantom.signTransaction) {
      const signed = (await phantom.signTransaction(solanaTx)) as {
        serialize: () => Uint8Array;
      };
      signature = await connection.sendRawTransaction(signed.serialize());
    } else {
      throw new Error("Phantom provider cannot sign transactions");
    }

    onBroadcast?.(signature);
    setIsBroadcastingTx(true);

    const outcome = await waitForSolanaSignature({
      getStatus: async (searchHistory) =>
        (
          await connection.getSignatureStatuses([signature], {
            searchTransactionHistory: searchHistory,
          })
        ).value[0],
      isBlockhashValid: recentBlockhash
        ? async () =>
            (
              await connection.isBlockhashValid(recentBlockhash!, {
                commitment: "confirmed",
              })
            ).value
        : undefined,
    });
    if (outcome === "failed" || outcome === "dropped") {
      throw new SolanaTxFailedError(signature, outcome);
    }
    return signature;
  };

  const signAndBroadcastSolanaTx = async (
    quote: NonNullable<typeof selectedQuote>["quote"]
  ) => {
    const transactionRequest =
      quote.transactionRequest as SolanaBridgeTransactionRequest;
    if (solanaTxInFlightRef.current) return; // already signing
    solanaTxInFlightRef.current = true;
    setIsAwaitingSolanaSignature(true);
    let broadcastSignature: string | undefined;
    try {
      // Record the transfer the moment it is submitted, as the EVM and
      // multi-tx paths do: the funds are en route from broadcast, and
      // waiting for confirmation to record it would lose the history entry
      // if the app closes meanwhile.
      await sendSolanaBridgeTx(transactionRequest, (signature) => {
        broadcastSignature = signature;
        trackTransferStatus({
          quote,
          sendTxHash: signature,
        });
      });

      onTransferProp?.();
      setTransferInitiated(true);
    } catch (e) {
      console.error("Solana transaction failed", e);
      // Definitely failed after being recorded: resolve the entry instead
      // of leaving it pending on a transaction that can no longer land.
      if (e instanceof SolanaTxFailedError && e.txHash === broadcastSignature) {
        transferHistoryStore.receiveNewTxStatus(e.txHash, "failed", undefined);
      }
      displayToast(getSolanaErrorToastContent(e), ToastType.ERROR);
      // An expired transaction can only be replaced by a fresh quote.
      if (e instanceof SolanaPreflightError && e.reason === "expired") {
        for (const quoteResult of quoteResults) void quoteResult.refetch();
      }
    } finally {
      solanaTxInFlightRef.current = false;
      setIsAwaitingSolanaSignature(false);
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

    // Warn-accept flags for the tx auth memo (MTN-137), stamped from the
    // frozen acknowledged basis — the sign-time guard in `onTransfer` has
    // already ensured the basis is fresh for the quote being signed.
    const memoFlags = deriveMemoFlags(acknowledgedBasis);

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
        // On the amino path the wallet-returned memo is what gets encoded —
        // don't let wallets offer to edit/drop the warn-accept proof.
        ...(memoFlags && { preferNoSetMemo: true }),
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
      },
      memoFlags
    );
  };

  const onTransfer = async () => {
    // Last-line guard: a warned transfer must hold a fresh acknowledgement at
    // the moment of signing. The disabled state of the confirm button is
    // advisory rendering — a 30s refetch or provider auto-switch can land
    // between the last render and the click, so the acknowledgement is
    // re-validated synchronously here against the figures that will be signed.
    if (needsAcknowledgement(acknowledgedBasis, currentLossFigures)) {
      setLossAcknowledged(false);
      displayToast(
        {
          titleTranslationKey: "transfer.quoteUpdatedTitle",
          captionTranslationKey: "transfer.quoteUpdatedCaption",
        },
        ToastType.ERROR
      );
      return;
    }

    const transactionRequest =
      selectedQuote?.transactionRequest ??
      bridgeTransaction.data?.transactionRequest;
    const quote = selectedQuote?.quote;

    if (!transactionRequest || !quote) {
      console.error("No quote or transaction to use for transfer");
      return;
    }

    // multi-transaction route: step-through flow with its own error handling
    const transactionSteps = quote.transactionSteps;
    if (transactionSteps && transactionSteps.length > 1) {
      if (multiTxPhase || multiTxInFlightRef.current) return; // already mid-flow
      multiTxInFlightRef.current = true;
      try {
        await signAndBroadcastMultiTx(quote, transactionSteps).catch((e) => {
          console.error("multi-tx transfer failed", e);
          throw e;
        });
      } finally {
        multiTxInFlightRef.current = false;
      }
      return;
    }

    const tx =
      transactionRequest.type === "evm"
        ? signAndBroadcastEvmTx({ ...quote, transactionRequest })
        : transactionRequest.type === "solana"
        ? signAndBroadcastSolanaTx({ ...quote, transactionRequest })
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
  const warnUserOfUnknownSwapImpact = selectedQuote?.isSwapImpactUnknown;
  const isCorrectEvmChainSelected =
    fromChain?.chainType === "evm"
      ? currentEvmChainId === fromChain?.chainId
      : true;

  const isWrongEvmChainSelected =
    isDeposit && !isCorrectEvmChainSelected && fromChain?.chainType === "evm";

  /** Info about the selected quote's multi-tx route, when it needs more than
   *  one user-signed transaction. */
  const multiTxSteps = selectedQuote?.quote.transactionSteps;
  const multiTx = useMemo(() => {
    if (!multiTxSteps || multiTxSteps.length <= 1) return undefined;
    const finalStep = multiTxSteps[multiTxSteps.length - 1];
    const chainId =
      typeof finalStep.chainId === "string" ? finalStep.chainId : undefined;
    const gasFee = finalStep.type === "cosmos" ? finalStep.gasFee : undefined;
    // the token the final step's drafted msg moves, in the intermediate
    // chain's own minimal denom (same denom space as the fee)
    const draftDenom =
      finalStep.type === "cosmos"
        ? (
            finalStep.msgs[0]?.value as
              | { token?: { denom?: string } }
              | undefined
          )?.token?.denom
        : undefined;
    return {
      totalSteps: multiTxSteps.length,
      intermediateChainId: chainId,
      intermediatePrettyName:
        ChainList.find((c) => c.chain_id === chainId)?.prettyName ??
        chainId ??
        "",
      /** DISPLAY denom of the final step's network fee (e.g. USDC.n on
       *  noble-1, INJ on injective-1), so surfaces can warn when the
       *  account there must hold a different asset than the one being
       *  transferred. */
      finalStepGasFeeDenom:
        gasFee && chainId
          ? displayFeeDenom(chainId, gasFee.denom)
          : gasFee?.denom,
      /**
       * True when the final step's fee token differs from the token the
       * step itself moves — the arriving funds then can't pay the step's
       * own gas, so the user's account on the intermediate chain must hold
       * the fee token.
       */
      finalStepGasWarning: Boolean(gasFee && gasFee.denom !== draftDenom),
    };
  }, [multiTxSteps]);

  let errorBoxMessage: { heading: string; description: string } | undefined;
  /**
   * True only when a high-loss warning owns `errorBoxMessage` — i.e. no
   * higher-precedence error (insufficient fee, value loss, invalid address,
   * transaction-request failure, …) is active. This is the flag surfaces use
   * to decide whether to render the acknowledgement checkbox and unlock the
   * confirm button through it; using the raw warn flags instead would pair
   * the checkbox with the wrong copy and unlock past blocking errors.
   */
  let highLossWarningActive = false;
  if (hasInsufficientFeeTokensForOsmosis) {
    // Surface this case via the dedicated warning component rendered by the
    // consumer (amount-screen). We still set a fallback text-only errorBox to
    // keep `userCanAdvance` gating consistent for surfaces that don't render
    // the dedicated component.
    errorBoxMessage = {
      heading: t("errors.insufficientFeeTokens.title"),
      description: t("errors.insufficientFeeTokens.body"),
    };
  } else if (isValueLossTooHigh) {
    errorBoxMessage = {
      heading: t("transfer.transferAmountTooLowValueLoss"),
      description: t("transfer.valueLossTooHighToBridge"),
    };
  } else if (isInsufficientFee) {
    errorBoxMessage = {
      heading: t("transfer.insufficientFundsForFees"),
      description: insufficientFeeDetails
        ? t("transfer.youNeedFundsToPayWithFee", {
            chain:
              (isWithdraw ? toChain?.prettyName : fromChain?.prettyName) ?? "",
            feeAmount: insufficientFeeDetails.amount,
            feeCurrency: insufficientFeeDetails.currency,
          })
        : t("transfer.youNeedFundsToPay", {
            chain:
              (isWithdraw ? toChain?.prettyName : fromChain?.prettyName) ?? "",
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
  } else if (isInvalidAddress) {
    errorBoxMessage = {
      heading: t("transfer.invalidAddress", {
        chain: toChain?.prettyName ?? "",
      }),
      description: t("taprootAddressNotSupported"),
    };
  } else if (bridgeTransaction.error || Boolean(someError)) {
    errorBoxMessage = {
      heading: t("transfer.somethingIsntWorking"),
      description: t("transfer.sorryForTheInconvenience"),
    };
  } else if (warnUserOfSlippage) {
    highLossWarningActive = true;
    errorBoxMessage = {
      heading: t("transfer.slippageTooHighTitle"),
      description: t("transfer.slippageTooHighDescription"),
    };
  } else if (warnUserOfPriceImpact) {
    highLossWarningActive = true;
    errorBoxMessage = {
      heading: t("transfer.priceImpactTooHighTitle"),
      description: t("transfer.priceImpactTooHighDescription"),
    };
  } else if (warnUserOfUnknownSwapImpact) {
    highLossWarningActive = true;
    errorBoxMessage = {
      heading: t("transfer.unknownSwapImpactTitle"),
      description: t("transfer.unknownSwapImpactDescription"),
    };
  }
  // Insufficient balance is not part of the errorBox chain (it renders its
  // own inline error), so exclude it here explicitly: quote queries disable
  // while the balance is insufficient, and a stale warned quote must not let
  // the acknowledgement checkbox unlock a transfer the user cannot fund.
  if (isInsufficientBal) highLossWarningActive = false;

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
  const isFromWalletConnected = isSourceWalletConnected({
    chainType: fromChain?.chainType,
    isEvmWalletConnected,
    isCosmosWalletConnected:
      fromChain?.chainType === "cosmos"
        ? accountStore.getWallet(fromChain.chainId)?.isWalletConnected ?? false
        : false,
    phantomAddress,
  });
  const isDepositReady = isDeposit && isFromWalletConnected;
  const isWithdrawReady = direction === "withdraw";
  const userCanAdvance =
    (isDepositReady || isWithdrawReady) &&
    !isInsufficientFee &&
    !isValueLossTooHigh &&
    !isInsufficientBal &&
    !isLoadingBridgeQuote &&
    !isLoadingBridgeTransaction &&
    !isTxPending &&
    !multiTxPhase &&
    !errorBoxMessage &&
    Boolean(selectedQuote);

  let buttonText: string;
  if (highLossWarningActive) {
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
  } else if (multiTxPhase === "waiting-arrival") {
    txButtonText = t("transfer.multiTxWaitingForFunds", {
      chain: multiTx?.intermediatePrettyName ?? "",
    });
  } else if (multiTxPhase === "step2-signing" || multiTxPhase === "preflight") {
    txButtonText = t("assets.transfer.approveInWallet");
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

    /** Set when the selected quote needs more than one signed transaction. */
    multiTx,
    /** Phase of an in-flight multi-tx transfer, undefined otherwise. */
    multiTxPhase,

    isInsufficientFee,
    isInsufficientBal,
    warnUserOfSlippage,
    warnUserOfPriceImpact,
    warnUserOfUnknownSwapImpact,
    highLossWarningActive,

    acknowledgedBasis,
    hasAcknowledgedLoss,
    setLossAcknowledged,
    warningNeedsAcknowledgement,

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
