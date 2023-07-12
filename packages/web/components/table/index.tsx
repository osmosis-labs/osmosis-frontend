import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, {
  FunctionComponent,
  PropsWithoutRef,
  useCallback,
  useState,
} from "react";

import { useWindowSize } from "~/hooks";

import { IS_FRONTIER } from "../../config";
import { replaceAt } from "../../utils/array";
import { Icon } from "../assets";
import { InfoTooltip } from "../tooltip";
import { CustomClasses } from "../types";
import { BaseCell, ColumnDef, RowDef } from "./types";

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
  const router = useRouter();

  // pass row hovered to cell components. Tailwind preferred for tr/tds.
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
    [data]
  );

  return (
    <table className={classNames("overflow-y-scroll", className)}>
      <thead className={tHeadClassName}>
        <tr className={classNames("px-10 py-5", headerTrClassName)}>
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
                  <div>
                    {colDef?.display ? (
                      typeof colDef.display === "string" ? (
                        <span className="subtitle1 text-osmoverse-300">
                          {colDef.display}
                        </span>
                      ) : (
                        <>{colDef.display}</>
                      )
                    ) : null}
                    {colDef?.sort && (
                      <div className="inline pl-1 align-middle">
                        {colDef?.sort?.currentDirection === "ascending" ? (
                          <Icon
                            id="sort-up"
                            className={classNames(
                              "h-[16px] w-[16px]",
                              IS_FRONTIER
                                ? "text-white-full"
                                : "text-osmoverse-300"
                            )}
                          />
                        ) : colDef?.sort?.currentDirection === "descending" ? (
                          <Icon
                            id="sort-down"
                            className={classNames(
                              "h-[16px] w-[16px]",
                              IS_FRONTIER
                                ? "text-white-full"
                                : "text-osmoverse-300"
                            )}
                          />
                        ) : undefined}
                      </div>
                    )}
                    {colDef.infoTooltip && (
                      <InfoTooltip content={colDef.infoTooltip} />
                    )}
                  </div>
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
                "h-20 transition-colors",
                rowDef?.makeClass?.(rowIndex),
                {
                  "focus-within:bg-osmoverse-700 focus-within:outline-none":
                    rowDef?.link,
                  " hover:cursor-pointer hover:bg-osmoverse-800":
                    rowDef?.onClick,
                },
                rowDef?.makeHoverClass
                  ? `cursor-pointer ${rowDef.makeHoverClass(rowIndex)}`
                  : undefined
              )}
              onMouseEnter={() => setRowHovered(rowIndex, true)}
              onMouseLeave={() => setRowHovered(rowIndex, false)}
              onClick={() => {
                if (rowDef?.link) {
                  router.push(rowDef.link);
                } else rowDef?.onClick?.(rowIndex);
              }}
            >
              {/* layout row's cells */}
              {row.map((cell, columnIndex) => {
                const DisplayCell = columnDefs[columnIndex]?.displayCell;
                const customClass = columnDefs[columnIndex]?.className;
                const collapseAt = columnDefs[columnIndex]?.collapseAt;

                if (collapseAt && width < collapseAt) {
                  return null;
                }

                return (
                  <td
                    className={classNames(
                      "subtitle1",
                      {
                        "rounded-l-2xl": columnIndex === 0,
                        "rounded-r-2xl":
                          columnDefs &&
                          Array.isArray(columnDefs) &&
                          columnIndex === columnDefs.length - 1,
                      },
                      customClass
                    )}
                    key={`${rowIndex}${columnIndex}`}
                  >
                    <ClickableContent isButton={rowIsButton}>
                      {rowDef?.link ? (
                        <Link
                          href={rowDef?.link}
                          className="focus:outline-none"
                          tabIndex={columnIndex > 0 ? -1 : 0}
                        >
                          {DisplayCell ? (
                            <DisplayCell rowHovered={rowHovered} {...cell} />
                          ) : (
                            cell.value
                          )}
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
