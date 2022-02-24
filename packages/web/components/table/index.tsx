import Image from "next/image";
import React, { PropsWithoutRef, useState, useCallback } from "react";
import classNames from "classnames";
import Tippy from "@tippyjs/react";
import { nanoid } from "nanoid";
import { replaceAt } from "../utils";
import { CustomClasses } from "../types";
import { BaseCell, ColumnDef, RowDef } from "./types";

export interface Props<TCell extends BaseCell> extends CustomClasses {
  /** Functionality common to all columns. */
  columnDefs: ColumnDef<TCell>[];
  /** Functionality common to all rows. */
  rowDefs?: RowDef[];
  data: Partial<TCell>[][];
}

/** Generic table that accepts a 2d array of any type of data cell,
 *  as well as row and column definitions that dictate header and cell appearance & behavior.
 */
export const Table = <TCell extends BaseCell = BaseCell>({
  columnDefs,
  rowDefs,
  data,
  className,
}: PropsWithoutRef<Props<TCell>>) => {
  const [rowsHovered, setRowsHovered] = useState(() => data.map(() => false));

  const setRowHovered = useCallback(
    (rowIndex: number, value: boolean) =>
      setRowsHovered(replaceAt(value, rowsHovered, rowIndex)),
    [rowsHovered]
  );

  return (
    <table className={className}>
      <thead>
        <tr className="h-20">
          {columnDefs.map((colDef, colIndex) => (
            <th
              key={nanoid()}
              className={classNames(
                {
                  "cursor-pointer select-none": colDef?.sort?.onClickHeader,
                },
                colDef.className
              )}
              onClick={() => colDef?.sort?.onClickHeader(colIndex)}
            >
              <span>
                {colDef?.display ? (
                  typeof colDef.display === "string" ? (
                    colDef.display ?? ""
                  ) : (
                    <>{colDef.display}</>
                  )
                ) : (
                  ""
                )}
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
                  <Tippy
                    className="bg-surface border border-secondary-200/30 p-2 rounded-lg text-body2"
                    content={colDef.infoTooltip}
                    trigger="click"
                  >
                    <div
                      className="inline cursor-pointer pl-1 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
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
          const rowHovered = rowsHovered[rowIndex] ?? false;

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
                  ? rowDef?.makeHoverClass?.(rowIndex) || "bg-card"
                  : undefined
              )}
              onClick={() => rowDef?.onClick?.(rowIndex)}
              onMouseEnter={() => setRowHovered(rowIndex, true)}
              onMouseLeave={() => setRowHovered(rowIndex, false)}
            >
              {row.map((cell, columnIndex) => {
                const DisplayCell = columnDefs[columnIndex]?.displayCell;
                const customClass = columnDefs[columnIndex]?.className;

                return (
                  <td className={customClass} key={`${rowIndex}${columnIndex}`}>
                    {DisplayCell ? (
                      <DisplayCell rowHovered={rowHovered} {...cell} />
                    ) : (
                      cell.value ?? ""
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
