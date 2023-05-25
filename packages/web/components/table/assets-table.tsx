import { Dec } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import {
  CoinBalance,
  IBCBalance,
  IBCCW20ContractBalance,
} from "~/stores/assets";

import { initialAssetsSort } from "../../config";
import { EventName } from "../../config/user-analytics-v2";
import {
  useAmplitudeAnalytics,
  useLocalStorageState,
  useWindowSize,
} from "../../hooks";
import { useFilteredData, useSortedData } from "../../hooks/data";
import { useStore } from "../../stores";
import { Icon } from "../assets";
import { ShowMoreButton } from "../buttons/show-more";
import { SortMenu, Switch } from "../control";
import { SearchBox } from "../input";
import { SortDirection } from "../types";
import { Table } from ".";
import {
  AssetCell as TableCell,
  AssetNameCell,
  BalanceCell,
  TransferButtonCell,
} from "./cells";
import { TransferHistoryTable } from "./transfer-history";
import { ColumnDef } from "./types";

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: ((IBCBalance | IBCCW20ContractBalance) & {
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[];
  onWithdraw: (
    chainId: string,
    coinDenom: string,
    externalUrl?: string
  ) => void;
  onDeposit: (chainId: string, coinDenom: string, externalUrl?: string) => void;
}

export const AssetsTable: FunctionComponent<Props> = observer(
  ({
    nativeBalances,
    ibcBalances,
    onDeposit: _onDeposit,
    onWithdraw: _onWithdraw,
  }) => {
    const { chainStore } = useStore();
    const { width, isMobile } = useWindowSize();
    const t = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const [favoritesList, onSetFavoritesList] = useLocalStorageState(
      "favoritesList",
      ["OSMO", "ATOM"]
    );

    const onDeposit = useCallback(
      (...depositParams: Parameters<typeof _onDeposit>) => {
        _onDeposit(...depositParams);
        logEvent([
          EventName.Assets.assetsItemDepositClicked,
          {
            tokenName: depositParams[1],
            hasExternalUrl: !!depositParams[2],
          },
        ]);
      },
      [_onDeposit, logEvent]
    );
    const onWithdraw = useCallback(
      (...withdrawParams: Parameters<typeof _onWithdraw>) => {
        _onWithdraw(...withdrawParams);
        logEvent([
          EventName.Assets.assetsItemWithdrawClicked,
          {
            tokenName: withdrawParams[1],
            hasExternalUrl: !!withdrawParams[2],
          },
        ]);
      },
      [_onWithdraw, logEvent]
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
        onDeposit,
        onWithdraw,
      ]
    );

    // Sort data based on user's input either with the table column headers or the sort menu.
    const [
      sortKey,
      _setSortKey,
      sortDirection,
      setSortDirection,
      toggleSortDirection,
      sortedCells,
    ] = useSortedData(cells);

    const setSortKey = useCallback(
      (term: string) => {
        logEvent([
          EventName.Assets.assetsListSorted,
          {
            sortedBy: term,
            sortDirection,

            sortedOn: "dropdown",
          },
        ]);
        _setSortKey(term);
      },
      [_setSortKey, logEvent, sortDirection]
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
                      sortDirection === "descending"
                        ? "ascending"
                        : "descending",
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
      [
        sortDirection,
        sortKey,
        logEvent,
        toggleSortDirection,
        setSortKey,
        setSortDirection,
      ]
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

    const tableData = useMemo(() => {
      const data: TableCell[] = [];
      const favorites: TableCell[] = [];
      filteredSortedCells.forEach((coin) => {
        if (favoritesList.includes(coin.coinDenom)) {
          coin.isFavorite = true;
          coin.onToggleFavorite = () => {
            const newFavorites = favoritesList.filter(
              (d) => d !== coin.coinDenom
            );
            onSetFavoritesList(newFavorites);
          };
          favorites.push(coin);
        } else {
          coin.isFavorite = false;
          coin.onToggleFavorite = () => {
            const newFavorites = [...favoritesList, coin.coinDenom];
            onSetFavoritesList(newFavorites);
          };
          data.push(coin);
        }
      });
      const tableData = favorites.concat(data);
      return showAllAssets ? tableData : tableData.slice(0, 10);
    }, [favoritesList, filteredSortedCells, onSetFavoritesList, showAllAssets]);

    return (
      <section>
        {isMobile ? (
          <div className="flex flex-col gap-5">
            <h6 className="px-3">{t("assets.table.title")}</h6>
            <SearchBox
              className="!w-full"
              currentValue={query}
              onInput={(query) => {
                setHideZeroBalances(false);
                setQuery(query);
              }}
              placeholder={t("assets.table.search")}
              size="small"
            />
            <div className="flex flex-wrap place-content-between items-center gap-3">
              <Switch
                isOn={hideZeroBalances}
                disabled={!canHideZeroBalances}
                onToggle={() => {
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
                <span className="text-osmoverse-200">
                  {t("assets.table.hideZero")}
                </span>
              </Switch>
              <SortMenu
                selectedOptionId={sortKey}
                onSelect={setSortKey}
                onToggleSortDirection={toggleSortDirection}
                options={[
                  {
                    id: "coinDenom",
                    display: t("assets.table.sort.symbol"),
                  },
                  {
                    /** These ids correspond to keys in `Cell` type and are later used for sorting. */
                    id: "chainName",
                    display: t("assets.table.sort.network"),
                  },
                  {
                    id: "fiatValueRaw",
                    display: t("assets.table.sort.balance"),
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap place-content-between items-center">
              <h5 className="mr-5 shrink-0">{t("assets.table.title")}</h5>
              <div className="flex items-center gap-3 lg:gap-2">
                <Switch
                  isOn={hideZeroBalances}
                  disabled={!canHideZeroBalances}
                  onToggle={() => {
                    setHideZeroBalances(!hideZeroBalances);
                  }}
                >
                  {t("assets.table.hideZero")}
                </Switch>
                <SearchBox
                  currentValue={query}
                  onInput={(query) => {
                    setHideZeroBalances(false);
                    setQuery(query);
                  }}
                  placeholder={t("assets.table.search")}
                  size="small"
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
                      display: t("assets.table.sort.symbol"),
                    },
                    {
                      /** These ids correspond to keys in `Cell` type and are later used for sorting. */
                      id: "chainName",
                      display: t("assets.table.sort.network"),
                    },
                    {
                      id: "fiatValueRaw",
                      display: t("assets.table.sort.balance"),
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}
        {isMobile ? (
          <div className="my-7 flex flex-col gap-3">
            {tableData.map((assetData) => (
              <div
                key={assetData.coinDenom}
                className="flex w-full place-content-between items-center rounded-xl bg-osmoverse-800 px-3 py-3"
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
              >
                <div className="flex items-center gap-2">
                  {assetData.coinImageUrl && (
                    <div className="flex w-10 shrink-0 items-center">
                      <Image
                        alt="token icon"
                        src={assetData.coinImageUrl}
                        height={40}
                        width={40}
                      />
                    </div>
                  )}
                  <div className="flex shrink flex-col gap-1 text-ellipsis">
                    <h6>{assetData.coinDenom}</h6>
                    {assetData.chainName && (
                      <span className="caption text-osmoverse-400">
                        {assetData.chainName}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <h5 className="sm:text-h6 sm:font-h6 xs:text-subtitle2 xs:font-subtitle2">
                      {assetData.amount}
                    </h5>
                    {assetData.fiatValue && (
                      <span className="caption">{assetData.fiatValue}</span>
                    )}
                  </div>
                  {!(
                    assetData.chainId === undefined ||
                    (assetData.chainId &&
                      assetData.chainId === chainStore.osmosis.chainId)
                  ) && (
                    <Icon
                      id="chevron-right"
                      className="text-osmoverse-500"
                      width={13}
                      height={13}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table<TableCell>
            className="my-5 w-full"
            columnDefs={[
              {
                display: t("assets.table.columns.assetChain"),
                displayCell: AssetNameCell,
                sort: sortColumnWithKeys(["coinDenom", "chainName"]),
              },
              {
                display: t("assets.table.columns.balance"),
                displayCell: BalanceCell,
                sort: sortColumnWithKeys(["fiatValueRaw"], "descending"),
                className: "text-right pr-24 lg:pr-8 1.5md:pr-1",
              },
              ...(mergeWithdrawCol
                ? ([
                    {
                      display: t("assets.table.columns.transfer"),
                      displayCell: (cell) => (
                        <div>
                          <TransferButtonCell type="deposit" {...cell} />
                          <TransferButtonCell type="withdraw" {...cell} />
                        </div>
                      ),
                      className: "text-left max-w-[5rem]",
                    },
                  ] as ColumnDef<TableCell>[])
                : ([
                    {
                      display: t("assets.table.columns.deposit"),
                      displayCell: (cell) => (
                        <TransferButtonCell type="deposit" {...cell} />
                      ),
                      className: "text-left max-w-[5rem]",
                    },
                    {
                      display: t("assets.table.columns.withdraw"),
                      displayCell: (cell) => (
                        <TransferButtonCell type="withdraw" {...cell} />
                      ),
                      className: "text-left max-w-[5rem]",
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
        <TransferHistoryTable className="mt-8 md:-mx-4 md:w-screen" />
      </section>
    );
  }
);
