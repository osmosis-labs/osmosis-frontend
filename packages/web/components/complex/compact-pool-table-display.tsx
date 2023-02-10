import { useRouter } from "next/router";
import { FunctionComponent } from "react";

import { PoolAssetInfo } from "../assets";
import { AssetCard } from "../cards";
import {
  MenuSelectProps,
  NumberSelectProps,
  PageList,
  SortMenu,
  Switch,
  ToggleProps,
} from "../control";
import { SearchBox } from "../input";
import { InputProps, Metric } from "../types";

/** Stateless component for displaying & filtering/sorting pools on a compact screen. */
export const CompactPoolTableDisplay: FunctionComponent<{
  pools: {
    id: string;
    assets: PoolAssetInfo[];
    metrics: Metric[];
    isSuperfluid?: boolean;
  }[];
  onClickPoolCard?: (poolId: string) => void;
  searchBoxProps?: InputProps<string>;
  sortMenuProps?: MenuSelectProps & { onToggleSortDirection?: () => void };
  pageListProps?: NumberSelectProps;
  minTvlToggleProps?: ToggleProps & { label: string };
}> = ({
  pools,
  onClickPoolCard,
  searchBoxProps,
  sortMenuProps,
  pageListProps,
  minTvlToggleProps,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5 pb-8">
      {searchBoxProps && <SearchBox size="small" {...searchBoxProps} />}
      <div className="flex flex-wrap place-content-between items-center gap-3">
        {minTvlToggleProps && (
          <Switch {...minTvlToggleProps} containerClassName="shrink flex-wrap">
            <span className="text-osmoverse-200">
              {minTvlToggleProps.label}
            </span>
          </Switch>
        )}
        {sortMenuProps && <SortMenu {...sortMenuProps} />}
      </div>
      <div className="flex flex-col gap-3">
        {pools.map(({ id, assets, metrics, isSuperfluid }) => (
          <AssetCard
            key={id}
            coinDenom={assets.map((asset) => asset.coinDenom).join("/")}
            coinImageUrl={assets}
            metrics={metrics}
            coinDenomCaption={id}
            isSuperfluid={isSuperfluid}
            onClick={() => {
              if (onClickPoolCard) {
                onClickPoolCard(id);
              } else {
                router.push(`/pool/${id}`);
              }
            }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 py-4">
        {pageListProps && pageListProps.max > 1 && (
          <PageList {...pageListProps} editField={false} />
        )}
      </div>
    </div>
  );
};
