import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { CoinPretty, Dec, Int, PricePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { Spinner } from "~/components/loaders";
import { CustomClasses } from "~/components/types";
import { EntityImage } from "~/components/ui/entity-image";
import { useFeatureFlags, useTranslation } from "~/hooks";
import {
  useOrderbookClaimableOrders,
  useOrderbookOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useAssetInfo } from "~/hooks/use-asset-info";
import { useStore } from "~/stores";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";

export const AssetOrderHistory = observer(({ className }: CustomClasses) => {
  const { accountStore } = useStore();
  const { asset } = useAssetInfo();
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();

  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { orders, isLoading, refetch, isRefetching } = useOrderbookOrders({
    userAddress: wallet?.address ?? "",
    pageSize: 100,
    refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
  });

  const filteredOrders = useMemo(() => {
    const denom = asset.coinMinimalDenom;
    return orders.filter(
      (o) =>
        (o.status === "open" ||
          o.status === "partiallyFilled" ||
          o.status === "filled") &&
        (o.baseAsset?.coinMinimalDenom === denom ||
          o.quoteAsset?.coinMinimalDenom === denom)
    );
  }, [orders, asset.coinMinimalDenom]);

  const filledOrders = useMemo(
    () => filteredOrders.filter((o) => o.status === "filled"),
    [filteredOrders]
  );

  const { claimAllOrders, count: claimableCount } = useOrderbookClaimableOrders(
    {
      userAddress: wallet?.address ?? "",
      disabled: isLoading || filledOrders.length === 0 || isRefetching,
      refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
    }
  );

  if (!wallet?.isWalletConnected || (!isLoading && filteredOrders.length === 0))
    return null;

  return (
    <section
      className={classNames(
        "flex flex-col gap-3 rounded-3xl border border-osmoverse-700 p-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h6>{t("portfolio.openOrders")}</h6>
        <Link
          href="/transactions?tab=orders"
          className="body2 text-wosmongton-300 hover:text-wosmongton-200"
        >
          {t("portfolio.seeAll")}
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner className="!h-6 !w-6" />
        </div>
      ) : (
        <div className="flex flex-col">
          {filledOrders.length > 0 && (
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="body2 font-semibold">
                  {t("limitOrders.orderHistoryHeaders.filled")}
                </span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#A51399]">
                  <span className="caption">{claimableCount}</span>
                </div>
              </div>
              <ClaimAllButton
                claimAllOrders={claimAllOrders}
                refetch={refetch}
              />
            </div>
          )}
          {filteredOrders.map((order, i) => (
            <OrderRow key={i} order={order} refetch={refetch} />
          ))}
        </div>
      )}
    </section>
  );
});

function ClaimAllButton({
  claimAllOrders,
  refetch,
}: {
  claimAllOrders: () => Promise<void>;
  refetch: () => Promise<any>;
}) {
  const { t } = useTranslation();
  const [claiming, setClaiming] = useState(false);

  const claim = async () => {
    setClaiming(true);
    try {
      await claimAllOrders();
      await refetch();
    } finally {
      setClaiming(false);
    }
  };

  return (
    <button
      className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 px-3 py-1.5 disabled:opacity-50"
      onClick={claim}
      disabled={claiming}
    >
      {claiming && <Spinner className="mr-2 !h-2 !w-2" />}
      <span className="caption">{t("limitOrders.claimAll")}</span>
    </button>
  );
}

function OrderRow({
  order,
  refetch,
}: {
  order: MappedLimitOrder;
  refetch: () => Promise<any>;
}) {
  const { t } = useTranslation();
  const {
    order_direction,
    baseAsset,
    quoteAsset,
    placed_quantity,
    output,
    price,
    status,
  } = order;

  const baseCurrency = {
    coinDecimals: baseAsset?.decimals ?? 0,
    coinDenom: baseAsset?.symbol ?? "",
    coinMinimalDenom: baseAsset?.coinMinimalDenom ?? "",
  };
  const quoteCurrency = {
    coinDecimals: quoteAsset?.decimals ?? 0,
    coinDenom: quoteAsset?.symbol ?? "",
    coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
  };

  const baseAmount = new CoinPretty(
    baseCurrency,
    order_direction === "ask" ? placed_quantity : output
  );
  const quoteAmount = new CoinPretty(
    quoteCurrency,
    order_direction === "ask" ? output : placed_quantity
  );
  const fiatValue = new PricePretty(
    DEFAULT_VS_CURRENCY,
    order_direction === "bid"
      ? placed_quantity /
        Number(new Dec(10).pow(new Int(quoteAsset?.decimals ?? 0)).toString())
      : output.quo(new Dec(10).pow(new Int(quoteAsset?.decimals ?? 0)))
  );

  const statusColor = classNames({
    "text-bullish-400": status === "filled" || status === "fullyClaimed",
    "text-osmoverse-300": status === "open" || status === "partiallyFilled",
  });

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
        <EntityImage
          width={32}
          height={32}
          logoURIs={baseAsset?.rawAsset.logoURIs ?? { png: undefined }}
          name={baseAsset?.rawAsset.name ?? ""}
          symbol={baseAsset?.rawAsset.symbol ?? ""}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="body2 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {order_direction === "bid"
            ? t("limitOrders.buy")
            : t("limitOrders.sell")}{" "}
          {formatPretty(baseAmount)}
        </span>
        <span className="caption overflow-hidden overflow-ellipsis whitespace-nowrap text-osmoverse-300">
          {formatPretty(quoteAmount)} ·{" "}
          {formatPretty(new PricePretty(DEFAULT_VS_CURRENCY, price), {
            ...getPriceExtendedFormatOptions(price),
          })}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="body2">{formatFiatPrice(fiatValue, 2)}</span>
        {status === "open" || status === "partiallyFilled" ? (
          <OrderProgressBar order={order} totalPercentClassNames="caption" />
        ) : (
          <span className={classNames("caption", statusColor)}>
            {t("limitOrders.filled")}
          </span>
        )}
      </div>

      <div className="shrink-0">
        <ActionsCell order={order} refetch={refetch} />
      </div>
    </div>
  );
}
