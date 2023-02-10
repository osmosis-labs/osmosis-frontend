import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-multi-lang";
import { EventName } from "../../config";
import { useAmplitudeAnalytics, useFilteredData } from "../../hooks";
import { useStore } from "../../stores";
import { SortMenu } from "../control";
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
    isLoading?: boolean;
  },
  {
    value: PricePretty;
    isLoading?: boolean;
  },
  {
    value: PricePretty | RatePretty | undefined;
    isLoading?: boolean;
  },
  {
    poolId: string;
    cellGroupEventEmitter: EventEmitter<string | symbol, any>;
    onAddLiquidity?: () => void;
    onRemoveLiquidity?: () => void;
    onLockTokens?: () => void;
  }
];

const Filters: Record<"superfluid" | "stable" | "weighted", string> = {
  superfluid: "Superfluid",
  stable: "Stableswap",
  weighted: "Weighted",
};

export const AllPoolsTableSet: FunctionComponent<{
  quickAddLiquidity: (poolId: string) => void;
  quickRemoveLiquidity: (poolId: string) => void;
  quickLockTokens: (poolId: string) => void;
}> = observer(
  ({ quickAddLiquidity, quickRemoveLiquidity, quickLockTokens }) => {
    const {
      chainStore,
      queriesExternalStore,
      priceStore,
      queriesStore,
      accountStore,
      derivedDataStore,
    } = useStore();
    const t = useTranslation();

    const { logEvent } = useAmplitudeAnalytics();

    const router = useRouter();
    const filter = router.query.filter;
    const fetchedRemainingPoolsRef = useRef(false);

    const { chainId } = chainStore.osmosis;
    const queryCosmos = queriesStore.get(chainId).cosmos;
    const queriesOsmosis = queriesStore.get(chainId).osmosis!;
    const account = accountStore.getAccount(chainId);
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;
    const queryActiveGauges = queriesExternalStore.queryActiveGauges;
    const queryOsmosis = queriesStore.get(chainId).osmosis!;

    const allPools = queriesOsmosis.queryGammPools.getAllPools();

    const allPoolsWithMetrics: PoolWithMetrics[] = useMemo(
      () =>
        allPools.map((pool) => {
          const poolTvl = pool.computeTotalValueLocked(priceStore);
          const myLiquidity = poolTvl.mul(
            queriesOsmosis.queryGammPoolShare.getAllGammShareRatio(
              account.bech32Address,
              pool.id
            )
          );

          return {
            pool,
            ...queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
              pool.id,
              priceStore
            ),
            liquidity: pool.computeTotalValueLocked(priceStore),
            myLiquidity,
            myAvailableLiquidity: myLiquidity.toDec().isZero()
              ? new PricePretty(fiat, 0)
              : poolTvl.mul(
                  queriesOsmosis.queryGammPoolShare
                    .getAvailableGammShare(account.bech32Address, pool.id)
                    .quo(pool.totalShare)
                ),
            poolName: pool.poolAssets
              .map((asset) => asset.amount.currency.coinDenom)
              .join("/"),
            networkNames: pool.poolAssets
              .map(
                (asset) =>
                  chainStore.getChainFromCurrency(asset.amount.denom)
                    ?.chainName ?? ""
              )
              .join(" "),
          };
        }),
      [
        // note: mobx only causes rerenders for values referenced *during* render. I.e. *not* within useEffect/useCallback/useMemo hooks (see: https://mobx.js.org/react-integration.html)
        // `useMemo` is needed in this file to avoid "debounce" with the hundreds of re-renders by mobx as the 200+ API requests come in and populate 1000+ observables (otherwise the UI is unresponsive for 30+ seconds)
        // also, the higher level `useMemo`s (i.e. this one) gain the most performance as other React renders are prevented down the line as data is calculated (remember, renders are initiated by both mobx and react)
        allPools,
        queriesOsmosis.queryGammPools.isFetching,
        queriesExternalStore.queryGammPoolFeeMetrics.response,
        queriesOsmosis.queryAccountLocked.get(account.bech32Address).response,
        queriesOsmosis.queryLockedCoins.get(account.bech32Address).response,
        queriesOsmosis.queryUnlockingCoins.get(account.bech32Address).response,
        priceStore.response,
        queriesExternalStore.queryGammPoolFeeMetrics.response,
        account.bech32Address,
      ]
    );

    // TODO: Make sure external pools are not included in all pools
    const pools = queryActiveGauges.poolIdsForActiveGauges.map((poolId) =>
      queryOsmosis.queryGammPools.getPool(poolId)
    );

    const externalIncentivizedPools = useMemo(
      () =>
        pools.filter(
          (
            pool: ObservableQueryPool | undefined
          ): pool is ObservableQueryPool => {
            if (!pool) {
              return false;
            }

            const gauges = queryActiveGauges.getExternalGaugesForPool(pool.id);

            if (!gauges || gauges.length === 0) {
              return false;
            }

            let maxRemainingEpoch = 0;
            for (const gauge of gauges) {
              if (maxRemainingEpoch < gauge.remainingEpoch) {
                maxRemainingEpoch = gauge.remainingEpoch;
              }
            }

            return maxRemainingEpoch > 0;
          }
        ),
      [pools, queryActiveGauges.response]
    );

    const externalIncentivizedPoolsWithMetrics = useMemo(
      () =>
        externalIncentivizedPools.map((pool) => {
          const gauges = queryActiveGauges.getExternalGaugesForPool(pool.id);

          let maxRemainingEpoch = 0;
          for (const gauge of gauges ?? []) {
            if (gauge.remainingEpoch > maxRemainingEpoch) {
              maxRemainingEpoch = gauge.remainingEpoch;
            }
          }

          const {
            poolDetail,
            superfluidPoolDetail: _,
            poolBonding,
          } = derivedDataStore.getForPool(pool.id);

          return {
            pool,
            ...queriesExternalStore.queryGammPoolFeeMetrics.getPoolFeesMetrics(
              pool.id,
              priceStore
            ),
            liquidity: pool.computeTotalValueLocked(priceStore),
            epochsRemaining: maxRemainingEpoch,
            myLiquidity: poolDetail.userAvailableValue,
            myAvailableLiquidity: poolDetail.userAvailableValue,
            apr:
              poolBonding.highestBondDuration?.aggregateApr.maxDecimals(0) ??
              new RatePretty(0),
            poolName: pool.poolAssets
              .map((asset) => asset.amount.currency.coinDenom)
              .join("/"),
            networkNames: pool.poolAssets
              .map(
                (asset) =>
                  chainStore.getChainFromCurrency(asset.amount.denom)
                    ?.chainName ?? ""
              )
              .join(" "),
          };
        }),
      [
        chainId,
        externalIncentivizedPools,
        queryOsmosis.queryIncentivizedPools.response,
        queryOsmosis.querySuperfluidPools.response,
        queryCosmos.queryInflation.isFetching,
        queriesExternalStore.queryGammPoolFeeMetrics.response,
        queryOsmosis.queryGammPools.response,
        queryActiveGauges.response,
        priceStore,
        account,
        chainStore,
      ]
    );

    const tvlFilteredPools = useMemo(() => {
      return [...allPoolsWithMetrics, ...externalIncentivizedPoolsWithMetrics]
        .filter((p) => p.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD)))
        .filter((p) => (filter ? p.pool.type === filter : true));
    }, [
      allPoolsWithMetrics,
      externalIncentivizedPoolsWithMetrics,
      filter,
      queriesExternalStore.queryGammPoolFeeMetrics.response,
    ]);

    const [query, _setQuery, filteredPools] = useFilteredData(
      tvlFilteredPools,
      [
        "pool.id",
        "poolName",
        "networkNames",
        "pool.poolAssets.amount.currency.originCurrency.pegMechanism",
      ]
    );
    const setQuery = (search: string) => {
      if (search !== "" && !fetchedRemainingPoolsRef.current) {
        queriesOsmosis.queryGammPools.fetchRemainingPools();
        fetchedRemainingPoolsRef.current = true;
      }
      _setQuery(search);
    };

    const [cellGroupEventEmitter] = useState(() => new EventEmitter());
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
              isLoading: !queriesExternalStore.queryGammPoolFeeMetrics.response,
            },
            {
              value: poolWithMetrics.feesSpent7d,
              isLoading: !queriesExternalStore.queryGammPoolFeeMetrics.response,
            },
            {
              value: poolWithMetrics.apr,
              isLoading: queriesOsmosis.queryIncentivizedPools.isAprFetching,
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
      [filteredPools, queriesOsmosis.queryIncentivizedPools.isAprFetching]
    );

    const columnHelper = createColumnHelper<Pool>();

    const columns = [
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
        }
      ),
      columnHelper.accessor(
        (row) => row[2].value.toDec().truncate().toString(),
        {
          cell: (props) => (
            <MetricLoaderCell
              value={props.row.original[2].value.toString()}
              isLoading={props.row.original[2].isLoading}
            />
          ),
          header: t("pools.allPools.sort.volume24h"),
          id: "volume24h",
        }
      ),
      columnHelper.accessor(
        (row) => row[3].value.toDec().truncate().toString(),
        {
          cell: (props) => (
            <MetricLoaderCell
              value={props.row.original[3].value.toString()}
              isLoading={props.row.original[3].isLoading}
            />
          ),
          header: t("pools.allPools.sort.fees"),
          id: "fees",
        }
      ),
      columnHelper.accessor((row) => row[4].value?.toDec().toString(), {
        cell: (props) => (
          <MetricLoaderCell
            value={props.row.original[4].value?.toString()}
            isLoading={props.row.original[4].isLoading}
          />
        ),
        header: t("pools.allPools.sort.APRIncentivized"),
        id: "apr",
      }),
      columnHelper.accessor((row) => row[5], {
        cell: (props) => {
          return <PoolQuickActionCell {...props.row.original[5]} />;
        },
        header: "",
        id: "actions",
      }),
    ];

    const [sorting, setSorting] = useState<SortingState>([
      {
        id: "liquidity",
        desc: true,
      },
    ]);

    const table = useReactTable({
      data: tableData,
      columns,
      state: {
        sorting,
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
    });

    return (
      <>
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex place-content-between items-center">
            <h5>{t("pools.allPools.title")}</h5>
            {/* <Switch
              isOn={isPoolTvlFiltered}
              onToggle={setIsPoolTvlFiltered}
              className="mr-2"
              labelPosition="left"
            >
              <span className="subtitle1 text-osmoverse-200">
                {tvlFilterLabel}
              </span>
            </Switch> */}
          </div>
          <div className="flex flex-wrap place-content-between items-center gap-4">
            <div className="flex gap-3">
              {Object.entries(Filters).map(([f, display]) => (
                <div
                  className={classNames(
                    "cursor-pointer self-start  rounded-xl bg-osmoverse-700 px-2 py-2",
                    {
                      "bg-osmoverse-600": filter ? f === filter : false,
                    }
                  )}
                  key={f}
                  onClick={() => {
                    if (f === filter) {
                      router.push("/pools");
                    } else {
                      router.push({ query: { filter: f } });
                    }
                  }}
                >
                  {display}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:w-full lg:place-content-between">
              <SearchBox
                currentValue={query}
                onInput={setQuery}
                placeholder={t("pools.allPools.search")}
                className="!w-64"
                size="small"
              />
              <SortMenu
                options={table
                  .getHeaderGroups()[0]
                  .headers.map(({ id, column }) => {
                    return {
                      id,
                      display: column.columnDef.header as string,
                    };
                  })}
                selectedOptionId={sorting[0]?.id}
                onSelect={(id: string) => {
                  table.reset();
                  table.getColumn(id).toggleSorting(false);
                }}
                onToggleSortDirection={() => {
                  logEvent([
                    EventName.Pools.allPoolsListSorted,
                    {
                      sortedBy: sorting[0]?.id,
                      sortDirection: sorting[0].desc
                        ? "ascending"
                        : "descending",
                      sortedOn: "dropdown",
                    },
                  ]);
                  setSorting((prev) => {
                    const [first] = prev;
                    return [{ ...first, desc: !first.desc }];
                  });
                }}
              />
            </div>
          </div>
        </div>
        <PaginatedTable
          paginate={() => queriesOsmosis.queryGammPools.paginate()}
          table={table}
        />
      </>
    );
  }
);
