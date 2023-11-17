import { ReactElement } from "react";

import { CustomClasses, SortDirection } from "~/components/types";
import { Breakpoint } from "~/components/types";

export interface BaseCell {
  /** "Default" value to be rendered.
   * Leave undefined if using a custom ReactElement to render the cell
   * (or have that component accept `value` in it's props). */
  value?: string;
  rowHovered?: boolean;
}

export interface ColumnSortDef {
  currentDirection?: SortDirection;
  onClickHeader: (colIndex: number) => void;
}

export interface ColumnDef<TCell extends BaseCell> extends CustomClasses {
  /** Header label or element. */
  display: string | ReactElement;
  /** If set, will enable column header as sort control. */
  sort?: ColumnSortDef;
  /** If set, will show a 'i' icon tooltip for hover. */
  infoTooltip?: string;
  /** If provided, will be used to render the cell for each row in this column.
   *
   *  Note: components must accept optionals for all cell data and check for the data they need. */
  displayCell?: React.FunctionComponent<Partial<TCell>>;
  /** Use to make your table responsive. Uses `use-window-size/Breakpoint` to incrementally
   *  remove whole columns from display as the screen shrinks in order from `XXL` to `MD` size.
   */
  collapseAt?: Breakpoint;
}

export interface RowDef {
  makeClass?: (rowIndex: number) => string;
  makeHoverClass?: (rowIndex: number) => string;
  onClick?: (rowIndex: number) => void;
  /** Overrides `onClick`, will use next/link if row is clicked. */
  link?: string;
}
