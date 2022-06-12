import classNames from "classnames";
import { useRouter } from "next/router";
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
export const CompactPoolTableDisplay: FunctionComponent<{
  title: string | ReactElement;
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
  title,
  pools,
  onClickPoolCard,
  searchBoxProps,
  sortMenuProps,
  pageListProps,
  minTvlToggleProps,
}) => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-5 p-5 pb-8">
      {searchBoxProps && (
        <SearchBox className="!rounded !w-full h-11" {...searchBoxProps} />
      )}
      <div className="flex flex-col gap-4">
        {typeof title === "string" ? (
          <span className="subtitle2">{title}</span>
        ) : (
          <>{title}</>
        )}
        <div
          className={classNames("flex items-center place-content-between", {})}
        >
          {minTvlToggleProps && (
            <Switch {...minTvlToggleProps}>{minTvlToggleProps.label}</Switch>
          )}
          {sortMenuProps && <SortMenu {...sortMenuProps} />}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {pools.map(({ id, assets, metrics, isSuperfluid }) => (
          <AssetCard
            key={id}
            contentClassName="!bg-background"
            coinDenom={assets.map((asset) => asset.coinDenom).join("/")}
            coinImageUrl={assets}
            metrics={metrics}
            coinDenomCaption={`Pool #${id}`}
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
      <div className="flex items-center justify-center flex-wrap gap-2 py-4">
        {pageListProps && pageListProps.max > 1 && (
          <PageList {...pageListProps} editField={false} />
        )}
      </div>
    </div>
  );
};
