import { Dec } from "@keplr-wallet/unit";
import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { memo, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { ExternalLinkIcon, Icon } from "~/components/assets";
import { CheckBox } from "~/components/control";
import { Tooltip } from "~/components/tooltip";
import { theme } from "~/tailwind.config";

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
  imageUrl: string;
  isAPRTooHigh: boolean;
  isVotingPowerTooHigh: boolean;
};

export const ValidatorSquadTable = memo(
  ({
    filteredValidators,
    sorting,
    setSorting,
    setRowSelection,
    rowSelection,
  }: {
    filteredValidators: FormattedValidator[];
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
    setRowSelection: React.Dispatch<React.SetStateAction<{}>>;
    rowSelection: {};
  }) => {
    // i18n
    const t = useTranslation();

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

    const { rows } = table.getRowModel();

    return (
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
                            onClick: header.column.getToggleSortingHandler(),
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
    );
  }
);
