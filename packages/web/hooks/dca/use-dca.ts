import { useCallback, useMemo, useState } from "react";

import {
  DCA_CONTRACT,
  DCA_INTERVAL_OPTIONS,
  DEFAULT_DCA_INTERVAL,
  DEFAULT_DCA_SLIPPAGE,
  DcaInterval,
} from "~/config/dca";
import {
  buildCreateVaultMsg,
  planExecutions,
  validatePerExec,
  validateTotal,
} from "~/hooks/dca/dca-utils";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

export interface UseDcaParams {
  initialSendDenom?: string;
  initialTargetDenom?: string;
}

export type DcaState = ReturnType<typeof useDca>;

export function useDca({
  initialSendDenom = "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA84", // USDC
  initialTargetDenom = "uosmo",
}: UseDcaParams = {}) {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { dcaSubHourly } = useFeatureFlags();

  const swapState = useSwap({
    initialFromDenom: initialSendDenom,
    initialToDenom: initialTargetDenom,
    useQueryParams: false,
    useOtherCurrencies: true,
    quoteType: "out-given-in",
    maxSlippage: undefined,
  });

  const sendAsset = swapState.fromAsset;
  const targetAsset = swapState.toAsset;
  const sendDenom = sendAsset?.coinMinimalDenom ?? initialSendDenom;
  const targetDenom = targetAsset?.coinMinimalDenom ?? initialTargetDenom;

  // amountRaw = per-execution swap amount (drives the quote preview)
  const amountRaw = swapState.inAmountInput.inputAmount;
  const setAmountRaw = swapState.inAmountInput.setAmount;

  // totalRaw = total deposit sent with the vault creation tx
  const [totalRaw, setTotalRaw] = useState("");

  const [interval, setInterval] = useState<DcaInterval>(DEFAULT_DCA_INTERVAL);
  const [slippageRaw, setSlippageRaw] = useState(DEFAULT_DCA_SLIPPAGE);
  const [minReceiveRaw, setMinReceiveRaw] = useState("");
  const [startNow, setStartNow] = useState(true);
  const [startTimeUtc, setStartTimeUtc] = useState<Date | undefined>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [txError, setTxError] = useState<string | undefined>();

  const availableBalance =
    swapState.inAmountInput.balance &&
    !swapState.inAmountInput.balance.toDec().isZero()
      ? formatPretty(swapState.inAmountInput.balance.toDec(), {
          minimumSignificantDigits: 6,
          maximumSignificantDigits: 6,
          maxDecimals: 10,
          notation: "standard",
        })
      : undefined;

  // Live quote estimate — number only, token shown separately in the dropdown
  const estimatedOutput = swapState.quote?.amount
    ? formatPretty(swapState.quote.amount.toDec(), {
        minimumSignificantDigits: 6,
        maximumSignificantDigits: 6,
        maxDecimals: 10,
        notation: "standard",
      })
    : "";

  // How many executions the deposit covers, and a human duration string
  const { executionCount, durationLabel } = useMemo(
    () => planExecutions(amountRaw, totalRaw, interval),
    [amountRaw, totalRaw, interval]
  );

  const perExecError = useMemo(() => validatePerExec(amountRaw), [amountRaw]);

  const totalError = useMemo(
    () =>
      validateTotal(
        totalRaw,
        amountRaw,
        swapState.inAmountInput.balance?.toDec()
      ),
    [totalRaw, amountRaw, swapState.inAmountInput.balance]
  );

  const canSubmit = useMemo(
    () =>
      !perExecError &&
      !totalError &&
      !!sendAsset &&
      !!targetAsset &&
      sendDenom !== targetDenom &&
      !!account?.address,
    [
      perExecError,
      totalError,
      sendAsset,
      targetAsset,
      sendDenom,
      targetDenom,
      account?.address,
    ]
  );

  const createVaultMsg = useMemo(() => {
    if (!canSubmit || !sendAsset || !targetAsset || !account?.address)
      return undefined;
    return buildCreateVaultMsg({
      contractAddress: DCA_CONTRACT,
      ownerAddress: account.address,
      sendDenom,
      sendDecimals: sendAsset.coinDecimals,
      targetDenom,
      targetDecimals: targetAsset.coinDecimals,
      amountRaw,
      totalRaw,
      slippageRaw,
      minReceiveRaw,
      interval,
      startNow,
      startTimeUtc,
    });
  }, [
    canSubmit,
    sendAsset,
    account?.address,
    amountRaw,
    totalRaw,
    slippageRaw,
    startNow,
    startTimeUtc,
    targetDenom,
    targetAsset,
    minReceiveRaw,
    interval,
    sendDenom,
  ]);

  const createVault = useCallback(
    async (onSuccess?: () => void) => {
      if (!createVaultMsg || !account) return;
      setIsConfirming(true);
      setTxError(undefined);
      try {
        await account.cosmwasm.sendExecuteContractMsg(
          "executeWasm",
          createVaultMsg.contractAddress,
          createVaultMsg.msg,
          createVaultMsg.funds
        );
        onSuccess?.();
        setAmountRaw("");
        setTotalRaw("");
      } catch (e) {
        setTxError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setIsConfirming(false);
      }
    },
    [createVaultMsg, account, setAmountRaw]
  );

  const intervalOptions = useMemo(
    () =>
      DCA_INTERVAL_OPTIONS.filter((o) => dcaSubHourly || !o.subHourly).map(
        (o) => ({ ...o, label: t(o.label) })
      ),
    [t, dcaSubHourly]
  );

  return {
    // asset state
    sendAsset,
    targetAsset,
    sendDenom,
    targetDenom,
    setSendDenom: swapState.setFromAssetDenom,
    setTargetDenom: swapState.setToAssetDenom,
    switchAssets: swapState.switchAssets,
    // selectable assets
    selectableAssets: swapState.selectableAssets,
    isLoadingSelectAssets: swapState.isLoadingSelectAssets,
    hasNextPageAssets: swapState.hasNextPageAssets,
    isFetchingNextPageAssets: swapState.isFetchingNextPageAssets,
    fetchNextPageAssets: swapState.fetchNextPageAssets,
    setAssetsQueryInput: swapState.setAssetsQueryInput,
    assetsQueryInput: swapState.assetsQueryInput,
    // per-execution amount (drives quote)
    amountRaw,
    setAmountRaw,
    inAmountInput: swapState.inAmountInput,
    availableBalance,
    estimatedOutput,
    isQuoteLoading: swapState.isQuoteLoading,
    tokenOutFiatValue: swapState.tokenOutFiatValue,
    // total deposit
    totalRaw,
    setTotalRaw,
    // execution summary
    executionCount,
    durationLabel,
    // dca-specific
    interval,
    setInterval,
    slippageRaw,
    setSlippageRaw,
    minReceiveRaw,
    setMinReceiveRaw,
    startNow,
    setStartNow,
    startTimeUtc,
    setStartTimeUtc,
    perExecError,
    totalError,
    canSubmit,
    createVault,
    isConfirming,
    txError,
    intervalOptions,
  };
}
