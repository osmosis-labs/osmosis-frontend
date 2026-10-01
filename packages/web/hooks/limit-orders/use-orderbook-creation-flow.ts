import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { useMemo, useState } from "react";

import { AssetLists } from "~/config/generated/asset-lists";
import { useWalletSelect } from "~/hooks";
import { useTranslation } from "~/hooks/language";
import { useCreateOrderbook } from "~/hooks/limit-orders/use-create-orderbook";
import { useOrderbookRatioGuard } from "~/hooks/limit-orders/use-orderbook-ratio-guard";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

/**
 * The confirm-modal flow shared by every orderbook-creation entry point (the
 * Limit tab and the Pay With / Receive dropdown): modal and fee-acknowledgement
 * state, the wallet handoff, the confirm-time ratio guard, and the creation
 * fee read from chain with a balance precheck. Callers render
 * `CreateOrderbookModal` with `modalProps` and decide what success means for
 * their UI via `onCreated`.
 *
 * Denoms must be resolved minimal denoms (never URL symbols): they end up in
 * the instantiate message. Decimals come from the same asset-list entry as
 * the denom, so the ratio guard can never pair one asset's denom with another
 * asset's decimals.
 */
export function useOrderbookCreationFlow({
  baseDenom,
  quoteDenom,
  onCreated,
}: {
  baseDenom: string;
  quoteDenom: string;
  onCreated?: () => void;
}) {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const { onOpenWalletSelect } = useWalletSelect();

  const [isOpen, setIsOpen] = useState(false);
  const [acknowledgeFee, setAcknowledgeFee] = useState(false);

  const baseAsset = useMemo(
    () =>
      baseDenom
        ? getAssetFromAssetList({
            assetLists: AssetLists,
            coinMinimalDenom: baseDenom,
          })
        : undefined,
    [baseDenom]
  );
  const quoteAsset = useMemo(
    () =>
      quoteDenom
        ? getAssetFromAssetList({
            assetLists: AssetLists,
            coinMinimalDenom: quoteDenom,
          })
        : undefined,
    [quoteDenom]
  );

  const {
    createOrderbook,
    isCreating,
    error: createError,
    resetError,
  } = useCreateOrderbook({ baseDenom, quoteDenom });

  const { isBlocked: isRatioBlocked, isRatioTooLow } = useOrderbookRatioGuard({
    baseDenom,
    quoteDenom,
    baseDecimals: baseAsset?.decimals,
    quoteDecimals: quoteAsset?.decimals,
  });

  // Fetched only while the modal is open: the fee is what the chain charges
  // MsgCreateCosmWasmPool, so it must be known before a paid confirm.
  const { data: poolCreationFee } =
    api.edge.orderbooks.getPoolCreationFee.useQuery(undefined, {
      enabled: isOpen,
      staleTime: 1000 * 60 * 5,
    });
  const feeCoin = poolCreationFee?.[0];
  const feeAsset = useMemo(
    () =>
      feeCoin
        ? getAssetFromAssetList({
            assetLists: AssetLists,
            coinMinimalDenom: feeCoin.denom,
          })
        : undefined,
    [feeCoin]
  );
  const feeLabel =
    feeCoin && feeAsset
      ? new CoinPretty(feeAsset.currency, new Dec(feeCoin.amount))
          .trim(true)
          .toString()
      : undefined;

  const { data: balances, isFetching: isFetchingBalances } =
    api.local.balances.getUserBalances.useQuery(
      { bech32Address: account?.address ?? "" },
      { enabled: isOpen && !!account?.address }
    );
  const hasInsufficientFeeBalance = useMemo(() => {
    if (!feeCoin || !balances) return false;
    const held = balances.find((b) => b.denom === feeCoin.denom)?.amount ?? "0";
    return new Int(held).lt(new Int(feeCoin.amount));
  }, [balances, feeCoin]);

  // Every way the modal closes (dismiss, wallet handoff, success) goes through
  // here so the acknowledgement and any previous attempt's error never carry
  // over to the next open.
  const close = () => {
    setIsOpen(false);
    setAcknowledgeFee(false);
    resetError();
  };

  const isWalletConnected = !!account?.isWalletConnected;
  // Anything still loading keeps the confirm disabled (fail closed); settled
  // blocks get a reason the modal shows instead of closing silently.
  const isConfirmPending =
    isWalletConnected &&
    (!baseAsset ||
      !quoteAsset ||
      (isRatioBlocked && !isRatioTooLow) ||
      !feeCoin ||
      !balances ||
      isFetchingBalances);
  const blockedReason = isRatioTooLow
    ? t("limitOrders.unavailable", { denom: baseAsset?.symbol ?? baseDenom })
    : isWalletConnected && hasInsufficientFeeBalance
    ? t("errors.insufficientBal")
    : undefined;

  const confirm = async () => {
    if (!isWalletConnected) {
      // Hand the user to the wallet selector rather than silently closing.
      close();
      onOpenWalletSelect({
        walletOptions: [
          { walletType: "cosmos", chainId: accountStore.osmosisChainId },
        ],
      });
      return;
    }
    // Re-checked at click time: the modal can sit open while prices and
    // balances load or move, and only a settled, passing verdict may sign.
    if (isConfirmPending || blockedReason) return;
    try {
      await createOrderbook();
      close();
      onCreated?.();
    } catch {
      // createOrderbook sets the error the modal shows; keep it open.
    }
  };

  return {
    isOpen,
    open: () => setIsOpen(true),
    close,
    modalProps: {
      isOpen,
      onRequestClose: close,
      isCreating,
      error: createError,
      acknowledgeFee,
      onAcknowledgeFee: setAcknowledgeFee,
      onConfirm: confirm,
      feeLabel,
      isConfirmPending,
      blockedReason,
    },
  };
}
