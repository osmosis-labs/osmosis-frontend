import Image from "next/image";
import React, { PropsWithoutRef, useState } from "react";
import classNames from "classnames";
import Tippy from "@tippyjs/react";
import { SortDirection } from "../types";
import { replaceAt } from "../utils";

export interface BaseCell {
  value: string;
  rowHovered: boolean;
}

export interface ColumnSortDef {
  currentDirection?: SortDirection;
  onClickHeader: (colIndex: number) => void;
}

export interface ColumnDef<CellT extends BaseCell> {
  header?: string;
  sort?: ColumnSortDef;
  infoTooltip?: string;
  /** If provided, will be used to render the cell for each row in this column.
   *
   * Note: components must accept optionals for all cell data and check for the data they need.
   */
  displayCell?: React.FunctionComponent<Partial<CellT>>;
}

export interface RowDef {
  makeClass?: (rowIndex: number) => string;
  makeHoverClass?: (rowIndex: number) => string;
  onClick?: (rowIndex: number) => void;
}

export interface Props<CellT extends BaseCell> {
  columnDefs: ColumnDef<CellT>[];
  rowDefs?: RowDef[];
  data: Partial<CellT>[][];
}

/** Generic table that accepts a 2d array of any type of data cell,
 *  as well as row and column definitions that dictate header and cell appearance & behavior.
 */
export const Table = <CellT extends BaseCell>({
  columnDefs,
  rowDefs,
  data,
}: PropsWithoutRef<Props<CellT>>) => {
  const [rowsHovered, setRowsHovered] = useState(data.map(() => false));

  const setRowHovered = (rowIndex: number, value: boolean) =>
    setRowsHovered(replaceAt(value, rowsHovered, rowIndex));

  return (
    <table className="">
      <thead>
        <tr className="h-20">
          {columnDefs.map((colDef, colIndex) => (
            <th
              key={colIndex}
              className={classNames({
                "cursor-pointer select-none": colDef?.sort?.onClickHeader,
              })}
              onClick={() => colDef?.sort?.onClickHeader(colIndex)}
            >
              <span>
                {colDef?.header ?? ""}
                <div className="inline pl-1 align-middle">
                  {colDef?.sort?.currentDirection === "ascending" ? (
                    <Image
                      alt="ascending"
                      src="/icons/arrow-down.svg"
                      height={16}
                      width={16}
                    />
                  ) : colDef?.sort?.currentDirection === "descending" ? (
                    <Image
                      alt="descending"
                      src="/icons/arrow-up.svg"
                      height={16}
                      width={16}
                    />
                  ) : undefined}
                </div>
                {colDef.infoTooltip && (
                  <Tippy
                    className="bg-wireframes-darkGrey border border-white-faint p-2 rounded-lg text-caption text-sm"
                    content={colDef.infoTooltip}
                    trigger="click"
                  >
                    <div className="inline cursor-pointer pl-2 align-middle">
                      <Image
                        alt="info"
                        src="/icons/info.svg"
                        height={16}
                        width={16}
                      />
                    </div>
                  </Tippy>
                )}
              </span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => {
          const rowDef = rowDefs?.[rowIndex];
          const rowHovered = rowsHovered[rowIndex];

          return (
            <tr
              key={rowIndex}
              className={classNames(
                "h-20 shadow-separator bg-surface",
                rowDef?.makeClass?.(rowIndex),
                {
                  "cursor-pointer select-none": rowDef?.onClick !== undefined,
                },
                rowHovered
                  ? `${rowDef?.makeHoverClass?.(rowIndex)} bg-card`
                  : undefined
              )}
              onClick={() => rowDef?.onClick?.(rowIndex)}
              onMouseEnter={() => setRowHovered(rowIndex, true)}
              onMouseLeave={() => setRowHovered(rowIndex, false)}
            >
              {row.map((cell, columnIndex) => {
                const DisplayCell = columnDefs[columnIndex]?.displayCell;

                return (
                  <td key={`${rowIndex}${columnIndex}`}>
                    {DisplayCell ? (
                      <DisplayCell rowHovered={rowHovered} {...cell} />
                    ) : (
                      cell.value
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
