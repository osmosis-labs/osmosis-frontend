import { Currency } from "@keplr-wallet/types";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import {
  ObservableQueryValidatorsInner,
  Staking,
} from "@osmosis-labs/keplr-stores";
import {
  CellContext,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import {
  FunctionComponent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import { FallbackImg } from "~/components/assets";
import { ExternalLinkIcon, Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { CheckBox } from "~/components/control";
import { SearchBox } from "~/components/input";
import {
  FormattedValidator,
  ValidatorSquadTable,
} from "~/components/stake/validator-squad-table";
import { Tooltip } from "~/components/tooltip";
import { EventName } from "~/config";
import { useTranslation } from "~/hooks";
import { useFilteredData } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { normalizeUrl, truncateString } from "~/utils/string";

interface ValidatorSquadModalProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
  usersValidatorSetPreferenceMap: Map<string, string>;
  action: "stake" | "edit";
  coin: {
    currency: Currency;
    amount: string;
    denom: Currency;
  };
  queryValidators: ObservableQueryValidatorsInner;
}

const CONSTANTS = {
  HIGH_APR: "0.3",
  HIGH_VOTING_POWER: "0.015",
};

export const ValidatorSquadModal: FunctionComponent<ValidatorSquadModalProps> =
  observer(
    ({
      onRequestClose,
      isOpen,
      usersValidatorsMap,
      validators,
      usersValidatorSetPreferenceMap,
      action,
      coin,
      queryValidators,
    }) => {
      // chain
      const { chainStore, queriesStore, accountStore } = useStore();

      const { chainId } = chainStore.osmosis;
      const queries = queriesStore.get(chainId);

      const account = accountStore.getWallet(chainId);

      const totalStakePool = queries.cosmos.queryPool.bondedTokens;

      // i18n
      const { t } = useTranslation();

      const { logEvent } = useAmplitudeAnalytics();

      const getMyStake = useCallback(
        (validator: Staking.Validator) =>
          new Dec(
            usersValidatorsMap.has(validator.operator_address)
              ? usersValidatorsMap.get(validator.operator_address)?.balance
                  ?.amount || 0
              : 0
          ),
        [usersValidatorsMap]
      );

      const getVotingPower = useCallback(
        (validator: Staking.Validator) =>
          totalStakePool.toDec().isZero() // should not divide by 0
            ? new Dec(validator.tokens).quo(totalStakePool.toDec())
            : new Dec(0),
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
        (validator: Staking.Validator) =>
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

      const rawData: FormattedValidator[] = useMemo(
        () =>
          validators
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
            }),
        [
          validators,
          getVotingPower,
          getMyStake,
          getFormattedMyStake,
          getFormattedVotingPower,
          getCommissions,
          getIsAPRTooHigh,
          getFormattedCommissions,
          getIsVotingPowerTooHigh,
          getFormattedWebsite,
        ]
      );

      const searchValidatorsMemoedKeys = useMemo(() => ["validatorName"], []);

      const [query, _setQuery, filteredValidators] = useFilteredData(
        rawData,
        searchValidatorsMemoedKeys
      );

      // table
      const [sorting, setSorting] = useState<SortingState>([
        { id: "myStake", desc: true },
      ]);
      const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

      const setQuery = useCallback(
        (search: string) => {
          setSorting([]);
          _setQuery(search);
        },
        [_setQuery, setSorting]
      );

      const tableContainerRef = useRef<HTMLDivElement>(null);

      // const columns = useMemo<ColumnDef<FormattedValidator>[]>(
      const columns = [
        {
          id: "validatorSquadTable",
          columns: [
            {
              id: "select",
              cell: memo(({ row }) => (
                <div className="px-1">
                  <CheckBox
                    isOn={row.getIsSelected()}
                    onToggle={row.getToggleSelectedHandler()}
                  />
                </div>
              )),
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
                    <div className="flex max-w-[15.625rem] items-center gap-3 sm:w-[300px]">
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
            },
            {
              id: "votingPower",
              accessorKey: "formattedVotingPower",
              header: () => t("stake.validatorSquad.column.votingPower"),
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
                    <span
                      className={classNames(
                        "text-left",
                        isAPRTooHigh ? "text-rust-200" : "text-white"
                      )}
                    >
                      {formattedCommissions}
                    </span>
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
        data: filteredValidators,
        columns,
        state: {
          sorting,
          rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
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
            className="max-h-[33rem] overflow-y-scroll md:max-h-[18.75rem]" // 528px & md:300px
            ref={tableContainerRef}
          >
            <ValidatorSquadTable
              // @ts-ignore
              sorting={sorting}
              setSorting={setSorting}
              filteredValidators={filteredValidators}
              setRowSelection={setRowSelection}
              rowSelection={rowSelection}
              table={table}
            />
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
