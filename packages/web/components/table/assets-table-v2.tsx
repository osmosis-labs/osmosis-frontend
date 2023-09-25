import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { ShowMoreButton } from "~/components/buttons/show-more";
import { MenuToggle } from "~/components/control";
import { SelectMenu } from "~/components/control/select-menu";
import { SearchBox } from "~/components/input";
import { Table } from "~/components/table";
import {
  AssetCell as TableCell,
  AssetNameCell,
  BalanceCell,
  PriceCell,
} from "~/components/table/cells";
import { ChangeCell } from "~/components/table/cells/change-cell";
import { TransferHistoryTable } from "~/components/table/transfer-history";
import { SortDirection } from "~/components/types";
import { initialAssetsSort } from "~/config";
import { EventName } from "~/config/user-analytics-v2";
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

export const AssetsTableV2: FunctionComponent<Props> = observer(
  ({
    nativeBalances,
    ibcBalances,
    unverifiedIbcBalances,
    onDeposit: _onDeposit,
    onWithdraw: _onWithdraw,
  }) => {
    const { chainStore, userSettings, priceStore } = useStore();
    const { isMobile } = useWindowSize();
    const t = useTranslation();
    const { logEvent } = useAmplitudeAnalytics();
    const [favoritesList, onSetFavoritesList] = useLocalStorageState(
      "favoritesList",
      ["OSMO", "ATOM"]
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
            pricePerUnit: priceStore
              .calculatePrice(
                new CoinPretty(
                  balance?.currency!,
                  DecUtils.getTenExponentNInPrecisionRange(
                    balance?.currency.coinDecimals!
                  )
                )
              )
              ?.toString(),
            isCW20: false,
            isVerified: true,
          };
        }),
        ...initialAssetsSort(
          /** If user is searching, display all balances */
          (isSearching ? unverifiedIbcBalances : ibcBalances).map(
            (ibcBalance) => {
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
              const pegMechanism =
                balance.currency.originCurrency?.pegMechanism;
              const isVerified = ibcBalance.isVerified;

              return {
                value: balance.toString(),
                currency: balance.currency,
                chainName: sourceChainNameOverride
                  ? sourceChainNameOverride
                  : chainName,
                chainId: chainId,
                coinDenom: balance.denom,
                coinImageUrl: balance.currency.coinImageUrl,
                /**
                 * Hide the balance for unverified assets that need to be activated
                 */
                amount:
                  !isVerified && !shouldDisplayUnverifiedAssets
                    ? ""
                    : balance
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
                pricePerUnit: priceStore
                  .calculatePrice(
                    new CoinPretty(
                      balance?.currency!,
                      DecUtils.getTenExponentNInPrecisionRange(
                        balance?.currency.coinDecimals!
                      )
                    )
                  )
                  ?.toString(),
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
      ],
      [
        nativeBalances,
        isSearching,
        unverifiedIbcBalances,
        ibcBalances,
        chainStore.osmosis.chainId,
        priceStore,
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

    const tokenToActivate = cells.find(
      ({ coinDenom }) => coinDenom === confirmUnverifiedTokenDenom
    );

    const mobileTableHeader = (
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
    );

    const mobileTable = (
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
          mobileTableHeader
        ) : (
          <div className="flex items-center gap-5">
            <SearchBox
              currentValue={query}
              onInput={(query) => {
                setHideZeroBalances(false);
                setQuery(query);
              }}
              placeholder={t("assets.table.search")}
              size="full"
            />
            <SelectMenu
              defaultSelectedOptionId="7d"
              options={[
                { id: "1h", display: "1H" },
                { id: "7d", display: "1D" },
                { id: "1mo", display: "1MO" },
                { id: "1y", display: "1Y" },
              ]}
              classes={{
                container: "self-stretch",
              }}
              onSelect={() => {}}
            />
            <MenuToggle
              selectedOptionId="all-assets"
              options={[
                { id: "your-assets", display: "Your Assets" },
                { id: "all-assets", display: "All Assets" },
              ]}
              onSelect={() => {}}
            />
          </div>
        )}
        {isMobile ? (
          mobileTable
        ) : (
          <Table<TableCell>
            className="my-5 w-full"
            columnDefs={[
              {
                display: "Name",
                displayCell: AssetNameCell,
                sort: sortColumnWithKeys(["coinDenom", "chainName"]),
              },
              {
                display: "Price",
                displayCell: PriceCell,
                className: "!text-left !pr-0",
              },
              {
                display: "Change",
                displayCell: ChangeCell,
                className: "!text-left",
              },
              {
                display: "Market Cap",
                displayCell: BalanceCell,
                className: "!text-left !pr-0",
              },
              {
                display: t("assets.table.columns.balance"),
                displayCell: BalanceCell,
                sort: sortColumnWithKeys(["fiatValueRaw"], "descending"),
                className: "text-right !pr-0",
              },
            ]}
            data={tableData.map((cell) => [cell, cell, cell, cell, cell])}
            headerTrClassName="!h-12 !body2 !bg-transparent"
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
