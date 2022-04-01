import Image from "next/image";
import Link from "next/link";
import React, { FunctionComponent, PropsWithoutRef, useState } from "react";
import classNames from "classnames";
import { InfoTooltip } from "../tooltip";
import { CustomClasses, SortDirection } from "../types";
import { replaceAt } from "../utils";

export interface BaseCell {
  value?: string;
  rowHovered?: boolean;
}

export interface ColumnSortDef {
  currentDirection?: SortDirection;
  onClickHeader: (colIndex: number) => void;
}

export interface ColumnDef<TCell> {
  display: string;
  displayClassName?: string;
  sort?: ColumnSortDef;
  infoTooltip?: string;
  /** If provided, will be used to render the cell for each row in this column.
   *
   * Note: components must accept optionals for all cell data and check for the data they need.
   */
  displayCell?: FunctionComponent<Partial<TCell>>;
}

export interface RowDef {
  makeClass?: (rowIndex: number) => string;
  makeHoverClass?: (rowIndex: number) => string;
  link?: string;
}

export interface TableProps<TCell> extends CustomClasses {
  columnDefs: ColumnDef<TCell>[];
  rowDefs?: RowDef[];
  data: Partial<TCell>[][];
}

/** Generic table that accepts a 2d array of any type of data cell,
 *  as well as row and column definitions that dictate header and cell appearance & behavior.
 */
export const Table = <TCell extends BaseCell>({
  columnDefs,
  rowDefs,
  data,
  className,
}: PropsWithoutRef<TableProps<TCell>>) => {
  const [rowsHovered, setRowsHovered] = useState(data.map(() => false));

  const setRowHovered = (rowIndex: number, value: boolean) =>
    setRowsHovered(replaceAt(value, rowsHovered, rowIndex));

  return (
    <table className={className}>
      <thead>
        <tr className="h-20">
          {columnDefs.map((colDef, colIndex) => (
            <th
              key={colIndex}
              className={classNames(
                {
                  "cursor-pointer select-none": colDef?.sort?.onClickHeader,
                },
                colDef?.displayClassName
              )}
              onClick={() => colDef?.sort?.onClickHeader(colIndex)}
            >
              <span>
                {colDef?.display ?? ""}
                <div className="inline pl-1 align-middle">
                  {colDef?.sort?.currentDirection === "ascending" ? (
                    <Image
                      alt="ascending"
                      src="/icons/arrow-up.svg"
                      height={16}
                      width={16}
                    />
                  ) : colDef?.sort?.currentDirection === "descending" ? (
                    <Image
                      alt="descending"
                      src="/icons/arrow-down.svg"
                      height={16}
                      width={16}
                    />
                  ) : undefined}
                </div>
                {colDef.infoTooltip && (
                  <InfoTooltip content={colDef.infoTooltip} />
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
                  "focus-within:bg-card focus-within:outline-none":
                    rowDef?.link !== undefined,
                },
                rowHovered
                  ? `${rowDef?.makeHoverClass?.(rowIndex)} bg-card`
                  : undefined
              )}
              onMouseEnter={() => setRowHovered(rowIndex, true)}
              onMouseLeave={() => setRowHovered(rowIndex, false)}
            >
              {row.map((cell, columnIndex) => {
                const DisplayCell = columnDefs[columnIndex]?.displayCell;

                return (
                  <td key={`${rowIndex}${columnIndex}`}>
                    {rowDef?.link ? (
                      <Link href={rowDef?.link}>
                        <a
                          className="focus:outline-none"
                          tabIndex={columnIndex > 0 ? -1 : 0}
                        >
                          {DisplayCell ? <DisplayCell {...cell} /> : cell.value}
                        </a>
                      </Link>
                    ) : DisplayCell ? (
                      <DisplayCell {...cell} />
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
