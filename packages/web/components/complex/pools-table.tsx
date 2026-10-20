import { SortDirection } from "@osmosis-labs/utils";
import { keepPreviousData } from "@tanstack/react-query";
import {
  CellContext,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
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

type Pool = RouterOutputs["edge"]["pools"]["getPools"]["items"][number];
/** Full pool type union (includes cosmwasm), as returned by the pools queries. */
export type PoolType = Pool["type"];
/** UI doesn't support cosmwasm pools as first class so exclude it from list of filter options. */
export type PoolTypeFilter = Exclude<Pool["type"], "cosmwasm">;
export type PoolIncentiveFilter = NonNullable<
  NonNullable<Pool["incentives"]>["incentiveTypes"]
>[number];

/** Pool types supported by the add liquidity modal. The modal has no
 *  cosmwasm support, so cosmwasm pools get no quick action; their liquidity
 *  is managed through dedicated UIs linked from the pool row instead. */
const quickAddLiquidityPoolTypes: readonly PoolType[] = [
  "weighted",
  "stable",
  "concentrated",
];

// These are the options for filtering the pools.
export const poolFilterTypes: PoolTypeFilter[] = [
  "concentrated",
  "cosmwasm-orderbook",
  "weighted",
  "stable",
  "cosmwasm-astroport-pcl",
  "cosmwasm-whitewhale",
  "cosmwasm-transmuter",
];

export const marketIncentivePoolsSortKeys = [
  "totalFiatValueLocked",
  "market.feesSpent7dUsd",
  "market.feesSpent24hUsd",
  "market.volume7dUsd",
  "market.volume24hUsd",
  "incentives.aprBreakdown.total.upper",
] as const;

type MarketIncentivePoolsSortKey =
  (typeof marketIncentivePoolsSortKeys)[number];

export const incentiveTypes: PoolIncentiveFilter[] = [
  "superfluid",
  "osmosis",
  "boost",
  "none",
];

export interface PoolsTableFilters {
  searchQuery: string | null;
  /** Optional. When omitted, all incentive types are included (no filtering). */
  poolIncentivesFilter?: PoolIncentiveFilter[];
  poolTypesFilter: PoolTypeFilter[];
  denoms?: string[];
}

export interface PoolsTabelSortParams {
  allPoolsSort: MarketIncentivePoolsSortKey;
  allPoolsSortDir: SortDirection;
}

interface PoolsTableProps {
  topOffset?: number;
  quickAddLiquidity?: (poolId: string, poolType: PoolType) => void;
  limit?: number;
  disablePagination?: boolean;
  filters?: PoolsTableFilters;
  sortParams?: PoolsTabelSortParams;
  emptyResultsText?: string;
  setSortDirection: (dir: SortDirection) => void;
  setSortKey: (key?: MarketIncentivePoolsSortKey) => void;
  minLiquidityUsd?: number;
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
      poolTypesFilter: poolFilterTypes.filter(
        (type) => type !== "cosmwasm-transmuter"
      ),
      poolIncentivesFilter: incentiveTypes,
      denoms: [],
    },
    sortParams = {
      allPoolsSort: "market.volume24hUsd",
      allPoolsSortDir: "desc",
    },
    emptyResultsText,
    setSortDirection,
    setSortKey,
    minLiquidityUsd = 1_000,
    children,
  } = props;

  // When SQS has no volume data (e.g. its fees source is down), every pool's volume is
  // unknown and a volume sort is meaningless, so sort by liquidity in the same direction.
  // Latched per filter set, so a sort that has fallen back doesn't flip back and forth.
  const filtersKey = JSON.stringify([filters, minLiquidityUsd]);
  const [volumeUnavailableFiltersKey, setVolumeUnavailableFiltersKey] =
    useState<string>();
  const isVolumeSortUnavailable =
    sortParams.allPoolsSort === "market.volume24hUsd" &&
    volumeUnavailableFiltersKey === filtersKey;
  const sortKey: MarketIncentivePoolsSortKey = isVolumeSortUnavailable
    ? "totalFiatValueLocked"
    : sortParams.allPoolsSort;

  // Choosing a sort clears the fallback, so a volume sort is re-checked once data recovers.
  const selectSortKey = useCallback(
    (key?: MarketIncentivePoolsSortKey) => {
      setVolumeUnavailableFiltersKey(undefined);
      setSortKey(key);
    },
    [setSortKey]
  );
  const selectSortDirection = useCallback(
    (dir: SortDirection) => {
      setVolumeUnavailableFiltersKey(undefined);
      setSortDirection(dir);
    },
    [setSortDirection]
  );
  // While the fallback is active the Liquidity header is highlighted but the sort is
  // still volume; clicking it makes liquidity the sort before toggling its direction.
  const selectLiquiditySortDirection = useCallback(
    (dir: SortDirection) => {
      if (isVolumeSortUnavailable) setSortKey("totalFiatValueLocked");
      selectSortDirection(dir);
    },
    [isVolumeSortUnavailable, setSortKey, selectSortDirection]
  );

  const {
    data: poolsPagesData,
    isLoading,
    isSuccess,
    isError,
    isFetching,
    isPlaceholderData,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = api.local.pools.getPools.useInfiniteQuery(
    {
      limit,
      search: filters.searchQuery
        ? {
            query: filters.searchQuery,
          }
        : undefined,
      denoms: filters.denoms,
      // These are all of the pools that we support fetching.
      // When transmuter is selected, include both transmuter and alloyed pools
      types: [
        ...filters.poolTypesFilter.reduce(
          (acc, type) => {
            if (type === "cosmwasm-transmuter") {
              acc.push(
                "cosmwasm-transmuter" as const,
                "cosmwasm-alloyed" as const
              );
            } else {
              acc.push(type);
            }
            return acc;
          },
          [] as (PoolTypeFilter | "cosmwasm-alloyed")[]
        ),
        "cosmwasm",
      ],
      incentiveTypes: filters.poolIncentivesFilter ?? incentiveTypes,
      sort: sortKey
        ? {
            keyPath: sortKey,
            direction: sortParams.allPoolsSortDir,
          }
        : undefined,
      // Drop the liquidity floor while searching, mirroring the assets table:
      // a pool the user asks for by name should be findable even below the
      // browsing threshold (orderbook pools also report 0 liquidity to SQS).
      minLiquidityUsd: filters.searchQuery ? 0 : minLiquidityUsd,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: 0,

      placeholderData: keepPreviousData,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const firstPage = poolsPagesData?.pages[0];
  useEffect(() => {
    // Wait for in-flight fetches: cached pages from an earlier outage would latch the
    // fallback before fresh data lands.
    if (
      sortKey !== "market.volume24hUsd" ||
      isPlaceholderData ||
      isFetching ||
      !firstPage?.items.length
    ) {
      return;
    }
    if (firstPage.items.every((pool) => !pool.market?.volume24hUsd)) {
      setVolumeUnavailableFiltersKey(filtersKey);
    }
  }, [sortKey, isPlaceholderData, isFetching, firstPage, filtersKey]);

  const poolsData = useMemo(() => {
    const allItems =
      poolsPagesData?.pages.flatMap((page) => {
        return page?.items;
      }) ?? [];

    return allItems;
  }, [poolsPagesData]);

  // Volume is always shown, with "–" where it's unknown. Fees are never shown in the table.
  const shouldDisplayFeesData = false;

  // Define columns
  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<Pool>();

    const allColumns = [
      columnHelper.accessor((row) => row, {
        id: "pool",
        header: t("pools.allPools.sort.poolName"),
        cell: PoolCompositionCell,
      }),
    ];

    allColumns.push(
      columnHelper.accessor(
        (row) => row.market?.volume24hUsd?.toString() ?? "–",
        {
          id: "market.volume24hUsd",
          header: () => (
            <SortHeader<MarketIncentivePoolsSortKey>
              label={t("pools.allPools.sort.volume24h")}
              sortKey="market.volume24hUsd"
              disabled={isLoading}
              currentSortKey={sortKey}
              currentDirection={sortParams.allPoolsSortDir}
              setSortDirection={selectSortDirection}
              setSortKey={selectSortKey}
            />
          ),
        }
      ) as unknown as (typeof allColumns)[number]
    );

    allColumns.push(
      columnHelper.accessor(
        (row) =>
          row.tvlUnknown ? "–" : (row.totalFiatValueLocked?.toString() ?? "0"),
        {
          id: "totalFiatValueLocked",
          header: () => (
            <SortHeader
              label={t("pools.allPools.sort.liquidity")}
              sortKey="totalFiatValueLocked"
              disabled={isLoading}
              currentSortKey={sortKey}
              currentDirection={sortParams.allPoolsSortDir}
              setSortDirection={selectLiquiditySortDirection}
              setSortKey={selectSortKey}
            />
          ),
        }
      ) as unknown as (typeof allColumns)[number]
    );

    // Only show fees if more than half of the pools have fees data.
    if (shouldDisplayFeesData) {
      allColumns.push(
        columnHelper.accessor(
          (row) => row.market?.feesSpent7dUsd?.toString() ?? "N/A",
          {
            id: "market.feesSpent7dUsd",
            header: () => (
              <SortHeader
                label={t("pools.allPools.sort.fees")}
                sortKey="market.feesSpent7dUsd"
                disabled={isLoading}
                currentSortKey={sortKey}
                currentDirection={sortParams.allPoolsSortDir}
                setSortDirection={selectSortDirection}
                setSortKey={selectSortKey}
              />
            ),
          }
        ) as unknown as (typeof allColumns)[number]
      );
    }

    const remainingColumns = [
      columnHelper.accessor((row) => row, {
        id: "aprBreakdown.total",
        header: () => (
          <SortHeader
            label={t("pools.allPools.sort.APRIncentivized")}
            sortKey="incentives.aprBreakdown.total.upper"
            disabled={isLoading}
            currentSortKey={sortKey}
            currentDirection={sortParams.allPoolsSortDir}
            setSortDirection={selectSortDirection}
            setSortKey={selectSortKey}
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
              onAddLiquidity={
                quickAddLiquidityPoolTypes.includes(row.original.type)
                  ? () => quickAddLiquidity(row.original.id, row.original.type)
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
    selectSortDirection,
    selectLiquiditySortDirection,
    selectSortKey,
    quickAddLiquidity,
    shouldDisplayFeesData,
  ]);

  /** Columns collapsed for screen size responsiveness. */
  const collapsedColumns = useMemo(() => {
    const collapsedColIds: string[] = [];
    if (width < Breakpoint.xxl && shouldDisplayFeesData)
      collapsedColIds.push("market.feesSpent7dUsd");
    if (width < Breakpoint.xlhalf && width > Breakpoint.xl)
      collapsedColIds.push("aprBreakdown.total");
    if (width < Breakpoint.xlg) collapsedColIds.push("totalFiatValueLocked");
    if (width < Breakpoint.lg) collapsedColIds.push("market.volume24hUsd");
    if (width < Breakpoint.md) collapsedColIds.push("poolQuickActions");
    return columns.filter(({ id }) => id && !collapsedColIds.includes(id));
  }, [columns, width, shouldDisplayFeesData]);

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
              : (emptyResultsText ??
                t("search.noResultsFor", {
                  query: filters.searchQuery ?? "",
                }))}
          </p>
        </div>
      ) : (
        <table
          className={classNames(
            "table-auto",
            isPlaceholderData &&
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
                        isPlaceholderData && isFetching && "cursor-progress"
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
                          isPlaceholderData && isFetching && "cursor-progress"
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
          {type === "cosmwasm-alloyed" ? (
            <span className="subtitle1 md:subtitle2">
              {(() => {
                // For alloyed pools, extract asset name from reserve coin symbols
                // Clean up symbols by removing prefixes and lowercase letters/periods
                const firstCoin = reserveCoins[0];
                if (firstCoin) {
                  let asset = firstCoin.denom
                    // Remove lowercase letters and periods
                    .replace(/[a-z.]/g, "");

                  // Handle specific overrides
                  if (asset === "WBTC" || firstCoin.denom.includes("BTC")) {
                    asset = "BTC";
                  }

                  return `Alloyed ${asset || firstCoin.denom}`;
                }
                return "Alloyed Asset";
              })()}
            </span>
          ) : (
            <PoolAssetsName
              size="sm"
              assetDenoms={reserveCoins.map(({ denom, currency }) => ({
                minDenom: currency.coinMinimalDenom,
                symbol: denom,
              }))}
            />
          )}
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
                    "text-osmoverse-300": Boolean(type === "cosmwasm-alloyed"),
                    "text-wosmongton-300": Boolean(
                      type === "cosmwasm-orderbook"
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
                      alt="skeleton swap icon"
                      src="/images/skeletonswap-icon.webp"
                      height={16}
                      width={16}
                    />
                  )}
                  {type === "cosmwasm-transmuter" && (
                    <Icon id="custom-pool" width={16} height={16} />
                  )}
                  {type === "cosmwasm-alloyed" && (
                    <Icon id="alloyed" width={16} height={16} />
                  )}
                  {type === "cosmwasm-orderbook" && (
                    <Icon id="open-book" width={16} height={16} />
                  )}

                  {type != "cosmwasm-astroport-pcl" &&
                    type != "cosmwasm-whitewhale" &&
                    type != "cosmwasm-orderbook" &&
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

function getContractAddress(pool: Pool): string | undefined {
  const raw = pool.raw as any;
  return raw?.contract_address;
}

function getPoolLink(pool: Pool): string {
  if (pool.type === "cosmwasm-alloyed") {
    return `https://alloyed.osmosis.zone/pools/${pool.id}`;
  }
  if (pool.type === "cosmwasm-transmuter") {
    const contractAddress = getContractAddress(pool);
    if (!contractAddress) {
      console.warn(`Pool ${pool.id} missing contract_address`);
      return `/pool/${pool.id}`;
    }
    return `https://celatone.osmosis.zone/osmosis-1/contracts/${contractAddress}`;
  }
  if (pool.type === "cosmwasm-astroport-pcl") {
    const contractAddress = getContractAddress(pool);
    if (!contractAddress) {
      console.warn(`Pool ${pool.id} missing contract_address`);
      return `/pool/${pool.id}`;
    }
    return `https://osmosis.astroport.fi/pools/${contractAddress}`;
  }
  if (pool.type === "cosmwasm-whitewhale") {
    return `https://skeletonswap.backbonelabs.io/osmosis/pools/${pool.id}`;
  }
  if (pool.type === "cosmwasm-orderbook") {
    return `/pool/${pool.id}`;
  }
  if (pool.type === "cosmwasm") {
    const contractAddress = getContractAddress(pool);
    if (!contractAddress) {
      console.warn(`Pool ${pool.id} missing contract_address`);
      return `/pool/${pool.id}`;
    }
    return `https://celatone.osmosis.zone/osmosis-1/contracts/${contractAddress}`;
  }

  return `/pool/${pool.id}`;
}

function getPoolTypeTarget(pool: Pool) {
  if (
    pool.type === "cosmwasm-alloyed" ||
    pool.type === "cosmwasm-transmuter" ||
    pool.type === "cosmwasm-astroport-pcl" ||
    pool.type === "cosmwasm-whitewhale" ||
    pool.type === "cosmwasm"
  ) {
    return "_blank";
  }
  return "";
}

const AprBreakdownCell: PoolCellComponent = ({
  row: {
    original: { incentives },
  },
}) => {
  const aprBreakdown = incentives?.aprBreakdown;
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
          <p className="xs:flex xs:flex-col xs:text-xs">
            <label>
              {aprBreakdown?.total?.lower?.maxDecimals(1).toString()}
            </label>{" "}
            -{" "}
            <label>
              {aprBreakdown?.total?.upper?.maxDecimals(1).toString()}
            </label>
          </p>
        )}
      </p>
    </Tooltip>
  );
};
