import { SortDirection } from "@osmosis-labs/utils";
import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import EventEmitter from "eventemitter3";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { Icon, PoolAssetsIcon, PoolAssetsName } from "~/components/assets";
import { AprBreakdown } from "~/components/cards/apr-breakdown";
import { Spinner } from "~/components/loaders";
import { PoolQuickActionCell } from "~/components/table/cells";
import { SortHeader } from "~/components/table/headers/sort";
import { AprDisclaimerTooltip } from "~/components/tooltip/apr-disclaimer";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
import { api, RouterOutputs } from "~/utils/trpc";

import { Tooltip } from "../tooltip";

export type Pool =
  RouterOutputs["edge"]["pools"]["getMarketIncentivePools"]["items"][number];
/** UI doesn't support cosmwasm pools as first class so exclude it from list of filter options. */
export type PoolTypeFilter = Exclude<Pool["type"], "cosmwasm">;
export type PoolIncentiveFilter = NonNullable<Pool["incentiveTypes"]>[number];

// These are the options for filtering the pools.
export const poolFilterTypes: PoolTypeFilter[] = [
  "weighted",
  "stable",
  "concentrated",
  "cosmwasm-transmuter",
];

export const marketIncentivePoolsSortKeys = [
  "totalFiatValueLocked",
  "feesSpent7dUsd",
  "feesSpent24hUsd",
  "volume7dUsd",
  "volume24hUsd",
  "aprBreakdown.total.upper",
] as const;

export type MarketIncentivePoolsSortKey =
  (typeof marketIncentivePoolsSortKeys)[number];

export const incentiveTypes: PoolIncentiveFilter[] = [
  "superfluid",
  "osmosis",
  "boost",
  "none",
];

export interface PoolsTableFilters {
  searchQuery: string | null;
  poolIncentivesFilter: PoolIncentiveFilter[];
  poolTypesFilter: PoolTypeFilter[];
  denoms?: string[];
}

export interface PoolsTabelSortParams {
  allPoolsSort: MarketIncentivePoolsSortKey;
  allPoolsSortDir: SortDirection;
}

export interface PoolsTableProps {
  topOffset?: number;
  quickAddLiquidity?: (poolId: string) => void;
  limit?: number;
  disablePagination?: boolean;
  filters?: PoolsTableFilters;
  sortParams?: PoolsTabelSortParams;
  emptyResultsText?: string;
  setSortDirection: (dir: SortDirection) => void;
  setSortKey: (key?: MarketIncentivePoolsSortKey) => void;
}

