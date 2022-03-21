import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservablePool } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";
import { ExternalIncentiveGaugeAllowList } from "../../config";
import {
  useFilteredData,
  usePaginatedData,
  useSortedData,
} from "../../hooks/data";
import { useStore } from "../../stores";
import { CheckBox, PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { RowDef, Table } from "../table";
import { MetricLoaderCell, PoolCompositionCell } from "../table/cells";

const TVL_FILTER_THRESHOLD = 1000;

export const ExternalIncentivizedPoolsTableSet: FunctionComponent = observer(
  () => {
    const {
      chainStore,
      queriesExternalStore,
      priceStore,
      queriesOsmosisStore,
      accountStore,
    } = useStore();
    const router = useRouter();

    const chainInfo = chainStore.getChain("osmosis");
    const queryExternal = queriesExternalStore.get();
    const queryOsmosis = queriesOsmosisStore.get(chainInfo.chainId);
    const account = accountStore.getAccount(chainInfo.chainId);

    const [isPoolTvlFiltered, setIsPoolTvlFiltered] = useState(false);

    const externalIncentivizedPools = Object.keys(
      ExternalIncentiveGaugeAllowList
    )
      .map((poolId: string) => {
        const pool = queryOsmosis.queryGammPools.getPool(poolId);
        if (pool) {
          return pool;
        }
      })
      .filter((pool: ObservablePool | undefined): pool is ObservablePool => {
        if (!pool) {
          return false;
        }

        const inner = ExternalIncentiveGaugeAllowList[pool.id];
        const data = Array.isArray(inner) ? inner : [inner];

        if (data.length === 0) {
          return false;
        }
        const gaugeIds = data.map((d) => d.gaugeId);
        const gauges = gaugeIds.map((gaugeId) =>
          queryOsmosis.queryGauge.get(gaugeId)
        );

        let maxRemainingEpoch = 0;
        for (const gauge of gauges) {
          if (maxRemainingEpoch < gauge.remainingEpoch) {
            maxRemainingEpoch = gauge.remainingEpoch;
          }
        }

        return maxRemainingEpoch > 0;
      });
    const externalIncentivizedPoolsWithMetrics = externalIncentivizedPools.map(
      (pool) => {
        const inner = ExternalIncentiveGaugeAllowList[pool.id];
        const data = Array.isArray(inner) ? inner : [inner];
        const gaugeIds = data.map((d) => d.gaugeId);
        const gauges = gaugeIds.map((gaugeId) => {
          return queryOsmosis.queryGauge.get(gaugeId);
        });
        const incentiveDenom = data[0].denom;
        const currency = chainStore
          .getChain(chainInfo.chainId)
          .forceFindCurrency(incentiveDenom);
        let sumRemainingBonus: CoinPretty = new CoinPretty(
          currency,
          new Dec(0)
        );
        let maxRemainingEpoch = 0;
        for (const gauge of gauges) {
          sumRemainingBonus = sumRemainingBonus.add(
            gauge.getRemainingCoin(currency)
          );

          if (gauge.remainingEpoch > maxRemainingEpoch) {
            maxRemainingEpoch = gauge.remainingEpoch;
          }
        }

        return {
          ...queryExternal.queryGammPoolFeeMetrics.makePoolWithFeeMetrics(
            pool,
            priceStore
          ),
          epochsRemaining: maxRemainingEpoch,
          myLiquidity: pool
            .computeTotalValueLocked(priceStore)
            .mul(
              queryOsmosis.queryGammPoolShare.getAllGammShareRatio(
                account.bech32Address,
                pool.id
              )
            ),
          apr: queryOsmosis.queryIncentivizedPools
            .computeMostAPY(pool.id, priceStore)
            .maxDecimals(2),
        };
      }
    );

    const tvlFilteredPools = isPoolTvlFiltered
      ? externalIncentivizedPoolsWithMetrics
      : externalIncentivizedPoolsWithMetrics.filter((poolWithMetrics) =>
          poolWithMetrics.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
        );

    const [query, setQuery, filteredPools] = useFilteredData(tvlFilteredPools, [
      "pool.id",
      "pool.poolAssets.amount.currency.coinDenom",
    ]);

    const [
      sortKeyPath,
      setSortKeyPath,
      sortDirection,
      setSortDirection,
      toggleSortDirection,
      sortedAllPoolsWithMetrics,
    ] = useSortedData(filteredPools);
    const [page, setPage, minPage, numPages, allData] = usePaginatedData(
      sortedAllPoolsWithMetrics,
      10
    );
    const tableCols = [
      {
        id: "pool.id",
        display: "Pool ID/Tokens",
        displayClassName: "!pl-[5.25rem]",
        sort:
          sortKeyPath === "pool.id"
            ? {
                currentDirection: sortDirection,
                onClickHeader: toggleSortDirection,
              }
            : {
                onClickHeader: () => {
                  setSortKeyPath("pool.id");
                  setSortDirection("ascending");
                },
              },
        displayCell: PoolCompositionCell,
      },
      {
        id: "liquidity",
        display: "Liquidity",
        sort:
          sortKeyPath === "liquidity"
            ? {
                currentDirection: sortDirection,
                onClickHeader: toggleSortDirection,
              }
            : {
                onClickHeader: () => {
                  setSortKeyPath("liquidity");
                  setSortDirection("ascending");
                },
              },
      },
      {
        id: "apr",
        display: "APR",
        sort:
          sortKeyPath === "apr"
            ? {
                currentDirection: sortDirection,
                onClickHeader: toggleSortDirection,
              }
            : {
                onClickHeader: () => {
                  setSortKeyPath("apr");
                  setSortDirection("ascending");
                },
              },
        displayCell: MetricLoaderCell,
      },
      {
        id: "epochsRemaining",
        display: "Epochs Remaining",
        sort:
          sortKeyPath === "epochsRemaining"
            ? {
                currentDirection: sortDirection,
                onClickHeader: toggleSortDirection,
              }
            : {
                onClickHeader: () => {
                  setSortKeyPath("epochsRemaining");
                  setSortDirection("ascending");
                },
              },
      },
      {
        id: "myLiquidity",
        display: "My Liquidity",
        sort:
          sortKeyPath === "myLiquidity"
            ? {
                currentDirection: sortDirection,
                onClickHeader: toggleSortDirection,
              }
            : {
                onClickHeader: () => {
                  setSortKeyPath("myLiquidity");
                  setSortDirection("ascending");
                },
              },
      },
    ];
    // TODO: Remove when pull request for asset page get merged.
    useEffect(() => {
      setSortKeyPath("liquidity");
      setSortDirection("descending");
    }, []);

    const baseRow: RowDef = {
      makeHoverClass: () => "text-secondary-200",
    };

    const tableRows: RowDef[] = allData.map((poolWithFeeMetrics) => ({
      ...baseRow,
      link: `/pool/${poolWithFeeMetrics.pool.id}`,
    }));

    const tableData = allData.map((poolWithMetrics) => {
      const poolId = poolWithMetrics.pool.id;
      const poolAssets = poolWithMetrics.pool.poolAssets.map((poolAsset) => ({
        coinImageUrl: poolAsset.amount.currency.coinImageUrl,
        coinDenom: poolAsset.amount.currency.coinDenom,
      }));

      return [
        { poolId, poolAssets },
        { value: poolWithMetrics.liquidity.toString() },
        {
          value: poolWithMetrics.apr?.toString(),
          isLoading: queryOsmosis.queryIncentivizedPools.isAprFetching,
        },
        { value: poolWithMetrics.epochsRemaining?.toString() },
        { value: poolWithMetrics.myLiquidity?.toString() },
      ];
    });

    return (
      <>
        <div className="mt-5 flex items-center justify-between">
          <h5>External Incentive Pools</h5>
          <div className="flex gap-8">
            <SearchBox
              currentValue={query}
              onInput={setQuery}
              placeholder="Filter by name"
              className="!w-64"
            />
            <SortMenu
              options={tableCols}
              selectedOptionId={sortKeyPath}
              onSelect={(id) =>
                id === sortKeyPath ? setSortKeyPath("") : setSortKeyPath(id)
              }
              onToggleSortDirection={toggleSortDirection}
            />
          </div>
        </div>
        <Table<PoolCompositionCell & MetricLoaderCell>
          className="mt-5 w-full"
          columnDefs={tableCols}
          rowDefs={tableRows}
          data={tableData}
        />
        <div className="relative flex place-content-around">
          <PageList
            currentValue={page}
            max={numPages}
            min={minPage}
            onInput={setPage}
            editField
          />
          <div className="absolute right-2 bottom-1 text-sm flex items-center">
            <CheckBox
              isOn={isPoolTvlFiltered}
              onToggle={setIsPoolTvlFiltered}
              className="mr-2 after:!bg-transparent after:!border-2 after:!border-white-full"
            >
              {`Show pools less than ${new PricePretty(
                priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!,
                TVL_FILTER_THRESHOLD
              ).toString()}`}
            </CheckBox>
          </div>
        </div>
      </>
    );
  }
);
