import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import type { BasePool } from "@osmosis-labs/pools";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import {
  CellContext,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactNode } from "react";

import { Icon } from "~/components/assets";
import { PaginatedTable } from "~/components/complex/paginated-table";
import { SearchBox } from "~/components/input";
import {
  MetricLoaderCell,
  PoolCompositionCell,
  PoolQuickActionCell,
} from "~/components/table/cells";
import { EventName, IS_TESTNET } from "~/config";
import { MultiLanguageT, useTranslation } from "~/hooks";
import { useAmplitudeAnalytics, useFilteredData, useWindowSize } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { MenuOptionsModal } from "~/modals";
import { useStore } from "~/stores";
import { ObservablePoolWithMetric } from "~/stores/derived-data";
import { runIfFn } from "~/utils/function";

import { CheckboxSelect } from "../control";
import { AprBreakdownCell } from "../table/cells/apr-breakdown";
import { AprDisclaimerTooltip } from "../tooltip/apr-disclaimer";

const TVL_FILTER_THRESHOLD = 1000;

export type Pool = [
  {
    poolId: string;
    poolAssets: { coinImageUrl: string | undefined; coinDenom: string }[];
    stableswapPool: boolean;
  },
  {
    value: PricePretty;
  },
  {
    value: PricePretty;
  },
  {
    value: PricePretty;
    isLoading?: boolean;
  },
  {
    value: PricePretty | RatePretty | undefined;
  },
  {
    poolId: string;
    cellGroupEventEmitter: EventEmitter<string | symbol, any>;
    onAddLiquidity?: () => void;
    onRemoveLiquidity?: () => void;
    onLockTokens?: () => void;
  }
];

const searchPoolsMemoedKeys = [
  "queryPool.id",
  "poolName",
  "networkNames",
  "pool.poolAssets.amount.currency.originCurrency.pegMechanism",
];

function getPoolFilters(
  t: MultiLanguageT,
  concentratedLiquidityEnabled: boolean
): Partial<Record<BasePool["type"], string>> {
  const base = {
    stable: t("components.table.stable"),
    weighted: t("components.table.weighted"),
    transmuter: t("components.table.transmuter"),
  };

  if (concentratedLiquidityEnabled) {
    return {
      ...base,
      concentrated: t("components.table.concentrated"),
    };
  }
  return base;
}

function getIncentiveFilters(
  t: MultiLanguageT
): Record<"internal" | "external" | "superfluid" | "noIncentives", string> {
  return {
    internal: t("components.table.internal"),
    external: t("components.table.external"),
    superfluid: t("components.table.superfluid"),
    noIncentives: t("components.table.noIncentives"),
  };
}

export function getPoolLink(queryPool: ObservableQueryPool): string {
  if (queryPool.type === "transmuter") {
    return `https://celatone.osmosis.zone/osmosis-1/pools/${queryPool.id}`;
  }

  return `/pool/${queryPool.id}`;
}

