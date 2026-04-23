import type { OrderbookLevel } from "@osmosis-labs/server";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";

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
  onPriceSelect?: (price: number) => void;
}> = ({ level, maxQuoteValue, cumulativeQuoteValue, side, onPriceSelect }) => {
  const pct =
    maxQuoteValue > 0 ? (cumulativeQuoteValue / maxQuoteValue) * 100 : 0;
  const isBid = side === "bid";
  const quoteAmount = level.price * level.quantity;

  return (
    <div
      className="relative grid cursor-pointer grid-cols-3 px-2 py-0.5 font-mono text-xs hover:bg-osmoverse-800"
      onClick={() => onPriceSelect?.(level.price)}
    >
      {/* depth bar behind the row — fills from the right */}
      <span
        className="pointer-events-none absolute inset-y-0 right-0"
        style={{
          width: `${Math.min(pct, 100)}%`,
          backgroundColor: isBid
            ? theme.colors.bullish["400"] + "20"
            : theme.colors.rust["400"] + "20",
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
  baseSymbol?: string;
  quoteSymbol?: string;
  onPriceSelect?: (price: number) => void;
  isLive?: boolean;
  isLoading?: boolean;
}> = ({
  bids,
  asks,
  baseSymbol,
  quoteSymbol,
  onPriceSelect,
  isLive,
  isLoading,
}) => {
  const VISIBLE_LEVELS = 12;
  const visibleBids = bids.slice(0, VISIBLE_LEVELS);
  const visibleAsks = asks.slice(0, VISIBLE_LEVELS);

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

  if (!isLoading && bids.length === 0 && asks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="body2 text-osmoverse-300">No open orders</p>
        <p className="caption text-osmoverse-500">
          This order book is currently empty
        </p>
      </div>
    );
  }

  const noAsks = !isLoading && asks.length === 0;
  const noBids = !isLoading && bids.length === 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-3 border-b border-osmoverse-700 px-2 py-1 font-mono text-xs text-osmoverse-400">
        <span>Price</span>
        <span className="text-right">{baseSymbol ?? "Base"}</span>
        <div className="flex items-center justify-end gap-1.5">
          <span>{quoteSymbol ?? "Quote"}</span>
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLive ? "bg-bullish-400" : "animate-pulse bg-osmoverse-500"
            }`}
          />
        </div>
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
            <p className="caption text-osmoverse-500">No asks</p>
          </div>
        ) : (
          visibleAsks.map((level, i) => (
            <OrderRow
              key={`ask-${i}`}
              level={level}
              maxQuoteValue={maxQuoteValue}
              cumulativeQuoteValue={askQuoteCumulatives[i]}
              side="ask"
              onPriceSelect={onPriceSelect}
            />
          ))
        )}
      </div>

      <div className="border-y border-osmoverse-700" />

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
            <p className="caption text-osmoverse-500">No bids</p>
          </div>
        ) : (
          visibleBids.map((level, i) => (
            <OrderRow
              key={`bid-${i}`}
              level={level}
              maxQuoteValue={maxQuoteValue}
              cumulativeQuoteValue={bidQuoteCumulatives[i]}
              side="bid"
              onPriceSelect={onPriceSelect}
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
