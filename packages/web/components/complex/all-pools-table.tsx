import type { SortDirection } from "@osmosis-labs/server";
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
import Link from "next/link";
import { useRouter } from "next/router";
import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringEnum,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { useCallback } from "react";

import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
import { api, RouterOutputs } from "~/utils/trpc";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "../assets";
import { AprBreakdown } from "../cards/apr-breakdown";
import { CheckboxSelect } from "../control";
import { SearchBox } from "../input";
import Spinner from "../loaders/spinner";
import { PoolQuickActionCell } from "../table/cells";
import { SortHeader } from "../table/headers/sort";
import { Tooltip } from "../tooltip";
import { AprDisclaimerTooltip } from "../tooltip/apr-disclaimer";

type Pool =
  RouterOutputs["edge"]["pools"]["getMarketIncentivePools"]["items"][number];
/** UI doesn't support cosmwasm pools as first class so exclude it from list of filter options. */
type PoolTypeFilter = Exclude<Pool["type"], "cosmwasm">;
type PoolIncentiveFilter = NonNullable<Pool["incentiveTypes"]>[number];

// These are the options for filtering the pools.
const poolFilterTypes = [
  "weighted",
  "stable",
  "concentrated",
  "cosmwasm-transmuter",
] as const;

const marketIncentivePoolsSortKeys = [
  "totalFiatValueLocked",
  "feesSpent7dUsd",
  "feesSpent24hUsd",
  "volume7dUsd",
  "volume24hUsd",
  "aprBreakdown.total",
] as const;

const incentiveTypes = ["superfluid", "osmosis", "boost", "none"] as const;

const useAllPoolsTable = () => {
  const [sortParams, setSortParams] = useQueryStates(
    {
      allPoolsSort: parseAsStringLiteral(
        marketIncentivePoolsSortKeys
      ).withDefault("volume24hUsd"),
      allPoolsSortDir: parseAsStringEnum<SortDirection>([
        "asc",
        "desc",
      ]).withDefault("desc"),
    },
    {
      history: "push",
    }
  );

  const [filters, setFilters] = useQueryStates(
    {
      searchQuery: parseAsString,
      poolTypesFilter: parseAsArrayOf<PoolTypeFilter>(
        parseAsStringLiteral<PoolTypeFilter>(poolFilterTypes)
      ).withDefault([...poolFilterTypes]),
      poolIncentivesFilter: parseAsArrayOf<PoolIncentiveFilter>(
        parseAsStringLiteral<PoolIncentiveFilter>(incentiveTypes)
      ).withDefault([...incentiveTypes]),
    },
    {
      history: "push",
    }
  );

  return {
    filters,
    setFilters,
    sortParams,
    setSortParams,
  };
};

