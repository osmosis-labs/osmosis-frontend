import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import { EventEmitter } from "eventemitter3";
import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";

import { useTranslation } from "~/hooks";
import { useSearchQueryInput } from "~/hooks/input/use-search-query-input";
import { useQueryParamState } from "~/hooks/window/use-query-param-state";
import type { MarketIncentivePoolSortKey } from "~/server/api/edge-routers/pools-router";
import { theme } from "~/tailwind.config";
import type { Search } from "~/utils/search";
import type { SortDirection } from "~/utils/sort";
import { api, RouterOutputs } from "~/utils/trpc";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "../assets";
import { AprBreakdown } from "../cards/apr-breakdown";
import { CheckboxSelect } from "../control";
import { SearchBox } from "../input";
import Spinner from "../spinner";
import { PoolQuickActionCell } from "../table/cells";
import { SortHeader } from "../table/headers/sort";
import { Tooltip } from "../tooltip";
import { AprDisclaimerTooltip } from "../tooltip/apr-disclaimer";

type Pool =
  RouterOutputs["edge"]["pools"]["getMarketIncentivePools"]["items"][number];
type SortKey = MarketIncentivePoolSortKey | undefined;
/** UI doesn't support cosmwasm pools as first class so exclude it from list of filter options. */
type PoolTypeFilter = Exclude<Pool["type"], "cosmwasm">;
type PoolIncentiveFilter = NonNullable<Pool["incentiveTypes"]>[number];

