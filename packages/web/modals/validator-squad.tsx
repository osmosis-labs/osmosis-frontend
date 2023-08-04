import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import {
  CellContext,
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ExternalLinkIcon, Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { CheckBox } from "~/components/control";
import { SearchBox } from "~/components/input";
import { Tooltip } from "~/components/tooltip";
import { useFilteredData } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { normalizeUrl, truncateString } from "~/utils/string";

interface ExtendedModalBaseProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
}

export const ValidatorSquadModal: FunctionComponent<ExtendedModalBaseProps> =
  observer((props) => <ValidatorSquadContent {...props} />);

type Validator = {
  validatorName: string | undefined;
  myStake: string;
  votingPower: Dec;
  commissions: string;
  website: string | undefined;
  imageUrl: string;
  operatorAddress: string;
};

interface ValidatorSquadContentProps {
  onRequestClose: () => void;
  isOpen: boolean;
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
}

const CONSTANTS = {
  HIGH_APR: "0.3",
  HIGH_VOTING_POWER: "0.015"
}

const ValidatorSquadContent: FunctionComponent<ValidatorSquadContentProps> =
  observer(({ onRequestClose, isOpen, usersValidatorsMap, validators }) => {
    // chain
    const { chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const queries = queriesStore.get(chainId);

    const totalStakePool = queries.cosmos.queryPool.bondedTokens;

    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded
    );

    // table
    const [sorting, setSorting] = useState<SortingState>([
      { id: "myStake", desc: true },
    ]);
    const columnHelper = createColumnHelper<Validator>();

    // i18n
    const t = useTranslation();

    const defaultUserValidatorsSet = new Set(usersValidatorsMap.keys());

    const [selectedValidators, setSelectedValidators] = useState(
      defaultUserValidatorsSet
    );

    const rawData: Validator[] = useMemo(
      () =>
        validators
          .filter((validator) => Boolean(validator.description.moniker))
          .map((validator) => ({
            validatorName: validator.description.moniker,
            myStake: new CoinPretty(
              totalStakePool.currency,
              new Dec(
                usersValidatorsMap.has(validator.operator_address)
                  ? usersValidatorsMap.get(validator.operator_address)?.balance
                      ?.amount || 0
                  : 0
              )
            )
              .maxDecimals(2)
              .hideDenom(true)
              .toString(),
            votingPower: Boolean(totalStakePool.toDec())
              ? new Dec(validator.tokens).quo(totalStakePool.toDec())
              : new Dec(0),
            commissions: validator.commission.commission_rates.rate,
            website: validator.description.website,
            imageUrl: queryValidators.getValidatorThumbnail(
              validator.operator_address
            ),
            operatorAddress: validator.operator_address,
          })),
      [validators, totalStakePool, queryValidators, usersValidatorsMap]
    );

    const searchValidatorsMemoedKeys = useMemo(() => ["validatorName"], []);

    const [query, _setQuery, filteredValidators] = useFilteredData(
      rawData,
      searchValidatorsMemoedKeys
    );

    const setQuery = useCallback(
      (search: string) => {
        setSorting([]);
        _setQuery(search);
      },
      [_setQuery, setSorting]
    );

    const columns = useMemo<ColumnDef<Validator>[]>(
      () => [
        {
          id: "validatorSquadTable",
          columns: [
            columnHelper.accessor((row) => row, {
              cell: observer((props: CellContext<Validator, Validator>) => {
                const displayUrl = normalizeUrl(
                  props.row.original.website || ""
                );
                const truncatedDisplayUrl = truncateString(displayUrl, 30);
                const operatorAddress = props.row.original.operatorAddress;
                const isChecked = selectedValidators.has(operatorAddress);

                return (
                  <div className="flex w-[350px] items-center gap-3 sm:w-[300px]">
                    <CheckBox
                      isOn={isChecked}
                      onToggle={() => {
                        setSelectedValidators((prevSet) => {
                          const newSet = new Set(prevSet);
                          if (isChecked) {
                            newSet.delete(operatorAddress);
                          } else {
                            newSet.add(operatorAddress);
                          }
                          return newSet;
                        });
                      }}
                    />
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img
                        alt={props.row.original.validatorName}
                        src={props.row.original.imageUrl || ""}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="subtitle1 md:subtitle2">
                        {props.row.original.validatorName}
                      </div>
                      {Boolean(props.row.original.website) && (
                        <span className="text-xs text-wosmongton-100">
                          <a
                            href={props.row.original.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            {truncatedDisplayUrl}
                            <ExternalLinkIcon
                              isAnimated
                              classes={{ container: "w-3 h-3" }}
                            />
                          </a>
                        </span>
                      )}
                    </div>
                  </div>
                );
              }),
              header: () => t("stake.validatorSquad.column.validator"),
              id: "validatorName",
            }),
            {
              accessorKey: "myStake",
              header: () => t("stake.validatorSquad.column.myStake"),
            },
            {
              accessorKey: "votingPower",
              header: () => t("stake.validatorSquad.column.votingPower"),
              cell: observer((props: CellContext<Validator, Validator>) => {
                const votingPower = props.row.original.votingPower;

                const formattedVotingPower = new RatePretty(votingPower)
                  .moveDecimalPointLeft(totalStakePool.currency.coinDecimals)
                  .maxDecimals(2)
                  .toString();

                return <>{formattedVotingPower}</>;
              }),
            },
            columnHelper.accessor((row) => row, {
              cell: observer((props: CellContext<Validator, Validator>) => {
                const comission = new RatePretty(
                  props.row.original.commissions
                );

                const votingPower = new RatePretty(
                  props.row.original.votingPower
                );

                const isAPRTooHigh = comission.toDec().gt(new Dec(CONSTANTS.HIGH_APR));

                const isVotingPowerTooHigh = votingPower
                  .moveDecimalPointLeft(totalStakePool.currency.coinDecimals)
                  .toDec()
                  .gt(new Dec(CONSTANTS.HIGH_VOTING_POWER));

                return (
                  <div className="flex justify-end gap-4">
                    <span
                      className={isAPRTooHigh ? "text-rust-200" : "text-white"}
                    >
                      {comission.toString()}
                    </span>
                    <div className="flex w-8">
                      {isAPRTooHigh && (
                        <Tooltip content={t("highPoolInflationWarning")}>
                          <Icon
                            id="alert-triangle"
                            color={theme.colors.rust["200"]}
                            className="w-8"
                          />
                        </Tooltip>
                      )}
                      {isVotingPowerTooHigh && (
                        <Tooltip content="This validator has a lot of voting power. To promote decentralization, consider delegating to more validators.">
                          <Icon
                            id="pie-chart"
                            color={theme.colors.rust["200"]}
                            className="w-8"
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                );
              }),
              header: () => t("stake.validatorSquad.column.commission"),
              id: "commissions",
            }),
          ],
        },
      ],
      [columnHelper, t]
    );

    const table = useReactTable({
      data: filteredValidators,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    const { rows } = table.getRowModel();

    const tableContainerRef = useRef<HTMLDivElement>(null);

    const rowVirtualizer = useVirtualizer({
      count: rows.length,
      getScrollElement: () => tableContainerRef.current,
      estimateSize: () => 66,
      overscan: 10,
    });

    const virtualRows = rowVirtualizer.getVirtualItems();
    const totalSize = rowVirtualizer.getTotalSize();

    const paddingTop =
      virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;

    const paddingBottom =
      virtualRows.length > 0
        ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
        : 0;

    return (
      <ModalBase
        title={t("stake.validatorSquad.title")}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="flex !max-w-[1168px] flex-col"
      >
        <div className="mx-auto mb-9 flex max-w-[500px] flex-col items-center justify-center">
          <div className="mt-7 mb-3 font-medium">
            {t("stake.validatorSquad.description")}
          </div>
          <SearchBox
            placeholder={t("stake.validatorSquad.searchPlaceholder")}
            className="self-end"
            size="full"
            onInput={setQuery}
            currentValue={query}
          />
        </div>
        <div
          className="max-h-[528px] overflow-y-scroll"
          ref={tableContainerRef}
        >
          <table className="w-full">
            <thead className="sticky top-0 z-50 m-0">
              {table
                .getHeaderGroups()
                .slice(1)
                .map((headerGroup) => (
                  <tr key={headerGroup.id} className="!bg-osmoverse-700">
                    {headerGroup.headers.map((header) => {
                      return (
                        <th key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none flex items-center gap-2"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <Icon
                                    id="sort-up"
                                    className="h-[16px] w-[7px] text-osmoverse-300"
                                  />
                                ),
                                desc: (
                                  <Icon
                                    id="sort-down"
                                    className="h-[16px] w-[7px] text-osmoverse-300"
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
            </thead>
            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}
              {virtualRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-32 text-center">
                    {t("stake.validatorSquad.noResults")}
                  </td>
                </tr>
              ) : (
                virtualRows.map((virtualRow) => {
                  const row = rows[virtualRow.index] as Row<Validator>;
                  const cells = row?.getVisibleCells();
                  return (
                    <tr key={row?.id}>
                      {cells?.map((cell) => {
                        return (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mb-6 flex justify-center justify-self-end">
          <Button
            mode="special-1"
            onClick={() => console.log("set squad")}
            className="w-[383px]"
          >
            {t("stake.validatorSquad.button")}
          </Button>
        </div>
      </ModalBase>
    );
  });
