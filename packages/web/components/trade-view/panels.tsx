import classNames from "classnames";
import { CSSProperties, FunctionComponent } from "react";

import type { BookPriceSelection } from "~/components/trade-tool/use-book-price-selection";
import { AssetUsdChart } from "~/components/trade-view/charts";
import { useCanonicalOrderbookForPair } from "~/components/trade-view/hooks";
import { OrderBook } from "~/components/trade-view/order-book";
import { OrderbookYourOrders } from "~/components/trade-view/your-orders";
import { api } from "~/utils/trpc";

/**
 * The trade widget's selected pair, as minimal denoms, and optionally the
 * orderbook pool to use instead of the pair's canonical book.
 */
export interface TradeViewPair {
  base?: string;
  quote?: string;
  poolId?: string;
}

function useAssetSymbol(coinMinimalDenom?: string) {
  const { data } = api.edge.assets.getUserAsset.useQuery(
    { findMinDenomOrSymbol: coinMinimalDenom ?? "" },
    { enabled: Boolean(coinMinimalDenom) }
  );
  return data?.coinMinimalDenom === coinMinimalDenom
    ? data?.coinDenom
    : undefined;
}

function useTradeViewOrderbook({ base, quote, poolId }: TradeViewPair) {
  return useCanonicalOrderbookForPair({
    coinMinimalDenomA: base,
    coinMinimalDenomB: quote,
    poolId,
  }).orderbook;
}

/**
 * Order book for the widget's pair. Renders nothing unless the pair, in
 * either orientation, has a canonical orderbook (or `poolId` names one).
 */
export const TradeViewBook: FunctionComponent<
  TradeViewPair & {
    className?: string;
    style?: CSSProperties;
    hideOpenOrderbookLink?: boolean;
    /** Rows per side; omit for the book's default. */
    visibleLevels?: number;
    /** Called with the clicked price and the book (pair and pool) it is on. */
    onPriceSelect?: (selection: BookPriceSelection) => void;
  }
> = ({
  className,
  style,
  hideOpenOrderbookLink,
  visibleLevels,
  onPriceSelect,
  ...pair
}) => {
  const orderbook = useTradeViewOrderbook(pair);
  // Depth is quoted in the book's own orientation, which may be the reverse
  // of the widget's pair.
  const baseSymbol = useAssetSymbol(orderbook?.baseDenom);
  const quoteSymbol = useAssetSymbol(orderbook?.quoteDenom);

  if (!orderbook) return null;

  return (
    <section
      style={style}
      className={classNames(
        "flex min-h-0 flex-col overflow-hidden rounded-3xl bg-osmoverse-900",
        className
      )}
    >
      <OrderBook
        poolId={orderbook.poolId}
        baseSymbol={baseSymbol}
        quoteSymbol={quoteSymbol}
        onPriceSelect={
          onPriceSelect &&
          ((price) =>
            onPriceSelect({
              price: String(price),
              baseDenom: orderbook.baseDenom,
              quoteDenom: orderbook.quoteDenom,
              poolId: orderbook.poolId,
            }))
        }
        hideOpenOrderbookLink={hideOpenOrderbookLink}
        visibleLevels={visibleLevels}
      />
    </section>
  );
};

/** The connected wallet's orders on the pair's orderbook, if it has one. */
export const TradeViewOrders: FunctionComponent<
  TradeViewPair & { className?: string }
> = ({ className, ...pair }) => {
  const orderbook = useTradeViewOrderbook(pair);
  if (!orderbook) return null;
  return (
    <div className={className}>
      <OrderbookYourOrders contractAddress={orderbook.contractAddress} />
    </div>
  );
};

/**
 * USD price chart of the widget's base asset: the same chart as the
 * orderbook pool page.
 */
export const TradeViewChart: FunctionComponent<{
  base?: string;
  className?: string;
  style?: CSSProperties;
}> = ({ base, className, style }) => (
  <section
    style={style}
    className={classNames(
      "flex min-h-0 flex-col overflow-hidden rounded-3xl bg-osmoverse-900",
      className
    )}
  >
    <AssetUsdChart coinDenom={base} />
  </section>
);
