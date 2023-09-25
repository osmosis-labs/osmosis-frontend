import { Dec } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import SkeletonLoader from "~/components/skeleton-loader";
import { AssetCell as Cell } from "~/components/table/cells/types";
import { useStore } from "~/stores";

export const MarketCapCell: FunctionComponent<Partial<Cell>> = observer(
  ({ coinDenom }) => {
    const { queriesExternalStore } = useStore();
    const tokenDataQuery = queriesExternalStore.queryTokenData.get(coinDenom!);

    const dayChange = tokenDataQuery.get24hrChange;

    return (
      <div className="flex items-center gap-4">
        <SkeletonLoader
          className={tokenDataQuery.isFetching ? "h-6 w-12" : undefined}
          isLoaded={!tokenDataQuery.isFetching}
        >
          <p
            className={classNames(
              "subtitle1",
              dayChange?.toDec().gte(new Dec(0))
                ? "text-bullish-400"
                : "text-error"
            )}
          >
            {dayChange?.maxDecimals(2).inequalitySymbol(false).toString()}
          </p>
        </SkeletonLoader>
      </div>
    );
  }
);
