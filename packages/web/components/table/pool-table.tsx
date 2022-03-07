import Tippy from "@tippyjs/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { PropsWithoutRef, useState } from "react";
import { replaceAt } from "../utils";
import { TableProps } from "./base";
import { MetricLoaderCell, PoolCompositionCell } from "./cells";

type PoolTableCell = PoolCompositionCell | MetricLoaderCell;

export const PoolTable = observer(
  ({
    columnDefs,
    rowDefs,
    data,
    className,
  }: PropsWithoutRef<TableProps<PoolTableCell>>) => {
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
                        <DisplayCell {...cell} />
                      ) : (
                        cell.value?.toString()
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
  }
);
