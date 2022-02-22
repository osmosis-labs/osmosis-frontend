import { ReactElement } from "react";
import { SortDirection, CustomClasses } from "../types";

export interface BaseCell {
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
}

export interface RowDef {
  makeClass?: (rowIndex: number) => string;
  makeHoverClass?: (rowIndex: number) => string;
  onClick?: (rowIndex: number) => void;
}
