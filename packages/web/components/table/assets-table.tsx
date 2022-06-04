import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { initialAssetsSort } from "../../config";
import {
  IBCBalance,
  IBCCW20ContractBalance,
  CoinBalance,
} from "../../stores/assets";
import { SearchBox } from "../input";
import { CheckBox, SortMenu } from "../control";
import { Table } from ".";
import { SortDirection } from "../types";
import {
  AssetNameCell,
  BalanceCell,
  TransferButtonCell,
  AssetCell as TableCell,
} from "./cells";
import { useStore } from "../../stores";
import { useSortedData, useFilteredData } from "../../hooks/data";
import { useWindowSize } from "../../hooks/window";
import { ShowMoreButton } from "../buttons/show-more";
import { AssetCard } from "../cards";
import { Switch } from "../control";
import { Button } from "../buttons";
import { PreTransferModal } from "../../modals";
import { IbcHistoryTable } from "./ibc-history";
import { ColumnDef } from "./types";

interface Props {
  nativeBalances: CoinBalance[];
  ibcBalances: ((IBCBalance | IBCCW20ContractBalance) & {
    depositUrlOverride?: string;
    withdrawUrlOverride?: string;
    sourceChainNameOverride?: string;
  })[];
  onWithdraw: (chainId: string, coinDenom: string) => void;
  onDeposit: (chainId: string, coinDenom: string) => void;
}

export const AssetsTable: FunctionComponent<Props> = ({
  nativeBalances,
  ibcBalances,
  onDeposit,
  onWithdraw,
}) => {
  const { chainStore } = useStore();
  const { width, isMobile } = useWindowSize();
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

          return {
            value: balance.toString(),
            currency: balance.currency,
            chainName: sourceChainNameOverride ? sourceChainNameOverride : chainName,
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
            isCW20,
            queryTags: [...(isCW20 ? ["CW20"] : [])],
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
    setSortKey,
    sortDirection,
    setSortDirection,
    toggleSortDirection,
    sortedCells,
  ] = useSortedData(cells);

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
          ? toggleSortDirection
          : () => {
            if (firstKey) {
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
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

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

  // Mobile only - State for pre-transfer menu for selecting asset to ibc transfer
  const [showPreTransfer, setShowPreTransfer] = useState(false);
  const [selectedTransferToken, setPreTransferToken] = useState<CoinPretty>(
    ibcBalances[0].balance
  );
  const {
    chainInfo: selectedChainInfo,
    depositUrlOverride: selectedDepositUrlOverride,
    withdrawUrlOverride: selectedWithdrawUrlOverride,
  } = ibcBalances.find(
    (ibcAsset) => ibcAsset.balance.denom === selectedTransferToken.denom
  ) ?? {};

  return (
    <section className="min-h-screen md:bg-background bg-surface">
      {showPreTransfer && (
        <PreTransferModal
          isOpen={showPreTransfer}
          onRequestClose={() => setShowPreTransfer(false)}
          externalDepositUrl={selectedDepositUrlOverride}
          externalWithdrawUrl={selectedWithdrawUrlOverride}
          onDeposit={() => {
            if (selectedChainInfo?.chainId) {
              onDeposit(selectedChainInfo.chainId, selectedTransferToken.denom);
            }
            setShowPreTransfer(false);
          }}
          onWithdraw={() => {
            if (selectedChainInfo?.chainId) {
              onWithdraw(
                selectedChainInfo.chainId,
                selectedTransferToken.denom
              );
            }
            setShowPreTransfer(false);
          }}
          isUnstable={
            ibcBalances.find(
              (balance) => balance.balance.denom === selectedTransferToken.denom
            )?.isUnstable ?? false
          }
          onSelectToken={(coinDenom) => {
            const ibcToken = ibcBalances.find(
              (ibcAsset) => ibcAsset.balance.denom === coinDenom
            );
            if (ibcToken) {
              setPreTransferToken(ibcToken.balance);
            }
          }}
          selectedToken={selectedTransferToken}
          tokens={ibcBalances.map((ibcAsset) => ibcAsset.balance)}
        />
      )}
      <div className="max-w-container mx-auto md:p-4 p-10">
        {isMobile ? (
          <div className="flex flex-col gap-5">
            <div className="flex place-content-between gap-10 py-2">
              <Button
                className="w-full h-10"
                onClick={() => setShowPreTransfer(true)}
              >
                Deposit
              </Button>
              <Button
                className="w-full h-10 bg-primary-200/30"
                type="outline"
                onClick={() => setShowPreTransfer(true)}
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
              placeholder="Filter by symbol"
            />
            <h6>Assets</h6>
            <div className="flex gap-3 items-center place-content-between">
              <Switch
                className="overline"
                isOn={hideZeroBalances}
                onToggle={() => setHideZeroBalances(!hideZeroBalances)}
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
          <div className="flex flex-wrap place-content-between">
            <h5 className="shrink-0">Osmosis Assets</h5>
            <div className="flex gap-5">
              <SearchBox
                currentValue={query}
                onInput={(query) => {
                  setHideZeroBalances(false);
                  setQuery(query);
                }}
                placeholder="Filter by symbol"
              />
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
                      setPreTransferToken(
                        new CoinPretty(
                          assetData.currency,
                          assetData.amount.replace(",", "")
                        ).moveDecimalPointRight(
                          assetData.currency.coinDecimals
                        )
                      );
                      setShowPreTransfer(true);
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
                sort: sortColumnWithKeys(["amount", "fiatValue"], "descending"),
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
              onToggle={() => setShowAllAssets(!showAllAssets)}
            />
          )}
          {!isMobile && (
            <div className="flex gap-2 absolute body2 right-24 lg:right-12 1.5md:right-6 bottom-1">
              <CheckBox
                className="mr-2 after:!bg-transparent after:!border-2 after:!border-white-full"
                isOn={hideZeroBalances}
                onToggle={() => setHideZeroBalances(!hideZeroBalances)}
              >
                Hide zero balances
              </CheckBox>
            </div>
          )}
        </div>
        <IbcHistoryTable className="mt-8 md:w-screen md:-mx-4" />
      </div>
    </section>
  );
};
