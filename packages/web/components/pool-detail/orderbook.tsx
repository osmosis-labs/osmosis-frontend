import { RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { parseAsStringEnum, parseAsStringLiteral, useQueryState } from "nuqs";
import { FunctionComponent, useEffect, useMemo, useState } from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { PlaceLimitTool } from "~/components/place-limit-tool";
import {
  OrderTypeSelector,
  TRADE_TYPES,
} from "~/components/swap-tool/order-type-selector";
import { SwapToolTab } from "~/components/swap-tool/swap-tool-tabs";
import { OrderBook } from "~/components/trade-view/order-book";
import { OrderbookYourOrders } from "~/components/trade-view/your-orders";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { api } from "~/utils/trpc";

import { AprBreakdown } from "../cards/apr-breakdown";
import { SkeletonLoader } from "../loaders/skeleton-loader";

const AssetUsdChart = dynamic(
  () => import("~/components/trade-view/charts").then((m) => m.AssetUsdChart),
  { ssr: false }
);

export const OrderbookPool: FunctionComponent<{ poolId: string }> = ({
  poolId,
}) => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();

  // Buy / Sell tab: written to the URL on mount so PlaceLimitTool picks up the default
  const [tradeTab, setTradeTab] = useQueryState(
    "tab",
    parseAsStringEnum<SwapToolTab>(Object.values(SwapToolTab)).withDefault(
      SwapToolTab.BUY
    )
  );

  // Default to limit order type on this page
  const [, setTradeType] = useQueryState(
    "type",
    parseAsStringLiteral(TRADE_TYPES).withDefault("limit")
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("tab")) setTradeTab(SwapToolTab.BUY);
    if (!params.has("type")) setTradeType("limit");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pool base data
  const { data: pool } = api.local.pools.getPool.useQuery({ poolId });

  // Orderbook metadata
  const { data: allOrderbooks } = api.edge.orderbooks.getPools.useQuery();
  const orderbook = useMemo(
    () => allOrderbooks?.find((ob) => ob.poolId === poolId),
    [allOrderbooks, poolId]
  );
  const contractAddress = orderbook?.contractAddress ?? "";
  const baseDenom =
    orderbook?.baseDenom ??
    pool?.reserveCoins[0]?.currency.coinMinimalDenom ??
    "";
  const quoteDenom =
    orderbook?.quoteDenom ??
    pool?.reserveCoins[1]?.currency.coinMinimalDenom ??
    "";

  // reserveCoins sorted to match normalized base/quote orientation
  const poolReserveCoins = pool?.reserveCoins;
  const sortedReserveCoins = useMemo(() => {
    if (!poolReserveCoins || !baseDenom) return poolReserveCoins ?? [];
    const base = poolReserveCoins.find(
      (c) => c.currency.coinMinimalDenom === baseDenom
    );
    const quote = poolReserveCoins.find(
      (c) => c.currency.coinMinimalDenom === quoteDenom
    );
    if (base && quote) return [base, quote];
    return poolReserveCoins;
  }, [poolReserveCoins, baseDenom, quoteDenom]);

  // Maker fee
  const { data: makerFeeData } = api.edge.orderbooks.getMakerFee.useQuery(
    { osmoAddress: contractAddress },
    { enabled: Boolean(contractAddress) }
  );

  // Price selected by clicking a depth table row, forwarded to PlaceLimitTool
  const [selectedPrice, setSelectedPrice] = useState<string>("");

  // Display denom for TradingView — use the normalized baseDenom from orderbook metadata
  const baseCoinDenom =
    baseDenom || (pool?.reserveCoins[0]?.currency.coinMinimalDenom ?? "");

  // Incentives / APR
  const { data: incentives, isLoading: isLoadingIncentives } =
    api.edge.pools.getPoolIncentives.useQuery(
      { poolId },
      { enabled: featureFlags.aprBreakdown }
    );

  return (
    <main className="m-auto flex min-h-screen max-w-container flex-col gap-8 px-8 py-4 md:gap-4 md:p-4">
      <section className="flex flex-col gap-4">
        {/* ── Header row ── */}
        <div className="flex flex-row items-start gap-4 px-2 lg:flex-col lg:gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <PoolAssetsIcon
                className="!w-[78px]"
                assets={sortedReserveCoins.map((coin) => ({
                  coinImageUrl: coin.currency.coinImageUrl,
                  coinDenom: coin.currency.coinDenom,
                  coinMinimalDenom: coin.currency.coinMinimalDenom,
                }))}
              />
              <PoolAssetsName
                size="md"
                className="text-h5 font-h5"
                assetDenoms={sortedReserveCoins.map(({ denom, currency }) => ({
                  minDenom: currency.coinMinimalDenom,
                  symbol: denom,
                }))}
              />
            </div>
            <div className="flex items-center gap-1.5 text-wosmongton-300">
              <Icon id="coins" height={18} width={18} />
              <span className="body2">{t("pool.orderbookPool.type")}</span>
            </div>
          </div>
          <div className="flex flex-grow justify-end lg:justify-start">
            {makerFeeData && !makerFeeData.makerFee.isZero() && (
              <PoolDataGroup
                label={t("pool.orderbookPool.makerFee")}
                value={new RatePretty(makerFeeData.makerFee)
                  .maxDecimals(2)
                  .toString()}
              />
            )}
          </div>
        </div>

        {/* ── TradingView chart ── */}
        <div
          className="h-[340px] overflow-hidden rounded-3xl border border-osmoverse-700"
          style={{ marginBottom: "-60px" }}
        >
          <AssetUsdChart coinDenom={baseCoinDenom || undefined} />
        </div>

        {/* ── APR breakdown ── */}
        {featureFlags.aprBreakdown && (
          <SkeletonLoader isLoaded={!isLoadingIncentives}>
            <AprBreakdown
              className="shrink-0 rounded-3xl"
              showDisclaimerTooltip
              {...incentives?.aprBreakdown}
            />
          </SkeletonLoader>
        )}

        {/* ── Trade widget + Depth table (side by side) ── */}
        <div className="flex items-start gap-6 lg:flex-col">
          {/* Trade widget — natural height, bordered */}
          <div className="w-[512px] shrink-0 rounded-3xl border border-osmoverse-700 lg:w-full">
            {/* Buy / Sell tabs — each takes 50% */}
            <div className="flex overflow-hidden rounded-t-3xl">
              {([SwapToolTab.BUY, SwapToolTab.SELL] as const).map((tab, i) => {
                const isActive = tradeTab === tab;
                const isBuy = tab === SwapToolTab.BUY;
                return (
                  <button
                    key={tab}
                    onClick={() => setTradeTab(tab)}
                    className={classNames(
                      "flex-1 py-3 font-semibold transition-colors",
                      isActive
                        ? isBuy
                          ? "bg-bullish-400 text-osmoverse-1000"
                          : "bg-rust-500 text-white"
                        : i === 0
                          ? "border-b border-r border-osmoverse-700 bg-osmoverse-900 text-osmoverse-400 hover:text-osmoverse-200"
                          : "border-b border-osmoverse-700 bg-osmoverse-900 text-osmoverse-400 hover:text-osmoverse-200"
                    )}
                  >
                    {isBuy ? t("portfolio.buy") : t("limitOrders.sell")}
                  </button>
                );
              })}
            </div>
            {/* Limit / Market toggle */}
            <div className="flex items-center px-5 pt-4">
              <OrderTypeSelector
                initialBaseDenom={baseDenom}
                initialQuoteDenom={quoteDenom}
              />
            </div>
            {/* PlaceLimitTool with matching padding */}
            <div className="px-5 pb-4">
              <PlaceLimitTool
                key={tradeTab}
                initialBaseDenom={baseDenom}
                initialQuoteDenom={quoteDenom}
                alwaysExpandedDetails
                externalOrderPrice={selectedPrice}
              />
            </div>
          </div>

          {/* Market depth panel: stretches to the trade widget's height */}
          <div className="relative min-w-0 flex-1 self-stretch lg:min-h-[500px]">
            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-osmoverse-700 bg-osmoverse-1000">
              <OrderBook
                poolId={poolId}
                baseSymbol={
                  pool?.reserveCoins.find(
                    (c) => c.currency.coinMinimalDenom === baseDenom
                  )?.currency.coinDenom
                }
                quoteSymbol={
                  pool?.reserveCoins.find(
                    (c) => c.currency.coinMinimalDenom === quoteDenom
                  )?.currency.coinDenom
                }
                onPriceSelect={(p) => setSelectedPrice(String(p))}
                hideOpenOrderbookLink
              />
            </div>
          </div>
        </div>

        {/* ── Your Orders (full width) ── */}
        {orderbook && <OrderbookYourOrders contractAddress={contractAddress} />}
      </section>
    </main>
  );
};

// ── Shared sub-components ──────────────────────────────────────────────────

const PoolDataGroup: FunctionComponent<{
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}> = ({ label, value, className, valueClassName }) => (
  <div className={classNames("flex flex-col gap-2", className)}>
    <div className="text-body2 font-body2 text-osmoverse-400">{label}</div>
    <h4 className={classNames("text-osmoverse-100", valueClassName)}>
      {value}
    </h4>
  </div>
);
