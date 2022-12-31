import { Dec, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import EventEmitter from "eventemitter3";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";
import { POOLS_PER_PAGE } from ".";
import { EventName, IS_FRONTIER } from "../../config";
import {
  useAmplitudeAnalytics,
  useFilteredData,
  usePaginatedData,
  useSortedData,
  useWindowSize,
} from "../../hooks";
import { useStore } from "../../stores";
import { MenuOption, MenuToggle, PageList, SortMenu, Switch } from "../control";
import { SearchBox } from "../input";
import { ColumnDef } from "../table";
import {
  MetricLoaderCell,
  PoolCompositionCell,
  PoolQuickActionCell,
} from "../table/cells";
import { Breakpoint } from "../types";
import { CompactPoolTableDisplay } from "./compact-pool-table-display";

type PoolCell = PoolCompositionCell & MetricLoaderCell & PoolQuickActionCell;

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

type Pool = [
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

export const AllPoolsTableSet: FunctionComponent<{
  tableSet?: "incentivized-pools" | "all-pools";
  quickAddLiquidity: (poolId: string) => void;
  quickRemoveLiquidity: (poolId: string) => void;
  quickLockTokens: (poolId: string) => void;
}> = observer(
  ({
    tableSet = "incentivized-pools",
    quickAddLiquidity,
    quickRemoveLiquidity,
    quickLockTokens,
  }) => {
    const {
      chainStore,
      queriesExternalStore,
      priceStore,
      queriesStore,
      accountStore,
    } = useStore();
    const { isMobile } = useWindowSize();
    const t = useTranslation();

    const { logEvent } = useAmplitudeAnalytics();

    const [activeOptionId, setActiveOptionId] = useState(tableSet);

    const poolsMenuOptions = [
      { id: "incentivized-pools", display: t("pools.incentivized") },
      { id: "all-pools", display: t("pools.all") },
    ];

    const selectOption = (optionId: string) => {
      if (optionId === "incentivized-pools" || optionId === "all-pools") {
        setActiveOptionId(optionId);
      }
    };
    const [isPoolTvlFiltered, do_setIsPoolTvlFiltered] = useState(false);
    const tvlFilterLabel = t("pools.allPools.displayLowLiquidity", {
      value: new PricePretty(
        priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!,
        TVL_FILTER_THRESHOLD
      ).toString(),
    });
    const setIsPoolTvlFiltered = useCallback((isFiltered: boolean) => {
      logEvent([
        EventName.Pools.allPoolsListFiltered,
        {
          filteredBy: tvlFilterLabel,
          isFilterOn: isFiltered,
        },
      ]);
      do_setIsPoolTvlFiltered(isFiltered);
    }, []);

    const { chainId } = chainStore.osmosis;
    const queriesOsmosis = queriesStore.get(chainId).osmosis!;
    const account = accountStore.getAccount(chainId);
    const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency)!;

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
        queriesOsmosis.queryGammPools.response,
        queriesExternalStore.queryGammPoolFeeMetrics.response,
        queriesOsmosis.queryAccountLocked.get(account.bech32Address).response,
        queriesOsmosis.queryLockedCoins.get(account.bech32Address).response,
        queriesOsmosis.queryUnlockingCoins.get(account.bech32Address).response,
        priceStore.response,
        queriesExternalStore.queryGammPoolFeeMetrics.response,
        account.bech32Address,
      ]
    );

    const incentivizedPoolsWithMetrics = allPoolsWithMetrics.reduce(
      (
        incentivizedPools: PoolWithMetrics[],
        poolWithMetrics: PoolWithMetrics
      ) => {
        if (
          queriesOsmosis.queryIncentivizedPools.incentivizedPools.some(
            (incentivizedPoolId) =>
              poolWithMetrics.pool.id === incentivizedPoolId
          )
        ) {
          incentivizedPools.push({
            ...poolWithMetrics,
            apr: queriesOsmosis.queryIncentivizedPools
              .computeMostApr(poolWithMetrics.pool.id, priceStore)
              .add(
                // swap fees
                queriesExternalStore.queryGammPoolFeeMetrics.get7dPoolFeeApr(
                  poolWithMetrics.pool,
                  priceStore
                )
              )
              .add(
                // superfluid apr
                queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
                  poolWithMetrics.pool.id
                )
                  ? new RatePretty(
                      queriesStore
                        .get(chainId)
                        .cosmos.queryInflation.inflation.mul(
                          queriesOsmosis.querySuperfluidOsmoEquivalent.estimatePoolAPROsmoEquivalentMultiplier(
                            poolWithMetrics.pool.id
                          )
                        )
                        .moveDecimalPointLeft(2)
                    )
                  : new Dec(0)
              )
              .maxDecimals(0),
          });
        }
        return incentivizedPools;
      },
      []
    );

    const isIncentivizedPools = activeOptionId === poolsMenuOptions[0].id;
    const activeOptionPools = useMemo(
      () =>
        isIncentivizedPools
          ? incentivizedPoolsWithMetrics
          : allPoolsWithMetrics,
      [isIncentivizedPools, incentivizedPoolsWithMetrics, allPoolsWithMetrics]
    );

    const tvlFilteredPools = useMemo(() => {
      return isPoolTvlFiltered
        ? activeOptionPools
        : activeOptionPools.filter((poolWithMetrics) =>
            poolWithMetrics.liquidity.toDec().gte(new Dec(TVL_FILTER_THRESHOLD))
          );
    }, [
      isPoolTvlFiltered,
      activeOptionPools,
      queriesExternalStore.queryGammPoolFeeMetrics.response,
    ]);

    const initialKeyPath = "liquidity";
    const initialSortDirection = "descending";
    const [
      sortKeyPath,
      setSortKeyPath,
      sortDirection,
      setSortDirection,
      toggleSortDirection,
      sortedAllPoolsWithMetrics,
    ] = useSortedData(tvlFilteredPools, initialKeyPath, initialSortDirection);

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
                    logEvent([
                      EventName.Pools.allPoolsListSorted,
                      {
                        sortedBy: keyPath,
                        sortDirection: "descending",
                        sortedOn: "table",
                      },
                    ]);
                    setSortDirection("descending");
                    break;
                  case "descending":
                    // default sort key toggles forever
                    if (sortKeyPath === initialKeyPath) {
                      logEvent([
                        EventName.Pools.allPoolsListSorted,
                        {
                          sortedBy: keyPath,
                          sortDirection: "ascending",

                          sortedOn: "table",
                        },
                      ]);
                      setSortDirection("ascending");
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
      [sortKeyPath, sortDirection]
    );
    const tableCols: ColumnDef<PoolCell>[] = useMemo(
      () => [
        {
          id: "pool.id",
          display: t("pools.allPools.sort.poolName"),
          sort: makeSortMechanism("pool.id"),
          displayCell: PoolCompositionCell,
        },
        {
          id: "liquidity",
          display: t("pools.allPools.sort.liquidity"),
          sort: makeSortMechanism("liquidity"),
        },
        {
          id: "volume24h",
          display: t("pools.allPools.sort.volume24h"),
          sort: makeSortMechanism("volume24h"),
          displayCell: MetricLoaderCell,
        },
        {
          id: "feesSpent7d",
          display: t("pools.allPools.sort.fees"),
          sort: makeSortMechanism("feesSpent7d"),
          displayCell: MetricLoaderCell,
          collapseAt: Breakpoint.XL,
        },
        {
          id: isIncentivizedPools ? "apr" : "myLiquidity",
          display: isIncentivizedPools
            ? t("pools.allPools.sort.APRIncentivized")
            : t("pools.allPools.sort.APR"),
          sort: makeSortMechanism(isIncentivizedPools ? "apr" : "myLiquidity"),
          displayCell: isIncentivizedPools ? MetricLoaderCell : undefined,
          collapseAt: Breakpoint.LG,
        },
        { id: "quickActions", display: "", displayCell: PoolQuickActionCell },
      ],
      [isIncentivizedPools, t]
    );

    const [cellGroupEventEmitter] = useState(() => new EventEmitter());
    const tableData: Pool[] = useMemo(
      () =>
        tvlFilteredPools.map((poolWithMetrics) => {
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
              value: isIncentivizedPools
                ? poolWithMetrics.apr
                : poolWithMetrics.myLiquidity,
              isLoading: isIncentivizedPools
                ? queriesOsmosis.queryIncentivizedPools.isAprFetching
                : false,
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
        allData,
        isIncentivizedPools,
        queriesOsmosis.queryIncentivizedPools.isAprFetching,
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
    }, [query, filteredPools, isPoolTvlFiltered, activeOptionId]);

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
      columnHelper.accessor(
        (row) =>
          isIncentivizedPools
            ? row[4].value?.toDec().toString()
            : row[4].value?.toDec().truncate().toString(),
        {
          cell: (props) =>
            isIncentivizedPools ? (
              <MetricLoaderCell
                value={props.row.original[4].value?.toString()}
                isLoading={props.row.original[4].isLoading}
              />
            ) : (
              props.row.original[1].value.toString()
            ),
          header: isIncentivizedPools
            ? t("pools.allPools.sort.APRIncentivized")
            : t("pools.allPools.sort.APR"),
          id: isIncentivizedPools ? "apr" : "myLiquidity",
        }
      ),
      columnHelper.accessor((row) => row[5], {
        cell: (props) => {
          // @ts-ignore
          return <PoolQuickActionCell {...props.row.original[5]} />;
        },
        header: "",
        id: "actions",
      }),
    ];

    const [sorting, setSorting] = useState<SortingState>([]);

    const table = useReactTable({
      data: tableData,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    if (isMobile) {
      return (
        <CompactPoolTableDisplay
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
                      label: t("pools.allPools.sort.volume24h"),
                      value: poolData.volume24h.toString(),
                    }
                  : sortKeyPath === "feesSpent7d"
                  ? {
                      label: t("pools.allPools.sort.fees"),
                      value: poolData.feesSpent7d.toString(),
                    }
                  : sortKeyPath === "apr"
                  ? {
                      label: t("pools.allPools.sort.APRIncentivized"),
                      value: poolData.apr?.toString() ?? "0%",
                    }
                  : sortKeyPath === "myLiquidity"
                  ? {
                      label: t("pools.allPools.myLiquidity"),
                      value:
                        poolData.myLiquidity?.toString() ?? `0${fiat.symbol}`,
                    }
                  : {
                      label: t("pools.allPools.TVL"),
                      value: poolData.liquidity.toString(),
                    },
              ],
              ...[
                sortKeyPath === "apr"
                  ? {
                      label: t("pools.allPools.TVL"),
                      value: poolData.liquidity.toString(),
                    }
                  : {
                      label: isIncentivizedPools
                        ? t("pools.allPools.APR")
                        : t("pools.allPools.APRIncentivized"),
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
            placeholder: t("pools.allPools.search"),
          }}
          sortMenuProps={{
            options: tableCols.filter(
              (col) =>
                typeof col.display === "string" && col.display.length !== 0
            ) as MenuOption[],
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
            <h5>{t("pools.allPools.title")}</h5>
            <Switch
              isOn={isPoolTvlFiltered}
              onToggle={setIsPoolTvlFiltered}
              className="mr-2"
              labelPosition="left"
            >
              <span className="subtitle1 text-osmoverse-200">
                {tvlFilterLabel}
              </span>
            </Switch>
          </div>
          <div className="flex flex-wrap items-center gap-4 place-content-between">
            <MenuToggle
              className="inline"
              options={poolsMenuOptions}
              selectedOptionId={activeOptionId}
              onSelect={selectOption}
            />
            <div className="flex flex-wrap items-center gap-3 lg:w-full lg:place-content-between">
              <SearchBox
                currentValue={query}
                onInput={setQuery}
                placeholder={t("pools.allPools.search")}
                className="!w-64"
              />
              <SortMenu
                options={tableCols as MenuOption[]}
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
        <table className="my-5 w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : "",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: (
                          <Image
                            alt="ascending"
                            src={
                              IS_FRONTIER
                                ? "/icons/sort-up-white.svg"
                                : "/icons/sort-up.svg"
                            }
                            height={16}
                            width={16}
                          />
                        ),
                        desc: (
                          <Image
                            alt="descending"
                            src={
                              IS_FRONTIER
                                ? "/icons/sort-down-white.svg"
                                : "/icons/sort-down.svg"
                            }
                            height={16}
                            width={16}
                          />
                        ),
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {table.getFooterGroups().map((footerGroup) => (
              <tr key={footerGroup.id}>
                {footerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>

        {/* <Table<PoolCell>
          className="my-5 w-full lg:text-sm"
          columnDefs={tableCols}
          rowDefs={tableRows}
          data={tableData}
        /> */}
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
  }
);
