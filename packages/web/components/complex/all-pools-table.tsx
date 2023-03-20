import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
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

import { EventName } from "~/config";
import { useAmplitudeAnalytics, useFilteredData, useWindowSize } from "~/hooks";
import { MenuOptionsModal } from "~/modals";

import { useStore } from "../../stores";
import { Icon } from "../assets";
import { AssetCard } from "../cards";
import { SelectMenu } from "../control/select-menu";
import { SearchBox } from "../input";
import {
  MetricLoaderCell,
  PoolCompositionCell,
  PoolQuickActionCell,
} from "../table/cells";
import PaginatedTable from "./paginated-table";

const TVL_FILTER_THRESHOLD = 1000;

type PoolWithMetrics = {
  pool: ObservableQueryPool;
  liquidity: PricePretty;
  myLiquidity: PricePretty;
  myAvailableLiquidity: PricePretty;
  apr?: RatePretty;
  poolName: string;
  networkNames: string;
  volume24h: PricePretty;
  volume7d: PricePretty;
  feesSpent24h: PricePretty;
  feesSpent7d: PricePretty;
  feesPercentage: string;
};

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
    const {
      chainStore,
      queriesExternalStore,
      derivedDataStore,
      priceStore,
      queriesStore,
    } = useStore();
    const t = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();

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

    const allPools = queriesOsmosis.queryGammPools.getAllPools();

    const allPoolsWithMetrics: PoolWithMetrics[] = allPools.map((pool) => {
      const poolDetail = derivedDataStore.poolDetails.get(pool.id);
      return {
        pool,
        ...queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
          pool.id,
          priceStore
        ),
        liquidity: poolDetail.totalValueLocked,
        myLiquidity: poolDetail.userShareValue,
        myAvailableLiquidity: poolDetail.userAvailableValue,
        poolName: pool.poolAssets
          .map((asset) => asset.amount.currency.coinDenom)
          .join("/"),
        networkNames: pool.poolAssets
          .map(
            (asset) =>
              chainStore.getChainFromCurrency(asset.amount.denom)?.chainName ??
              ""
          )
          .join(" "),
        apr:
          derivedDataStore.poolsBonding
            .get(pool.id)
            ?.highestBondDuration?.aggregateApr.maxDecimals(0) ??
          poolDetail.swapFeeApr.maxDecimals(0),
      };
    });

    const tvlFilteredPools = useMemo(
      () =>
        allPoolsWithMetrics.filter((p) =>
          p.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
        ),
      [allPoolsWithMetrics]
    );

    const poolFilteredPools = useMemo(
      () =>
        tvlFilteredPools.filter((p) => {
          if (poolFilter) {
            return p.pool.type === poolFilter;
          }
          return true;
        }),
      [poolFilter, tvlFilteredPools]
    );

    const incentiveFilteredPools = useMemo(
      () =>
        poolFilteredPools.filter((p) => {
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
        incentiveFilter,
        poolFilteredPools,
        queriesOsmosis.queryIncentivizedPools,
        queriesOsmosis.querySuperfluidPools,
        queryActiveGauges,
      ]
    );

    const [sorting, _setSorting] = useState<SortingState>([
      {
        id: "liquidity",
        desc: true,
      },
    ]);
    const setSorting = useCallback(
      (s) => {
        if (typeof s === "function") {
          const sort = s()[0];
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

    const [query, _setQuery, filteredPools] = useFilteredData(
      incentiveFilteredPools,
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
        if (query === "" && search !== "") {
          console.log([
            EventName.Pools.allPoolsListFiltered,
            {
              isFilterOn: true,
              filteredBy: search,
            },
          ]);
          logEvent([
            EventName.Pools.allPoolsListFiltered,
            {
              isFilterOn: true,
              filteredBy: search,
            },
          ]);
        }
        setSorting([]);
        _setQuery(search);
      },
      [_setQuery, queriesOsmosis.queryGammPools, query, logEvent, setSorting]
    );

    const cellGroupEventEmitter = useRef(new EventEmitter()).current;
    const tableData: Pool[] = useMemo(
      () =>
        filteredPools.map((poolWithMetrics) => {
          const poolId = poolWithMetrics.pool.id;
          const poolAssets = poolWithMetrics.pool.poolAssets.map(
            (poolAsset) => ({
              coinImageUrl: poolAsset.amount.currency.coinImageUrl,
              coinDenom: poolAsset.amount.currency.coinDenom,
            })
          );

          const pool: Pool = [
            {
              poolId,
              poolAssets,
              stableswapPool: poolWithMetrics.pool.type === "stable",
            },
            { value: poolWithMetrics.liquidity },
            {
              value: poolWithMetrics.volume24h,
            },
            {
              value: poolWithMetrics.feesSpent7d,
            },
            {
              value: poolWithMetrics.apr,
            },
            {
              poolId,
              cellGroupEventEmitter,
              onAddLiquidity: () => quickAddLiquidity(poolId),
              onRemoveLiquidity: !poolWithMetrics.myAvailableLiquidity
                .toDec()
                .isZero()
                ? () => quickRemoveLiquidity(poolId)
                : undefined,
              onLockTokens: !poolWithMetrics.myAvailableLiquidity
                .toDec()
                .isZero()
                ? () => quickLockTokens(poolId)
                : undefined,
            },
          ];
          return pool;
        }),
      [
        cellGroupEventEmitter,
        filteredPools,
        quickAddLiquidity,
        quickLockTokens,
        quickRemoveLiquidity,
      ]
    );

    const columnHelper = createColumnHelper<Pool>();

    const columns = useMemo(
      () => [
        columnHelper.accessor((row) => row[0].poolId, {
          cell: (props) => <PoolCompositionCell {...props.row.original[0]} />,
          header: t("pools.allPools.sort.poolName"),
          id: "id",
        }),
        columnHelper.accessor(
          (row) => row[1].value.toDec().truncate().toString(),
          {
            cell: (props) => props.row.original[1].value.toString(),
            header: t("pools.allPools.sort.liquidity"),
            id: "liquidity",
            sortDescFirst: true,
          }
        ),
        columnHelper.accessor(
          (row) => row[2].value.toDec().truncate().toString(),
          {
            cell: (props) => (
              <MetricLoaderCell
                value={props.row.original[2].value.toString()}
              />
            ),
            header: t("pools.allPools.sort.volume24h"),
            id: "volume24h",
            sortDescFirst: true,
          }
        ),
        columnHelper.accessor(
          (row) => row[3].value.toDec().truncate().toString(),
          {
            cell: (props) => (
              <MetricLoaderCell
                value={props.row.original[3].value.toString()}
              />
            ),
            header: t("pools.allPools.sort.fees"),
            id: "fees",
            sortDescFirst: true,
          }
        ),
        columnHelper.accessor((row) => row[4].value?.toDec().toString(), {
          cell: (props) => (
            <MetricLoaderCell value={props.row.original[4].value?.toString()} />
          ),
          header: t("pools.allPools.sort.APRIncentivized"),
          id: "apr",
          sortDescFirst: true,
        }),
        columnHelper.accessor((row) => row[5], {
          cell: (props) => {
            return <PoolQuickActionCell {...props.row.original[5]} />;
          },
          header: "",
          id: "actions",
        }),
      ],
      [columnHelper, t]
    );

    const table = useReactTable({
      data: tableData,
      columns,
      state: {
        sorting,
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: (s) => {
        queriesOsmosis.queryGammPools.fetchRemainingPools();
        setSorting(s);
      },
    });

    const handleFetchRemaining = useCallback(
      () => queriesOsmosis.queryGammPools.fetchRemainingPools(),
      [queriesOsmosis.queryGammPools]
    );

    const [mobileSortMenuIsOpen, setMobileSortMenuIsOpen] = useState(false);

    const mobileTableRow = useCallback((row: Row<Pool>) => {
      return (
        <AssetCard
          coinDenom={row.original[0].poolAssets
            .map((asset) => asset.coinDenom)
            .join("/")}
          metrics={[
            {
              label: "TVL",
              value: row.original[1].value.toString(),
            },
            {
              label: "APR",
              value: row.original[4].value!.toString(),
            },
          ]}
          coinImageUrl={row.original[0].poolAssets}
        />
      );
    }, []);
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
              renderMobileItem={mobileTableRow}
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
