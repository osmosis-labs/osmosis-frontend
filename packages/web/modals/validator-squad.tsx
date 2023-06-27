import { Staking } from "@keplr-wallet/stores";
import {
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

import { Icon } from "~/components/assets";
import { SearchBox } from "~/components/input";
import { IS_FRONTIER } from "~/config/index";
import { ModalBase, ModalBaseProps } from "~/modals/base";

import { useStore } from "../stores";

export const ValidatorSquadModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => <ValidatorSquadContent {...props} />
);

const data: Validator[] = [
  {
    validatorName: "Cosmostation",
    myStake: "0.01",
    votingPower: "1.44%",
    commissions: "1%",
  },
  {
    validatorName: "Figment",
    myStake: "0.02",
    votingPower: "2.44%",
    commissions: "2%",
  },
  {
    validatorName: "Stargaze",
    myStake: "0.03",
    votingPower: "3.44%",
    commissions: "3%",
  },
  {
    validatorName: "Frens",
    myStake: "0.04",
    votingPower: "4.44%",
    commissions: "4%",
  },
  {
    validatorName: "Figment",
    myStake: "0.05",
    votingPower: "5.44%",
    commissions: "5%",
  },
  {
    validatorName: "interchain.fm",
    myStake: "0.06",
    votingPower: "6.44%",
    commissions: "6%",
  },
  {
    validatorName: "imperator.co",
    myStake: "0.07",
    votingPower: "7.44%",
    commissions: "7%",
  },
  {
    validatorName: "Chorus One",
    myStake: "0.08",
    votingPower: "8.44%",
    commissions: "8%",
  },
  {
    validatorName: "Electric",
    myStake: "0.09",
    votingPower: "9.44%",
    commissions: "9%",
  },
  {
    validatorName: "wosmongton",
    myStake: "0.10",
    votingPower: "10.44%",
    commissions: "10%",
  },
];

type Validator = {
  validatorName: string;
  myStake: string;
  votingPower: string;
  commissions: string;
};

interface ValidatorSquadContentProps {
  onRequestClose: () => void;
  isOpen: boolean;
}

const ValidatorSquadContent: FunctionComponent<ValidatorSquadContentProps> =
  observer(({ onRequestClose, isOpen }) => {
    const { chainStore, queriesStore, accountStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const queries = queriesStore.get(chainId);

    const account = accountStore.getWallet(chainId);

    const queryValidators = queries.cosmos.queryValidators.getQueryStatus(
      Staking.BondStatus.Bonded
    );

    const activeValidators = queryValidators.validators;

    const userValidatorDelegations =
      queries.cosmos.queryDelegations.getQueryBech32Address(
        account?.address ?? ""
      ).delegations;

    console.log("activeValidators: ", activeValidators);
    console.log("userValidatorDelegations: ", userValidatorDelegations);

    const t = useTranslation();

    const columnHelper = createColumnHelper<Validator>();

    const [sorting, setSorting] = useState<SortingState>([]);

    const columns = useMemo<ColumnDef<Validator>[]>(
      () => [
        {
          id: "validatorSquadTable",
          columns: [
            {
              accessorKey: "validatorName",
              header: () => "Validator",
            },
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
        className="!max-h-[938px] !max-w-[1168px]"
      >
        <div className="flex flex-col overflow-auto">
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
          <table className="w-full">
            <thead className="z-[51] m-0">
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
      </ModalBase>
    );
  });
