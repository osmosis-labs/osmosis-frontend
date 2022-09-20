import { Dec, PricePretty } from "@keplr-wallet/unit";
import { ObservablePoolWithFeeMetrics } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { EventName, PoolsPageEvents } from "../../config";
import {
  useFilteredData,
  usePaginatedData,
  useSortedData,
  useWindowSize,
  useMatomoAnalytics,
  useAmplitudeAnalytics,
} from "../../hooks";
import { useStore } from "../../stores";
import { Switch, MenuToggle, PageList, SortMenu } from "../control";
import { SearchBox } from "../input";
import { RowDef, Table } from "../table";
import { MetricLoaderCell, PoolCompositionCell } from "../table/cells";
import { Breakpoint } from "../types";
import { CompactPoolTableDisplay } from "./compact-pool-table-display";
import { POOLS_PER_PAGE } from ".";

const poolsMenuOptions = [
  { id: "incentivized-pools", display: "Incentivized Pools" },
  { id: "all-pools", display: "All Pools" },
];

const TVL_FILTER_THRESHOLD = 1000;

export const AllPoolsTableSet: FunctionComponent<{
  tableSet?: "incentivized-pools" | "all-pools";
}> = observer(({ tableSet = "incentivized-pools" }) => {
  const {
    chainStore,
    queriesExternalStore,
    priceStore,
    queriesStore,
    accountStore,
  } = useStore();
  const { isMobile } = useWindowSize();
  const { trackEvent } = useMatomoAnalytics();
  const { logEvent } = useAmplitudeAnalytics();

  const [activeOptionId, setActiveOptionId] = useState(tableSet);
  const selectOption = (optionId: string) => {
    if (optionId === "all-pools") trackEvent(PoolsPageEvents.showAllPools);

    if (optionId === "incentivized-pools" || optionId === "all-pools") {
      setActiveOptionId(optionId);
    }
  };
  const [isPoolTvlFiltered, do_setIsPoolTvlFiltered] = useState(false);
  const tvlFilterLabel = `Show pools less than ${new PricePretty(
    priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!,
    TVL_FILTER_THRESHOLD
  ).toString()}`;
  const setIsPoolTvlFiltered = useCallback(
    (isFiltered: boolean) => {
      logEvent([
        EventName.Pools.allPoolsListFiltered,
        {
          filteredBy: tvlFilterLabel,
          isFilterOn: isFiltered,
        },
      ]);
      if (isFiltered) trackEvent(PoolsPageEvents.showLowTvlPools);
      do_setIsPoolTvlFiltered(isFiltered);
    },
    [do_setIsPoolTvlFiltered]
  );

  const { chainId } = chainStore.osmosis;
  const queriesOsmosis = queriesStore.get(chainId).osmosis!;
  const queriesExternal = queriesExternalStore.get();
  const account = accountStore.getAccount(chainId);
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

  const allPools = queriesOsmosis.queryGammPools.getAllPools();
  const incentivizedPoolIds =
    queriesOsmosis.queryIncentivizedPools.incentivizedPools;

  const allPoolsWithMetrics = useMemo(
    () =>
      allPools.map((pool) => ({
        ...queriesExternal.queryGammPoolFeeMetrics.makePoolWithFeeMetrics(
          pool,
          priceStore
        ),
        myLiquidity: pool
          .computeTotalValueLocked(priceStore)
          .mul(
            queriesOsmosis.queryGammPoolShare.getAllGammShareRatio(
              account.bech32Address,
              pool.id
            )
          ),
        apr: queriesOsmosis.queryIncentivizedPools
          .computeMostAPY(pool.id, priceStore)
          .maxDecimals(2),
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
      })),
    [
      allPools,
      account.bech32Address,
      queriesOsmosis,
      priceStore,
      queriesExternal,
      queriesExternal.queryGammPoolFeeMetrics.response,
    ]
  );

  const incentivizedPoolsWithMetrics = useMemo(
    () =>
      allPoolsWithMetrics.reduce(
        (
          incentivizedPools: ObservablePoolWithFeeMetrics[],
          poolWithMetrics: ObservablePoolWithFeeMetrics
        ) => {
          if (
            incentivizedPoolIds.some(
              (incentivizedPoolId) =>
                poolWithMetrics.pool.id === incentivizedPoolId
            )
          ) {
            incentivizedPools.push(poolWithMetrics);
          }
          return incentivizedPools;
        },
        []
      ),
    [allPoolsWithMetrics, incentivizedPoolIds]
  );

  const isIncentivizedPools = activeOptionId === poolsMenuOptions[0].id;
  const activeOptionPools = useMemo(
    () =>
      isIncentivizedPools ? incentivizedPoolsWithMetrics : allPoolsWithMetrics,
    [isIncentivizedPools, incentivizedPoolsWithMetrics, allPoolsWithMetrics]
  );

  const tvlFilteredPools = useMemo(() => {
    return isPoolTvlFiltered
      ? activeOptionPools
      : activeOptionPools.filter((poolWithMetrics) =>
          poolWithMetrics.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
        );
  }, [isPoolTvlFiltered, activeOptionPools]);

  const initialKeyPath = "liquidity";
  const initialSortDirection = "descending";
  const [
    sortKeyPath,
    do_setSortKeyPath,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    sortedAllPoolsWithMetrics,
  ] = useSortedData(tvlFilteredPools, initialKeyPath, initialSortDirection);
  const setSortKeyPath = useCallback(
    (terms: string) => {
      trackEvent(PoolsPageEvents.sortPools);
      do_setSortKeyPath(terms);
    },
    [do_setSortKeyPath]
  );

  const [query, setQuery, filteredPools] = useFilteredData(
    sortedAllPoolsWithMetrics,
    [
      "pool.id",
      "poolName",
      "networkNames",
      "pool.poolAssets.amount.currency.originCurrency.pegMechanism",
    ]
  );

  const [page, setPage, minPage, numPages, allData] = usePaginatedData(
    filteredPools,
    POOLS_PER_PAGE
  );
  const makeSortMechanism = useCallback(
    (keyPath: string) =>
      sortKeyPath === keyPath
        ? {
            currentDirection: sortDirection,
            onClickHeader: () => {
              switch (sortDirection) {
                case "ascending":
                  const newSortDirection = "descending";
                  logEvent([
                    EventName.Pools.allPoolsListSorted,
                    {
                      sortedBy: keyPath,
                      sortDirection: newSortDirection,
                      sortedOn: "table",
                    },
                  ]);
                  setSortDirection(newSortDirection);
                  break;
                case "descending":
                  // default sort key toggles forever
                  if (sortKeyPath === initialKeyPath) {
                    const newSortDirection = "ascending";
                    logEvent([
                      EventName.Pools.allPoolsListSorted,
                      {
                        sortedBy: keyPath,
                        sortDirection: newSortDirection,

                        sortedOn: "table",
                      },
                    ]);
                    setSortDirection(newSortDirection);
                  } else {
                    // other keys toggle then go back to default
                    setSortKeyPath(initialKeyPath);
                    setSortDirection(initialSortDirection);
                  }
              }
            },
          }
        : {
            onClickHeader: () => {
              const newSortDirection = "ascending";
              logEvent([
                EventName.Pools.allPoolsListSorted,
                {
                  sortedBy: keyPath,
                  sortDirection: newSortDirection,

                  sortedOn: "table",
                },
              ]);
              setSortKeyPath(keyPath);
              setSortDirection(newSortDirection);
            },
          },
    [sortKeyPath, sortDirection, setSortDirection, setSortKeyPath]
  );
  const tableCols = useMemo(
    () => [
      {
        id: "pool.id",
        display: "Pool Name",
        sort: makeSortMechanism("pool.id"),
        displayCell: PoolCompositionCell,
      },
      {
        id: "liquidity",
        display: "Liquidity",
        sort: makeSortMechanism("liquidity"),
      },
      {
        id: "volume24h",
        display: "Volume (24H)",
        sort: makeSortMechanism("volume24h"),

        displayCell: MetricLoaderCell,
      },
      {
        id: "feesSpent7d",
        display: "Fees (7D)",
        sort: makeSortMechanism("feesSpent7d"),
        displayCell: MetricLoaderCell,
        collapseAt: Breakpoint.XL,
      },
      {
        id: isIncentivizedPools ? "apr" : "myLiquidity",
        display: isIncentivizedPools ? "APR" : "My Liquidity",
        sort: makeSortMechanism(isIncentivizedPools ? "apr" : "myLiquidity"),
        displayCell: isIncentivizedPools ? MetricLoaderCell : undefined,
        collapseAt: Breakpoint.LG,
      },
    ],
    [makeSortMechanism, isIncentivizedPools]
  );

  const tableRows: RowDef[] = useMemo(
    () =>
      allData.map((poolWithFeeMetrics) => ({
        link: `/pool/${poolWithFeeMetrics.pool.id}`,
        onClick: () => {
          logEvent([
            isIncentivizedPools
              ? EventName.Pools.incentivizedPoolsItemClicked
              : EventName.Pools.allPoolsItemClicked,
            {
              poolId: poolWithFeeMetrics.pool.id,
              poolName: poolWithFeeMetrics.pool.poolAssets
                .map((poolAsset) => poolAsset.amount.denom)
                .join(" / "),
              poolWeight: poolWithFeeMetrics.pool.poolAssets
                .map((poolAsset) => poolAsset.weightFraction.toString())
                .join(" / "),
              isSuperfluidPool:
                queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
                  poolWithFeeMetrics.pool.id
                ),
            },
          ]);
        },
      })),
    [allData]
  );

  const tableData = useMemo(
    () =>
      allData.map((poolWithMetrics) => {
        const poolId = poolWithMetrics.pool.id;
        const poolAssets = poolWithMetrics.pool.poolAssets.map((poolAsset) => ({
          coinImageUrl: poolAsset.amount.currency.coinImageUrl,
          coinDenom: poolAsset.amount.currency.coinDenom,
        }));

        return [
          {
            poolId,
            poolAssets,
            isIncentivized: incentivizedPoolIds.some((id) => id === poolId),
          },
          { value: poolWithMetrics.liquidity.toString() },
          {
            value: poolWithMetrics.volume24h.toString(),
            isLoading: !queriesExternal.queryGammPoolFeeMetrics.response,
          },
          {
            value: poolWithMetrics.feesSpent7d.toString(),
            isLoading: !queriesExternal.queryGammPoolFeeMetrics.response,
          },
          {
            value: isIncentivizedPools
              ? poolWithMetrics.apr?.toString()
              : poolWithMetrics.myLiquidity?.toString(),
            isLoading: isIncentivizedPools
              ? queriesOsmosis.queryIncentivizedPools.isAprFetching
              : false,
          },
        ];
      }),
    [
      allData,
      isIncentivizedPools,
      incentivizedPoolIds,
      queriesExternal,
      queriesOsmosis,
    ]
  );

  // auto expand searchable pools set when user is actively searching
  const didAutoSwitchActiveSet = useRef(false);
  const didAutoSwitchTVLFilter = useRef(false);
  useEffect(() => {
    // first expand to all pools, then to low TVL pools
    // remember if/what we switched for user
    if (query !== "" && filteredPools.length < POOLS_PER_PAGE) {
      if (activeOptionId === "all-pools") {
        if (!isPoolTvlFiltered) didAutoSwitchTVLFilter.current = true;
        setIsPoolTvlFiltered(true);
      } else {
        if (activeOptionId === "incentivized-pools")
          didAutoSwitchActiveSet.current = true;
        setActiveOptionId("all-pools");
      }
    }

    // reset filter states when query cleared only if auto switched
    if (query === "" && didAutoSwitchActiveSet.current) {
      setActiveOptionId("incentivized-pools");
      didAutoSwitchActiveSet.current = false;
    }
    if (query === "" && didAutoSwitchTVLFilter.current) {
      setIsPoolTvlFiltered(false);
      didAutoSwitchTVLFilter.current = false;
    }
  }, [
    query,
    filteredPools,
    isPoolTvlFiltered,
    activeOptionId,
    setIsPoolTvlFiltered,
    setActiveOptionId,
  ]);

  if (isMobile) {
    return (
      <CompactPoolTableDisplay
        title={isIncentivizedPools ? "Incentivized Pools" : "All Pools"}
        pools={allData.map((poolData) => ({
          id: poolData.pool.id,
          assets: poolData.pool.poolAssets.map(
            ({
              amount: {
                currency: { coinDenom, coinImageUrl },
              },
            }) => ({
              coinDenom,
              coinImageUrl,
            })
          ),
          metrics: [
            ...[
              sortKeyPath === "volume24h"
                ? {
                    label: "",
                    value: poolData.volume24h.toString(),
                  }
                : sortKeyPath === "feesSpent7d"
                ? { label: "", value: poolData.feesSpent7d.toString() }
                : sortKeyPath === "apr"
                ? { label: "", value: poolData.apr?.toString() ?? "0%" }
                : sortKeyPath === "myLiquidity"
                ? {
                    label: "my liquidity",
                    value:
                      poolData.myLiquidity?.toString() ?? `0${fiat.symbol}`,
                  }
                : { label: "TVL", value: poolData.liquidity.toString() },
            ],
            ...[
              sortKeyPath === "apr"
                ? { label: "TVL", value: poolData.liquidity.toString() }
                : {
                    label: isIncentivizedPools ? "APR" : "7d Vol.",
                    value: isIncentivizedPools
                      ? poolData.apr?.toString() ?? "0%"
                      : poolData.volume7d.toString(),
                  },
            ],
          ],
          isSuperfluidPool:
            queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
              poolData.pool.id
            ),
        }))}
        searchBoxProps={{
          currentValue: query,
          onInput: setQuery,
          onFocus: () => trackEvent(PoolsPageEvents.startPoolsSearch),
          placeholder: "Search pools",
        }}
        sortMenuProps={{
          options: tableCols,
          selectedOptionId: sortKeyPath,
          onSelect: (id) =>
            id === sortKeyPath ? setSortKeyPath("") : setSortKeyPath(id),
          onToggleSortDirection: toggleSortDirection,
        }}
        pageListProps={{
          currentValue: page,
          max: numPages,
          min: minPage,
          onInput: setPage,
        }}
        minTvlToggleProps={{
          isOn: isPoolTvlFiltered,
          onToggle: setIsPoolTvlFiltered,
          label: tvlFilterLabel,
        }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 mt-5">
        <div className="flex items-center place-content-between">
          <h5>All Pools</h5>
          <MenuToggle
            className="inline"
            options={poolsMenuOptions}
            selectedOptionId={activeOptionId}
            onSelect={selectOption}
          />
        </div>
        <div className="flex flex-wrap gap-4 place-content-between">
          <Switch
            isOn={isPoolTvlFiltered}
            onToggle={setIsPoolTvlFiltered}
            className="mr-2"
          >
            {tvlFilterLabel}
          </Switch>
          <div className="flex flex-wrap items-center gap-8 lg:w-full lg:place-content-between">
            <SearchBox
              currentValue={query}
              onInput={setQuery}
              onFocus={() => trackEvent(PoolsPageEvents.startPoolsSearch)}
              placeholder="Search pools"
              className="!w-64"
            />
            <SortMenu
              options={tableCols}
              selectedOptionId={sortKeyPath}
              onSelect={(id) => {
                if (id === sortKeyPath) {
                  setSortKeyPath("");
                } else {
                  logEvent([
                    EventName.Pools.allPoolsListSorted,
                    {
                      sortedBy: id,
                      sortDirection: sortDirection,
                      sortedOn: "dropdown",
                    },
                  ]);
                  setSortKeyPath(id);
                }
              }}
              onToggleSortDirection={() => {
                logEvent([
                  EventName.Pools.allPoolsListSorted,
                  {
                    sortedBy: sortKeyPath,
                    sortDirection:
                      sortDirection === "ascending"
                        ? "descending"
                        : "ascending",
                    sortedOn: "dropdown",
                  },
                ]);
                toggleSortDirection();
              }}
            />
          </div>
        </div>
      </div>
      <Table<PoolCompositionCell & MetricLoaderCell>
        className="mt-5 w-full lg:text-sm"
        columnDefs={tableCols}
        rowDefs={tableRows}
        data={tableData}
      />
      <div className="flex items-center place-content-center">
        <PageList
          currentValue={page}
          max={numPages}
          min={minPage}
          onInput={setPage}
          editField
        />
      </div>
    </>
  );
});