export const AllPoolsTable: FunctionComponent<{
  topOffset: number;
  quickAddLiquidity: (poolId: string) => void;
}> = ({ topOffset, quickAddLiquidity }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { width } = useWindowSize();

  const { filters, sortParams, setSortParams } = useAllPoolsTable();

  /** Won't sort when searching is happening. */
  const sortKey = useMemo(
    () => (Boolean(filters.searchQuery) ? undefined : sortParams.allPoolsSort),
    [filters.searchQuery, sortParams.allPoolsSort]
  );

  const setSortDirection = useCallback(
    (dir: SortDirection) => {
      setSortParams((state) => ({
        ...state,
        allPoolsSortDir: dir,
      }));
    },
    [setSortParams]
  );

  const setSortKey = useCallback(
    (key: (typeof sortParams)["allPoolsSort"] | undefined) => {
      if (key) {
        setSortParams((state) => ({
          ...state,
          allPoolsSort: key,
        }));
      }
    },
    [setSortParams]
  );

  const {
    data: poolsPagesData,
    isLoading,
    isFetching,
    isPreviousData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.edge.pools.getMarketIncentivePools.useInfiniteQuery(
    {
      limit: 100,
      search: filters.searchQuery
        ? {
            query: filters.searchQuery,
          }
        : undefined,
      // These are all of the pools that we support fetching.
      // In addiion, to pool filters, there are also general cosmwasm pools, Astroport PCL pools, and whitewhale pools.
      types: [
        ...filters.poolTypesFilter,
        "cosmwasm",
        "cosmwasm-astroport-pcl",
        "cosmwasm-whitewhale",
      ],
      incentiveTypes: filters.poolIncentivesFilter,
      sort: sortKey
        ? {
            keyPath: sortKey,
            direction: sortParams.allPoolsSortDir,
          }
        : undefined,
      minLiquidityUsd: 1_000,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,

      keepPreviousData: true,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const poolsData = useMemo(
    () => poolsPagesData?.pages.flatMap((page) => page?.items) ?? [],
    [poolsPagesData]
  );

  // If more than half of the pools have volume and fees data, we should format their respective columns.
  // Otherwise, we should not display them.
  const { shouldDisplayVolumeData, shouldDisplayFeesData } = useMemo(() => {
    let volumePresenceCount = 0;
    let feesPresenceCount = 0;
    poolsData.forEach((pool) => {
      if (pool.volume24hUsd) {
        volumePresenceCount++;
      }

      if (pool.feesSpent7dUsd) {
        feesPresenceCount++;
      }
    });
    return {
      shouldDisplayVolumeData: volumePresenceCount > poolsData.length / 2,
      shouldDisplayFeesData: feesPresenceCount > poolsData.length / 2,
    };
  }, [poolsData]);

  // Define columns
  const cellGroupEventEmitter = useRef(new EventEmitter()).current;
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Pool>();

    let allColumns = [
      columnHelper.accessor((row) => row, {
        id: "pool",
        header: t("pools.allPools.sort.poolName"),
        cell: PoolCompositionCell,
      }),
    ];

    // Only show volume if more than half of the pools have volume data.
    if (shouldDisplayVolumeData) {
      allColumns.push(
        columnHelper.accessor((row) => row.volume24hUsd?.toString() ?? "N/A", {
          id: "volume24hUsd",
          header: () => (
            <SortHeader
              label={t("pools.allPools.sort.volume24h")}
              sortKey="volume24hUsd"
              disabled={isLoading}
              currentSortKey={sortKey}
              currentDirection={sortParams.allPoolsSortDir}
              setSortDirection={setSortDirection}
              setSortKey={setSortKey}
            />
          ),
        }) as (typeof allColumns)[number]
      );
    }

    allColumns.push(
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
              currentDirection={sortParams.allPoolsSortDir}
              setSortDirection={setSortDirection}
              setSortKey={setSortKey}
            />
          ),
        }
      ) as (typeof allColumns)[number]
    );

    // Only show fees if more than half of the pools have fees data.
    if (shouldDisplayFeesData) {
      allColumns.push(
        columnHelper.accessor(
          (row) => row.feesSpent7dUsd?.toString() ?? "N/A",
          {
            id: "feesSpent7dUsd",
            header: () => (
              <SortHeader
                label={t("pools.allPools.sort.fees")}
                sortKey="feesSpent7dUsd"
                disabled={isLoading}
                currentSortKey={sortKey}
                currentDirection={sortParams.allPoolsSortDir}
                setSortDirection={setSortDirection}
                setSortKey={setSortKey}
              />
            ),
          }
        ) as (typeof allColumns)[number]
      );
    }

    let remainingColumns = [
      columnHelper.accessor((row) => row, {
        id: "aprBreakdown.total",
        header: () => (
          <SortHeader
            label={t("pools.allPools.sort.APRIncentivized")}
            sortKey="aprBreakdown.total"
            disabled={isLoading}
            currentSortKey={sortKey}
            currentDirection={sortParams.allPoolsSortDir}
            setSortDirection={setSortDirection}
            setSortKey={setSortKey}
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
    ] as (typeof allColumns)[number][];

    allColumns.push(...remainingColumns);

    return allColumns;
  }, [
    t,
    isLoading,
    sortKey,
    sortParams.allPoolsSortDir,
    setSortDirection,
    setSortKey,
    cellGroupEventEmitter,
    quickAddLiquidity,
    shouldDisplayVolumeData,
    shouldDisplayFeesData,
  ]);

  /** Columns collapsed for screen size responsiveness. */
  const collapsedColumns = useMemo(() => {
    const collapsedColIds: string[] = [];
    if (width < Breakpoint.xxl && shouldDisplayFeesData)
      collapsedColIds.push("feesSpent7dUsd");
    if (width < Breakpoint.xlg) collapsedColIds.push("totalFiatValueLocked");
    if (width < Breakpoint.lg && shouldDisplayVolumeData)
      collapsedColIds.push("volume24hUsd");
    if (width < Breakpoint.md) collapsedColIds.push("poolQuickActions");
    return columns.filter(({ id }) => id && !collapsedColIds.includes(id));
  }, [columns, width, shouldDisplayVolumeData, shouldDisplayFeesData]);

  const table = useReactTable({
    data: poolsData,
    columns: collapsedColumns,
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
      <TableControls />
      <table
        className={classNames(
          "w-full",
          isPreviousData &&
            isFetching &&
            "animate-[deepPulse_2s_ease-in-out_infinite] cursor-progress"
        )}
      >
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
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
          {paddingTop > 0 && paddingTop - topOffset > 0 && (
            <tr>
              <td style={{ height: paddingTop - topOffset }} />
            </tr>
          )}
          {isLoading && (
            <tr>
              <td className="!text-center" colSpan={collapsedColumns.length}>
                <Spinner />
              </td>
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];

            return (
              <tr
                className="group transition-colors duration-200 ease-in-out hover:cursor-pointer hover:bg-osmoverse-850"
                key={row.id}
                onClick={() => router.push("/pool/" + row.original.id)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    className={classNames(
                      "transition-colors duration-200 ease-in-out",
                      isPreviousData && isFetching && "cursor-progress"
                    )}
                    key={cell.id}
                  >
                    <Link
                      href={getPoolLink(row.original)}
                      key={virtualRow.index}
                      target={getPoolTypeTarget(row.original)}
                      onClick={(e) => e.stopPropagation()}
                      passHref
                      prefetch={false}
                      className={classNames(
                        isPreviousData && isFetching && "cursor-progress"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Link>
                  </td>
                ))}
              </tr>
            );
          })}
          {isFetchingNextPage && (
            <tr>
              <td className="!text-center" colSpan={collapsedColumns.length}>
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

const TableControls = () => {
  const { t } = useTranslation();

  const { filters, setFilters } = useAllPoolsTable();

  const onSearchInput = useCallback(
    (data: string) => {
      setFilters((state) => ({
        ...state,
        searchQuery: data.length === 0 ? null : data,
      }));
    },
    [setFilters]
  );

  return (
    <div className="flex w-full place-content-between items-center gap-5 xl:flex-col xl:items-start">
      <h5>{t("pools.allPools.title")}</h5>

      <div className="flex h-12 flex-wrap gap-3 xl:h-fit">
        <CheckboxSelect
          label={t("components.pool.title")}
          selectedOptionIds={filters.poolTypesFilter}
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
            if (filters.poolTypesFilter.includes(poolType as PoolTypeFilter)) {
              setFilters((state) => ({
                ...state,
                poolTypesFilter: state.poolTypesFilter.filter(
                  (type) => type !== poolType
                ),
              }));
            } else {
              setFilters((state) => ({
                ...state,
                poolTypesFilter: [
                  ...state.poolTypesFilter,
                  poolType as PoolTypeFilter,
                ],
              }));
            }
          }}
        />
        <CheckboxSelect
          label={t("components.incentive.title")}
          selectedOptionIds={filters.poolIncentivesFilter}
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
              filters.poolIncentivesFilter.includes(
                incentiveType as PoolIncentiveFilter
              )
            ) {
              setFilters((state) => ({
                ...state,
                poolIncentivesFilter: filters.poolIncentivesFilter.filter(
                  (type) => type !== (incentiveType as PoolIncentiveFilter)
                ),
              }));
            } else {
              setFilters((state) => ({
                ...state,
                poolIncentivesFilter: [
                  ...state.poolIncentivesFilter,
                  incentiveType as PoolIncentiveFilter,
                ],
              }));
            }
          }}
        />
        <SearchBox
          size="small"
          placeholder={t("assets.table.search")}
          debounce={500}
          currentValue={filters.searchQuery ?? undefined}
          onInput={onSearchInput}
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
    original: { id, type, spreadFactor, reserveCoins },
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
            <p className={classNames("ml-auto flex items-center gap-1.5")}>
              {t("components.table.poolId", { id })}
              <div>
                <p
                  className={classNames("ml-auto flex items-center gap-1.5", {
                    "text-ion-400": Boolean(type === "concentrated"),
                    "text-bullish-300": Boolean(type === "stable"),
                    "text-rust-300": Boolean(
                      type === "cosmwasm-transmuter" || type === "cosmwasm"
                    ),
                  })}
                >
                  {type === "weighted" && (
                    <Icon id="weighted-pool" width={16} height={16} />
                  )}
                  {type === "stable" && (
                    <Icon id="stable-pool" width={16} height={16} />
                  )}
                  {type === "concentrated" && (
                    <Icon id="concentrated-pool" width={16} height={16} />
                  )}
                  {type === "cosmwasm-transmuter" && (
                    <Icon id="custom-pool" width={16} height={16} />
                  )}
                  {spreadFactor ? spreadFactor.toString() : ""}
                </p>
              </div>
            </p>
          </span>
        </div>
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
      rootClassNames="!rounded-2xl drop-shadow-md"
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

function getPoolLink(pool: Pool): string {
  if (pool.type === "cosmwasm-transmuter") {
    return `https://celatone.osmosis.zone/osmosis-1/pools/${pool.id}`;
  }
  if (pool.type === "cosmwasm-astroport-pcl") {
    return `https://osmosis.astroport.fi/pools/${pool.id}`;
  }

  if (pool.type === "cosmwasm-whitewhale") {
    return `https://app.whitewhale.money/osmosis/pools/${pool.id}`;
  }

  return `/pool/${pool.id}`;
}

function getPoolTypeTarget(pool: Pool) {
  if (
    pool.type === "cosmwasm-transmuter" ||
    pool.type === "cosmwasm-astroport-pcl" ||
    pool.type === "cosmwasm-whitewhale"
  ) {
    return "_blank";
  }
  return "";
}
