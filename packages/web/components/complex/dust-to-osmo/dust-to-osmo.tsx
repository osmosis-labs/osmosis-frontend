import { Dec } from "@keplr-wallet/unit";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/ui/button";
import { DefaultSlippage } from "~/config/swap";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useSwap } from "~/hooks/use-swap";
import { useStore } from "~/stores";
import { HideDustUserSetting } from "~/stores/user-settings";
import { api } from "~/utils/trpc";

const maxSlippage = new Dec(DefaultSlippage);

export function DustToOsmo() {
  const { t } = useTranslation();

  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isLoadingWallet } = useWalletSelect();

  const [convertDust, setConvertDust] = useState(false);

  const {
    data: dustAssets,
    isSuccess: isSuccessDust,
    isFetched: isFetchedDust,
  } = api.edge.assets.getUserDustAssets.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
      // TODO(Greg): the dust threshold has changed to 0.02.
      // Is it ok to use this or should I use the 0.01 which was specified?
      dustThreshold: HideDustUserSetting.DUST_THRESHOLD,
    },
    {
      enabled: !isLoadingWallet && Boolean(account?.address) && convertDust,
      cacheTime: 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  return (
    <>
      <Button
        className="gap-2 !border !border-osmoverse-700 !py-2 !px-4 !text-wosmongton-200"
        variant="outline"
        size="lg-full"
        isLoading={convertDust}
        onClick={() => setConvertDust(true)}
      >
        <Icon id="dust-broom" className="h-6 w-6" />
        {t("dustToOsmo.mainButton")}
      </Button>
      {convertDust && isSuccessDust && (
        <SequentialSwapExecutor
          dustAssets={dustAssets}
          onComplete={() => setConvertDust(false)}
        />
      )}
    </>
  );
}

function SequentialSwapExecutor({
  dustAssets,
  onComplete,
}: {
  dustAssets: {
    coinDenom: string;
    amount: { toDec: () => { toString: () => string } };
  }[];
  onComplete: () => void;
}) {
  const [swapTxStatuses, setSwapTxStatuses] = useState<{
    [denom: string]: {
      status: UseMutationResult["status"];
      denom: string;
    };
  }>({});

  const hasAllSwapsFinished =
    Object.keys(swapTxStatuses).length === dustAssets.length &&
    Object.values(swapTxStatuses).every(
      ({ status }) => status === "success" || status === "error"
    );

  const handleSwapTxStatusChange = useCallback(
    (denom: string, status: UseMutationResult["status"]) =>
      setSwapTxStatuses((prev) => ({ ...prev, [denom]: { status, denom } })),
    []
  );

  const activeSwapDenom = useMemo(() => {
    const runningSwapDenom = Object.values(swapTxStatuses).find(
      (s) => s.status === "loading"
    )?.denom;

    if (runningSwapDenom) {
      return runningSwapDenom;
    }

    const nextDenom = Object.values(swapTxStatuses).find(
      (s) => s.status === "idle"
    )?.denom;

    return nextDenom ?? "";
  }, [swapTxStatuses]);

  useEffect(() => {
    // Notify the parent that we're done
    if (hasAllSwapsFinished) {
      onComplete();
    }
  }, [hasAllSwapsFinished, onComplete]);

  return (
    <>
      {dustAssets.map((dustAsset) => (
        <SwapHandler
          key={dustAsset.coinDenom}
          fromDenom={dustAsset.coinDenom}
          amount={dustAsset.amount.toDec().toString()}
          onSendSwapTxStatusChange={handleSwapTxStatusChange}
          shouldExecuteSwap={activeSwapDenom === dustAsset.coinDenom}
        />
      ))}
    </>
  );
}

function SwapHandler({
  fromDenom,
  amount,
  shouldExecuteSwap = false,
  onSendSwapTxStatusChange,
}: {
  fromDenom: string;
  amount: string;
  shouldExecuteSwap: boolean;
  onSendSwapTxStatusChange: (
    denom: string,
    status: UseMutationResult["status"]
  ) => void;
}) {
  const {
    inAmountInput: { setAmount: setInAmount },
    isReadyToSwap,
    sendTradeTokenInTx,
  } = useSwap({
    initialFromDenom: fromDenom,
    initialToDenom: "OSMO",
    useQueryParams: false,
    maxSlippage,
    quoteType: "out-given-in",
    inputDebounceMs: 0,
  });

  useEffect(() => {
    setInAmount(amount);
  }, [setInAmount, amount]);

  const {
    mutate: sendSwapTx,
    isIdle: isSendSwapTxIdle,
    status: sendSwapTxStatus,
  } = useMutation(sendTradeTokenInTx);

  useEffect(() => {
    if (shouldExecuteSwap && isReadyToSwap && isSendSwapTxIdle) {
      sendSwapTx();
    }
  }, [shouldExecuteSwap, isReadyToSwap, isSendSwapTxIdle, sendSwapTx]);

  useEffect(() => {
    onSendSwapTxStatusChange(fromDenom, sendSwapTxStatus);
  }, [sendSwapTxStatus, onSendSwapTxStatusChange, fromDenom]);

  return <></>;
}
