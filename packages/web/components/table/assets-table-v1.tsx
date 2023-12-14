import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { ShowMoreButton } from "~/components/buttons/show-more";
import { SortMenu, Switch } from "~/components/control";
import { SearchBox } from "~/components/input";
import { Table } from "~/components/table";
import {
  AssetCell as TableCell,
  AssetNameCell,
  BalanceCell,
  SortableAssetCell as SortableTableCell,
  TransferButtonCell,
} from "~/components/table/cells";
import { TransferHistoryTable } from "~/components/table/transfer-history";
import { ColumnDef, RowDef } from "~/components/table/types";
import { SortDirection } from "~/components/types";
import { ENABLE_FEATURES, initialAssetsSort, URBIT_DEPLOYMENT } from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { EventName } from "~/config/user-analytics-v2";
import { useFeatureFlags, useTranslation } from "~/hooks";
import {
  useAmplitudeAnalytics,
  useLocalStorageState,
  useWindowSize,
} from "~/hooks";
import { useFilteredData, useSortedData } from "~/hooks/data";
import { ActivateUnverifiedTokenConfirmation } from "~/modals";
import { useStore } from "~/stores";
import {
  CoinBalance,
  IBCBalance,
  IBCCW20ContractBalance,
} from "~/stores/assets";
import { HideBalancesState } from "~/stores/user-settings";
import { UnverifiedAssetsState } from "~/stores/user-settings";

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: ((IBCBalance | IBCCW20ContractBalance) & {
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[];
  unverifiedIbcBalances: ((IBCBalance | IBCCW20ContractBalance) & {
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

const zeroDec = new Dec(0);

function mapCommonFields(
  balance: CoinPretty,
  fiatValue: PricePretty | undefined
): SortableTableCell {
  const value = fiatValue?.maxDecimals(2);
  const valueDec = value?.toDec();
  return {
    value: balance.toString(),
    currency: balance.currency,
    coinDenom: balance.denom,
    coinImageUrl: balance.currency.coinImageUrl,
    amount: balance.hideDenom(true).trim(true).maxDecimals(6).toString(),
    fiatValue: value && valueDec?.gt(zeroDec) ? value.toString() : undefined,
    fiatValueRaw: value && valueDec?.gt(zeroDec) ? valueDec : zeroDec,
  };
}

function nativeBalancesToTableCell(
  balances: CoinBalance[],
  osmosisChainId: string
): SortableTableCell[] {
  return balances.map(({ balance, fiatValue }) => {
    const commonFields = mapCommonFields(balance, fiatValue);
    return {
      ...commonFields,
      chainId: osmosisChainId,
      chainName: "",
      isVerified: true,
    };
  });
}

export const AssetsTableV1: FunctionComponent<Props> = observer(
  ({
    nativeBalances,
    ibcBalances,
    unverifiedIbcBalances,
    onDeposit: _onDeposit,
    onWithdraw: _onWithdraw,
  }) => {
    const { chainStore, userSettings } = useStore();
    const { width, isMobile } = useWindowSize();
    const { t } = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const featureFlags = useFeatureFlags();

    const [favoritesList, onSetFavoritesList] = useLocalStorageState(
      "favoritesList",
      ["OSMO", "ATOM", "TIA"]
    );

    const [isSearching, setIsSearching] = useState(false);
    const [confirmUnverifiedTokenDenom, setConfirmUnverifiedTokenDenom] =
      useState<string | null>(null);

    const showUnverifiedAssetsSetting =
      userSettings.getUserSettingById<UnverifiedAssetsState>(
        "unverified-assets"
      );
    const shouldDisplayUnverifiedAssets =
      showUnverifiedAssetsSetting?.state.showUnverifiedAssets;

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
      () =>
        [
          // Put osmo balance + native assets w/ non-zero balance to the top.
          ...nativeBalancesToTableCell(
            nativeBalances.filter(
              ({ balance, fiatValue }) =>
                balance.denom === "OSMO" ||
                fiatValue?.maxDecimals(2).toDec().gt(zeroDec)
            ),
            chainStore.osmosis.chainId
          ),
          ...initialAssetsSort(
            /** If user is searching, display all balances */
            (isSearching ? unverifiedIbcBalances : ibcBalances).map(
              (ibcBalance) => {
                const {
                  chainInfo: { chainId, prettyChainName },
                  balance,
                  fiatValue,
                  depositUrlOverride,
                  withdrawUrlOverride,
                  sourceChainNameOverride,
                } = ibcBalance;
                const isCW20 = "ics20ContractAddress" in ibcBalance;
                const pegMechanism =
                  balance.currency.originCurrency?.pegMechanism;
                const isVerified = ibcBalance.isVerified;
                const commonFields = mapCommonFields(balance, fiatValue);

                return {
                  ...commonFields,
                  chainName: sourceChainNameOverride
                    ? sourceChainNameOverride
                    : prettyChainName,
                  chainId: chainId,
                  /**
                   * Hide the balance for unverified assets that need to be activated
                   */
                  amount:
                    !isVerified && !shouldDisplayUnverifiedAssets
                      ? ""
                      : commonFields.amount,
                  queryTags: [
                    ...(isCW20 ? ["CW20"] : []),
                    ...(pegMechanism ? ["stable", pegMechanism] : []),
                  ],
                  isUnstable: ibcBalance.isUnstable === true,
                  isVerified,
                  depositUrlOverride,
                  withdrawUrlOverride,
                  onWithdraw,
                  onDeposit,
                };
              }
            )
          ),
          ...nativeBalancesToTableCell(
            nativeBalances.filter(
              ({ balance, fiatValue }) =>
                !(
                  balance.denom === "OSMO" ||
                  fiatValue?.maxDecimals(2).toDec().gt(zeroDec)
                )
            ),
            chainStore.osmosis.chainId
          ),
        ].map((balance) => {
          const currencies = ChainList.map(
            (info) => info.keplrChain.currencies
          ).reduce((a, b) => [...a, ...b]);

          const currency = currencies.find(
            (el) => el.coinDenom === balance.coinDenom
          );

          const asset = getAssetFromAssetList({
            coinMinimalDenom: currency?.coinMinimalDenom,
            assetLists: AssetLists,
          });

          return {
            ...balance,
            assetName: asset?.rawAsset.name,
          };
        }),
      [
        nativeBalances,
        isSearching,
        unverifiedIbcBalances,
        ibcBalances,
        chainStore.osmosis.chainId,
        shouldDisplayUnverifiedAssets,
        onWithdraw,
        onDeposit,
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

    const hideBalancesSetting =
      userSettings.getUserSettingById<HideBalancesState>("hide-balances");

    let setHideBalancesPrivacy = (hideBalances: boolean) => {
      hideBalancesSetting?.setState({ hideBalances: hideBalances });
    };

    // Filter data based on user's input in the search box.
    const [query, _setQuery, filteredSortedCells] = useFilteredData(
      hideZeroBalances
        ? sortedCells.filter((cell) => cell.amount !== "0")
        : sortedCells,
      ["chainName", "chainId", "coinDenom", "amount", "fiatValue", "queryTags"]
    );

    const setQuery = (term: string) => {
      _setQuery(term);
      setIsSearching(term !== "");
    };

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

    const rowDefs = useMemo<RowDef[]>(
      () =>
        ENABLE_FEATURES || featureFlags.tokenInfo
          ? tableData.map((cell) => ({
              link: `/assets/${
                URBIT_DEPLOYMENT ? cell.coinDenom.toLowerCase() : cell.coinDenom
              }`,
              makeHoverClass: () => "hover:bg-osmoverse-850",
              onClick: () => {
                logEvent([
                  EventName.Assets.assetClicked,
                  { tokenName: cell.coinDenom },
                ]);
              },
            }))
          : [],
      [logEvent, tableData, featureFlags]
    );

    const tokenToActivate = cells.find(
      ({ coinDenom }) => coinDenom === confirmUnverifiedTokenDenom
    );

    return (
      <section>
        <ActivateUnverifiedTokenConfirmation
          coinDenom={tokenToActivate?.coinDenom}
          coinImageUrl={tokenToActivate?.coinImageUrl}
          isOpen={Boolean(confirmUnverifiedTokenDenom)}
          onConfirm={() => {
            if (!confirmUnverifiedTokenDenom) return;
            showUnverifiedAssetsSetting?.setState({
              showUnverifiedAssets: true,
            });
          }}
          onRequestClose={() => {
            setConfirmUnverifiedTokenDenom(null);
          }}
        />
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
                  isOn={hideBalancesSetting?.state.hideBalances ?? false}
                  onToggle={() => {
                    setHideBalancesPrivacy(
                      !hideBalancesSetting!.state.hideBalances
                    );
                  }}
                >
                  {t("assets.table.hideBalances")}
                </Switch>
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
                        loading="lazy"
                      />
                    </div>
                  )}
                  {ENABLE_FEATURES || featureFlags.tokenInfo ? (
                    <Link
                      href={`/assets/${
                        URBIT_DEPLOYMENT
                          ? assetData.coinDenom.toLowerCase()
                          : assetData.coinDenom
                      }`}
                      className="flex shrink flex-col gap-1 text-ellipsis"
                      onClick={(e) => {
                        e.stopPropagation();
                        logEvent([
                          EventName.Assets.assetClicked,
                          { tokenName: assetData.coinDenom },
                        ]);
                      }}
                    >
                      <h6>{assetData.coinDenom}</h6>
                      {assetData.assetName && (
                        <span className="caption text-osmoverse-400">
                          {assetData.assetName}
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div className="flex shrink flex-col gap-1 text-ellipsis">
                      <h6>{assetData.coinDenom}</h6>
                      {assetData.assetName && (
                        <span className="caption text-osmoverse-400">
                          {assetData.assetName}
                        </span>
                      )}
                    </div>
                  )}
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
                      displayCell: (cell) =>
                        !shouldDisplayUnverifiedAssets && !cell.isVerified ? (
                          <Button
                            mode="text"
                            className="whitespace-nowrap !p-0"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (!cell.coinDenom) return;
                              setConfirmUnverifiedTokenDenom(cell.coinDenom);
                            }}
                          >
                            {t("assets.table.activate")}
                          </Button>
                        ) : (
                          <TransferButtonCell type="deposit" {...cell} />
                        ),
                      className: "text-left max-w-[5rem]",
                    },
                    {
                      display: t("assets.table.columns.withdraw"),
                      displayCell: (cell) =>
                        !shouldDisplayUnverifiedAssets &&
                        !cell.isVerified ? null : (
                          <TransferButtonCell type="withdraw" {...cell} />
                        ),
                      className: "text-left max-w-[5rem]",
                    },
                  ] as ColumnDef<TableCell>[])),
            ]}
            rowDefs={rowDefs}
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
