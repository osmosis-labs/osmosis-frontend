import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import {
  ObservableQueryValidatorsInner,
  Staking,
} from "@osmosis-labs/keplr-stores";
import { Staking as StakingType } from "@osmosis-labs/keplr-stores";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  CellContext,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FallbackImg } from "~/components/assets";
import { ExternalLinkIcon, Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { CheckBox } from "~/components/control";
import { SearchBox } from "~/components/input";
import { Tooltip } from "~/components/tooltip";
import { StakeOrEdit } from "~/components/types";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { normalizeUrl, truncateString } from "~/utils/string";

const CONSTANTS = {
  HIGH_APR: "0.3",
  HIGH_VOTING_POWER: "0.015",
};

declare module "@tanstack/table-core" {
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

export type Validator = {
  validatorName: string | undefined;
  myStake: Dec;
  votingPower: Dec;
  commissions: Dec;
  website: string | undefined;
  imageUrl: string;
  operatorAddress: string;
  isAPRTooHigh: boolean;
  isVotingPowerTooHigh: boolean;
};

export type FormattedValidator = {
  validatorName: string;
  formattedMyStake: string;
  formattedVotingPower: string;
  formattedCommissions: string;
  formattedWebsite: string;
  website: string;
  isAPRTooHigh: boolean;
  isVotingPowerTooHigh: boolean;
  operatorAddress: string;
};

interface ValidatorSquadModalProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
  usersValidatorSetPreferenceMap: Map<string, string>;
  action: StakeOrEdit;
  coin: {
    currency: Currency;
    amount: string;
    denom: Currency;
  };
  queryValidators: ObservableQueryValidatorsInner;
}

export const ValidatorSquadModal: FunctionComponent<ValidatorSquadModalProps> =
  observer(
    ({
      onRequestClose,
      isOpen,
      action,
      coin,
      queryValidators,
      usersValidatorsMap,
      validators,
      usersValidatorSetPreferenceMap,
    }) => {
      // chain
      const { chainStore, accountStore, queriesStore } = useStore();
      const osmosisChainId = chainStore.osmosis.chainId;
      const queries = queriesStore.get(osmosisChainId);

      const { chainId } = chainStore.osmosis;

      const account = accountStore.getWallet(chainId);

      // i18n
      const { t } = useTranslation();

      const { logEvent } = useAmplitudeAnalytics();

      const [globalFilter, setGlobalFilter] = useState("");

      const totalStakePool = queries.cosmos.queryPool.bondedTokens;

      // table
      const [sorting, setSorting] = useState<SortingState>([
        { id: "myStake", desc: true },
      ]);
      const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

      const tableContainerRef = useRef<HTMLDivElement>(null);

      const getMyStake = useCallback(
        (validator: StakingType.Validator) =>
          new Dec(
            usersValidatorsMap.has(validator.operator_address)
              ? usersValidatorsMap.get(validator.operator_address)?.balance
                  ?.amount || 0
              : 0
          ),
        [usersValidatorsMap]
      );

      const getVotingPower = useCallback(
        (validator: StakingType.Validator) =>
          totalStakePool.toDec().isZero() // should not divide by 0
            ? new Dec(0)
            : new Dec(validator.tokens).quo(totalStakePool.toDec()),
        [totalStakePool]
      );

      const getFormattedVotingPower = useCallback(
        (votingPower: Dec) =>
          new RatePretty(votingPower)
            .moveDecimalPointLeft(totalStakePool.currency.coinDecimals)
            .maxDecimals(2)
            .toString(),
        [totalStakePool.currency.coinDecimals]
      );

      const getFormattedMyStake = useCallback(
        (myStake) =>
          new CoinPretty(totalStakePool.currency, myStake)
            .maxDecimals(2)
            .hideDenom(true)
            .toString(),
        [totalStakePool.currency]
      );

      const getCommissions = useCallback(
        (validator: StakingType.Validator) =>
          new Dec(validator.commission.commission_rates.rate),
        []
      );

      const getFormattedCommissions = useCallback(
        (commissions: Dec) => new RatePretty(commissions)?.toString(),
        []
      );

      const getIsAPRTooHigh = useCallback(
        (commissions: Dec) => commissions.gt(new Dec(CONSTANTS.HIGH_APR)),
        []
      );

      const getIsVotingPowerTooHigh = useCallback(
        (votingPower: Dec) =>
          new RatePretty(votingPower)
            .moveDecimalPointLeft(totalStakePool.currency.coinDecimals)
            .toDec()
            .gt(new Dec(CONSTANTS.HIGH_VOTING_POWER)),
        [totalStakePool.currency.coinDecimals]
      );

      const getFormattedWebsite = useCallback((website: string) => {
        const displayUrl = normalizeUrl(website);
        const truncatedDisplayUrl = truncateString(displayUrl, 30);
        return truncatedDisplayUrl;
      }, []);

      const data = useMemo(() => {
        return validators
          .filter(({ description }) => Boolean(description.moniker))
          .map((validator) => {
            const votingPower = getVotingPower(validator);
            const myStake = getMyStake(validator);

            const formattedVotingPower = getFormattedVotingPower(votingPower);
            const formattedMyStake = getFormattedMyStake(myStake);

            const commissions = getCommissions(validator);
            const formattedCommissions = getFormattedCommissions(commissions);

            const isAPRTooHigh = getIsAPRTooHigh(commissions);
            const isVotingPowerTooHigh = getIsVotingPowerTooHigh(votingPower);

            const website = validator?.description?.website || "";
            const formattedWebsite = getFormattedWebsite(website || "");

            const validatorName = validator?.description?.moniker || "";

            const operatorAddress = validator?.operator_address;

            return {
              validatorName,
              formattedMyStake,
              formattedVotingPower,
              commissions,
              formattedCommissions,
              formattedWebsite,
              website,
              isAPRTooHigh,
              isVotingPowerTooHigh,
              operatorAddress,
            };
          });
      }, [
        validators,
        getVotingPower,
        getMyStake,
        getFormattedVotingPower,
        getFormattedMyStake,
        getCommissions,
        getFormattedCommissions,
        getIsAPRTooHigh,
        getIsVotingPowerTooHigh,
        getFormattedWebsite,
      ]);

      const columns = [
        {
          id: "validatorSquadTable",
          columns: [
            {
              id: "select",
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => (
                  <CheckBox
                    isOn={props.row.getIsSelected()}
                    onToggle={props.row.getToggleSelectedHandler()}
                    containerProps={{ style: {} }}
                  />
                )
              ),
            },
            {
              id: "validatorName",
              accessorKey: "validatorName",
              header: () => t("stake.validatorSquad.column.validator"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedWebsite = props.row.original.formattedWebsite;
                  const website = props.row.original.website;

                  const operatorAddress = props.row.original.operatorAddress;

                  const imageUrl =
                    queryValidators.getValidatorThumbnail(operatorAddress);

                  return (
                    <div className="flex max-w-[15.625rem] items-center gap-3 sm:w-[18.75rem]">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <FallbackImg
                          alt={props.row.original.validatorName}
                          src={imageUrl}
                          fallbacksrc="/icons/superfluid-osmo.svg"
                          height={40}
                          width={40}
                        />
                      </div>
                      <div className="flex flex-col">
                        <div className="subtitle1 md:subtitle2 text-left">
                          {props.row.original.validatorName}
                        </div>
                        {Boolean(website) && (
                          <span className="text-left text-xs text-wosmongton-100">
                            <a
                              href={website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              {formattedWebsite}
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
                }
              ),
            },
            {
              id: "myStake",
              accessorKey: "formattedMyStake",
              header: () => t("stake.validatorSquad.column.myStake"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedMyStake = props.row.original.formattedMyStake;

                  return (
                    <div className="w-full text-right">{formattedMyStake}</div>
                  );
                }
              ),
            },
            {
              id: "votingPower",
              accessorKey: "formattedVotingPower",
              header: () => t("stake.validatorSquad.column.votingPower"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedVotingPower =
                    props.row.original.formattedVotingPower;

                  return (
                    <div className="w-full text-right">
                      {formattedVotingPower}
                    </div>
                  );
                }
              ),
            },
            {
              id: "commissions",
              accessorKey: "commissions",
              header: () => t("stake.validatorSquad.column.commission"),
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const formattedCommissions =
                    props.row.original.formattedCommissions;
                  const isAPRTooHigh = props.row.original.isAPRTooHigh;

                  return (
                    <div
                      className={classNames(
                        "text-right",
                        isAPRTooHigh ? "text-rust-200" : "text-white"
                      )}
                    >
                      {formattedCommissions}
                    </div>
                  );
                }
              ),
            },
            {
              id: "warning",
              cell: observer(
                (
                  props: CellContext<FormattedValidator, FormattedValidator>
                ) => {
                  const isVotingPowerTooHigh =
                    props.row.original.isVotingPowerTooHigh;

                  const isAPRTooHigh = props.row.original.isAPRTooHigh;

                  return (
                    <div className="flex w-8">
                      {isAPRTooHigh && (
                        <Tooltip content={t("stake.isAPRTooHighTooltip")}>
                          <Icon
                            id="alert-triangle"
                            color={theme.colors.rust["200"]}
                            className="w-8"
                          />
                        </Tooltip>
                      )}
                      {!isAPRTooHigh && isVotingPowerTooHigh && (
                        <Tooltip
                          content={t("stake.isVotingPowerTooHighTooltip")}
                        >
                          <Icon
                            id="pie-chart"
                            color={theme.colors.rust["200"]}
                            className="w-8"
                          />
                        </Tooltip>
                      )}
                    </div>
                  );
                }
              ),
            },
          ],
        },
      ];

      const table = useReactTable({
        data,
        columns,
        state: {
          sorting,
          rowSelection,
          globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: fuzzyFilter,
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
      });

      // matches the user's valsetpref (if any) to the table model, and sets default checkboxes accordingly via id
      useEffect(() => {
        const defaultusersValidatorSetPreferenceMap = new Set(
          usersValidatorSetPreferenceMap.keys()
        );

        const defaultRowSelection = { ...rowSelection };

        table.getRowModel().flatRows.forEach((row) => {
          if (
            defaultusersValidatorSetPreferenceMap.has(
              row.original.operatorAddress
            )
          ) {
            defaultRowSelection[row.id] = true;
          }
        });

        setRowSelection(defaultRowSelection);
      }, [usersValidatorSetPreferenceMap]);

      const setSquadButtonDisabled = !table.getIsSomeRowsSelected();

      const handleSetSquadClick = useCallback(async () => {
        // TODO disable cases for button, disable if none selected, if weights and list is same

        const validatorNames = Object.keys(rowSelection).map((rowId) =>
          table.getRow(rowId).getValue("validatorName")
        );

        const operatorAddresses = Object.keys(rowSelection).map(
          (rowId) => table.getRow(rowId).original.operatorAddress
        );

        const numberOfValidators = Object.keys(rowSelection).length;

        logEvent([
          EventName.Stake.selectSquadAndStakeClicked,
          { numberOfValidators, validatorNames },
        ]);

        // throw or return
        if (!account) return;

        // stake button
        if (action === "stake") {
          await account.osmosis.sendSetValidatorSetPreferenceAndDelegateToValidatorSetMsg(
            operatorAddresses,
            coin,
            "",
            onRequestClose
          );
        } else {
          // edit / view all
          await account.osmosis.sendSetValidatorSetPreferenceMsg(
            operatorAddresses,
            "",
            onRequestClose
          );
        }
      }, [
        logEvent,
        rowSelection,
        table,
        account,
        onRequestClose,
        coin,
        action,
      ]);

      const { rows } = table.getRowModel();

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
              onInput={(value) => setGlobalFilter(String(value))}
              currentValue={globalFilter ?? ""}
            />
          </div>
          <div
            className="h-screen max-h-[33rem] overflow-y-scroll md:max-h-[18.75rem]" // 528px & md:300px
            ref={tableContainerRef}
          >
            <table className="w-full border-separate border-spacing-y-1">
              <thead className="sticky top-0 z-50 m-0">
                {table
                  .getHeaderGroups()
                  .slice(1)
                  .map((headerGroup) => (
                    <tr key={headerGroup.id}>
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
                                }[header.column.getIsSorted() as string] ??
                                  null}
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.getAllColumns()[0].columns.length}
                      className="h-32 text-center"
                    >
                      <h6>{t("stake.validatorSquad.noResults")}</h6>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const cells = row?.getVisibleCells();
                    return (
                      <tr
                        key={row?.id}
                        className={classNames(
                          `transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-700`,
                          row.getIsSelected() ? "bg-osmoverse-700" : ""
                        )}
                        onClick={row.getToggleSelectedHandler()}
                      >
                        {cells?.map((cell) => {
                          return (
                            <td key={cell.id} className="text-left">
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
              </tbody>
            </table>
          </div>
          <div className="mb-6 flex justify-center justify-self-end">
            <Button
              disabled={setSquadButtonDisabled}
              mode="special-1"
              onClick={handleSetSquadClick}
              className="w-[383px] disabled:cursor-not-allowed disabled:opacity-75"
            >
              {action === "stake"
                ? t("stake.validatorSquad.button2")
                : t("stake.validatorSquad.button")}
            </Button>
          </div>
        </ModalBase>
      );
    }
  );
