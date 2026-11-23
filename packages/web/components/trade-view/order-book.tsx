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
}> = ({
  poolId,
  baseSymbol,
  quoteSymbol,
  onPriceSelect,
  hideOpenOrderbookLink = false,
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

  const header = (
    <div className="flex shrink-0 items-center justify-between px-4 pt-3 pb-2">
      <h6 className="text-osmoverse-200">{t("tradeView.orderBook")}</h6>
      {!hideOpenOrderbookLink && poolId && (
        <Link
          href={`/pool/${poolId}`}
          className="flex items-center gap-1 text-wosmongton-300 hover:text-wosmongton-200"
        >
          <span className="body2">{t("limitOrders.openOrderbook")}</span>
          <Icon id="chevron-right" width={7} height={12} />
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
          // A failed poll keeps the last book on screen, but not as live.
          isLive={!isRefetching && !isError}
          isRefetching={isRefetching}
          isLoading={(isLoading || !poolId) && !depthData}
          isError={isError || Boolean(depthData?.unavailable)}
          bucketSize={bucketSize}
          onBucketSizeChange={setBucketSize}
          clIncluded={(depthData?.clPoolIds?.length ?? 0) > 0}
          clUnavailable={depthData?.clUnavailable}
          clEnabled={includeCl}
          onClEnabledChange={setIncludeCl}
        />
      </div>
    </div>
  );
};