export const AllPoolsTable: FunctionComponent<{
  topOffset: number;
  quickAddLiquidity: (poolId: string) => void;
}> = ({ topOffset, quickAddLiquidity }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<Search | undefined>();

  const [sortKey_, setSortKey] = useQueryParamState<SortKey>(
    "allPoolsSort",
    "volume24hUsd"
  );
  /** Won't sort when searching is happening. */
  const sortKey: SortKey = Boolean(searchQuery) ? undefined : sortKey_;

  const [sortDirection = "desc", setSortDirection, isQueryParamsReady] =
    useQueryParamState<SortDirection>("allPoolsSortDir", "desc");

  const [poolTypesFilter, setPoolTypesFilter] = useQueryParamState<
    PoolTypeFilter[]
  >("allPoolsType", [
    "weighted",
    "stable",
    "concentrated",
    "cosmwasm-transmuter",
  ]);
  const [poolIncentivesFilter_, setPoolIncentivesFilter] = useQueryParamState<
    PoolIncentiveFilter[] | string | undefined
  >("allPoolsIncentive", ["superfluid", "osmosis", "boost", "none"]);
  // useQueryParamState will return a string if there's a single filter selected
  const poolIncentivesFilter = useMemo(
    () =>
      (!poolIncentivesFilter_
        ? []
        : typeof poolIncentivesFilter_ === "string"
        ? [poolIncentivesFilter_]
        : poolIncentivesFilter_) as PoolIncentiveFilter[],
    [poolIncentivesFilter_]
  );

  const {
    data: poolsPagesData,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.edge.pools.getMarketIncentivePools.useInfiniteQuery(
    {
      limit: 100,
      search: searchQuery,
      types: poolTypesFilter
        ? poolTypesFilter.concat("cosmwasm" as PoolTypeFilter)
        : undefined,
      incentiveTypes: poolIncentivesFilter,
      sort: sortKey
        ? {
            keyPath: sortKey,
            direction: sortDirection,
          }
        : undefined,
      minLiquidityUsd: 1_000,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,
      enabled: isQueryParamsReady,
    }
  );
  const poolsData = useMemo(
    () => poolsPagesData?.pages.flatMap((page) => page?.items) ?? [],
    [poolsPagesData]
  );

  // Define columns
  const columnHelper = createColumnHelper<Pool>();
  const cellGroupEventEmitter = useRef(new EventEmitter()).current;
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row, {
        id: "pool",
        header: t("pools.allPools.sort.poolName"),
        cell: PoolCompositionCell,
      }),
      columnHelper.accessor((row) => row.volume24hUsd?.toString() ?? "0", {
        id: "volume24hUsd",
        header: () => (
          <SortHeader
            label={t("pools.allPools.sort.volume24h")}
            sortKey="volume24hUsd"
            disabled={isLoading}
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={(key) => {
              if (key) setSortKey(key);
            }}
          />
        ),
      }),
      columnHelper.accessor(
        (row) => row.totalFiatValueLocked?.toString() ?? "0",
        {
          id: "totalFiatValueLocked",
          header: () => (
            <SortHeader
              label={t("pools.allPools.sort.liquidity")}
              sortKey="totalFiatValueLocked"
              disabled={isLoading}
              currentSortKey={sortKey}
              currentDirection={sortDirection}
              setSortDirection={setSortDirection}
              setSortKey={(key) => {
                if (key) setSortKey(key);
              }}
            />
          ),
        }
      ),
      columnHelper.accessor((row) => row.feesSpent7dUsd?.toString() ?? "0", {
        id: "feesSpent7dUsd",
        header: () => (
          <SortHeader
            label={t("pools.allPools.sort.fees")}
            sortKey="feesSpent7dUsd"
            disabled={isLoading}
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={(key) => {
              if (key) setSortKey(key);
            }}
          />
        ),
      }),
      columnHelper.accessor((row) => row, {
        id: "aprBreakdown.total",
        header: () => (
          <SortHeader
            label={t("pools.allPools.sort.APRIncentivized")}
            sortKey="aprBreakdown.total"
            disabled={isLoading}
            currentSortKey={sortKey}
            currentDirection={sortDirection}
            setSortDirection={setSortDirection}
            setSortKey={(key) => {
              if (key) setSortKey(key);
            }}
          >
            <AprDisclaimerTooltip />
          </SortHeader>
        ),
        cell: AprBreakdownCell,
      }),
      columnHelper.accessor((row) => row, {
        id: "poolQuickActions",
        header: "",
        cell: ({ row }) => (
          <PoolQuickActionCell
            poolId={row.original.id}
            cellGroupEventEmitter={cellGroupEventEmitter}
            onAddLiquidity={() => quickAddLiquidity(row.original.id)}
          />
        ),
      }),
    ],
    [
      columnHelper,
      sortKey,
      sortDirection,
      cellGroupEventEmitter,
      isLoading,
      setSortKey,
      setSortDirection,
      t,
      quickAddLiquidity,
    ]
  );

  const table = useReactTable({
    data: poolsData,
    columns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => 69,
    paddingStart: topOffset,
    overscan: 5,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() -
        (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  // pagination
  const lastRow = rows[rows.length - 1];
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  const canLoadMore = !isLoading && !isFetchingNextPage && hasNextPage;
  useEffect(() => {
    if (
      lastRow &&
      lastVirtualRow &&
      lastRow.index === lastVirtualRow.index &&
      canLoadMore
    )
      fetchNextPage();
  }, [lastRow, lastVirtualRow, canLoadMore, fetchNextPage]);

  return (
    <div className="w-full">
      <TableControls
        poolTypesFilter={poolTypesFilter ?? []}
        setPoolTypesFilter={setPoolTypesFilter}
        poolIncentivesFilter={poolIncentivesFilter ?? []}
        setPoolIncentivesFilter={setPoolIncentivesFilter}
        setSearchQuery={setSearchQuery}
      />
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="bg-transparent" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={classNames("subtitle1", {
                    "w-96 !text-left": header.index === 0,
                    "text-right": header.index > 0,
                  })}
                  key={header.id}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop - topOffset }} />
            </tr>
          )}
          {isLoading && (
            <tr>
              <td className="text-center" colSpan={columns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                className="group rounded-3xl transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
                key={row.id}
                onClick={() => router.push("/pool/" + row.original.id)}
              >
                {row.getVisibleCells().map((cell, cellIndex, cells) => (
                  <td
                    className={classNames(
                      "transition-colors duration-200 ease-in-out",
                      {
                        "rounded-l-3xl text-left": cellIndex === 0,
                        "text-right": cellIndex > 0,
                        "rounded-r-3xl": cellIndex === cells.length - 1,
                      }
                    )}
                    key={cell.id}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {isFetchingNextPage && (
            <tr>
              <td className="text-center" colSpan={columns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom - topOffset }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const TableControls: FunctionComponent<{
  poolTypesFilter: PoolTypeFilter[];
  setPoolTypesFilter: (poolType: PoolTypeFilter[]) => void;
  poolIncentivesFilter: PoolIncentiveFilter[];
  setPoolIncentivesFilter: (poolIncentive: PoolIncentiveFilter[]) => void;
  setSearchQuery: (searchQuery: Search | undefined) => void;
}> = ({
  poolTypesFilter,
  setPoolTypesFilter,
  poolIncentivesFilter,
  setPoolIncentivesFilter,
  setSearchQuery,
}) => {
  const { t } = useTranslation();

  const { searchInput, setSearchInput, queryInput } = useSearchQueryInput();

  // Pass search query in an effect to prevent rendering the entire table on every input change
  // Only on debounced search query input
  useEffect(() => setSearchQuery(queryInput), [setSearchQuery, queryInput]);

  return (
    <div className="flex h-12 w-full place-content-between items-center gap-5">
      <h5>{t("pools.allPools.title")}</h5>

      <div className="flex h-12 gap-3">
        <CheckboxSelect
          label={t("components.pool.title")}
          selectedOptionIds={poolTypesFilter as string[]}
          atLeastOneSelected
          options={[
            { id: "weighted", display: t("components.table.weighted") },
            { id: "stable", display: t("components.table.stable") },
            {
              id: "concentrated",
              display: t("components.table.concentrated"),
            },
            {
              id: "cosmwasm-transmuter",
              display: t("components.table.transmuter"),
            },
          ]}
          onSelect={(poolType) => {
            if (poolTypesFilter.includes(poolType as PoolTypeFilter)) {
              setPoolTypesFilter(
                poolTypesFilter.filter(
                  (type) => type !== (poolType as PoolTypeFilter)
                )
              );
            } else if (!poolTypesFilter.includes(poolType as PoolTypeFilter)) {
              setPoolTypesFilter([
                ...poolTypesFilter,
                poolType as PoolTypeFilter,
              ]);
            }
          }}
        />
        <CheckboxSelect
          label={t("components.incentive.title")}
          selectedOptionIds={poolIncentivesFilter as string[]}
          atLeastOneSelected
          options={[
            { id: "superfluid", display: t("pools.aprBreakdown.superfluid") },
            { id: "osmosis", display: t("pools.aprBreakdown.boost") },
            {
              id: "boost",
              display: t("pools.aprBreakdown.externalBoost"),
            },
            {
              id: "none",
              display: t("components.table.noIncentives"),
            },
          ]}
          onSelect={(incentiveType) => {
            if (
              poolIncentivesFilter.includes(
                incentiveType as PoolIncentiveFilter
              )
            ) {
              setPoolIncentivesFilter(
                poolIncentivesFilter.filter(
                  (type) => type !== (incentiveType as PoolIncentiveFilter)
                )
              );
            } else if (
              !poolIncentivesFilter.includes(
                incentiveType as PoolIncentiveFilter
              )
            ) {
              setPoolIncentivesFilter([
                ...poolIncentivesFilter,
                incentiveType as PoolIncentiveFilter,
              ]);
            }
          }}
        />
        <SearchBox
          size="small"
          placeholder={t("assets.table.search")}
          currentValue={searchInput}
          onInput={setSearchInput}
        />
      </div>
    </div>
  );
};

type PoolCellComponent<TProps = {}> = FunctionComponent<
  CellContext<Pool, Pool> & TProps
>;

const PoolCompositionCell: PoolCellComponent = ({
  row: {
    original: { id, type, reserveCoins },
  },
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center">
      <PoolAssetsIcon
        assets={reserveCoins.map((coin) => coin.currency)}
        size="sm"
      />
      <div className="flex items-center gap-1.5 text-ion-400">
        <div className="ml-4 mr-1 flex flex-col items-start text-white-full">
          <PoolAssetsName
            size="sm"
            assetDenoms={reserveCoins.map((coin) => coin.denom)}
          />
          <span className={classNames("text-sm font-caption opacity-60")}>
            {t("components.table.poolId", { id })}
          </span>
        </div>
        {type === "stable" && (
          <Image
            alt=""
            src="/icons/stableswap-pool.svg"
            width={24}
            height={24}
          />
        )}
        {type === "concentrated" && (
          <Icon
            color={theme.colors.white.mid}
            id="lightning-small"
            height={24}
            width={24}
          />
        )}
        {type === "cosmwasm-transmuter" && (
          <Image
            alt=""
            src="/icons/stableswap-pool.svg"
            width={24}
            height={24}
          />
        )}
      </div>
    </div>
  );
};

const AprBreakdownCell: PoolCellComponent = ({
  row: {
    original: { aprBreakdown },
  },
}) =>
  (aprBreakdown && (
    <Tooltip
      rootClassNames="!rounded-[20px] drop-shadow-md"
      content={<AprBreakdown {...aprBreakdown} />}
    >
      <p
        className={classNames("ml-auto flex items-center gap-1.5", {
          "text-bullish-500": Boolean(
            aprBreakdown.boost || aprBreakdown.osmosis
          ),
        })}
      >
        {aprBreakdown.boost || aprBreakdown.osmosis ? (
          <div className="rounded-full bg-[#003F4780]">
            <Icon id="boost" className="h-4 w-4 text-bullish-500" />
          </div>
        ) : (
          <Icon id="info" className="h-4 w-4" />
        )}
        {aprBreakdown.total?.maxDecimals(0).toString() ?? ""}
      </p>
    </Tooltip>
  )) ??
  null;
