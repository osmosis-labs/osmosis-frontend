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
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ExternalLinkIcon, Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { SearchBox } from "~/components/input";
import { IS_FRONTIER } from "~/config/index";
import { ModalBase, ModalBaseProps } from "~/modals/base";
import { useStore } from "~/stores";

export const ValidatorSquadModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => <ValidatorSquadContent {...props} />
);

type Validator = {
  validatorName: string | undefined;
  myStake: string;
  votingPower: string;
  commissions: string;
  website: string | undefined;
  imageUrl: string;
};

interface ValidatorSquadContentProps {
  onRequestClose: () => void;
  isOpen: boolean;
}

const ValidatorSquadContent: FunctionComponent<ValidatorSquadContentProps> =
  observer(({ onRequestClose, isOpen }) => {
    const { chainStore, queriesStore, accountStore } = useStore();
    const t = useTranslation();
    const [sorting, setSorting] = useState<SortingState>([]);

    const { chainId } = chainStore.osmosis;
    const queries = queriesStore.get(chainId);
    const account = accountStore.getWallet(chainId);

    const columnHelper = createColumnHelper<Validator>();

    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded
    );

    const totalStakePool = queries.cosmos.queryPool.bondedTokens;

    const activeValidators = queryValidators.validators;

    const userValidatorDelegations =
      queries.cosmos.queryDelegations.getQueryBech32Address(
        account?.address ?? ""
      ).delegations;

    const userValidatorDelegationsByValidatorAddress = useMemo(() => {
      return userValidatorDelegations.reduce((delegations, delegation) => {
        delegations[delegation.delegation.validator_address] = delegation;
        return delegations;
      }, {} as { [x: string]: Staking.Delegation });
    }, [userValidatorDelegations]);

    const data: Validator[] = useMemo(
      () =>
        activeValidators
          .filter((validator) => Boolean(validator.description.moniker))
          .map((validator) => ({
            validatorName: validator.description.moniker,
            myStake: new CoinPretty(
              totalStakePool.currency,
              new Dec(
                validator.operator_address in
                userValidatorDelegationsByValidatorAddress
                  ? userValidatorDelegationsByValidatorAddress[
                      validator.operator_address
                    ].balance?.amount || 0
                  : 0
              )
            )
              .maxDecimals(2)
              .hideDenom(true)
              .toString(),
            votingPower: new RatePretty(
              new Dec(validator.tokens).quo(totalStakePool.toDec())
            )
              .moveDecimalPointLeft(6)
              .maxDecimals(2)
              .toString(),
            commissions: validator.commission.commission_rates.rate,
            website: validator.description.website,
            imageUrl: queryValidators.getValidatorThumbnail(
              validator.operator_address
            ),
          })),
      [
        activeValidators,
        totalStakePool,
        queryValidators,
        userValidatorDelegationsByValidatorAddress,
      ]
    );

    const columns = useMemo<ColumnDef<Validator>[]>(
      () => [
        {
          id: "validatorSquadTable",
          columns: [
            columnHelper.accessor((row) => row, {
              cell: observer((props: CellContext<any, any>) => {
                return (
                  <div className="flex items-center gap-3">
                    {/*  input placeholder */}
                    <input type="radio" />
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
                            {props.row.original.website}
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
              header: () => "Validator",
              id: "validatorName",
            }),
            {
              accessorKey: "myStake",
              header: () => "My Stake",
            },
            {
              accessorKey: "votingPower",
              header: () => "Voting Power",
            },
            {
              accessorKey: "commissions",
              header: () => "Commissions",
              cell: (props) =>
                new RatePretty(props.row.original.commissions).toString(),
            },
          ],
        },
      ],
      [columnHelper]
    );

    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
      },
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
    });

    const handleSearchInput = () => console.log("search");

    return (
      <ModalBase
        title={t("stake.validatorSquad.title")}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        // className="flex !h-full !max-h-[938px] !max-w-[1168px] flex-col"
        className="flex !max-w-[1168px] flex-col"
      >
        <div className="mx-auto mb-9 flex max-w-[500px] flex-col items-center justify-center">
          <div className="mt-7 mb-3 font-medium">
            {t("stake.validatorSquad.description")}
          </div>
          <SearchBox
            placeholder={t("stake.validatorSquad.searchPlaceholder")}
            onInput={handleSearchInput}
            className="self-end"
            size="full"
          />
        </div>
        <div className="max-h-[528px] overflow-y-scroll">
          <table className="w-full">
            <thead className="sticky top-0 m-0">
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
                                    className={classNames(
                                      "h-[16px] w-[7px]",
                                      IS_FRONTIER
                                        ? "text-white-full"
                                        : "text-osmoverse-300"
                                    )}
                                  />
                                ),
                                desc: (
                                  <Icon
                                    id="sort-down"
                                    className={classNames(
                                      "h-[16px] w-[7px]",
                                      IS_FRONTIER
                                        ? "text-white-full"
                                        : "text-osmoverse-300"
                                    )}
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
              {table
                .getRowModel()
                .rows.slice(0, 10)
                .map((row) => {
                  return (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => {
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
                })}
            </tbody>
          </table>
        </div>
        <div className="mb-6 flex justify-center justify-self-end">
          <Button
            mode="special-1"
            onClick={() => console.log("set squad")}
            className="w-[383px]"
          >
            Set Squad
          </Button>
        </div>
      </ModalBase>
    );
  });
