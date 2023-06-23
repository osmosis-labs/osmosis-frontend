import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";
import { useMemo } from "react";

import { Icon } from "~/components/assets";
import { SearchBox } from "~/components/input";
import { IS_FRONTIER } from "~/config/index";
import { ModalBase, ModalBaseProps } from "~/modals/base";

export const ValidatorSquadModal: FunctionComponent<ModalBaseProps> = observer(
  (props) => <ValidatorSquadContent {...props} />
);

const data = [
  ["Cosmostation", "0.00", "8.44%", "5%"],
  ["Figment", "0.00", "8.44%", "5%"],
  ["Stargaze", "0.00", "8.44%", "5%"],
  ["Frens", "0.00", "8.44%", "5%"],
  ["Figment", "0.00", "8.44%", "5%"],
  ["interchain.fm", "0.00", "8.44%", "5%"],
  ["imperator.co", "0.00", "8.44%", "5%"],
  ["Chorus One", "0.00", "8.44%", "5%"],
  ["Electric", "0.00", "8.44%", "5%"],
  ["wosmongton", "0.00", "8.44%", "5%"],
];

type Validator = {
  validator: string;
  myStake: number;
  votingPower: number;
  comissions: number;
};

interface ValidatorSquadContentProps {
  onRequestClose: () => void;
  isOpen: boolean;
}

const ValidatorSquadContent: FunctionComponent<ValidatorSquadContentProps> =
  observer(({ onRequestClose, isOpen }) => {
    const columnHelper = createColumnHelper<Validator>();

    const virtualRows = data;
    const rows = data;

    const columns = useMemo(
      () => [
        columnHelper.accessor((row) => row, {
          cell: "hello world",
          header: "Validator",
          id: "validator",
          sortDescFirst: false,
        }),
        columnHelper.accessor((row) => row, {
          cell: "hello world",
          header: "My stake",
          id: "myStake",
          sortDescFirst: false,
        }),
        columnHelper.accessor((row) => row, {
          cell: "hello world",
          header: "Voting power",
          id: "votingPower",
          sortDescFirst: false,
        }),
        columnHelper.accessor((row) => row, {
          cell: "hello world",
          header: "Commissions",
          id: "comissions",
          sortDescFirst: false,
        }),
      ],
      [columnHelper]
    );

    const table = useReactTable({
      data,
      // @ts-ignore
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      manualSorting: true,
    });

    const paddingTop = 0;
    const topOffset = 324;

    const handleSearchInput = () => console.log("search");

    return (
      <ModalBase
        title="Validator Squad"
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        className="!max-h-[938px] !max-w-[1168px]"
      >
        <div className="flex flex-col overflow-auto">
          <div className="mx-auto mb-9 flex max-w-[500px] flex-col items-center justify-center">
            <div className="mt-7 mb-3 font-medium">
              Select the validators you’d like to delegate to. Once complete,
              continue to stake. You may edit your validator set at any time.
            </div>
            <SearchBox
              placeholder="Search for a validator"
              onInput={handleSearchInput}
              className="self-end"
              size="full"
            />
          </div>
          <table className="w-full">
            <thead className="z-[51] m-0">
              {table.getHeaderGroups().map((headerGroup) => (
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
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop - topOffset}px` }} />
                </tr>
              )}
              {/* update to virtual rows */}
              {virtualRows.map((virtualRow, i) => {
                // const row = rows[virtualRow.index] as Row<ObservablePoolWithMetric>;
                const row = rows[i];
                console.log("virtual row: ", virtualRow);
                return (
                  <tr
                    // key={row.id}
                    key={i}
                    className="transition-colors focus-within:bg-osmoverse-700 focus-within:outline-none hover:cursor-pointer hover:bg-osmoverse-800"
                    // ref={i === virtualRows.length - 1 ? intersectionRef : null}
                  >
                    {row.map((cell) => {
                      return (
                        <td key={i} onClick={(e) => e.stopPropagation()}>
                          {cell}
                          {/* {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )} */}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {/* {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom - topOffset}px` }} />
              </tr>
            )} */}
            </tbody>
          </table>
        </div>
      </ModalBase>
    );
  });
