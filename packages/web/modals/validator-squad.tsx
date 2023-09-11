import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import {
  CellContext,
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-multi-lang";

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
import { useFilteredData } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";
import { normalizeUrl, truncateString } from "~/utils/string";

interface ValidatorSquadModalProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
}

const CONSTANTS = {
  HIGH_APR: "0.3",
  HIGH_VOTING_POWER: "0.015",
};

export const ValidatorSquadModal: FunctionComponent<ValidatorSquadModalProps> =
  observer(({ onRequestClose, isOpen, usersValidatorsMap, validators }) => {
    // chain
    const { chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const queries = queriesStore.get(chainId);

    const totalStakePool = queries.cosmos.queryPool.bondedTokens;

    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded
    );

    // i18n
    const t = useTranslation();

    const { logEvent } = useAmplitudeAnalytics();

    const defaultUserValidatorsSet = new Set(usersValidatorsMap.keys());

    const [selectedValidators, setSelectedValidators] = useState(
      defaultUserValidatorsSet
    );

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
        Boolean(totalStakePool.toDec())
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

    const getImageUrl = useCallback(
      (operator_address) =>
        queryValidators.getValidatorThumbnail(operator_address),
      [queryValidators]
    );

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

            const imageUrl = getImageUrl(validator.operator_address);

            const validatorName = validator?.description?.moniker || "";

            return {
              validatorName,
              formattedMyStake,
              formattedVotingPower,
              commissions,
              formattedCommissions,
              formattedWebsite,
              website,
              imageUrl,
              isAPRTooHigh,
              isVotingPowerTooHigh,
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
        getImageUrl,
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

    const columns = useMemo<ColumnDef<FormattedValidator>[]>(
      () => [
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
              cell: (
                props: CellContext<FormattedValidator, FormattedValidator>
              ) => {
                const formattedWebsite = props.row.original.formattedWebsite;
                const website = props.row.original.website;

                return (
                  <div className="flex max-w-[15.625rem] items-center gap-3 sm:w-[300px]">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img
                        alt={props.row.original.validatorName}
                        src={props.row.original.imageUrl || ""}
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
              },
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
              cell: (
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
              },
            },
            {
              id: "warning",
              cell: (
                props: CellContext<FormattedValidator, FormattedValidator>
              ) => {
                const isVotingPowerTooHigh =
                  props.row.original.isVotingPowerTooHigh;

                const isAPRTooHigh = props.row.original.isAPRTooHigh;

                return (
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
                    {!isAPRTooHigh && isVotingPowerTooHigh && (
                      <Tooltip content="This validator has a lot of voting power. To promote decentralization, consider delegating to more validators.">
                        <Icon
                          id="pie-chart"
                          color={theme.colors.rust["200"]}
                          className="w-8"
                        />
                      </Tooltip>
                    )}
                  </div>
                );
              },
            },
          ],
        },
      ],
      [t]
    );

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

    const handleButtonClick = useCallback(() => {
      const validatorNames = Object.keys(rowSelection).map((rowId) =>
        table.getRow(rowId).getValue("validatorName")
      );

      const numberOfValidators = Object.keys(rowSelection).length;

      // TODO add set squad and stake logic

      logEvent([
        EventName.Stake.selectSquadAndStakeClicked,
        { numberOfValidators, validatorNames },
      ]);
    }, [logEvent, rowSelection, table]);

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
            mode="special-1"
            onClick={handleButtonClick}
            className="w-[383px]"
          >
            {t("stake.validatorSquad.button")}
          </Button>
        </div>
      </ModalBase>
    );
  });
