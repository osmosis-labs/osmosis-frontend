import { FunctionComponent, ReactElement } from "react";
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
export const CompactTableDisplay: FunctionComponent<{
  title: string | ReactElement;
  pools: {
    id: string;
    assets: PoolAssetInfo[];
    metrics: Metric[];
    isSuperfluid?: boolean;
  }[];
  searchBoxProps: InputProps<string>;
  sortMenuProps: MenuSelectProps & { onToggleSortDirection?: () => void };
  pageListProps: NumberSelectProps;
  minTvlToggleProps: ToggleProps & { label: string };
}> = ({
  title,
  pools,
  searchBoxProps,
  sortMenuProps,
  pageListProps,
  minTvlToggleProps,
}) => (
  <div className="flex flex-col gap-5 p-5 pb-8">
    <SearchBox className="!rounded !w-full h-11" {...searchBoxProps} />
    <div className="flex items-center place-content-between">
      {typeof title === "string" ? (
        <span className="subtitle">{title}</span>
      ) : (
        <>{title}</>
      )}
      <SortMenu {...sortMenuProps} />
    </div>
    <div className="flex flex-col gap-3">
      {pools.map(({ id, assets, metrics, isSuperfluid }) => (
        <AssetCard
          key={id}
          coinDenom={assets.map((asset) => asset.coinDenom).join("/")}
          coinImageUrl={assets}
          metrics={metrics}
          coinDenomCaption={`Lab #${id}`}
          isSuperfluid={isSuperfluid}
        />
      ))}
    </div>
    <div className="flex items-center place-content-between p-4">
      <Switch {...minTvlToggleProps}>{minTvlToggleProps.label}</Switch>
      {pageListProps.max > 1 && (
        <PageList {...pageListProps} editField={false} />
      )}
    </div>
  </div>
);
