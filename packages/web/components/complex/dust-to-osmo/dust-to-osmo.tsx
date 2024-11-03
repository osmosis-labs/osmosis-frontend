import { Dec } from "@keplr-wallet/unit";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

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

  const [isSendingSwapTxs, setIsSendingSwapTxs] = useState(0);

  const onSendSwapTxStatus = useCallback(
    (status: UseMutationResult["status"]) => {
      switch (status) {
        case "loading":
          setIsSendingSwapTxs((prev) => prev + 1);
          break;
        case "error":
        case "success":
          // We are being cheerfully neglectful with error handling here
          setIsSendingSwapTxs((prev) => prev - 1);
          break;
        case "idle":
        default:
          break;
      }
    },
    []
  );

  const { data: dustAssets, isSuccess: isSuccessDust } =
    api.edge.assets.getUserDustAssets.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
        // TODO(Greg): the dust threshold has changed to 0.02.
        // Is it ok to use this or should I use the 0.01 which was specified?
        dustThreshold: HideDustUserSetting.DUST_THRESHOLD,
      },
      {
        enabled: !isLoadingWallet && Boolean(account?.address) && convertDust,
        cacheTime: 0,
      }
    );

  return (
    <>
      <Button
        className="gap-2 !border !border-osmoverse-700 !py-2 !px-4 !text-wosmongton-200"
        variant="outline"
        size="lg-full"
        isLoading={convertDust && isSendingSwapTxs > 0}
        onClick={() => setConvertDust(true)}
      >
        <Icon id="dust-broom" className="h-6 w-6" />
        {t("dustToOsmo.mainButton")}
      </Button>
      {isSuccessDust &&
        dustAssets.map((dustAsset) => (
          <SwapHandler
            key={dustAsset.coinDenom}
            fromDenom={dustAsset.coinDenom}
            amount={dustAsset.amount.toDec().toString()}
            onSendSwapTxStatus={onSendSwapTxStatus}
          />
        ))}
    </>
  );
}

function SwapHandler({
  fromDenom,
  amount,
  onSendSwapTxStatus,
}: {
  fromDenom: string;
  amount: string;
  onSendSwapTxStatus: (status: UseMutationResult["status"]) => void;
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
    if (isReadyToSwap && isSendSwapTxIdle) {
      sendSwapTx();
    }
  }, [isReadyToSwap, isSendSwapTxIdle, sendSwapTx]);

  useEffect(() => {
    if (sendSwapTxStatus !== "idle") {
      // useSwap needs a bit of time to be ready so we send loading first
      onSendSwapTxStatus("loading");
    } else {
      onSendSwapTxStatus(sendSwapTxStatus);
    }
  }, [sendSwapTxStatus, onSendSwapTxStatus]);

  return <></>;
}
