import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservablePoolWithMetric } from "@osmosis-labs/stores";
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
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

import { MenuOptionsModal } from "~/modals";
import { runIfFn } from "~/utils/function";

import { useFilteredData, useWindowSize } from "../../hooks";
import { useStore } from "../../stores";
import { Icon } from "../assets";
import { SelectMenu } from "../control/select-menu";
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

const PoolFilters: Record<"stable" | "weighted", string> = {
  stable: "Stableswap",
  weighted: "Weighted",
};

const IncentiveFilters: Record<"internal" | "external" | "superfluid", string> =
  {
    internal: "Internal incentives",
    external: "External incentives",
    superfluid: "Superfluid",
  };

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
    const poolFilter = router.query.pool as keyof Record<
      "stable" | "weighted",
      string
    >;
    const incentiveFilter = router.query.incentive as keyof Record<
      "internal" | "external" | "superfluid",
      string
    >;
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
          if (poolFilter && p.pool.type !== poolFilter) {
            return false;
          }

          if (incentiveFilter === "superfluid") {
            return queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
              p.pool.id
            );
          }
          if (incentiveFilter === "internal") {
            return queriesOsmosis.queryIncentivizedPools.isIncentivized(
              p.pool.id
            );
          }
          if (incentiveFilter === "external") {
            const gauges = queryActiveGauges.getExternalGaugesForPool(
              p.pool.id
            );
            return gauges && gauges.length > 0;
          }
          return true;
        }),
      [
        allPoolsWithMetrics,
        incentiveFilter,
        poolFilter,
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
          sortDescFirst: true,
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
          sortDescFirst: true,
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
          sortDescFirst: true,
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
          sortDescFirst: true,
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
      (id: string) => {
        if (id === poolFilter) {
          router.replace(
            {
              query: router.query.incentive
                ? { incentive: router.query.incentive }
                : null,
            },
            undefined,
            {
              scroll: false,
            }
          );
        } else {
          router.push({ query: { ...router.query, pool: id } }, undefined, {
            scroll: false,
          });
        }
        handleFetchRemaining();
      },
      [handleFetchRemaining, poolFilter, router]
    );
    const onSelectIncentiveFilter = useCallback(
      (id: string) => {
        if (id === incentiveFilter) {
          router.replace(
            {
              query: router.query.pool ? { pool: router.query.pool } : null,
            },
            undefined,
            {
              scroll: false,
            }
          );
        } else {
          router.push(
            { query: { ...router.query, incentive: id } },
            undefined,
            {
              scroll: false,
            }
          );
        }
        handleFetchRemaining();
      },
      [handleFetchRemaining, incentiveFilter, router]
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
                  <SelectMenu
                    label={t("components.pool.mobileTitle")}
                    selectedOptionLabel={PoolFilters[poolFilter]}
                    options={Object.entries(PoolFilters).map(
                      ([id, display]) => ({
                        id,
                        display,
                      })
                    )}
                    selectedOptionId={poolFilter}
                    onSelect={onSelectFilter}
                  />
                </div>
                <div className="flex-1">
                  <SelectMenu
                    label={t("components.incentive.mobileTitle")}
                    options={Object.entries(IncentiveFilters).map(
                      ([id, display]) => ({
                        id,
                        display,
                      })
                    )}
                    selectedOptionLabel={IncentiveFilters[incentiveFilter]}
                    selectedOptionId={incentiveFilter}
                    onSelect={onSelectIncentiveFilter}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex place-content-between items-center">
              <h5>{t("pools.allPools.title")}</h5>
              <div className="flex flex-wrap items-center gap-3 lg:w-full lg:place-content-between">
                <SelectMenu
                  label={
                    isMobile
                      ? t("components.pool.mobileTitle")
                      : t("components.pool.title")
                  }
                  selectedOptionLabel={PoolFilters[poolFilter]}
                  options={Object.entries(PoolFilters).map(([id, display]) => ({
                    id,
                    display,
                  }))}
                  selectedOptionId={poolFilter}
                  onSelect={onSelectFilter}
                />
                <SelectMenu
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
                  selectedOptionLabel={IncentiveFilters[incentiveFilter]}
                  selectedOptionId={incentiveFilter}
                  onSelect={onSelectIncentiveFilter}
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
