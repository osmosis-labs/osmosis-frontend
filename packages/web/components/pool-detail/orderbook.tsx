import { RatePretty } from "@osmosis-labs/unit";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { FunctionComponent, useMemo } from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { TradeTool } from "~/components/trade-tool";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { api } from "~/utils/trpc";

import { AprBreakdown } from "../cards/apr-breakdown";
import { SkeletonLoader } from "../loaders/skeleton-loader";

const AssetUsdChart = dynamic(
  () => import("~/components/trade-view/charts").then((m) => m.AssetUsdChart),
  { ssr: false }
);

/** Trades on this page are not remembered as the trade page's last pair. */
const noop = () => {};

export const OrderbookPool: FunctionComponent<{ poolId: string }> = ({
  poolId,
}) => {
  const { t } = useTranslation();
  const featureFlags = useFeatureFlags();

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

        {/* ── Trade widget (Buy and Sell, locked to this pair) + order book,
              then the user's orders on this book ── */}
        {orderbook && (
          <TradeTool
            setPreviousTrade={noop}
            limitOnly
            showOrderHistoryLink={false}
            orderbookPool={{
              poolId,
              baseDenom: orderbook.baseDenom,
              quoteDenom: orderbook.quoteDenom,
            }}
          />
        )}
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
