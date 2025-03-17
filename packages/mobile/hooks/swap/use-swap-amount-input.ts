import { Dec } from "@osmosis-labs/unit";
import { CoinPretty } from "@osmosis-labs/unit";
import { isNil } from "@osmosis-labs/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { useQueryRouterBestQuote } from "~/hooks/swap/use-query-best-quote";
import { useAmountInput } from "~/hooks/use-amount-input";
import { useDeepMemo } from "~/hooks/use-deep-memo";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { useOsmosisChain } from "~/hooks/use-osmosis-chain";
import { useIsTransactionInProgress } from "~/hooks/use-sign-and-broadcast";
import { useSwapStore } from "~/stores/swap";

export type UseSwapAmountInputReturn = ReturnType<typeof useSwapAmountInput>;

export function useSwapAmountInput({ direction }: { direction: "in" | "out" }) {
  const osmosisChain = useOsmosisChain();
  const { fromAsset, toAsset, maxSlippage } = useSwapStore(
    useShallow((state) => ({
      fromAsset: state.fromAsset,
      toAsset: state.toAsset,
      maxSlippage: state.maxSlippage,
    }))
  );
  const { isTransactionInProgress } = useIsTransactionInProgress();

  const [gasAmount, setGasAmount] = useState<CoinPretty | undefined>(undefined);

  const asset = useMemo(
    () => (direction === "in" ? fromAsset : toAsset),
    [direction, fromAsset, toAsset]
  );

  const amountInput = useAmountInput({
    currency: asset,
    gasAmount: gasAmount,
  });

  const balanceQuoteQueryEnabled = useMemo(
    () =>
      !isTransactionInProgress &&
      Boolean(fromAsset) &&
      Boolean(toAsset) &&
      // since the in amount is debounced, the asset could be wrong when switching assets
      amountInput.debouncedInAmount?.currency.coinMinimalDenom ===
        fromAsset!.coinMinimalDenom &&
      amountInput.amount?.currency.coinMinimalDenom ===
        fromAsset!.coinMinimalDenom &&
      !!amountInput.balance &&
      !amountInput.balance.toDec().isZero() &&
      amountInput.balance.currency.coinMinimalDenom ===
        fromAsset?.coinMinimalDenom,
    [
      isTransactionInProgress,
      fromAsset,
      toAsset,
      amountInput.debouncedInAmount,
      amountInput.amount,
      amountInput.balance,
    ]
  );

  const balanceQuoteParams = useMemo(
    () => ({
      tokenIn: fromAsset!,
      tokenOut: toAsset!,
      tokenInAmount: amountInput.balance?.toCoin().amount ?? "",
      maxSlippage,
    }),
    [fromAsset, toAsset, amountInput.balance, maxSlippage]
  );

  const {
    data: quoteForCurrentBalance,
    isLoading: isQuoteForCurrentBalanceLoading_,
    errorMsg: quoteForCurrentBalanceErrorMsg,
  } = useQueryRouterBestQuote(balanceQuoteParams, balanceQuoteQueryEnabled);

  const isQuoteForCurrentBalanceLoading = useMemo(
    () => isQuoteForCurrentBalanceLoading_ && balanceQuoteQueryEnabled,
    [isQuoteForCurrentBalanceLoading_, balanceQuoteQueryEnabled]
  );

  const networkFeeQueryEnabled = useMemo(
    () =>
      !isQuoteForCurrentBalanceLoading &&
      balanceQuoteQueryEnabled &&
      Boolean(quoteForCurrentBalance),
    [
      isQuoteForCurrentBalanceLoading,
      balanceQuoteQueryEnabled,
      quoteForCurrentBalance,
    ]
  );

  const networkFeeParams = useMemo(
    () => ({
      chainId: osmosisChain.chain_id,
      messages: quoteForCurrentBalance?.messages ?? [],
      enabled: networkFeeQueryEnabled,
    }),
    [
      osmosisChain.chain_id,
      quoteForCurrentBalance?.messages,
      networkFeeQueryEnabled,
    ]
  );

  const {
    data: currentBalanceNetworkFee,
    isLoading: isLoadingCurrentBalanceNetworkFee_,
    error: currentBalanceNetworkFeeError,
  } = useEstimateTxFees(networkFeeParams);

  const isLoadingCurrentBalanceNetworkFee = useMemo(
    () => networkFeeQueryEnabled && isLoadingCurrentBalanceNetworkFee_,
    [networkFeeQueryEnabled, isLoadingCurrentBalanceNetworkFee_]
  );

  const hasErrorWithCurrentBalanceQuote = useMemo(
    () => !!currentBalanceNetworkFeeError || !!quoteForCurrentBalanceErrorMsg,
    [currentBalanceNetworkFeeError, quoteForCurrentBalanceErrorMsg]
  );

  const notEnoughBalanceForMax = useMemo(
    () =>
      currentBalanceNetworkFeeError?.message.includes(
        "min out amount or max in amount should be positive"
      ) ||
      currentBalanceNetworkFeeError?.message.includes(
        "No fee tokens found with sufficient balance on account"
      ) ||
      currentBalanceNetworkFeeError?.message.includes(
        "Insufficient alternative balance for transaction fees"
      ) ||
      quoteForCurrentBalanceErrorMsg?.includes(
        "Not enough quoted. Try increasing amount."
      ),
    [currentBalanceNetworkFeeError?.message, quoteForCurrentBalanceErrorMsg]
  );

  // Use a ref to track the last gas amount to prevent unnecessary updates
  const lastGasAmountRef = useRef<CoinPretty | undefined>();

  useEffect(() => {
    if (isNil(currentBalanceNetworkFee?.gasAmount)) return;

    const newGasAmount = currentBalanceNetworkFee.gasAmount.mul(new Dec(1.02)); // Add 2% buffer

    // Only update if the gas amount has changed significantly
    if (
      !lastGasAmountRef.current ||
      !lastGasAmountRef.current.toDec().equals(newGasAmount.toDec())
    ) {
      lastGasAmountRef.current = newGasAmount;
      setGasAmount(newGasAmount);
    }
  }, [currentBalanceNetworkFee?.gasAmount]);

  const returnValue = useDeepMemo(() => {
    return {
      ...amountInput,
      isLoadingCurrentBalanceNetworkFee,
      hasErrorWithCurrentBalanceQuote,
      notEnoughBalanceForMax,
    };
  }, [
    amountInput,
    isLoadingCurrentBalanceNetworkFee,
    hasErrorWithCurrentBalanceQuote,
    notEnoughBalanceForMax,
  ]);

  return returnValue;
}
