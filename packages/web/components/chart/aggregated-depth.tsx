import type { OrderbookLevel } from "@osmosis-labs/server";
import dynamic from "next/dynamic";
import { FunctionComponent, useEffect, useRef } from "react";

import { theme } from "~/tailwind.config";

export type DepthDataSource = "cl" | "gamm" | "orderbook";

export type DepthPoint = {
  price: number;
  depth: number;
  source: DepthDataSource;
};

function formatPrice(price: number): string {
  if (price >= 10_000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1_000) return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
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

// ── Depth curve ───────────────────────────────────────────────────────────────

const DepthCurve: FunctionComponent<{
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}> = ({ bids, asks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const { offsetWidth: w, offsetHeight: h } = canvas;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (bids.length === 0 && asks.length === 0) return;

    // Bids are sorted desc (best bid first = highest price first)
    // Asks are sorted asc (best ask first = lowest price first)
    const maxCumulative = Math.max(
      bids.length ? bids[bids.length - 1].cumulative : 0,
      asks.length ? asks[0].cumulative : 0
    );
    if (maxCumulative <= 0) return;

    const allPrices = [
      ...(bids.length ? [bids[bids.length - 1].price, bids[0].price] : []),
      ...(asks.length ? [asks[0].price, asks[asks.length - 1].price] : []),
    ];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    if (minPrice >= maxPrice) return;

    const pad = { top: 4, bottom: 4, left: 0, right: 0 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const toX = (price: number) =>
      pad.left + ((price - minPrice) / (maxPrice - minPrice)) * chartW;
    const toY = (cum: number) =>
      pad.top + chartH - (cum / maxCumulative) * chartH;

    const drawSide = (
      levels: OrderbookLevel[],
      color: string,
      fillColor: string,
      side: "bid" | "ask"
    ) => {
      if (levels.length === 0) return;
      ctx.beginPath();

      if (side === "bid") {
        // bids: price desc, cumulative increases as price falls
        // draw step curve left-to-right starting from best bid
        const startX = toX(levels[0].price);
        ctx.moveTo(startX, chartH + pad.top);
        ctx.lineTo(startX, toY(levels[0].cumulative));
        for (let i = 1; i < levels.length; i++) {
          const x = toX(levels[i].price);
          ctx.lineTo(x, toY(levels[i - 1].cumulative));
          ctx.lineTo(x, toY(levels[i].cumulative));
        }
        const lastX = toX(levels[levels.length - 1].price);
        ctx.lineTo(lastX, chartH + pad.top);
      } else {
        // asks: price asc, cumulative increases as price rises
        const startX = toX(levels[0].price);
        ctx.moveTo(startX, chartH + pad.top);
        ctx.lineTo(startX, toY(levels[0].cumulative));
        for (let i = 1; i < levels.length; i++) {
          const x = toX(levels[i].price);
          ctx.lineTo(x, toY(levels[i - 1].cumulative));
          ctx.lineTo(x, toY(levels[i].cumulative));
        }
        const lastX = toX(levels[levels.length - 1].price);
        ctx.lineTo(lastX, chartH + pad.top);
      }

      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    drawSide(
      bids,
      theme.colors.bullish["400"],
      theme.colors.bullish["400"] + "33",
      "bid"
    );
    drawSide(
      asks,
      theme.colors.rust["400"],
      theme.colors.rust["400"] + "33",
      "ask"
    );
  }, [bids, asks]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: "block" }}
    />
  );
};

// ── Level 2 table ─────────────────────────────────────────────────────────────

const OrderRow: FunctionComponent<{
  level: OrderbookLevel;
  maxQuoteValue: number;
  cumulativeQuoteValue: number;
  side: "bid" | "ask";
}> = ({ level, maxQuoteValue, cumulativeQuoteValue, side }) => {
  const pct = maxQuoteValue > 0 ? (cumulativeQuoteValue / maxQuoteValue) * 100 : 0;
  const isBid = side === "bid";
  const quoteAmount = level.price * level.quantity;

  return (
    <div className="relative grid grid-cols-3 px-2 py-0.5 font-mono text-xs hover:bg-osmoverse-800">
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
}> = ({ bids, asks, baseSymbol, quoteSymbol }) => {
  // Show only the N levels closest to mid price to keep the table compact
  const VISIBLE_LEVELS = 12;
  const visibleBids = bids.slice(0, VISIBLE_LEVELS);
  const visibleAsks = asks.slice(0, VISIBLE_LEVELS);

  // Compute cumulative quote value (price × quantity) for fill bars so both
  // sides are denominated in the same currency and large base-unit orders don't skew.
  // Bids: accumulate from best bid outward.
  let cumBidQuote = 0;
  const bidQuoteCumulatives = visibleBids.map((l) => {
    cumBidQuote += l.price * l.quantity;
    return cumBidQuote;
  });
  // Asks: accumulate from best ask outward.
  let cumAskQuote = 0;
  const askQuoteCumulatives = visibleAsks.map((l) => {
    cumAskQuote += l.price * l.quantity;
    return cumAskQuote;
  });
  const maxQuoteValue = Math.max(
    bidQuoteCumulatives.at(-1) ?? 0,
    askQuoteCumulatives.at(-1) ?? 0
  );

  if (bids.length === 0 && asks.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="body2 text-osmoverse-300">No open orders</p>
        <p className="caption text-osmoverse-500">This order book is currently empty</p>
      </div>
    );
  }

  const noAsks = asks.length === 0;
  const noBids = bids.length === 0;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-3 border-b border-osmoverse-700 px-2 py-1 font-mono text-xs text-osmoverse-400">
        <span>Price</span>
        <span className="text-right">{baseSymbol ?? "Base"}</span>
        <span className="text-right">{quoteSymbol ?? "Quote"}</span>
      </div>

      {/* Asks (reverse order — highest ask at top, best ask nearest spread) */}
      <div className="no-scrollbar flex flex-col-reverse overflow-y-auto">
        {noAsks ? (
          <div className="flex flex-1 items-center justify-center py-4">
            <p className="caption text-osmoverse-500">No asks</p>
          </div>
        ) : visibleAsks.map((level, i) => (
          <OrderRow
            key={`ask-${i}`}
            level={level}
            maxQuoteValue={maxQuoteValue}
            cumulativeQuoteValue={askQuoteCumulatives[i]}
            side="ask"
          />
        ))}
      </div>

      <div className="border-y border-osmoverse-700" />

      {/* Bids */}
      <div className="no-scrollbar overflow-y-auto">
        {noBids ? (
          <div className="flex flex-1 items-center justify-center py-4">
            <p className="caption text-osmoverse-500">No bids</p>
          </div>
        ) : visibleBids.map((level, i) => (
          <OrderRow
            key={`bid-${i}`}
            level={level}
            maxQuoteValue={maxQuoteValue}
            cumulativeQuoteValue={bidQuoteCumulatives[i]}
            side="bid"
          />
        ))}
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
