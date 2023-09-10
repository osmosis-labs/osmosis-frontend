import { Staking } from "@keplr-wallet/stores";
import { CoinPretty, Dec, RatePretty } from "@keplr-wallet/unit";
import {
  CellContext,
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ExternalLinkIcon, Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { CheckBox } from "~/components/control";
import { SearchBox } from "~/components/input";
import { EventName } from "~/config";
import { useFilteredData } from "~/hooks";
import { useAmplitudeAnalytics } from "~/hooks";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";
import { normalizeUrl, truncateString } from "~/utils/string";

interface ValidatorSquadModalProps extends ModalBaseProps {
  usersValidatorsMap: Map<string, Staking.Delegation>;
  validators: Staking.Validator[];
}

type Validator = {
  validatorName: string | undefined;
  myStake: Dec;
  votingPower: Dec;
  formattedVotingPower: string;
  commissions: Dec;
  website: string | undefined;
  imageUrl: string;
  operatorAddress: string;
};

const CONSTANTS = {
  HIGH_APR: "0.3",
  HIGH_VOTING_POWER: "0.015",
};

// function IndeterminateCheckbox({
//   indeterminate,
//   className = "",
//   ...rest
// }: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) {
//   const ref = useRef<HTMLInputElement>(null!);

//   useEffect(() => {
//     if (typeof indeterminate === "boolean") {
//       ref.current.indeterminate = !rest.checked && indeterminate;
//     }
//   }, [ref, indeterminate]);

//   return (
//     <input
//       type="checkbox"
//       ref={ref}
//       className={className + " cursor-pointer"}
//       {...rest}
//     />
//   );
// }

export const ValidatorSquadModal2: FunctionComponent<ValidatorSquadModalProps> =
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

    const rawData: Validator[] = useMemo(
      () =>
        validators
          .filter(({ description }) => Boolean(description.moniker))
          .map((validator) => {
            const votingPower = getVotingPower(validator);

            const formattedVotingPower = getFormattedVotingPower(votingPower);

            return {
              validatorName: validator.description.moniker,
              myStake: getMyStake(validator),
              votingPower,
              formattedVotingPower,
              commissions: new Dec(validator.commission.commission_rates.rate),
              website: validator.description.website,
              imageUrl: queryValidators.getValidatorThumbnail(
                validator.operator_address
              ),
              operatorAddress: validator.operator_address,
            };
          }),
      [validators, queryValidators, getVotingPower, getMyStake]
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
            {
              id: "select",
              cell: ({ row }) => (
                <div className="px-1">
                  <CheckBox
                    isOn={row.getIsSelected()}
                    onToggle={row.getToggleSelectedHandler()}
                  />
                </div>
              ),
            },
            {
              id: "validatorName",
              accessorKey: "validatorName",
              header: () => t("stake.validatorSquad.column.validator"),
              cell: (props: CellContext<Validator, Validator>) => {
                const displayUrl = normalizeUrl(
                  props.row.original.website || ""
                );
                const truncatedDisplayUrl = truncateString(displayUrl, 30);

                return (
                  <div className="flex w-[350px] items-center gap-3 sm:w-[300px]">
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
                      {Boolean(props.row.original.website) && (
                        <span className="text-left text-xs text-wosmongton-100">
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
              },
            },
            {
              id: "myStake",
              accessorKey: "myStake",
              header: () => t("stake.validatorSquad.column.myStake"),
              cell: (props: CellContext<Validator, Validator>) => {
                const myStake = props.row.original.myStake;

                const formattedMyStake = new CoinPretty(
                  totalStakePool.currency,
                  myStake
                )
                  .maxDecimals(2)
                  .hideDenom(true)
                  .toString();

                return <>{formattedMyStake}</>;
              },
            },
            {
              id: "votingPower",
              accessorKey: "votingPower",
              header: () => t("stake.validatorSquad.column.votingPower"),
              cell: (props: CellContext<Validator, Validator>) => {
                const formattedVotingPower =
                  props.row.original.formattedVotingPower;
                return <>{formattedVotingPower}</>;
              },
            },
            // {
            //   id: "commissions",
            //   accessorKey: "commissions",
            //   header: () => t("stake.validatorSquad.column.commission"),
            //   cell: (props: CellContext<Validator, Validator>) => {
            //     const comission = new RatePretty(
            //       props.row.original.commissions
            //     );

            //     const votingPower = new RatePretty(
            //       props.row.original.votingPower
            //     );

            //     const isAPRTooHigh = comission
            //       .toDec()
            //       .gt(new Dec(CONSTANTS.HIGH_APR));

            //     const isVotingPowerTooHigh = votingPower
            //       .moveDecimalPointLeft(totalStakePool.currency.coinDecimals)
            //       .toDec()
            //       .gt(new Dec(CONSTANTS.HIGH_VOTING_POWER));

            //     return (
            //       <div className="flex justify-end gap-4">
            //         <span
            //           className={isAPRTooHigh ? "text-rust-200" : "text-white"}
            //         >
            //           {comission.toString()}
            //         </span>
            //         <div className="flex w-8">
            //           {isAPRTooHigh && (
            //             <Tooltip content={t("highPoolInflationWarning")}>
            //               <Icon
            //                 id="alert-triangle"
            //                 color={theme.colors.rust["200"]}
            //                 className="w-8"
            //               />
            //             </Tooltip>
            //           )}
            //           {isVotingPowerTooHigh && (
            //             <Tooltip content="This validator has a lot of voting power. To promote decentralization, consider delegating to more validators.">
            //               <Icon
            //                 id="pie-chart"
            //                 color={theme.colors.rust["200"]}
            //                 className="w-8"
            //               />
            //             </Tooltip>
            //           )}
            //         </div>
            //       </div>
            //     );
            //   },
            // },
          ],
        },
      ],
      [columnHelper, t, selectedValidators, totalStakePool.currency]
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

    const handleClick = useCallback(() => {
      const validatorNames = validators
        .filter(({ operator_address }) =>
          selectedValidators.has(operator_address)
        )
        .map(({ description }) => description.moniker);
      const numberOfValidators = selectedValidators.size;

      // TODO add set squad and stake logic

      logEvent([
        EventName.Stake.selectSquadAndStakeClicked,
        { numberOfValidators, validatorNames },
      ]);
    }, [logEvent, selectedValidators, validators]);

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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-32 text-center">
                    {t("stake.validatorSquad.noResults")}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
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
            </tbody>
          </table>
        </div>
        <div className="mb-6 flex justify-center justify-self-end">
          <Button mode="special-1" onClick={handleClick} className="w-[383px]">
            {t("stake.validatorSquad.button")}
          </Button>
        </div>
      </ModalBase>
    );
  });
