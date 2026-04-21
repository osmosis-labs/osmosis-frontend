import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import { CoinPretty, Dec, Int, PricePretty } from "@osmosis-labs/unit";
import React, { FunctionComponent, useCallback, useState } from "react";

import { LinkButton } from "~/components/buttons/link-button";
import { Spinner } from "~/components/loaders";
import { EntityImage } from "~/components/ui/entity-image";
import { useTranslation } from "~/hooks";
import {
  useOrderbookClaimableOrders,
  useOrderbookOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";
import { formatFiatPrice, formatPretty } from "~/utils/formatter";

const OPEN_ORDERS_LIMIT = 5;

interface OpenOrdersProps {
  /** When provided, filters orders to those involving this asset and also shows filled/claimable orders. */
  coinMinimalDenom?: string;
}

export const OpenOrders: FunctionComponent<OpenOrdersProps> = ({
  coinMinimalDenom,
}) => {
  const { t } = useTranslation();
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);

  const { orders: allActiveOrders, isLoading } = useOrderbookOrders({
    userAddress: wallet?.address ?? "",
    pageSize: coinMinimalDenom ? 100 : OPEN_ORDERS_LIMIT,
    filter: "open",
  });

  const activeOrders = coinMinimalDenom
    ? allActiveOrders.filter(
        (o) =>
          o.baseAsset?.coinMinimalDenom === coinMinimalDenom ||
          o.quoteAsset?.coinMinimalDenom === coinMinimalDenom
      )
    : allActiveOrders;

  const {
    orders: claimableOrders,
    claimAllOrders,
    isLoading: isClaimableLoading,
  } = useOrderbookClaimableOrders({
    userAddress: wallet?.address ?? "",
    disabled: !coinMinimalDenom,
  });

  const filledOrders = coinMinimalDenom
    ? claimableOrders.filter(
        (o) =>
          o.baseAsset?.coinMinimalDenom === coinMinimalDenom ||
          o.quoteAsset?.coinMinimalDenom === coinMinimalDenom
      )
    : [];

  const [claiming, setClaiming] = useState(false);
  const claim = useCallback(async () => {
    setClaiming(true);
    try {
      await claimAllOrders();
    } finally {
      setClaiming(false);
    }
  }, [claimAllOrders]);

  const hasOrders = activeOrders.length > 0 || filledOrders.length > 0;

  if (isLoading || !hasOrders) return null;

  return (
    <div className="flex w-full flex-col py-3">
      <div className="flex items-center justify-between gap-3">
        <h6 className="py-3">{t("portfolio.openOrders")}</h6>
        <LinkButton
          href="/transactions?tab=orders"
          className="-mx-2 text-osmoverse-400"
          label={t("portfolio.seeAll")}
          ariaLabel={t("portfolio.seeAll")}
          size="md"
        />
      </div>
      <div className="w-full flex-col justify-between self-stretch">
        {filledOrders.length > 0 && (
          <div className="mb-2 flex items-center justify-between">
            <span className="body2 text-bullish-400">
              {t("limitOrders.orderHistoryHeaders.filled")}
            </span>
            <button
              className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 py-1.5 px-3 disabled:opacity-50"
              onClick={claim}
              disabled={claiming || isClaimableLoading}
            >
              {claiming && <Spinner className="mr-1.5 !h-3 !w-3" />}
              <span className="caption">{t("limitOrders.claimAll")}</span>
            </button>
          </div>
        )}
        {[...filledOrders, ...activeOrders].map((order, index) => (
          <OrderRow key={index} order={order} />
        ))}
      </div>
    </div>
  );
};

const OrderRow: FunctionComponent<{ order: MappedLimitOrder }> = ({
  order,
}) => {
  const { t } = useTranslation();
  const {
    baseAsset,
    quoteAsset,
    order_direction,
    output,
    placed_quantity,
    status,
  } = order;

  const formattedBuySellToken = formatPretty(
    new CoinPretty(
      {
        coinDecimals: baseAsset?.decimals ?? 0,
        coinDenom: baseAsset?.symbol ?? "",
        coinMinimalDenom: baseAsset?.coinMinimalDenom ?? "",
      },
      order_direction === "ask" ? placed_quantity : output
    )
  );

  const formattedFiatPrice = formatFiatPrice(
    new PricePretty(
      DEFAULT_VS_CURRENCY,
      order_direction === "bid"
        ? placed_quantity /
          Number(new Dec(10).pow(new Int(quoteAsset?.decimals ?? 0)).toString())
        : output.quo(new Dec(10).pow(new Int(quoteAsset?.decimals ?? 0)))
    ),
    2
  );

  const formattedQuoteAsset = formatPretty(
    new CoinPretty(
      {
        coinDecimals: quoteAsset?.decimals ?? 0,
        coinDenom: quoteAsset?.symbol ?? "",
        coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
      },
      order_direction === "ask" ? output : placed_quantity
    )
  );

  const buySellText =
    order_direction === "bid" ? t("portfolio.buy") : t("portfolio.sell");

  const isFilled = status === "filled";

  return (
    <div className="-mx-2 flex justify-between gap-4 p-2">
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
        <EntityImage
          width={32}
          height={32}
          logoURIs={baseAsset?.rawAsset.logoURIs ?? { png: undefined }}
          name={baseAsset?.rawAsset.name ?? ""}
          symbol={baseAsset?.rawAsset.symbol ?? ""}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <span className="body2 truncate">
          {buySellText} {baseAsset?.currency?.coinDenom}
        </span>
        <span className="caption truncate text-osmoverse-300">
          {formattedBuySellToken}
        </span>
      </div>
      <div className="body2 flex shrink-0 flex-col items-end justify-between text-right">
        <span className={isFilled ? "text-bullish-400" : ""}>
          {isFilled ? t("limitOrders.filled") : formattedFiatPrice}
        </span>
        <span className="caption text-osmoverse-300">
          {formattedQuoteAsset}
        </span>
      </div>
    </div>
  );
};
