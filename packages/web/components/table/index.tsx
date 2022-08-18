import Image from "next/image";
import Link from "next/link";
import React, {
  PropsWithoutRef,
  useState,
  useCallback,
  FunctionComponent,
} from "react";
import classNames from "classnames";
import { InfoTooltip } from "../tooltip";
import { CustomClasses } from "../types";
import { replaceAt } from "../utils";
import { BaseCell, ColumnDef, RowDef } from "./types";
import { useWindowSize } from "../../hooks";
import { IS_FRONTIER } from "../../config";

export interface Props<TCell extends BaseCell> extends CustomClasses {
  /** Functionality common to all columns. */
  columnDefs: ColumnDef<TCell>[];
  /** Functionality common to all rows.
   *  Supply an array to configure specific rows, otherwise def is applied to all rows.
   */
  rowDefs?: RowDef[] | RowDef;
  /** Table of partial data objects. Each custom `ColumnDef.displayCell` component is required to check
   *  for relevant data regardless, thus not requiring all data in each cell in table.
   */
  data: Partial<TCell>[][];
  headerTrClassName?: string;
  tHeadClassName?: string;
  tBodyClassName?: string;
}

/** Generic table that accepts a 2d array of any type of data cell,
 *  as well as row and column definitions that dictate header and cell appearance & behavior.
 */
export const Table = <TCell extends BaseCell>({
  columnDefs,
  rowDefs,
  data,
  className,
  headerTrClassName,
  tHeadClassName,
  tBodyClassName,
}: PropsWithoutRef<Props<TCell>>) => {
  const { width } = useWindowSize();

  const [rowsHovered, setRowsHovered] = useState(() => data.map(() => false));

  const setRowHovered = useCallback(
    (rowIndex: number, value: boolean) =>
      setRowsHovered(
        replaceAt(
          value,
          data.map(() => false),
          rowIndex
        )
      ),
    []
  );

  return (
    <table className={classNames("overflow-y-scroll", className)}>
      <thead className={tHeadClassName}>
        <tr className={classNames("h-20", headerTrClassName)}>
          {columnDefs.map((colDef, colIndex) => {
            if (colDef.collapseAt && width < colDef.collapseAt) {
              return null;
            }

            return (
              <th
                key={colIndex}
                className={classNames(
                  {
                    "cursor-pointer select-none": colDef?.sort?.onClickHeader,
                  },
                  colDef.className
                )}
                onClick={() => colDef?.sort?.onClickHeader(colIndex)}
              >
                <ClickableContent
                  isButton={colDef?.sort?.onClickHeader !== undefined}
                >
                  <span>
                    {colDef?.display ? (
                      typeof colDef.display === "string" ? (
                        colDef.display
                      ) : (
                        <>{colDef.display}</>
                      )
                    ) : null}
                    {colDef?.sort && (
                      <div className="inline pl-1 align-middle">
                        {colDef?.sort?.currentDirection === "ascending" ? (
                          <Image
                            alt="ascending"
                            src={
                              IS_FRONTIER
                                ? "/icons/sort-up-white.svg"
                                : "/icons/sort-up.svg"
                            }
                            height={16}
                            width={16}
                          />
                        ) : colDef?.sort?.currentDirection === "descending" ? (
                          <Image
                            alt="descending"
                            src={
                              IS_FRONTIER
                                ? "/icons/sort-down-white.svg"
                                : "/icons/sort-down.svg"
                            }
                            height={16}
                            width={16}
                          />
                        ) : undefined}
                      </div>
                    )}
                    {colDef.infoTooltip && (
                      <InfoTooltip content={colDef.infoTooltip} />
                    )}
                  </span>
                </ClickableContent>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className={tBodyClassName}>
        {data.map((row, rowIndex) => {
          const rowDef =
            rowDefs && Array.isArray(rowDefs) ? rowDefs[rowIndex] : rowDefs;
          const rowHovered = rowsHovered[rowIndex] ?? false;
          const rowIsButton =
            rowDef !== undefined && rowDef.onClick && !rowDef.link;

          return (
            <tr
              key={rowIndex}
              className={classNames(
                "h-20 shadow-separator bg-surface",
                rowDef?.makeClass?.(rowIndex),
                {
                  "focus-within:bg-card focus-within:outline-none":
                    rowDef?.link,
                },
                rowHovered && rowDef?.makeHoverClass
                  ? `cursor-pointer ${rowDef.makeHoverClass(rowIndex)}`
                  : undefined
              )}
              onMouseEnter={() => setRowHovered(rowIndex, true)}
              onMouseLeave={() => setRowHovered(rowIndex, false)}
              onClick={() => {
                if (rowIsButton) {
                  rowDef.onClick?.(rowIndex);
                }
              }}
            >
              {row.map((cell, columnIndex) => {
                const DisplayCell = columnDefs[columnIndex]?.displayCell;
                const customClass = columnDefs[columnIndex]?.className;
                const collapseAt = columnDefs[columnIndex]?.collapseAt;

                if (collapseAt && width < collapseAt) {
                  return null;
                }

                return (
                  <td className={customClass} key={`${rowIndex}${columnIndex}`}>
                    <ClickableContent isButton={rowIsButton}>
                      {rowDef?.link ? (
                        <Link href={rowDef?.link}>
                          <a
                            className="focus:outline-none"
                            tabIndex={columnIndex > 0 ? -1 : 0}
                          >
                            {DisplayCell ? (
                              <DisplayCell rowHovered={rowHovered} {...cell} />
                            ) : (
                              cell.value
                            )}
                          </a>
                        </Link>
                      ) : DisplayCell ? (
                        <DisplayCell rowHovered={rowHovered} {...cell} />
                      ) : (
                        cell.value
                      )}
                    </ClickableContent>
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

/** Wrap non-link non-visual content in a button for Ax users. */
const ClickableContent: FunctionComponent<{ isButton?: boolean }> = ({
  isButton = false,
  children,
}) => (isButton ? <button>{children}</button> : <>{children}</>);

export * from "./types";
