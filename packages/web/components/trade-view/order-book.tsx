import Link from "next/link";
import { FunctionComponent, useState } from "react";

import { Icon } from "~/components/assets";
import { OrderbookDepthPanel } from "~/components/chart/aggregated-depth";
import { useOrderbookDepthPreferences } from "~/components/trade-view/depth-preferences";
import { useTranslation } from "~/hooks";
import { api } from "~/utils/trpc";

/**
 * Live depth for one orderbook pool. Prices are quote per base in the
 * orderbook's own orientation, so the symbols passed must be that book's
 * base and quote.
 *
 * Depth that cannot be read (a failed first load, or a result the server
 * marks unavailable) renders as unavailable, never as an empty book.
 *
 * The header (title, and an "Open orderbook" link unless hidden) is the same
 * wherever the book is shown.
 */
export const OrderBook: FunctionComponent<{
  poolId?: string;
  baseSymbol?: string;
  quoteSymbol?: string;
  onPriceSelect?: (price: number) => void;
  /** Hide the link to the orderbook pool page (when already on it). */
  hideOpenOrderbookLink?: boolean;
  /** Rows per side; omit for the panel's default. */
  visibleLevels?: number;
}> = ({
  poolId,
  baseSymbol,
  quoteSymbol,
  onPriceSelect,
  hideOpenOrderbookLink = false,
  visibleLevels,
}) => {
  const { t } = useTranslation();

  // Whether CL pool liquidity is included: remembered per browser and shared
  // by every order book on the page. localStorage is read synchronously when
  // the store is created (this component is client only), so a user who
  // turned it off never triggers a CL fetch.
  const includeCl = useOrderbookDepthPreferences((s) => s.includeCl);
  const setIncludeCl = useOrderbookDepthPreferences((s) => s.setIncludeCl);

  // Bucket size for depth aggregation; undefined means raw ticks. A size picked
  // for one pool can round another pool's prices to zero, so reset it when the
  // pool changes.
  const [bucketSize, setBucketSize] = useState<number | undefined>(undefined);
  const [bucketPoolId, setBucketPoolId] = useState(poolId);
  if (bucketPoolId !== poolId) {
    setBucketPoolId(poolId);
    setBucketSize(undefined);
  }

  const {
    data: depthData,
    isLoading,
    isError,
    isRefetching,
  } = api.edge.pools.getPairDepth.useQuery(
    { poolId: poolId ?? "", bucketSize, includeCl },
    {
      enabled: Boolean(poolId),
      refetchInterval: 30000,
      // Keep showing the last depth while bucketing changes, but never carry
      // one pool's depth over to another: its prices and quantities would be
      // shown under the new pair's symbols.
      placeholderData: (previousData, previousQuery) =>
        (previousQuery?.queryKey[1] as { input?: { poolId?: string } })?.input
          ?.poolId === poolId
          ? previousData
          : undefined,
      staleTime: 0,
    }
  );

  const pair = baseSymbol && quoteSymbol ? `${baseSymbol}/${quoteSymbol}` : "";
  const header = (
    <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3 pb-2">
      <div className="flex min-w-0 items-baseline gap-2">
        <h6 className="shrink-0 text-osmoverse-200">
          {t("tradeView.orderBook")}
        </h6>
        {pair && (
          <span className="body2 truncate text-osmoverse-400" title={pair}>
            {pair}
          </span>
        )}
      </div>
      {!hideOpenOrderbookLink && poolId && pair && (
        <Link
          href={`/pool/${poolId}`}
          aria-label={t("limitOrders.openOrderbook", { pair })}
          title={t("limitOrders.openOrderbook", { pair })}
          className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-wosmongton-300 transition-colors hover:bg-osmoverse-800 hover:text-wosmongton-200"
        >
          <Icon id="arrow-up-right" width={18} height={18} aria-hidden />
        </Link>
      )}
    </div>
  );

  if (isError && !depthData) {
    return (
      <div className="flex h-full flex-col">
        {header}
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

  return (
    <div className="flex h-full flex-col">
      {header}
      <div className="min-h-0 flex-1">
        <OrderbookDepthPanel
          bids={depthData?.bids ?? []}
          asks={depthData?.asks ?? []}
          midPrice={depthData?.midPrice ?? 0}
          bidPrice={depthData?.bidPrice}
          askPrice={depthData?.askPrice}
          groupingOptions={depthData?.groupingOptions ?? []}
          baseSymbol={baseSymbol}
          quoteSymbol={quoteSymbol}
          onPriceSelect={onPriceSelect}
          isLive={!isRefetching}
          isRefetching={isRefetching}
          isLoading={(isLoading || !poolId) && !depthData}
          isError={isError || Boolean(depthData?.unavailable)}
          bucketSize={bucketSize}
          onBucketSizeChange={setBucketSize}
          clIncluded={(depthData?.clPoolIds?.length ?? 0) > 0}
          clUnavailable={depthData?.clUnavailable}
          clEnabled={includeCl}
          onClEnabledChange={setIncludeCl}
          visibleLevels={visibleLevels}
        />
      </div>
    </div>
  );
};
