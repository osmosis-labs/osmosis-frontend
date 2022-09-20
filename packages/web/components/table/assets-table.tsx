import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { Dec } from "@keplr-wallet/unit";
import { initialAssetsSort, AssetsPageEvents } from "../../config";
import {
  IBCBalance,
  IBCCW20ContractBalance,
  CoinBalance,
} from "../../stores/assets";
import { useStore } from "../../stores";
import { useSortedData, useFilteredData } from "../../hooks/data";
import {
  useLocalStorageState,
  useWindowSize,
  useMatomoAnalytics,
  useAmplitudeAnalytics,
} from "../../hooks";
import { ShowMoreButton } from "../buttons/show-more";
import { SearchBox } from "../input";
import { SortMenu, Switch } from "../control";
import { SortDirection } from "../types";
import { AssetCard } from "../cards";
import { Button } from "../buttons";
import {
  AssetNameCell,
  BalanceCell,
  TransferButtonCell,
  AssetCell as TableCell,
} from "./cells";
import { TransferHistoryTable } from "./transfer-history";
import { ColumnDef } from "./types";
import { Table } from ".";
import { EventName } from "../../config/user-analytics-v2";

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: ((IBCBalance | IBCCW20ContractBalance) & {
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[];
  onWithdrawIntent: () => void;
  onDepositIntent: () => void;
  onWithdraw: (
    chainId: string,
    coinDenom: string,
    externalUrl?: string
  ) => void;
  onDeposit: (chainId: string, coinDenom: string, externalUrl?: string) => void;
}

export const AssetsTable: FunctionComponent<Props> = ({
  nativeBalances,
  ibcBalances,
  onDepositIntent,
  onWithdrawIntent,
  onDeposit: do_onDeposit,
  onWithdraw: do_onWithdraw,
}) => {
  const { chainStore } = useStore();
  const { width, isMobile } = useWindowSize();
  const { trackEvent } = useMatomoAnalytics();
  const { logEvent } = useAmplitudeAnalytics();

  const onDeposit = useCallback(
    (...depositParams: Parameters<typeof do_onDeposit>) => {
      do_onDeposit(...depositParams);
      logEvent([
        EventName.Assets.assetsItemDepositClicked,
        {
          tokenName: depositParams[1],
          hasExternalUrl: !!depositParams[2],
        },
      ]);
      trackEvent(AssetsPageEvents.rowStartDeposit);
    },
    [do_onDeposit]
  );
  const onWithdraw = useCallback(
    (...withdrawParams: Parameters<typeof do_onWithdraw>) => {
      do_onWithdraw(...withdrawParams);
      logEvent([
        EventName.Assets.assetsItemWithdrawClicked,
        {
          tokenName: withdrawParams[1],
          hasExternalUrl: !!withdrawParams[2],
        },
      ]);
      trackEvent(AssetsPageEvents.rowStartWithdraw);
    },
    [do_onWithdraw]
  );

  const mergeWithdrawCol = width < 1000 && !isMobile;
  // Assemble cells with all data needed for any place in the table.
  const cells: TableCell[] = useMemo(
    () => [
      // hardcode native Osmosis assets (OSMO, ION) at the top initially
      ...nativeBalances.map(({ balance, fiatValue }) => {
        const value = fiatValue?.maxDecimals(2);

        return {
          value: balance.toString(),
          currency: balance.currency,
          chainId: chainStore.osmosis.chainId,
          chainName: "",
          coinDenom: balance.denom,
          coinImageUrl: balance.currency.coinImageUrl,
          amount: balance.hideDenom(true).trim(true).maxDecimals(6).toString(),
          fiatValue:
            value && value.toDec().gt(new Dec(0))
              ? value.toString()
              : undefined,
          fiatValueRaw:
            value && value.toDec().gt(new Dec(0))
              ? value?.toDec().toString()
              : "0",
          isCW20: false,
        };
      }),
      ...initialAssetsSort(
        ibcBalances.map((ibcBalance) => {
          const {
            chainInfo: { chainId, chainName },
            balance,
            fiatValue,
            depositUrlOverride,
            withdrawUrlOverride,
            sourceChainNameOverride,
          } = ibcBalance;
          const value = fiatValue?.maxDecimals(2);
          const isCW20 = "ics20ContractAddress" in ibcBalance;
          const pegMechanism = balance.currency.originCurrency?.pegMechanism;

          return {
            value: balance.toString(),
            currency: balance.currency,
            chainName: sourceChainNameOverride
              ? sourceChainNameOverride
              : chainName,
            chainId: chainId,
            coinDenom: balance.denom,
            coinImageUrl: balance.currency.coinImageUrl,
            amount: balance
              .hideDenom(true)
              .trim(true)
              .maxDecimals(6)
              .toString(),
            fiatValue:
              value && value.toDec().gt(new Dec(0))
                ? value.toString()
                : undefined,
            fiatValueRaw:
              value && value.toDec().gt(new Dec(0))
                ? value?.toDec().toString()
                : "0",
            queryTags: [
              ...(isCW20 ? ["CW20"] : []),
              ...(pegMechanism ? ["stable", pegMechanism] : []),
            ],
            isUnstable: ibcBalance.isUnstable === true,
            depositUrlOverride,
            withdrawUrlOverride,
            onWithdraw,
            onDeposit,
          };
        })
      ),
    ],
    [
      nativeBalances,
      chainStore.osmosis.chainId,
      ibcBalances,
      onWithdraw,
      onDeposit,
    ]
  );

  // Sort data based on user's input either with the table column headers or the sort menu.
  const [
    sortKey,
    do_setSortKey,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    sortedCells,
  ] = useSortedData(cells);
  const setSortKey = useCallback(
    (term: string) => {
      trackEvent(AssetsPageEvents.sortAssets);
      logEvent([
        EventName.Assets.assetsListSorted,
        {
          sortedBy: term,
          sortDirection,

          sortedOn: "dropdown",
        },
      ]);
      do_setSortKey(term);
    },
    [trackEvent, sortDirection, do_setSortKey]
  );

  // Table column def to determine how the first 2 column headers handle user click.
  const sortColumnWithKeys = useCallback(
    (
      /** Possible cell keys/members this column can sort on. First key is default
       *  sort key if this column header is selected.
       */
      sortKeys: string[],
      /** Default sort direction when this column is first selected. */
      onClickSortDirection: SortDirection = "descending"
    ) => {
      const isSorting = sortKeys.some((key) => key === sortKey);
      const firstKey = sortKeys.find((_, i) => i === 0);

      return {
        currentDirection: isSorting ? sortDirection : undefined,
        // Columns can sort by more than one key. If the column is already sorting by
        // one of it's sort keys (one that the user may have selected from the sort menu),
        // then it will toggle sort direction on that key.
        // If it wasn't sorting (aka first time it is clicked), then it will sort on the first
        // key by default.
        onClickHeader: isSorting
          ? () => {
              logEvent([
                EventName.Assets.assetsListSorted,
                {
                  sortedBy: firstKey,
                  sortDirection:
                    sortDirection === "descending" ? "ascending" : "descending",
                  sortedOn: "table-head",
                },
              ]);
              toggleSortDirection();
            }
          : () => {
              if (firstKey) {
                logEvent([
                  EventName.Assets.assetsListSorted,
                  {
                    sortedBy: firstKey,
                    sortDirection: onClickSortDirection,
                    sortedOn: "table-head",
                  },
                ]);
                setSortKey(firstKey);
                setSortDirection(onClickSortDirection);
              }
            },
      };
    },
    [sortKey, sortDirection, toggleSortDirection, setSortKey, setSortDirection]
  );

  // User toggles for showing 10+ pools and assets with > 0 fiat value
  const [showAllAssets, setShowAllAssets] = useState(false);
  const [hideZeroBalances, setHideZeroBalances] = useLocalStorageState(
    "assets_hide_zero_balances",
    false
  );
  const canHideZeroBalances = cells.some((cell) => cell.amount !== "0");

  // Filter data based on user's input in the search box.
  const [query, setQuery, filteredSortedCells] = useFilteredData(
    hideZeroBalances
      ? sortedCells.filter((cell) => cell.amount !== "0")
      : sortedCells,
    ["chainName", "chainId", "coinDenom", "amount", "fiatValue", "queryTags"]
  );

  const tableData = showAllAssets
    ? filteredSortedCells
    : filteredSortedCells.slice(0, 10);

  return (
    <section className="md:bg-background bg-surface">
      <div className="max-w-container mx-auto md:p-4 p-10">
        {isMobile ? (
          <div className="flex flex-col gap-5">
            <div className="flex place-content-between gap-10 py-2">
              <Button
                className="w-full h-10"
                onClick={() => {
                  onDepositIntent();
                  trackEvent(AssetsPageEvents.rowStartDeposit);
                }}
              >
                Deposit
              </Button>
              <Button
                className="w-full h-10 bg-primary-200/30"
                type="outline"
                onClick={() => {
                  onWithdrawIntent();
                  trackEvent(AssetsPageEvents.rowStartWithdraw);
                }}
              >
                Withdraw
              </Button>
            </div>
            <SearchBox
              className="!rounded !w-full h-11"
              currentValue={query}
              onInput={(query) => {
                setHideZeroBalances(false);
                setQuery(query);
              }}
              onFocus={() => {
                trackEvent(AssetsPageEvents.startSearchAssets);
              }}
              placeholder="Filter by symbol"
            />
            <h6>Assets</h6>
            <div className="flex gap-3 items-center place-content-between">
              <Switch
                isOn={hideZeroBalances}
                disabled={!canHideZeroBalances}
                onToggle={() => {
                  if (hideZeroBalances)
                    trackEvent(AssetsPageEvents.showZeroBalances);
                  else trackEvent(AssetsPageEvents.hideZeroBalances);
                  logEvent([
                    EventName.Assets.assetsListFiltered,
                    {
                      filteredBy: "Hide zero balances",
                      isFilterOn: !hideZeroBalances,
                    },
                  ]);

                  setHideZeroBalances(!hideZeroBalances);
                }}
              >
                Hide zero balances
              </Switch>
              <SortMenu
                selectedOptionId={sortKey}
                onSelect={setSortKey}
                onToggleSortDirection={toggleSortDirection}
                options={[
                  {
                    id: "coinDenom",
                    display: "Symbol",
                  },
                  {
                    /** These ids correspond to keys in `Cell` type and are later used for sorting. */
                    id: "chainName",
                    display: "Network",
                  },
                  {
                    id: "amount",
                    display: "Balance",
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <h5>Assets</h5>
            <div className="flex place-content-between">
              <Switch
                isOn={hideZeroBalances}
                disabled={!canHideZeroBalances}
                onToggle={() => {
                  if (hideZeroBalances)
                    trackEvent(AssetsPageEvents.showZeroBalances);
                  else trackEvent(AssetsPageEvents.hideZeroBalances);

                  setHideZeroBalances(!hideZeroBalances);
                }}
              >
                Hide zero balances
              </Switch>
              <div className="flex items-center gap-5">
                <SearchBox
                  currentValue={query}
                  onInput={(query) => {
                    setHideZeroBalances(false);
                    setQuery(query);
                  }}
                  onFocus={() => {
                    trackEvent(AssetsPageEvents.startSearchAssets);
                  }}
                  placeholder="Search assets"
                />
                <SortMenu
                  selectedOptionId={sortKey}
                  onSelect={setSortKey}
                  onToggleSortDirection={() => {
                    logEvent([
                      EventName.Assets.assetsListSorted,
                      {
                        sortedBy: sortKey,
                        sortDirection:
                          sortDirection === "descending"
                            ? "ascending"
                            : "descending",
                        sortedOn: "dropdown",
                      },
                    ]);
                    toggleSortDirection();
                  }}
                  options={[
                    {
                      id: "coinDenom",
                      display: "Symbol",
                    },
                    {
                      /** These ids correspond to keys in `Cell` type and are later used for sorting. */
                      id: "chainName",
                      display: "Network",
                    },
                    {
                      id: "fiatValueRaw",
                      display: "Balance",
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
        {isMobile ? (
          <div className="flex flex-col gap-3 my-7">
            {tableData.map((assetData) => (
              <AssetCard
                key={assetData.coinDenom}
                {...assetData}
                coinDenomCaption={assetData.chainName}
                metrics={[
                  { label: "", value: assetData.amount },
                  ...(assetData.fiatValue
                    ? [{ label: "", value: assetData.fiatValue }]
                    : []),
                ]}
                onClick={
                  assetData.chainId === undefined ||
                  (assetData.chainId &&
                    assetData.chainId === chainStore.osmosis.chainId)
                    ? undefined
                    : () => {
                        if (assetData.chainId && assetData.coinDenom) {
                          onDeposit(assetData.chainId, assetData.coinDenom);
                        }
                      }
                }
                showArrow
              />
            ))}
          </div>
        ) : (
          <Table<TableCell>
            className="w-full my-5"
            columnDefs={[
              {
                display: "Asset / Chain",
                displayCell: AssetNameCell,
                sort: sortColumnWithKeys(["coinDenom", "chainName"]),
              },
              {
                display: "Balance",
                displayCell: BalanceCell,
                sort: sortColumnWithKeys(["fiatValueRaw"], "descending"),
                className: "text-right pr-24 lg:pr-8 1.5md:pr-1",
              },
              ...(mergeWithdrawCol
                ? ([
                    {
                      display: "Transfer",
                      displayCell: (cell) => (
                        <div>
                          <TransferButtonCell type="deposit" {...cell} />
                          <TransferButtonCell type="withdraw" {...cell} />
                        </div>
                      ),
                      className: "text-center max-w-[5rem]",
                    },
                  ] as ColumnDef<TableCell>[])
                : ([
                    {
                      display: "Deposit",
                      displayCell: (cell) => (
                        <TransferButtonCell type="deposit" {...cell} />
                      ),
                      className: "text-center max-w-[5rem]",
                    },
                    {
                      display: "Withdraw",
                      displayCell: (cell) => (
                        <TransferButtonCell type="withdraw" {...cell} />
                      ),
                      className: "text-center max-w-[5rem]",
                    },
                  ] as ColumnDef<TableCell>[])),
            ]}
            data={tableData.map((cell) => [
              cell,
              cell,
              ...(mergeWithdrawCol ? [cell] : [cell, cell]),
            ])}
            headerTrClassName="!h-12 !body2"
          />
        )}
        <div className="relative flex h-12 justify-center">
          {filteredSortedCells.length > 10 && (
            <ShowMoreButton
              className="m-auto"
              isOn={showAllAssets}
              onToggle={() => {
                logEvent([
                  EventName.Assets.assetsListMoreClicked,
                  {
                    isOn: !showAllAssets,
                  },
                ]);
                setShowAllAssets(!showAllAssets);
              }}
            />
          )}
        </div>
        <TransferHistoryTable className="mt-8 md:w-screen md:-mx-4" />
      </div>
    </section>
  );
};
