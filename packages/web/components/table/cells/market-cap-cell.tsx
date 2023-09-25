import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import SkeletonLoader from "~/components/skeleton-loader";
import { AssetCell as Cell } from "~/components/table/cells/types";
import { useStore } from "~/stores";

export const MarketCapCell: FunctionComponent<Partial<Cell>> = observer(
  ({ marketCap }) => {
    const { queriesExternalStore } = useStore();
    const marketCapQuery = queriesExternalStore.queryMarketCap;

    return (
      <div className="flex items-center gap-4">
        <SkeletonLoader
          className={marketCapQuery.isFetching ? "h-6 w-12" : undefined}
          isLoaded={!marketCapQuery.isFetching}
        >
          <p className="subtitle1">{marketCap}</p>
        </SkeletonLoader>
      </div>
    );
  }
);