export const AllPoolsTable: FunctionComponent<{
  topOffset: number;
  quickAddLiquidity: (poolId: string) => void;
  quickRemoveLiquidity: (poolId: string) => void;
  quickLockTokens: (poolId: string) => void;
}> = observer(
  ({ quickAddLiquidity, quickRemoveLiquidity, quickLockTokens, topOffset }) => {
    const { chainStore, queriesExternalStore, derivedDataStore, queriesStore } =
      useStore();
    const { t } = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const { isMobile } = useWindowSize();

    const flags = useFeatureFlags();

    const router = useRouter();
    const PoolFilters = useMemo(
      () => getPoolFilters(t, flags.concentratedLiquidity),
      [t, flags.concentratedLiquidity]
    );
    const IncentiveFilters = useMemo(() => getIncentiveFilters(t), [t]);
    const poolFilterQuery = useMemo(
      () =>
        String(router.query?.pool ?? "")
          .split(",")
          .filter(Boolean) as Array<keyof typeof PoolFilters>,
      [router.query?.pool]
    );
    const incentiveFilterQuery = useMemo(
      () =>
        String(router.query?.incentive ?? "")
          .split(",")
          .filter(Boolean) as Array<keyof typeof IncentiveFilters>,
      [router.query?.incentive]
    );

    // Initially display everything
    useEffect(() => {
      const poolQuery = router.query.pool;
      const incentiveQuery = router.query.incentive;

      if (
        !location.search.includes("pool") ||
        !location.search.includes("incentive")
      ) {
        router.replace(
          {
            query: {
              ...router.query,
              ...(!poolQuery && { pool: Object.keys(PoolFilters) }),
              ...(!incentiveQuery && {
                incentive: Object.keys(IncentiveFilters),
              }),
            },
          },
          undefined,
          {
            scroll: false,
          }
        );
      }
    }, [
      IncentiveFilters,
      PoolFilters,
      router,
      router.query.incentive,
      router.query.pools,
    ]);

    const { chainId } = chainStore.osmosis;
    const queriesOsmosis = queriesStore.get(chainId).osmosis!;
    const queryActiveGauges = queriesExternalStore.queryActiveGauges;

    const [sorting, _setSorting] = useState<
      { id: keyof ObservablePoolWithMetric; desc: boolean }[]
    >([
      {
        id: "volume24h",
        desc: true,
      },
    ]);
    const setSorting = useCallback(
      (s) => {
        if (typeof s === "function") {
          const sort = s()?.[0];
          if (sort)
            logEvent([
              EventName.Pools.allPoolsListSorted,
              {
                sortedBy: sort.id,
                sortedOn: isMobile ? "dropdown" : "table",
                sortDirection: sort.desc ? "descending" : "ascending",
              },
            ]);
        }
        _setSorting(s);
      },
      [logEvent, isMobile]
    );

    const [isSearching, setIsSearching] = useState(false);

    const allPoolsWithMetrics = derivedDataStore.poolsWithMetrics
      .get(chainId)
      .getAllPools(
        sorting[0]?.id,
        sorting[0]?.desc,
        isSearching,
        flags.concentratedLiquidity
      );

    const initiallyFilteredPools = useMemo(
      () =>
        allPoolsWithMetrics.filter((p) => {
          // Filter out pools with low TVL.
          if (
            !IS_TESTNET &&
            !p.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
          ) {
            return false;
          }

          // Filter out pools that do not match the pool filter.
          if (poolFilterQuery && !poolFilterQuery.includes(p.queryPool.type)) {
            return false;
          }

          if (incentiveFilterQuery.includes("superfluid")) {
            const isSuperfluid =
              queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
                p.queryPool.id
              );
            if (isSuperfluid) return true;
          }

          if (incentiveFilterQuery.includes("internal")) {
            const isInternallyIncentivized =
              queriesOsmosis.queryIncentivizedPools.isIncentivized(
                p.queryPool.id
              );
            if (isInternallyIncentivized) return true;
          }

          if (incentiveFilterQuery.includes("external")) {
            const gauges = queryActiveGauges.getExternalGaugesForPool(
              p.queryPool.id
            );
            const isExternallyIncentivized = gauges && gauges.length > 0;
            if (isExternallyIncentivized) return true;
          }

          if (incentiveFilterQuery.includes("noIncentives")) {
            const gauges = queryActiveGauges.getExternalGaugesForPool(
              p.queryPool.id
            );
            const isInternallyIncentivized =
              queriesOsmosis.queryIncentivizedPools.isIncentivized(
                p.queryPool.id
              );

            const hasNoIncentives =
              !(gauges && gauges.length > 0) && !isInternallyIncentivized;
            if (hasNoIncentives) return true;
          }

          return false;
        }),
      [
        allPoolsWithMetrics,
        incentiveFilterQuery,
        poolFilterQuery,
        queriesOsmosis.queryIncentivizedPools,
        queriesOsmosis.querySuperfluidPools,
        queryActiveGauges,
      ]
    );

    const [query, _setQuery, filteredPools] = useFilteredData(
      initiallyFilteredPools,
      searchPoolsMemoedKeys
    );
    const setQuery = useCallback(
      (search: string) => {
        const sanitizedSearch = search.replace(/#/g, "");

        if (sanitizedSearch === "") {
          setIsSearching(false);
        } else {
          queriesOsmosis.queryPools.fetchRemainingPools({
            minLiquidity: 0,
          });
          setIsSearching(true);
        }
        setSorting([]);
        _setQuery(sanitizedSearch);
      },
      [_setQuery, queriesOsmosis.queryPools, setSorting]
    );

    const columnHelper = createColumnHelper<ObservablePoolWithMetric>();
    const cellGroupEventEmitter = useRef(new EventEmitter()).current;

    const columns = useMemo(
      () => [
        columnHelper.accessor((row) => row, {
          cell: observer(
            (
              props: CellContext<
                ObservablePoolWithMetric,
                ObservablePoolWithMetric
              >
            ) => {
              const poolAssets = props.row.original.queryPool.poolAssets.map(
                (poolAsset) => ({
                  coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                  coinDenom: poolAsset.amount.currency.coinDenom,
                })
              );

              return (
                <PoolCompositionCell
                  poolAssets={poolAssets}
                  poolId={props.row.original.queryPool.id}
                  stableswapPool={
                    props.row.original.queryPool.type === "stable"
                  }
                  superchargedPool={
                    props.row.original.queryPool.type === "concentrated"
                  }
                  transmuterPool={
                    props.row.original.queryPool.type === "transmuter"
                  }
                />
              );
            }
          ),
          header: t("pools.allPools.sort.poolName"),
          id: "pool",
          sortDescFirst: false,
        }),
        columnHelper.accessor((row) => row, {
          cell: observer(
            (
              props: CellContext<
                ObservablePoolWithMetric,
                ObservablePoolWithMetric
              >
            ) => {
              return (
                <MetricLoaderCell
                  value={props.row.original.volume24h.toString()}
                />
              );
            }
          ),
          header: t("pools.allPools.sort.volume24h"),
          id: "volume24h",
        }),
        columnHelper.accessor((row) => row, {
          cell: observer(
            (
              props: CellContext<
                ObservablePoolWithMetric,
                ObservablePoolWithMetric
              >
            ) => {
              return <>{props.row.original.liquidity.toString()}</>;
            }
          ),
          header: t("pools.allPools.sort.liquidity"),
          id: "liquidity",
        }),
        columnHelper.accessor((row) => row, {
          cell: observer(
            (
              props: CellContext<
                ObservablePoolWithMetric,
                ObservablePoolWithMetric
              >
            ) => {
              return (
                <MetricLoaderCell
                  value={props.row.original.feesSpent7d.toString()}
                />
              );
            }
          ),
          header: t("pools.allPools.sort.fees"),
          id: "feesSpent7d",
        }),
        columnHelper.accessor((row) => row, {
          cell: observer(
            (
              props: CellContext<
                ObservablePoolWithMetric,
                ObservablePoolWithMetric
              >
            ) => {
              const pool = props.getValue();

              if (!flags._isInitialized) return null;

              let value: ReactNode | null;
              if (flags.aprBreakdown) {
                value = <AprBreakdownCell poolId={pool.queryPool.id} />;
              } else {
                value = pool.apr.toString();
              }

              return (
                <MetricLoaderCell
                  isLoading={
                    queriesOsmosis.queryIncentivizedPools.isAprFetching
                  }
                  value={value}
                />
              );
            }
          ),
          header: () => (
            <div className="flex items-center gap-1">
              <AprDisclaimerTooltip />
              <span>{t("pools.allPools.sort.APRIncentivized")}</span>
            </div>
          ),
          id: "apr",
        }),
        columnHelper.accessor((row) => row, {
          cell: observer(
            (
              props: CellContext<
                ObservablePoolWithMetric,
                ObservablePoolWithMetric
              >
            ) => {
              const poolWithMetrics = props.row.original;
              const poolId = poolWithMetrics.queryPool.id;
              return (
                <PoolQuickActionCell
                  poolId={poolId}
                  cellGroupEventEmitter={cellGroupEventEmitter}
                  onAddLiquidity={() => quickAddLiquidity(poolId)}
                  onRemoveLiquidity={
                    !poolWithMetrics.myAvailableLiquidity.toDec().isZero()
                      ? () => quickRemoveLiquidity(poolId)
                      : undefined
                  }
                  onLockTokens={
                    !poolWithMetrics.myAvailableLiquidity.toDec().isZero()
                      ? () => quickLockTokens(poolId)
                      : undefined
                  }
                />
              );
            }
          ),
          header: "",
          id: "actions",
        }),
      ],
      [
        cellGroupEventEmitter,
        columnHelper,
        queriesOsmosis.queryIncentivizedPools.isAprFetching,
        quickAddLiquidity,
        quickLockTokens,
        quickRemoveLiquidity,
        t,
        flags.aprBreakdown,
        flags._isInitialized,
      ]
    );

    const table = useReactTable({
      data: filteredPools,
      columns,
      state: {
        sorting,
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: (updaterOrValue) => {
        queriesOsmosis.queryPools.fetchRemainingPools({
          minLiquidity: 0,
        });

        const nextState = runIfFn(updaterOrValue, sorting);
        const nextId: string | undefined = nextState[0]?.id;

        const accessors: Record<string, keyof ObservablePoolWithMetric> = {
          queryPool: "queryPool",
          volume24h: "volume24h",
          liquidity: "liquidity",
          feesSpent7d: "feesSpent7d",
          apr: "apr",
        };

        if (accessors[nextId]) {
          setSorting([{ id: accessors[nextId], desc: nextState[0].desc }]);
        } else {
          setSorting([]);
        }
      },
      manualSorting: true,
    });

    const handleFetchRemaining = useCallback(
      () =>
        queriesOsmosis.queryPools.fetchRemainingPools({
          minLiquidity: 0,
        }),
      [queriesOsmosis.queryPools]
    );

    const paginatePoolsQueryStore = useCallback(() => {
      queriesOsmosis.queryPools.paginate();
    }, [queriesOsmosis.queryPools]);

    const [mobileSortMenuIsOpen, setMobileSortMenuIsOpen] = useState(false);

    const onSelectFilter = useCallback(
      (id: keyof typeof PoolFilters) => {
        if (poolFilterQuery.includes(id)) {
          router.replace(
            {
              query: {
                ...router.query,
                pool: poolFilterQuery
                  .filter((incentive) => incentive !== id)
                  .join(","),
              },
            },
            undefined,
            {
              scroll: false,
            }
          );
        } else {
          router.push(
            {
              query: {
                ...router.query,
                pool: [...poolFilterQuery, id].join(","),
              },
            },
            undefined,
            {
              scroll: false,
            }
          );
        }
        handleFetchRemaining();
      },
      [handleFetchRemaining, poolFilterQuery, router]
    );
    const onSelectIncentiveFilter = useCallback(
      (id: keyof typeof IncentiveFilters) => {
        if (incentiveFilterQuery.includes(id)) {
          router.replace(
            {
              query: {
                ...router.query,
                incentive: incentiveFilterQuery
                  .filter((incentive) => incentive !== id)
                  .join(","),
              },
            },
            undefined,
            {
              scroll: false,
            }
          );
        } else {
          router.push(
            {
              query: {
                ...router.query,
                incentive: [...incentiveFilterQuery, id].join(","),
              },
            },
            undefined,
            {
              scroll: false,
            }
          );
        }
        handleFetchRemaining();
      },
      [handleFetchRemaining, incentiveFilterQuery, router]
    );

    return (
      <>
        <div className="mt-5 flex flex-col gap-3">
          {isMobile ? (
            <>
              <div className="flex gap-3">
                <SearchBox
                  currentValue={query}
                  onInput={setQuery}
                  placeholder={t("pools.allPools.search")}
                  className="!w-full rounded-full"
                  rightIcon={() => (
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-osmoverse-500 text-osmoverse-200"
                      onClick={() => setMobileSortMenuIsOpen(true)}
                    >
                      <Icon id="tune" className="" />
                    </button>
                  )}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1">
                  <CheckboxSelect
                    label={t("components.pool.mobileTitle")}
                    options={Object.entries(PoolFilters).map(
                      ([id, display]) => ({
                        id,
                        display,
                      })
                    )}
                    selectedOptionIds={poolFilterQuery}
                    onSelect={(id) =>
                      onSelectFilter(id as keyof typeof PoolFilters)
                    }
                  />
                </div>
                <div className="flex-1">
                  <CheckboxSelect
                    label={t("components.incentive.mobileTitle")}
                    options={Object.entries(IncentiveFilters).map(
                      ([id, display]) => ({
                        id,
                        display,
                      })
                    )}
                    selectedOptionIds={incentiveFilterQuery}
                    onSelect={(id) =>
                      onSelectIncentiveFilter(
                        id as keyof typeof IncentiveFilters
                      )
                    }
                    menuItemsClassName="sm:left-auto sm:-right-px"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex place-content-between items-center">
              <h5>{t("pools.allPools.title")}</h5>
              <div className="flex flex-wrap items-center gap-3 lg:w-full lg:place-content-between">
                <CheckboxSelect
                  label={
                    isMobile
                      ? t("components.pool.mobileTitle")
                      : t("components.pool.title")
                  }
                  options={Object.entries(PoolFilters).map(([id, display]) => ({
                    id,
                    display,
                  }))}
                  selectedOptionIds={poolFilterQuery}
                  onSelect={(id) =>
                    onSelectFilter(id as keyof typeof PoolFilters)
                  }
                />
                <CheckboxSelect
                  label={
                    isMobile
                      ? t("components.incentive.mobileTitle")
                      : t("components.incentive.title")
                  }
                  options={Object.entries(IncentiveFilters).map(
                    ([id, display]) => ({
                      id,
                      display,
                    })
                  )}
                  selectedOptionIds={incentiveFilterQuery}
                  onSelect={(id) =>
                    onSelectIncentiveFilter(id as keyof typeof IncentiveFilters)
                  }
                />
                <SearchBox
                  currentValue={query}
                  onInput={setQuery}
                  placeholder={t("pools.allPools.search")}
                  className="!w-64"
                  size="small"
                  onFocusChange={(isFocused) => {
                    // user typed then removed focus
                    if (query !== "" && !isFocused) {
                      logEvent([
                        EventName.Pools.allPoolsListFiltered,
                        {
                          isFilterOn: true,
                          filteredBy: query,
                        },
                      ]);
                    }
                  }}
                />
              </div>
            </div>
          )}

          <div className="h-auto overflow-auto">
            <PaginatedTable
              paginate={paginatePoolsQueryStore}
              mobileSize={170}
              size={69}
              table={table}
              topOffset={topOffset}
            />
          </div>
        </div>
        <MenuOptionsModal
          title={t("components.sort.mobileMenu")}
          options={table.getHeaderGroups()[0].headers.map(({ id, column }) => {
            return {
              id,
              display: column.columnDef.header as string,
            };
          })}
          selectedOptionId={sorting[0]?.id}
          onSelectMenuOption={(id: string) => {
            table.getColumn(id)?.toggleSorting();
            setMobileSortMenuIsOpen(false);
          }}
          isOpen={mobileSortMenuIsOpen}
          onRequestClose={() => setMobileSortMenuIsOpen(false)}
        />
      </>
    );
  }
);
