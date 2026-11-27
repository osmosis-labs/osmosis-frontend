import type { GroupingOption, OrderbookLevel } from "@osmosis-labs/server";
import dynamic from "next/dynamic";
import { FunctionComponent, useState } from "react";

import { t } from "~/hooks/language";
import { theme } from "~/tailwind.config";

export type DepthDataSource = "cl" | "gamm" | "orderbook";

export type DepthPoint = {
  price: number;
  depth: number;
  source: DepthDataSource;
};

function formatPrice(price: number): string {
  if (price >= 10_000)
    return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1_000)
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toPrecision(4);
}

/**
 * A level as shown. A summary row (`beyond`) can stand for several levels at
 * different prices, so it carries its own quote values.
 */
type DisplayLevel = OrderbookLevel & {
  /** Quote value of the row's orders; price x quantity when absent. */
  quoteValue?: number;
  /** Quote value including CL; price x (quantity + CL) when absent. */
  totalQuoteValue?: number;
};

const ordersQuote = (l: DisplayLevel) => l.quoteValue ?? l.price * l.quantity;
const totalQuote = (l: DisplayLevel) =>
  l.totalQuoteValue ?? l.price * (l.quantity + (l.clQuantity ?? 0));

/**
 * At most `max` rows per side, best first. Everything past the last row that
 * fits (further orders, and the server's summary level for CL past the
 * outermost order) folds into one summary row priced at that last row, shown
 * as "< price" for bids and "> price" for asks, so no liquidity is dropped.
 */
function foldLevels(
  levels: OrderbookLevel[],
  max: number,
  showEdges: boolean
): DisplayLevel[] {
  if (!showEdges) return levels.filter((l) => !l.beyond).slice(0, max);
  if (levels.length <= max) return levels;
  const shown = levels.slice(0, max - 1);
  const rest = levels.slice(max - 1);
  const edge = shown.at(-1)!;
  const quantity = rest.reduce((sum, l) => sum + l.quantity, 0);
  const clQuantity = rest.reduce((sum, l) => sum + (l.clQuantity ?? 0), 0);
  // Valued at no more than the row's own price: a far ask (say 70 OSMO at
  // 9,999 USDC) would otherwise dominate the row's quote total. Bids past
  // the edge are all below it, so their own total is already the smaller.
  const quoteValue = Math.min(
    rest.reduce((sum, l) => sum + ordersQuote(l), 0),
    quantity * edge.price
  );
  return [
    ...shown,
    {
      price: edge.price,
      quantity,
      cumulative: rest.at(-1)!.cumulative,
      clQuantity,
      beyond: true,
      quoteValue,
      // CL is capped at the row's own price for the same reason. For bids
      // each level's own price is the smaller, and the server's CL summary
      // level is priced at the outermost bid, not at this row.
      totalQuoteValue:
        quoteValue +
        Math.min(
          rest.reduce((sum, l) => sum + (l.clQuantity ?? 0) * l.price, 0),
          clQuantity * edge.price
        ),
    },
  ];
}

/** Running total of price x quantity per level, in quote units. */
function cumulativeQuoteValue(levels: DisplayLevel[]): number[] {
  const totals: number[] = [];
  for (const l of levels) {
    totals.push((totals.at(-1) ?? 0) + ordersQuote(l));
  }
  return totals;
}

function formatQuantity(qty: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 4,
    notation: qty >= 10_000 ? "compact" : "standard",
    compactDisplay: "short",
  }).format(qty);
}

// ── Level 2 table ─────────────────────────────────────────────────────────────

