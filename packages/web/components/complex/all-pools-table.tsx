import { Menu } from "@headlessui/react";
import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservablePoolWithMetric } from "@osmosis-labs/stores";
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

import { MenuOptionsModal } from "~/modals";
import { noop, runIfFn } from "~/utils/function";

import { useFilteredData, useWindowSize } from "../../hooks";
import { useStore } from "../../stores";
import { Icon } from "../assets";
import { CheckBox } from "../control";
import { SearchBox } from "../input";
import {
  MetricLoaderCell,
  PoolCompositionCell,
  PoolQuickActionCell,
} from "../table/cells";
import PaginatedTable from "./paginated-table";

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

function getPoolFilters(
  t: ReturnType<typeof useTranslation>
): Record<"stable" | "weighted", string> {
  return {
    stable: t("components.table.stable"),
    weighted: t("components.table.weighted"),
  };
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

    const router = useRouter();
    const PoolFilters = getPoolFilters(t);
    const IncentiveFilters = getIncentiveFilters(t);
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
    }, [poolFilterQuery, router, router.query.incentive, router.query.pools]);

    const fetchedRemainingPoolsRef = useRef(false);
    const { isMobile } = useWindowSize();

    const { chainId } = chainStore.osmosis;
    const queriesOsmosis = queriesStore.get(chainId).osmosis!;
    const queryActiveGauges = queriesExternalStore.queryActiveGauges;

    const [sorting, setSorting] = useState<
      { id: keyof ObservablePoolWithMetric; desc: boolean }[]
    >([
      {
        id: "liquidity",
        desc: true,
      },
    ]);

    const allPoolsWithMetrics = derivedDataStore.poolsWithMetrics
      .get(chainId)
      .getAllPools(sorting[0]?.id, sorting[0]?.desc);

    const initiallyFilteredPools = useMemo(
      () =>
        allPoolsWithMetrics.filter((p) => {
          // Filter out pools with low TVL.
          if (!p.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))) {
            return false;
          }

          // Filter out pools that do not match the pool filter.
          if (poolFilterQuery && !poolFilterQuery.includes(p.pool.type)) {
            return false;
          }

          if (incentiveFilterQuery.includes("superfluid")) {
            const isSuperfluid =
              queriesOsmosis.querySuperfluidPools.isSuperfluidPool(p.pool.id);
            if (isSuperfluid) return true;
          }

          if (incentiveFilterQuery.includes("internal")) {
            const isInternallyIncentivized =
              queriesOsmosis.queryIncentivizedPools.isIncentivized(p.pool.id);
            if (isInternallyIncentivized) return true;
          }

          if (incentiveFilterQuery.includes("external")) {
            const gauges = queryActiveGauges.getExternalGaugesForPool(
              p.pool.id
            );
            const isExternallyIncentivized = gauges && gauges.length > 0;
            if (isExternallyIncentivized) return true;
          }

          if (incentiveFilterQuery.includes("noIncentives")) {
            const gauges = queryActiveGauges.getExternalGaugesForPool(
              p.pool.id
            );
            const isInternallyIncentivized =
              queriesOsmosis.queryIncentivizedPools.isIncentivized(p.pool.id);

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
      useMemo(
        () => [
          "pool.id",
          "poolName",
          "networkNames",
          "pool.poolAssets.amount.currency.originCurrency.pegMechanism",
        ],
        []
      )
    );
    const setQuery = useCallback(
      (search: string) => {
        if (search !== "" && !fetchedRemainingPoolsRef.current) {
          queriesOsmosis.queryGammPools.fetchRemainingPools();
          fetchedRemainingPoolsRef.current = true;
        }
        setSorting([]);
        _setQuery(search);
      },
      [_setQuery, queriesOsmosis.queryGammPools]
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
              const poolAssets = props.row.original.pool.poolAssets.map(
                (poolAsset) => ({
                  coinImageUrl: poolAsset.amount.currency.coinImageUrl,
                  coinDenom: poolAsset.amount.currency.coinDenom,
                })
              );

              return (
                <PoolCompositionCell
                  poolAssets={poolAssets}
                  poolId={props.row.original.pool.id}
                  stableswapPool={props.row.original.pool.type === "stable"}
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
              return (
                <MetricLoaderCell value={props.getValue().apr.toString()} />
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
              const poolId = poolWithMetrics.pool.id;
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
        queriesOsmosis.queryGammPools.fetchRemainingPools();

        const nextState = runIfFn(updaterOrValue, sorting);
        const nextId: string | undefined = nextState[0]?.id;

        const accessors: Record<string, keyof ObservablePoolWithMetric> = {
          pool: "pool",
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
      () => queriesOsmosis.queryGammPools.fetchRemainingPools(),
      [queriesOsmosis.queryGammPools]
    );

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

    const onSelectAll = (type: "pool" | "incentive") => () => {
      router.replace(
        {
          query: {
            ...router.query,
            ...(type === "pool"
              ? { pool: Object.keys(PoolFilters) }
              : {
                  incentive: Object.keys(IncentiveFilters),
                }),
          },
        },
        undefined,
        {
          scroll: false,
        }
      );
    };

    const onDeselectAll = (type: "pool" | "incentive") => () => {
      router.replace(
        {
          query: {
            ...router.query,
            ...(type === "pool" ? { pool: "" } : { incentive: "" }),
          },
        },
        undefined,
        {
          scroll: false,
        }
      );
    };

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
                    showDeselectAll
                    onSelectAll={onSelectAll("incentive")}
                    onDeselectAll={onDeselectAll("incentive")}
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
                  showDeselectAll
                  onSelectAll={onSelectAll("incentive")}
                  onDeselectAll={onDeselectAll("incentive")}
                />
                <SearchBox
                  currentValue={query}
                  onInput={setQuery}
                  placeholder={t("pools.allPools.search")}
                  className="!w-64"
                  size="small"
                />
              </div>
            </div>
          )}

          <div className="h-auto overflow-auto">
            <PaginatedTable
              paginate={handleFetchRemaining}
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

const CheckboxSelect: FC<{
  label: string;
  selectedOptionIds?: string[];
  showDeselectAll?: boolean;
  options: {
    id: string;
    display: string;
    isDeselect?: boolean;
  }[];
  onSelect: (optionId: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}> = ({
  label,
  selectedOptionIds,
  options: optionsProp,
  onSelect,
  showDeselectAll,
  onSelectAll,
  onDeselectAll,
}) => {
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  const areAllSelected = optionsProp?.length === selectedOptionIds?.length;
  const isIndeterminate = !areAllSelected && selectedOptionIds?.length !== 0;
  const options = showDeselectAll
    ? [
        {
          id: "0",
          display: !areAllSelected
            ? t("components.checkbox-select.selectAll")
            : t("components.checkbox-select.deselectAll"),
          isDeselect: true,
        },
        ...optionsProp,
      ]
    : optionsProp;

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

          <Menu.Items className="absolute top-full -left-px z-[1000] mt-2 flex w-max select-none flex-col overflow-hidden rounded-xl border border-osmoverse-700 bg-osmoverse-800 text-left">
            {options.map(({ id, display, isDeselect }, index) => {
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
                        if (isDeselect) {
                          isIndeterminate || !areAllSelected
                            ? onSelectAll?.()
                            : onDeselectAll?.();
                          return;
                        }
                        onSelect(id);
                      }}
                    >
                      <CheckBox
                        className="w-fit"
                        isOn={
                          isDeselect
                            ? areAllSelected
                            : Boolean(selectedOptionIds?.includes(id))
                        }
                        isIndeterminate={
                          isDeselect ? isIndeterminate : undefined
                        }
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
