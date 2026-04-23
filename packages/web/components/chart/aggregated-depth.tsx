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

function formatQuantity(qty: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 4,
    notation: qty >= 10_000 ? "compact" : "standard",
    compactDisplay: "short",
  }).format(qty);
}

// ── Level 2 table ─────────────────────────────────────────────────────────────

const OrderRow: FunctionComponent<{
  level: OrderbookLevel;
  maxQuoteValue: number;
  cumulativeQuoteValue: number;
  side: "bid" | "ask";
  isHighlighted: boolean;
  onPriceSelect?: (price: number) => void;
  onHover: (i: number | null) => void;
  index: number;
}> = ({
  level,
  maxQuoteValue,
  cumulativeQuoteValue,
  side,
  isHighlighted,
  onPriceSelect,
  onHover,
  index,
}) => {
  const pct =
    maxQuoteValue > 0 ? (cumulativeQuoteValue / maxQuoteValue) * 100 : 0;
  const isBid = side === "bid";
  const quoteAmount = level.price * level.quantity;

  const baseColor = isBid
    ? theme.colors.bullish["400"]
    : theme.colors.rust["400"];

  return (
    <div
      className="relative grid cursor-pointer grid-cols-3 px-2 py-0.5 font-mono text-xs"
      style={{
        backgroundColor: isHighlighted ? baseColor + "18" : "transparent",
      }}
      onClick={() => onPriceSelect?.(level.price)}
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
    >
      {/* depth bar behind the row — fills from the right */}
      <span
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{
          width: `${Math.min(pct, 100)}%`,
          backgroundColor: isHighlighted ? baseColor + "35" : baseColor + "20",
        }}
      />
      <span className={isBid ? "text-bullish-400" : "text-rust-400"}>
        {formatPrice(level.price)}
      </span>
      <span className="text-right text-osmoverse-200">
        {formatQuantity(level.quantity)}
      </span>
      <span className="text-right text-osmoverse-400">
        {formatQuantity(quoteAmount)}
      </span>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

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
}> = ({
  bids,
  asks,
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
}) => {
  const VISIBLE_LEVELS = 12;
  const visibleBids = bids.slice(0, VISIBLE_LEVELS);
  const visibleAsks = asks.slice(0, VISIBLE_LEVELS);

  const [hoveredAsk, setHoveredAsk] = useState<number | null>(null);
  const [hoveredBid, setHoveredBid] = useState<number | null>(null);

  // Compute cumulative quote value (price × quantity) for fill bars so both
  // sides are denominated in the same currency and large base-unit orders don't skew.
  let cumBidQuote = 0;
  const bidQuoteCumulatives = visibleBids.map((l) => {
    cumBidQuote += l.price * l.quantity;
    return cumBidQuote;
  });
  let cumAskQuote = 0;
  const askQuoteCumulatives = visibleAsks.map((l) => {
    cumAskQuote += l.price * l.quantity;
    return cumAskQuote;
  });
  const maxQuoteValue = Math.max(
    bidQuoteCumulatives.at(-1) ?? 0,
    askQuoteCumulatives.at(-1) ?? 0
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

  if (
    !isLoading &&
    !isRefetching &&
    !isError &&
    bids.length === 0 &&
    asks.length === 0
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="body2 text-osmoverse-300">
          {t("pool.orderbookPool.depthNoOrders")}
        </p>
        <p className="caption text-osmoverse-500">
          {t("pool.orderbookPool.depthNoOrdersDesc")}
        </p>
      </div>
    );
  }

  const noAsks =
    !isLoading &&
    !isRefetching &&
    !isError &&
    asks.length === 0 &&
    bids.length > 0;
  const noBids =
    !isLoading &&
    !isRefetching &&
    !isError &&
    bids.length === 0 &&
    asks.length > 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Aggregation selector + live indicator */}
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
        <span
          className={`ml-auto mr-0.5 h-1.5 w-1.5 rounded-full ${
            isLive ? "bg-bullish-400" : "animate-pulse bg-osmoverse-500"
          }`}
        />
      </div>
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
