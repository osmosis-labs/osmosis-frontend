import { ColumnDef, BaseCell } from ".";
import { MenuOption } from "../control";
import { SortDirection } from "../types";

export type MenuColumn<TCell extends BaseCell> = {
  id: string;
  display: string;
} & Pick<ColumnDef<TCell>, "infoTooltip" | "displayCell">;

/**
 * Helper to create `ColumnDef`s for a table that is controlled by a `<SortMenu />` component.
 * Especially useful if all sort metrics have a column in the table.
 *
 * @param menuColumns Minimal definition of a column.
 * @param sortPath Current sort object key path. Used by `useSortedData` hook. Must equal a unique `id` in `menuColumns`.
 * @param setSortPath Callback to set the current sort key path.
 * @param sortDirection Current direction the current column is being sorted.
 * @param setSortDirection Callback to set current sort direction.
 * @returns Objects that can jointly be used in the `<SortMenu options />` and `<Table columnDefs />` props.
 */
export function makeMenuControlledColumnDefs<TCell extends BaseCell>(
  menuColumns: MenuColumn<TCell>[],
  sortPath: string,
  setSortPath: (path: string) => void,
  sortDirection: SortDirection,
  setSortDirection: (direction: SortDirection) => void
): (ColumnDef<TCell> & MenuOption)[] {
  return menuColumns.map(({ id, display, infoTooltip, displayCell }) => ({
    id: id,
    display: display,
    sort:
      sortPath === id
        ? {
            currentDirection: sortDirection,
            onClickHeader: () =>
              setSortDirection(
                sortDirection === "ascending" ? "descending" : "ascending"
              ),
          }
        : {
            onClickHeader: () => {
              setSortPath(id);
              setSortDirection("ascending");
            },
          },
    infoTooltip,
    displayCell,
  }));
}