const OrderRow: FunctionComponent<{
  level: DisplayLevel;
  maxQuoteValue: number;
  /** Cumulative quote value of resting orders up to this level. */
  cumulativeQuoteValue: number;
  /** Cumulative quote value including CL pool liquidity. */
  cumulativeTotalQuoteValue: number;
  side: "bid" | "ask";
  isHighlighted: boolean;
  onPriceSelect?: (price: number) => void;
  onHover: (i: number | null) => void;
  index: number;
}> = ({
  level,
  maxQuoteValue,
  cumulativeQuoteValue,
  cumulativeTotalQuoteValue,
  side,
  isHighlighted,
  onPriceSelect,
  onHover,
  index,
}) => {
  const pct =
    maxQuoteValue > 0 ? (cumulativeQuoteValue / maxQuoteValue) * 100 : 0;
  const totalPct =
    maxQuoteValue > 0 ? (cumulativeTotalQuoteValue / maxQuoteValue) * 100 : 0;
  const clQuantity = level.clQuantity ?? 0;
  const isBid = side === "bid";
  // A summary row stands for what is not shown, so its columns include CL;
  // other rows show resting orders, with CL in the hatched bar and tooltip.
  const quoteAmount = level.beyond ? totalQuote(level) : ordersQuote(level);
  const baseAmount = level.beyond
    ? level.quantity + (level.clQuantity ?? 0)
    : level.quantity;

  const baseColor = isBid
    ? theme.colors.bullish["400"]
    : theme.colors.rust["400"];

  return (
    <div
      className={`relative grid grid-cols-3 px-2 py-0.5 font-mono text-xs ${
        level.beyond ? "cursor-default" : "cursor-pointer"
      }`}
      style={{
        backgroundColor: isHighlighted ? baseColor + "18" : "transparent",
      }}
      onClick={() => !level.beyond && onPriceSelect?.(level.price)}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      title={
        clQuantity > 0
          ? t("pool.orderbookPool.depthRowWithCl", {
              orders: formatQuantity(level.quantity),
              cl: formatQuantity(clQuantity),
            })
          : undefined
      }
    >
      {/* CL pool liquidity: a lighter, hatched bar behind the orders bar */}
      {totalPct > pct && (
        <span
          className="pointer-events-none absolute inset-y-0 right-0"
          style={{
            width: `${Math.min(totalPct, 100)}%`,
            backgroundImage: `repeating-linear-gradient(135deg, ${baseColor}14 0 3px, transparent 3px 6px)`,
          }}
        />
      )}
      {/* depth bar behind the row — fills from the right */}
      <span
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{
          width: `${Math.min(pct, 100)}%`,
          backgroundColor: isHighlighted ? baseColor + "35" : baseColor + "20",
        }}
      />
      <span className={isBid ? "text-bullish-400" : "text-rust-400"}>
        {level.beyond ? (isBid ? "< " : "> ") : ""}
        {formatPrice(level.price)}
      </span>
      <span className="text-right text-osmoverse-200">
        {formatQuantity(baseAmount)}
      </span>
      <span className="text-right text-osmoverse-400">
        {formatQuantity(quoteAmount)}
      </span>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const withoutCl = (level: OrderbookLevel): OrderbookLevel => ({
  ...level,
  clQuantity: undefined,
});

export const OrderbookDepthPanel: FunctionComponent<{
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
  midPrice: number;
  bidPrice?: number;
  askPrice?: number;
  groupingOptions?: GroupingOption[];
  baseSymbol?: string;
  quoteSymbol?: string;
  onPriceSelect?: (price: number) => void;
  isLive?: boolean;
  isLoading?: boolean;
  isRefetching?: boolean;
  isError?: boolean;
  bucketSize?: number;
  onBucketSizeChange?: (size: number | undefined) => void;
  /** Levels include CL pool liquidity in `clQuantity`. */
  clIncluded?: boolean;
  /** Whether CL pool liquidity is shown; omit to hide the toggle. */
  clEnabled?: boolean;
  onClEnabledChange?: (enabled: boolean) => void;
  /** CL pool liquidity could not be loaded; levels are orders only. */
  clUnavailable?: boolean;
  /** Rows per side, including the "<" or ">" row. */
  visibleLevels?: number;
  /** Whether what is past the rows shown folds into a "<" and ">" row. */
  showEdges?: boolean;
  onShowEdgesChange?: (show: boolean) => void;
}> = ({
  bids: bidsProp,
  asks: asksProp,
  midPrice,
  bidPrice = 0,
  askPrice = 0,
  groupingOptions = [],
  baseSymbol,
  quoteSymbol,
  onPriceSelect,
  isLive,
  isLoading,
  isRefetching,
  isError,
  bucketSize,
  onBucketSizeChange,
  clIncluded,
  clUnavailable,
  clEnabled = true,
  onClEnabledChange,
  visibleLevels = 12,
  showEdges = true,
  onShowEdgesChange,
}) => {
  // With CL off, ignore any CL amounts still on the levels (e.g. depth kept
  // on screen while the orders-only result loads), and the CL-only levels
  // past the book's edge with them.
  const ordersOnly = (levels: OrderbookLevel[]) =>
    levels.filter((l) => l.quantity > 0).map(withoutCl);
  const bids = clEnabled ? bidsProp : ordersOnly(bidsProp);
  const asks = clEnabled ? asksProp : ordersOnly(asksProp);
  const VISIBLE_LEVELS = visibleLevels;
  const visibleBids = foldLevels(bids, VISIBLE_LEVELS, showEdges);
  const visibleAsks = foldLevels(asks, VISIBLE_LEVELS, showEdges);

  const [hoveredAsk, setHoveredAsk] = useState<number | null>(null);
  const [hoveredBid, setHoveredBid] = useState<number | null>(null);

  // Compute cumulative quote value (price × quantity) for fill bars so both
  // sides are denominated in the same currency and large base-unit orders don't skew.
  const bidQuoteCumulatives = cumulativeQuoteValue(visibleBids);
  const askQuoteCumulatives = cumulativeQuoteValue(visibleAsks);
  // The same including CL pool liquidity, for the lighter bar.
  const totalCumulatives = (levels: DisplayLevel[]) => {
    let cum = 0;
    return levels.map((l) => {
      cum += totalQuote(l);
      return cum;
    });
  };
  const bidTotalCumulatives = totalCumulatives(visibleBids);
  const askTotalCumulatives = totalCumulatives(visibleAsks);
  // The bars scale to the rows shown, not the "<" and ">" rows: those can
  // stand for far more (outlier orders, CL out to the curve's ends) and would
  // flatten every other bar. Their own bars cap at full width.
  const lastShown = (levels: DisplayLevel[], cumulatives: number[]) => {
    const i = levels.findLastIndex((l) => !l.beyond);
    return i >= 0 ? cumulatives[i] : 0;
  };
  const maxQuoteValue = Math.max(
    lastShown(visibleBids, bidTotalCumulatives),
    lastShown(visibleAsks, askTotalCumulatives)
  );

  const skeletonRows = Array.from({ length: VISIBLE_LEVELS });

  const spreadAbs =
    bidPrice > 0 && askPrice > 0 ? askPrice - bidPrice : undefined;
  const spreadPct =
    spreadAbs !== undefined && midPrice > 0
      ? (spreadAbs / midPrice) * 100
      : undefined;

  // Sweep summary: sum base quantity from best price up to hovered row (inclusive)
  const sweepSide =
    hoveredAsk !== null ? "ask" : hoveredBid !== null ? "bid" : null;
  const sweepIndex = hoveredAsk ?? hoveredBid ?? null;
  const sweepLevels =
    sweepSide === "ask"
      ? visibleAsks.slice(0, (sweepIndex ?? 0) + 1)
      : sweepSide === "bid"
        ? visibleBids.slice(0, (sweepIndex ?? 0) + 1)
        : [];
  const sweepVolume = sweepLevels.reduce((s, l) => s + l.quantity, 0);
  const sweepWorstPrice =
    sweepSide === "ask"
      ? visibleAsks[sweepIndex ?? 0]?.price
      : visibleBids[sweepIndex ?? 0]?.price;

  // The controls stay up in the empty state too, so a toggle that hid every
  // row can be switched back.
  const controls = (
    <div className="flex items-center border-b border-osmoverse-700 px-3 py-1">
      <div className="flex gap-1">
        <button
          onClick={() => onBucketSizeChange?.(undefined)}
          className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
            bucketSize === undefined
              ? "bg-osmoverse-700 text-white-full"
              : "text-osmoverse-400 hover:text-osmoverse-200"
          }`}
        >
          {t("pool.orderbookPool.depthRaw")}
        </button>
        {groupingOptions.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onBucketSizeChange?.(value)}
            className={`rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
              bucketSize === value
                ? "bg-osmoverse-700 text-white-full"
                : "text-osmoverse-400 hover:text-osmoverse-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {onShowEdgesChange && (
        <button
          type="button"
          aria-pressed={showEdges}
          aria-label={t("pool.orderbookPool.depthEdgesTooltip")}
          onClick={() => onShowEdgesChange(!showEdges)}
          title={t("pool.orderbookPool.depthEdgesTooltip")}
          className={`ml-auto rounded px-1.5 py-0.5 font-mono text-xs transition-colors ${
            showEdges
              ? "bg-osmoverse-700 text-white-full"
              : "text-osmoverse-400 hover:text-osmoverse-200"
          }`}
        >
          {"<>"}
        </button>
      )}
      {onClEnabledChange && (clIncluded || clUnavailable || !clEnabled) && (
        <button
          type="button"
          aria-pressed={clEnabled}
          onClick={() => onClEnabledChange(!clEnabled)}
          title={t("pool.orderbookPool.depthClLegendTooltip")}
          className={`${onShowEdgesChange ? "ml-1" : "ml-auto"} flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-xs transition-colors ${
            clEnabled
              ? "bg-osmoverse-700 text-white-full"
              : "text-osmoverse-400 hover:text-osmoverse-200"
          }`}
        >
          <span
            className="inline-block h-2 w-3 rounded-sm"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, ${theme.colors.osmoverse["300"]}${clEnabled ? "aa" : "44"} 0 2px, transparent 2px 4px)`,
            }}
          />
          {t("pool.orderbookPool.depthClLegend")}
        </button>
      )}
      {clEnabled && clUnavailable && (
        <span className="ml-2 text-xs text-osmoverse-500">
          {t("pool.orderbookPool.depthClUnavailable")}
        </span>
      )}
      <span
        className={`${onClEnabledChange && (clIncluded || clUnavailable || !clEnabled) ? "ml-2" : "ml-auto"} mr-0.5 h-1.5 w-1.5 rounded-full ${
          isLive ? "bg-bullish-400" : "animate-pulse bg-osmoverse-500"
        }`}
      />
    </div>
  );

  // Empty states follow the rows shown: with the "<" and ">" rows off, a
  // side holding only CL past the book's edge has nothing to show.
  if (!isLoading && visibleBids.length === 0 && visibleAsks.length === 0) {
    if (isError) {
      return (
        <div className="flex h-full flex-col overflow-hidden">
          {controls}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="body2 text-osmoverse-300">
              {t("pool.orderbookPool.depthUnavailable")}
            </p>
            <p className="caption text-osmoverse-500">
              {t("pool.orderbookPool.depthUnavailableDesc")}
            </p>
          </div>
        </div>
      );
    }
    if (!isRefetching) {
      return (
        <div className="flex h-full flex-col overflow-hidden">
          {controls}
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="body2 text-osmoverse-300">
              {t("pool.orderbookPool.depthNoOrders")}
            </p>
            <p className="caption text-osmoverse-500">
              {t("pool.orderbookPool.depthNoOrdersDesc")}
            </p>
          </div>
        </div>
      );
    }
  }

  const noAsks =
    !isLoading &&
    !isRefetching &&
    !isError &&
    visibleAsks.length === 0 &&
    visibleBids.length > 0;
  const noBids =
    !isLoading &&
    !isRefetching &&
    !isError &&
    visibleBids.length === 0 &&
    visibleAsks.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {controls}
      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-0.5 font-mono text-xs text-osmoverse-500">
        <span>{t("pool.orderbookPool.depthPrice")}</span>
        <span className="text-right">{baseSymbol ?? "Base"}</span>
        <span className="text-right">{quoteSymbol ?? "Quote"}</span>
      </div>

      {/* Asks (reverse order — highest ask at top, best ask nearest spread) */}
      <div className="no-scrollbar flex flex-col-reverse overflow-y-auto">
        {isLoading ? (
          skeletonRows.map((_, i) => (
            <div
              key={`ask-skel-${i}`}
              className="mx-2 my-0.5 h-5 animate-pulse rounded bg-osmoverse-700"
            />
          ))
        ) : noAsks ? (
          <div className="flex flex-1 items-center justify-center py-4">
            <p className="caption text-osmoverse-500">
              {t("pool.orderbookPool.depthNoAsks")}
            </p>
          </div>
        ) : (
          visibleAsks.map((level, i) => (
            <OrderRow
              key={`ask-${i}`}
              index={i}
              level={level}
              maxQuoteValue={maxQuoteValue}
              cumulativeQuoteValue={askQuoteCumulatives[i]}
              cumulativeTotalQuoteValue={askTotalCumulatives[i]}
              side="ask"
              isHighlighted={hoveredAsk !== null && i <= hoveredAsk}
              onPriceSelect={onPriceSelect}
              onHover={setHoveredAsk}
            />
          ))
        )}
      </div>

      {/* Spread / sweep summary row */}
      <div
        className="flex items-center justify-center gap-2 border-y border-osmoverse-700 px-2 py-0.5 font-mono text-xs"
        onMouseLeave={() => {
          setHoveredAsk(null);
          setHoveredBid(null);
        }}
      >
        {sweepSide !== null && sweepWorstPrice !== undefined ? (
          <>
            <span className="text-osmoverse-200">
              {formatQuantity(sweepVolume)} {baseSymbol ?? "base"}
            </span>
          </>
        ) : spreadPct !== undefined ? (
          <>
            <span className="text-osmoverse-400">
              {t("pool.orderbookPool.spread")}:
            </span>
            <span className="text-osmoverse-200">{spreadPct.toFixed(2)}%</span>
          </>
        ) : (
          <span className="text-osmoverse-600">—</span>
        )}
      </div>

      {/* Bids */}
      <div className="no-scrollbar overflow-y-auto">
        {isLoading ? (
          skeletonRows.map((_, i) => (
            <div
              key={`bid-skel-${i}`}
              className="mx-2 my-0.5 h-5 animate-pulse rounded bg-osmoverse-700"
            />
          ))
        ) : noBids ? (
          <div className="flex flex-1 items-center justify-center py-4">
            <p className="caption text-osmoverse-500">
              {t("pool.orderbookPool.depthNoBids")}
            </p>
          </div>
        ) : (
          visibleBids.map((level, i) => (
            <OrderRow
              key={`bid-${i}`}
              index={i}
              level={level}
              maxQuoteValue={maxQuoteValue}
              cumulativeQuoteValue={bidQuoteCumulatives[i]}
              cumulativeTotalQuoteValue={bidTotalCumulatives[i]}
              side="bid"
              isHighlighted={hoveredBid !== null && i <= hoveredBid}
              onPriceSelect={onPriceSelect}
              onHover={setHoveredBid}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const OrderbookDepthPanelDynamic = dynamic(
  () =>
    import("~/components/chart/aggregated-depth").then(
      (m) => m.OrderbookDepthPanel
    ),
  { ssr: false }
);
