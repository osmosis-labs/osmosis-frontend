import { Menu } from "@headlessui/react";
import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import type { BasePool } from "@osmosis-labs/pools";
import {
  CellContext,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import {
  FC,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { PaginatedTable } from "~/components/complex/paginated-table";
import { CheckBox, MenuSelectProps } from "~/components/control";
import { SearchBox } from "~/components/input";
import {
  MetricLoaderCell,
  PoolCompositionCell,
  PoolQuickActionCell,
} from "~/components/table/cells";
import { Tooltip } from "~/components/tooltip";
import { EventName, IS_TESTNET } from "~/config";
import { useAmplitudeAnalytics, useFilteredData, useWindowSize } from "~/hooks";
import { useFeatureFlags } from "~/hooks/use-feature-flags";
import { MenuOptionsModal } from "~/modals";
import { useStore } from "~/stores";
import { ObservablePoolWithMetric } from "~/stores/derived-data";
import { noop, runIfFn } from "~/utils/function";

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
  "pool.id",
  "poolName",
  "networkNames",
  "pool.poolAssets.amount.currency.originCurrency.pegMechanism",
];

function getPoolFilters(
  t: ReturnType<typeof useTranslation>,
  concentratedLiquidityEnabled: boolean
): Partial<Record<BasePool["type"], string>> {
  const base = {
    stable: t("components.table.stable"),
    weighted: t("components.table.weighted"),
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
  t: ReturnType<typeof useTranslation>
): Record<"internal" | "external" | "superfluid" | "noIncentives", string> {
  return {
    internal: t("components.table.internal"),
    external: t("components.table.external"),
    superfluid: t("components.table.superfluid"),
    noIncentives: t("components.table.noIncentives"),
  };
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
    const t = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const { isMobile } = useWindowSize();

    const flags = useFeatureFlags();

    const router = useRouter();
    const PoolFilters = useMemo(
      () => getPoolFilters(t, flags.concentratedLiquidity),
      [t, flags.concentratedLiquidity]
    );
    const IncentiveFilters = useMemo(() => getIncentiveFilters(t), [t]);
    const poolFilterQuery = String(router.query?.pool ?? "")
      .split(",")
      .filter(Boolean) as Array<keyof typeof PoolFilters>;
    const incentiveFilterQuery = String(router.query?.incentive ?? "")
      .split(",")
      .filter(Boolean) as Array<keyof typeof IncentiveFilters>;

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
    const queriesCosmos = queriesStore.get(chainId).cosmos;
    const queryActiveGauges = queriesExternalStore.queryActiveGauges;

    const [sorting, _setSorting] = useState<
      { id: keyof ObservablePoolWithMetric; desc: boolean }[]
    >([
      {
        id: "liquidity",
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
        if (search === "") {
          setIsSearching(false);
        } else {
          queriesOsmosis.queryPools.fetchRemainingPools();
          setIsSearching(true);
        }
        setSorting([]);
        _setQuery(search);
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

              const inflation = queriesCosmos.queryInflation;
              /**
               * If pool APR is 5 times bigger than staking APR, warn user
               * that pool may be subject to inflation
               */
              const isAPRTooHigh = inflation.inflation.toDec().gt(new Dec(0))
                ? pool.apr
                    .toDec()
                    .gt(
                      inflation.inflation
                        .toDec()
                        .quo(new Dec(100))
                        .mul(new Dec(5))
                    )
                : false;

              return (
                <MetricLoaderCell
                  isLoading={
                    queriesOsmosis.queryIncentivizedPools.isAprFetching
                  }
                  value={
                    // Only display warning when APR is too high
                    isAPRTooHigh ? (
                      <Tooltip
                        className="w-5"
                        content={t("highPoolInflationWarning")}
                      >
                        <p className="flex items-center gap-1.5">
                          <Icon
                            id="alert-triangle"
                            className="h-4 w-4 text-osmoverse-400"
                          />
                          {pool.apr.toString()}
                        </p>
                      </Tooltip>
                    ) : (
                      pool.apr.toString()
                    )
                  }
                />
              );
            }
          ),
          header: t("pools.allPools.sort.APRIncentivized"),
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
        queriesCosmos.queryInflation,
        queriesOsmosis.queryIncentivizedPools.isAprFetching,
        quickAddLiquidity,
        quickLockTokens,
        quickRemoveLiquidity,
        t,
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
        queriesOsmosis.queryPools.fetchRemainingPools();

        const nextState = runIfFn(updaterOrValue, sorting);
        const nextId: string | undefined = nextState[0]?.id;

        const accessors: Record<string, keyof ObservablePoolWithMetric> = {
          queryPool: "queryPool",
          liquidity: "liquidity",
          volume24h: "volume24h",
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
      () => queriesOsmosis.queryPools.fetchRemainingPools(),
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

const CheckboxSelect: FC<
  {
    label: string;
    selectedOptionIds?: string[];
    showDeselectAll?: boolean;
    menuItemsClassName?: string;
  } & MenuSelectProps
> = ({ label, selectedOptionIds, options, onSelect, menuItemsClassName }) => {
  const { isMobile } = useWindowSize();

  return (
    <Menu>
      {({ open }) => (
        <div className="relative">
          <Menu.Button
            className={classNames(
              "relative flex h-10 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl px-6 text-sm transition-colors md:w-full",
              "border border-osmoverse-500 hover:border-2 hover:border-osmoverse-200 hover:px-[23px]",
              open &&
                "border-2 border-osmoverse-200 px-[23px] text-osmoverse-200"
            )}
          >
            {label}
            <Icon
              className="flex shrink-0 items-center text-osmoverse-200"
              id={open ? "chevron-up" : "chevron-down"}
              height={isMobile ? 12 : 16}
              width={isMobile ? 12 : 16}
            />
          </Menu.Button>

          <Menu.Items
            className={classNames(
              "absolute top-full -left-px z-[1000] mt-2 flex w-max select-none flex-col overflow-hidden rounded-xl border border-osmoverse-700 bg-osmoverse-800 text-left",
              menuItemsClassName
            )}
          >
            {options.map(({ id, display }, index) => {
              return (
                <Menu.Item key={id}>
                  {({ active }) => (
                    <button
                      className={classNames(
                        "flex cursor-pointer items-center gap-3 px-4 py-2 text-left text-osmoverse-200 transition-colors",
                        {
                          "hover:bg-osmoverse-700": active,
                          "rounded-b-xlinset": index === options.length - 1,
                        }
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelect(id);
                      }}
                    >
                      <CheckBox
                        className="w-fit"
                        isOn={Boolean(selectedOptionIds?.includes(id))}
                        onToggle={noop}
                      />
                      <span>{display}</span>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </Menu.Items>
        </div>
      )}
    </Menu>
  );
};