export const PoolsTable = (props: PropsWithChildren<PoolsTableProps>) => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  const router = useRouter();
  const {
    topOffset,
    quickAddLiquidity,
    limit = 100,
    disablePagination = false,
    filters = {
      searchQuery: undefined,
      poolTypesFilter: poolFilterTypes,
      poolIncentivesFilter: incentiveTypes,
      denoms: [],
    },
    sortParams = {
      allPoolsSort: "volume24hUsd",
      allPoolsSortDir: "desc",
    },
    emptyResultsText,
    setSortDirection,
    setSortKey,
    children,
  } = props;

  const sortKey = useMemo(
    () => (Boolean(filters.searchQuery) ? undefined : sortParams.allPoolsSort),
    [filters.searchQuery, sortParams.allPoolsSort]
  );

  const {
    data: poolsPagesData,
    isLoading,
    isSuccess,
    isError,
    isFetching,
    isPreviousData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.edge.pools.getMarketIncentivePools.useInfiniteQuery(
    {
      limit,
      search: filters.searchQuery
        ? {
            query: filters.searchQuery,
          }
        : undefined,
      denoms: filters.denoms,
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
      shouldDisplayFeesData: false, // never show fees in the table
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
            <SortHeader<MarketIncentivePoolsSortKey>
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
            sortKey="aprBreakdown.total.upper"
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
    ] as (typeof allColumns)[number][];

    if (quickAddLiquidity) {
      remainingColumns.push(
        columnHelper.accessor((row) => row, {
          id: "poolQuickActions",
          header: "",
          cell: ({ row }) => (
            <PoolQuickActionCell
              poolId={row.original.id}
              cellGroupEventEmitter={cellGroupEventEmitter}
              onAddLiquidity={
                quickAddLiquidity
                  ? () => quickAddLiquidity(row.original.id)
                  : undefined
              }
            />
          ),
        })
      );
    }

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
    overscan: disablePagination ? limit : 5,
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
      canLoadMore &&
      !disablePagination
    )
      fetchNextPage();
  }, [lastRow, lastVirtualRow, canLoadMore, disablePagination, fetchNextPage]);

  return (
    <div className="w-full">
      {children}

      {(isSuccess && virtualRows.length === 0) || isError ? (
        <div className="flex w-full flex-col items-center justify-center py-8">
          <h6 className="mb-2">{t("search.noPools")}</h6>
          <p className=" text-body1 font-body1 text-osmoverse-300">
            {isError
              ? t("errors.fallbackText1")
              : emptyResultsText ??
                t("search.noResultsFor", {
                  query: filters.searchQuery ?? "",
                })}
          </p>
        </div>
      ) : (
        <table
          className={classNames(
            "table-auto",
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
            {topOffset !== undefined &&
              paddingTop > 0 &&
              paddingTop - topOffset > 0 && (
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
                        "transition-colors duration-200 ease-in-out xs:px-1",
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
            {topOffset !== undefined && paddingBottom > 0 && (
              <tr>
                <td style={{ height: paddingBottom - topOffset }} />
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export type PoolCellComponent<TProps = {}> = FunctionComponent<
  CellContext<Pool, Pool> & TProps
>;

export const PoolCompositionCell: PoolCellComponent = ({
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
                  {type === "cosmwasm-astroport-pcl" && (
                    <Image
                      alt="astroport icon"
                      src="/images/astroport-icon.png"
                      height={16}
                      width={16}
                    />
                  )}
                  {type === "cosmwasm-whitewhale" && (
                    <Image
                      alt="astroport icon"
                      src="/images/whitewhale-icon.png"
                      height={16}
                      width={16}
                    />
                  )}
                  {type === "cosmwasm-transmuter" && (
                    <Icon id="custom-pool" width={16} height={16} />
                  )}

                  {type != "cosmwasm-astroport-pcl" &&
                    type != "cosmwasm-whitewhale" &&
                    (spreadFactor ? spreadFactor.toString() : "")}
                </p>
              </div>
            </p>
          </span>
        </div>
      </div>
    </div>
  );
};

export function getPoolLink(pool: Pool): string {
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

export function getPoolTypeTarget(pool: Pool) {
  if (
    pool.type === "cosmwasm-transmuter" ||
    pool.type === "cosmwasm-astroport-pcl" ||
    pool.type === "cosmwasm-whitewhale"
  ) {
    return "_blank";
  }
  return "";
}

export const AprBreakdownCell: PoolCellComponent = ({
  row: {
    original: { aprBreakdown },
  },
}) => {
  if (!aprBreakdown) {
    return null;
  }

  const available = Boolean(
    aprBreakdown.boost?.upper || aprBreakdown.osmosis?.upper
  );

  const disabled =
    !available &&
    !Boolean(aprBreakdown.superfluid?.upper) &&
    Boolean(aprBreakdown.swapFee?.upper);

  return (
    <Tooltip
      rootClassNames="!rounded-2xl drop-shadow-md"
      content={<AprBreakdown {...aprBreakdown} />}
      disabled={disabled}
    >
      <p
        className={classNames(
          "ml-auto flex items-center gap-1.5 whitespace-nowrap",
          {
            "text-bullish-500": available,
          }
        )}
      >
        {aprBreakdown.boost?.upper || aprBreakdown.osmosis?.upper ? (
          <div className="rounded-full bg-[#003F4780]">
            <Icon id="boost" className="h-4 w-4 text-bullish-500" />
          </div>
        ) : !disabled ? (
          <Icon id="info" className="h-4 w-4" />
        ) : null}
        {aprBreakdown?.total?.lower &&
        aprBreakdown?.total?.upper?.maxDecimals(1).toString() ===
          aprBreakdown?.total?.lower.maxDecimals(1).toString() ? (
          <p className="xs:text-xs">
            {aprBreakdown?.total?.upper?.maxDecimals(1).toString()}
          </p>
        ) : (
          <p className="xs:text-xs">
            {aprBreakdown?.total?.lower?.maxDecimals(1).toString()} -{" "}
            {aprBreakdown?.total?.upper?.maxDecimals(1).toString()}
          </p>
        )}
      </p>
    </Tooltip>
  );
};
