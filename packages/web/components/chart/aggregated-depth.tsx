import type { OrderbookLevel } from "@osmosis-labs/server";
import dynamic from "next/dynamic";
import { FunctionComponent, useEffect, useRef, useState } from "react";

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

// ── Depth curve ───────────────────────────────────────────────────────────────

type TooltipState = {
  x: number;
  y: number;
  price: number;
  cumulative: number;
  side: "bid" | "ask";
} | null;

const DepthCurve: FunctionComponent<{
  bids: OrderbookLevel[];
  asks: OrderbookLevel[];
}> = ({ bids, asks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  // Store render params in a ref so mouse handlers can read them without
  // triggering the draw effect.
  const chartParamsRef = useRef<{
    minPrice: number;
    maxPrice: number;
    chartW: number;
    chartH: number;
    pad: { top: number; bottom: number; left: number; right: number };
    allLevels: (OrderbookLevel & { side: "bid" | "ask" })[];
  } | null>(null);

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

    if (bids.length === 0 && asks.length === 0) {
      chartParamsRef.current = null;
      return;
    }

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

    chartParamsRef.current = {
      minPrice,
      maxPrice,
      chartW,
      chartH,
      pad,
      allLevels: [
        ...bids.map((l) => ({ ...l, side: "bid" as const })),
        ...asks.map((l) => ({ ...l, side: "ask" as const })),
      ],
    };

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
        // asks: price asc, cumulative decreases as price falls toward mid
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

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const params = chartParamsRef.current;
    if (!params) return;
    const { minPrice, maxPrice, chartW, allLevels } = params;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const price = minPrice + (x / chartW) * (maxPrice - minPrice);

    // Find nearest level by price distance
    let nearest = allLevels[0];
    let minDist = Infinity;
    for (const l of allLevels) {
      const d = Math.abs(l.price - price);
      if (d < minDist) {
        minDist = d;
        nearest = l;
      }
    }

    setTooltip({
      x,
      y: e.clientY - rect.top,
      price: nearest.price,
      cumulative: nearest.cumulative,
      side: nearest.side,
    });
  };

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: "block" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded bg-osmoverse-800 px-2 py-1 text-xs shadow-md"
          style={{
            left: tooltip.x + 8,
            top: Math.max(0, tooltip.y - 28),
          }}
        >
          <span
            className={
              tooltip.side === "bid" ? "text-bullish-400" : "text-rust-400"
            }
          >
            {formatPrice(tooltip.price)}
          </span>
          <span className="ml-2 text-osmoverse-300">
            {formatQuantity(tooltip.cumulative)}
          </span>
        </div>
      )}
    </div>
  );
};

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
