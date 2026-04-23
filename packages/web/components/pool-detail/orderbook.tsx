import { DEFAULT_VS_CURRENCY, MappedLimitOrder } from "@osmosis-labs/server";
import {
  CoinPretty,
  Dec,
  Int,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";
import Tippy from "@tippyjs/react";
import classNames from "classnames";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import dynamic from "next/dynamic";
import Image from "next/image";
import { parseAsStringEnum, parseAsStringLiteral, useQueryState } from "nuqs";
import {
  FunctionComponent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { ChartUnavailable } from "~/components/chart/price-historical";
import { ActionsCell } from "~/components/complex/orders-history/cells/actions";
import { OrderProgressBar } from "~/components/complex/orders-history/cells/filled-progress";
import { Spinner } from "~/components/loaders/spinner";
import { PlaceLimitTool } from "~/components/place-limit-tool";
import {
  OrderTypeSelector,
  TRADE_TYPES,
} from "~/components/swap-tool/order-type-selector";
import { SwapToolTab } from "~/components/swap-tool/swap-tool-tabs";
import { Button } from "~/components/ui/button";
import { EntityImage } from "~/components/ui/entity-image";
import {
  useAmplitudeAnalytics,
  useFeatureFlags,
  useTranslation,
  useWalletSelect,
} from "~/hooks";
import {
  useOrderbookClaimableOrders,
  useOrderbookOrders,
} from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";
import {
  formatFiatPrice,
  formatPretty,
  getPriceExtendedFormatOptions,
} from "~/utils/formatter";
import { historicalDatafeed } from "~/utils/trading-view";
import { api } from "~/utils/trpc";

import { AprBreakdown } from "../cards/apr-breakdown";
import { SkeletonLoader } from "../loaders/skeleton-loader";

const AdvancedChart = dynamic(
  () =>
    import("~/components/chart/light-weight-charts/advanced-chart").then(
      (m) => m.AdvancedChart
    ),
  { ssr: false }
);

const OrderbookDepthPanel = dynamic(
  () =>
    import("~/components/chart/aggregated-depth").then(
      (m) => m.OrderbookDepthPanel
    ),
  { ssr: false }
);

export const OrderbookPool: FunctionComponent<{ poolId: string }> = observer(
  ({ poolId }) => {
    const { chainStore, accountStore } = useStore();
    const { t } = useTranslation();
    useAmplitudeAnalytics();
    const { isLoading: isWalletLoading } = useWalletSelect();
    const account = accountStore.getWallet(chainStore.osmosis.chainId);
    const featureFlags = useFeatureFlags();

    // Buy / Sell tab — write to URL on mount so PlaceLimitTool picks up the default
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
    const sortedReserveCoins = useMemo(() => {
      if (!pool?.reserveCoins || !baseDenom) return pool?.reserveCoins ?? [];
      const base = pool.reserveCoins.find(
        (c) => c.currency.coinMinimalDenom === baseDenom
      );
      const quote = pool.reserveCoins.find(
        (c) => c.currency.coinMinimalDenom === quoteDenom
      );
      if (base && quote) return [base, quote];
      return pool.reserveCoins;
    }, [pool?.reserveCoins, baseDenom, quoteDenom]);

    // Maker fee
    const { data: makerFeeData } = api.edge.orderbooks.getMakerFee.useQuery(
      { osmoAddress: contractAddress },
      { enabled: Boolean(contractAddress) }
    );

    // Bucket size for depth aggregation — undefined = raw ticks
    const [bucketSize, setBucketSize] = useState<number | undefined>(undefined);

    // Aggregated depth chart data
    const {
      data: depthData,
      isLoading: isDepthLoading,
      isError: isDepthError,
      isRefetching: isDepthRefetching,
    } = api.edge.pools.getPairDepth.useQuery(
      { poolId, bucketSize },
      {
        enabled: Boolean(contractAddress),
        refetchInterval: 30000,
        keepPreviousData: true,
        staleTime: 0,
      }
    );

    // Price selected by clicking a depth table row — forwarded to PlaceLimitTool
    const [selectedPrice, setSelectedPrice] = useState<string>("");

    // TradingView datafeed — uses the same historical price API as the assets page
    const apiUtils = api.useUtils();
    const tvDatafeed = useMemo(
      () => historicalDatafeed({ apiUtils }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
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

    // User orders — fetch all, then filter to this contract
    const {
      orders: allOrders,
      isLoading: isOrdersLoading,
      fetchNextPage,
      hasNextPage,
      isFetchingNextPage,
      refetch,
      isRefetching,
    } = useOrderbookOrders({
      userAddress: account?.address ?? "",
      pageSize: 100,
      refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
    });

    const poolOrders = useMemo(
      () => allOrders.filter((o) => o.orderbookAddress === contractAddress),
      [allOrders, contractAddress]
    );

    const [dirFilter, setDirFilter] = useState<"all" | "bid" | "ask">("all");
    const filteredOrders = useMemo(
      () =>
        dirFilter === "all"
          ? poolOrders
          : poolOrders.filter((o) => o.order_direction === dirFilter),
      [poolOrders, dirFilter]
    );

    // Claimable orders for this pool
    const { claimAllOrders } = useOrderbookClaimableOrders({
      userAddress: account?.address ?? "",
      disabled: isOrdersLoading || isRefetching,
      refetchInterval: featureFlags.sqsActiveOrders ? 10000 : 30000,
    });

    const claimablePoolOrders = useMemo(
      () =>
        poolOrders.filter(
          (o) => o.status === "filled" && o.orderbookAddress === contractAddress
        ),
      [poolOrders, contractAddress]
    );

    const claimOrders = useCallback(async () => {
      await claimAllOrders();
      await refetch();
    }, [claimAllOrders, refetch]);

    const showConnectWallet = !account?.isWalletConnected && !isWalletLoading;

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
                  assetDenoms={sortedReserveCoins.map(
                    ({ denom, currency }) => ({
                      minDenom: currency.coinMinimalDenom,
                      symbol: denom,
                    })
                  )}
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
            {baseCoinDenom ? (
              <AdvancedChart coinDenom={baseCoinDenom} datafeed={tvDatafeed} />
            ) : (
              <ChartUnavailable />
            )}
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
                {([SwapToolTab.BUY, SwapToolTab.SELL] as const).map(
                  (tab, i) => {
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
                  }
                )}
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
                  page="Pool Details Page"
                  initialBaseDenom={baseDenom}
                  initialQuoteDenom={quoteDenom}
                  alwaysExpandedDetails
                  externalOrderPrice={selectedPrice}
                  onOrderSuccess={() => refetch()}
                />
              </div>
            </div>

            {/* Market depth panel — self-stretch to fill trade widget height */}
            <div className="relative min-w-0 flex-1 self-stretch lg:min-h-[500px]">
              <div className="absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-osmoverse-700 bg-osmoverse-1000">
                <div className="min-h-0 flex-1">
                  {isDepthError && !depthData ? (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                      <p className="body2 text-osmoverse-300">
                        Order book unavailable
                      </p>
                      <p className="caption text-osmoverse-500">
                        Could not load depth data
                      </p>
                    </div>
                  ) : (
                    <OrderbookDepthPanel
                      bids={depthData?.bids ?? []}
                      asks={depthData?.asks ?? []}
                      midPrice={depthData?.midPrice ?? 0}
                      bidPrice={depthData?.bidPrice}
                      askPrice={depthData?.askPrice}
                      groupingOptions={depthData?.groupingOptions ?? []}
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
                      isLive={!isDepthRefetching}
                      isRefetching={isDepthRefetching}
                      isLoading={isDepthLoading && !depthData}
                      isError={isDepthError || depthData?.unavailable}
                      bucketSize={bucketSize}
                      onBucketSizeChange={setBucketSize}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Your Orders (full width) ── */}
          <div className="rounded-3xl border border-osmoverse-700 p-6">
            <div className="mb-4 flex items-center gap-3">
              <h4>{t("pool.orderbookPool.yourOrders")}</h4>
              <div className="ml-auto flex gap-1 rounded-lg bg-osmoverse-800 p-0.5">
                {(["all", "bid", "ask"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDirFilter(f)}
                    className={`rounded-md px-3 py-1 text-xs transition-colors ${
                      dirFilter === f
                        ? "bg-osmoverse-700 text-white-full"
                        : "text-osmoverse-400 hover:text-osmoverse-200"
                    }`}
                  >
                    {f === "all"
                      ? t("pool.orderbookPool.filterAll")
                      : f === "bid"
                      ? t("pool.orderbookPool.filterBuy")
                      : t("pool.orderbookPool.filterSell")}
                  </button>
                ))}
              </div>
            </div>

            {showConnectWallet ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <Image
                  src="/images/place-limit-order.svg"
                  alt="place a limit order"
                  width={120}
                  height={80}
                />
                <p className="body2 text-osmoverse-300">
                  {t("limitOrders.historyTable.emptyState.connectSubtitle")}
                </p>
              </div>
            ) : isOrdersLoading ? (
              <div className="flex justify-center py-10">
                <Spinner className="!h-10 !w-10" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Image
                  src="/images/place-limit-order.svg"
                  alt="no orders"
                  width={120}
                  height={80}
                />
                <p className="body2 text-osmoverse-300">
                  {t("pool.orderbookPool.noOrders")}
                </p>
                <p className="caption text-osmoverse-500">
                  {t("pool.orderbookPool.noOrdersDesc")}
                </p>
              </div>
            ) : (
              <OrdersTable
                orders={filteredOrders}
                refetch={refetch}
                claimableCount={claimablePoolOrders.length}
                onClaimAll={claimOrders}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={fetchNextPage}
              />
            )}
          </div>
        </section>
      </main>
    );
  }
);

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

// ── Orders table ───────────────────────────────────────────────────────────

const gridClasses =
  "grid grid-cols-[80px_4fr_2fr_2fr_2fr_150px] md:grid-cols-[2fr_1fr]";

const OrdersTable: FunctionComponent<{
  orders: MappedLimitOrder[];
  refetch: () => Promise<any>;
  claimableCount: number;
  onClaimAll: () => Promise<void>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}> = ({
  orders,
  refetch,
  claimableCount,
  onClaimAll,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}) => {
  const { t } = useTranslation();

  const grouped = useMemo(() => {
    const pending = orders.filter(
      (o) => o.status === "open" || o.status === "partiallyFilled"
    );
    const filled = orders.filter((o) => o.status === "filled");
    const past = orders.filter(
      (o) => o.status === "cancelled" || o.status === "fullyClaimed"
    );
    return { pending, filled, past };
  }, [orders]);

  return (
    <div className="mt-3 overflow-x-auto xl:overflow-visible">
      <table className="min-w-[900px] table-auto">
        <thead className="border-b border-osmoverse-700 bg-osmoverse-1000">
          <tr className={classNames(gridClasses)}>
            {["order", "amount", "price", "orderPlaced", "status"].map(
              (header) => (
                <th key={header} className="flex !px-0">
                  {header !== "amount" && (
                    <small className="body2">
                      {t(`limitOrders.historyTable.columns.${header}`)}
                    </small>
                  )}
                </th>
              )
            )}
            <th />
          </tr>
        </thead>
        <tbody>
          {(["filled", "pending", "past"] as const).map((group) => {
            const groupOrders = grouped[group];
            if (!groupOrders.length) return null;
            return (
              <>
                <PoolOrderGroupHeader
                  key={`group-${group}`}
                  group={group}
                  claimableCount={claimableCount}
                  onClaimAll={onClaimAll}
                />
                {groupOrders.map((order) => (
                  <OrderRow
                    key={`${order.order_id}-${order.tick_id}`}
                    order={order}
                    refetch={refetch}
                  />
                ))}
              </>
            );
          })}
        </tbody>
      </table>
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage?.()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Spinner className="h-4 w-4" /> : "Load more"}
          </Button>
        </div>
      )}
    </div>
  );
};

