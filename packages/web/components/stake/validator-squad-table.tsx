import { Dec } from "@keplr-wallet/unit";
import { flexRender } from "@tanstack/react-table";
import { Table } from "@tanstack/react-table";
import { memo } from "react";

import { Icon } from "~/components/assets";
import { useTranslation } from "~/hooks";

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

interface ValidatorSquadTableProps {
  table: Table<FormattedValidator>;
}

export const ValidatorSquadTable = memo(
  ({ table }: ValidatorSquadTableProps) => {
    const { t } = useTranslation();
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