const PoolOrderGroupHeader: FunctionComponent<{
  group: "filled" | "pending" | "past";
  claimableCount: number;
  onClaimAll: () => Promise<void>;
}> = ({ group, claimableCount, onClaimAll }) => {
  const { t } = useTranslation();
  const [claiming, setClaiming] = useState(false);

  const claim = useCallback(async () => {
    setClaiming(true);
    try {
      await onClaimAll();
    } finally {
      setClaiming(false);
    }
  }, [onClaimAll]);

  if (group === "filled") {
    return (
      <tr className="flex w-full items-center py-2">
        <td className="flex min-w-0 flex-1 items-center gap-2 !px-0">
          <span className="shrink-0 text-h5 font-h5">
            {t("limitOrders.orderHistoryHeaders.filled")}
          </span>
          {claimableCount > 0 && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A51399]">
              <span className="md:body2 text-subtitle font-subtitle">
                {claimableCount}
              </span>
            </div>
          )}
          <Tippy
            content={
              <div className="body2 flex flex-col gap-1 rounded-xl border border-osmoverse-100 bg-osmoverse-1000 px-3 py-2.5">
                <span className="caption">
                  {t("limitOrders.whatIsOrderClaim.title")}
                </span>
                <span className="caption text-osmoverse-300">
                  {t("limitOrders.whatIsOrderClaim.description")}
                </span>
              </div>
            }
            trigger="mouseenter focus"
            arrow={false}
          >
            <span className="inline-flex cursor-pointer items-center">
              <Icon
                id="question"
                className="h-6 w-6 text-wosmongton-200 hover:text-wosmongton-100"
                width={24}
                height={24}
              />
            </span>
          </Tippy>
        </td>
        <td className="shrink-0 !px-0">
          {claimableCount > 0 && (
            <button
              className="flex items-center justify-center rounded-[48px] bg-wosmongton-700 px-4 py-2 disabled:opacity-50"
              onClick={claim}
              disabled={claiming}
            >
              {claiming && <Spinner className="mr-2 !h-2 !w-2" />}
              <span className="subtitle1">{t("limitOrders.claimAll")}</span>
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <tr className="flex items-center py-2">
      <td colSpan={6} className="!px-0">
        <span className="text-h5 font-h5">
          {group === "pending"
            ? t("limitOrders.orderHistoryHeaders.pending")
            : t("limitOrders.orderHistoryHeaders.past")}
        </span>
      </td>
    </tr>
  );
};

const OrderRow = memo(
  ({
    order,
    refetch,
  }: {
    order: MappedLimitOrder;
    refetch: () => Promise<any>;
  }) => {
    const { t } = useTranslation();
    const {
      order_direction,
      quoteAsset,
      baseAsset,
      placed_quantity,
      output,
      price,
      placed_at,
      status,
    } = order;

    const placedAt = dayjs.unix(placed_at);
    const formattedTime = placedAt.format("h:mm A");
    const formattedDate = placedAt.format("MMM D");

    const statusComponent = (() => {
      switch (status) {
        case "open":
        case "partiallyFilled":
          return <OrderProgressBar order={order} />;
        case "cancelled": {
          const dayDiff = dayjs(new Date()).diff(placedAt, "d");
          const hourDiff = dayjs(new Date()).diff(placedAt, "h");
          return (
            <span className="body2 md:caption text-osmoverse-300">
              {dayDiff > 0
                ? t("limitOrders.daysAgo", { days: dayDiff.toString() })
                : hourDiff > 0
                ? t("limitOrders.hoursAgo", { hours: hourDiff.toString() })
                : "<1 hour ago"}
            </span>
          );
        }
        default:
          return null;
      }
    })();

    const statusString = (() => {
      switch (status) {
        case "open":
        case "partiallyFilled":
          return t("limitOrders.open");
        case "filled":
        case "fullyClaimed":
          return t("limitOrders.filled");
        case "cancelled":
          return t("limitOrders.cancelled");
      }
    })();

    return (
      <tr
        className={classNames(
          gridClasses,
          "items-center hover:bg-osmoverse-900 sm:[&>td]:!py-0"
        )}
      >
        <td className="flex items-center justify-center !px-0 !text-left">
          <div className="subtitle1 rounded-full bg-osmoverse-alpha-850 p-3">
            <Icon
              id="coins"
              width={24}
              height={24}
              className={classNames("h-6 w-6", {
                "text-rust-400": order_direction === "ask",
                "text-bullish-400": order_direction === "bid",
              })}
            />
          </div>
        </td>
        <td className="!px-0 !text-left">
          <div className="flex flex-col gap-1">
            <p
              className={classNames(
                "body2 md:caption inline-flex w-fit items-center gap-1 text-osmoverse-300",
                { "flex-row-reverse": order_direction === "bid" }
              )}
            >
              <span>
                {formatPretty(
                  new CoinPretty(
                    {
                      coinDecimals: baseAsset?.decimals ?? 0,
                      coinDenom: baseAsset?.symbol ?? "",
                      coinMinimalDenom: baseAsset?.coinMinimalDenom ?? "",
                    },
                    order_direction === "ask" ? placed_quantity : output
                  )
                )}
              </span>
              <Icon
                id="arrow-right"
                className="h-4 w-4"
                width={16}
                height={16}
              />
              <span>
                {formatPretty(
                  new CoinPretty(
                    {
                      coinDecimals: quoteAsset?.decimals ?? 0,
                      coinDenom: quoteAsset?.symbol ?? "",
                      coinMinimalDenom: quoteAsset?.coinMinimalDenom ?? "",
                    },
                    order_direction === "ask" ? output : placed_quantity
                  )
                )}
              </span>
            </p>
            <div className="md:body2 inline-flex items-center gap-2">
              <span>
                {order_direction === "bid"
                  ? t("limitOrders.buy")
                  : t("limitOrders.sell")}{" "}
                {formatFiatPrice(
                  new PricePretty(
                    DEFAULT_VS_CURRENCY,
                    order_direction === "bid"
                      ? placed_quantity /
                        Number(
                          new Dec(10)
                            .pow(new Int(quoteAsset?.decimals ?? 0))
                            .toString()
                        )
                      : output.quo(
                          new Dec(10).pow(new Int(quoteAsset?.decimals ?? 0))
                        )
                  ),
                  2
                )}{" "}
                {t("limitOrders.of")}
              </span>
              <div className="h-5 w-5 shrink-0 overflow-hidden rounded-full">
                <EntityImage
                  width={20}
                  height={20}
                  logoURIs={baseAsset?.rawAsset.logoURIs ?? { png: undefined }}
                  name={baseAsset?.rawAsset.name ?? ""}
                  symbol={baseAsset?.rawAsset.symbol ?? ""}
                />
              </div>
              <span>{baseAsset?.symbol}</span>
            </div>
          </div>
        </td>
        <td className="!px-0 !text-left">
          <div className="flex flex-col gap-1">
            <p className="body2 text-osmoverse-300">
              {baseAsset?.symbol} · {t("limitOrders.limit")}
            </p>
            <p>
              {formatPretty(new PricePretty(DEFAULT_VS_CURRENCY, price), {
                ...getPriceExtendedFormatOptions(price),
              })}
            </p>
          </div>
        </td>
        <td className="!px-0 !text-left md:hidden">
          <div className="flex flex-col gap-1">
            <p className="body2 text-osmoverse-300">{formattedTime}</p>
            <p>{formattedDate}</p>
          </div>
        </td>
        <td
          className={classNames("!px-0 !text-left", {
            "flex items-center": status === "filled",
          })}
        >
          <div className="flex flex-col gap-1">
            {statusComponent}
            <span
              className={classNames("md:body2", {
                "text-bullish-400":
                  status === "filled" || status === "fullyClaimed",
                "text-osmoverse-300":
                  status === "open" || status === "partiallyFilled",
                "text-osmoverse-500": status === "cancelled",
              })}
            >
              {statusString}
            </span>
          </div>
        </td>
        <td className="flex w-[150px] items-center justify-end !px-0 !text-left">
          <ActionsCell order={order} refetch={refetch} />
        </td>
      </tr>
    );
  }
);
