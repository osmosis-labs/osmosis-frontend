import classNames from "classnames";

import { Icon } from "~/components/assets";
import { CustomClasses } from "~/components/types";
import type { SortDirection } from "~/utils/sort";

type SortHeaderProps<TSortKey extends string | undefined> = {
  label: string;
  sortKey: NonNullable<TSortKey>;
  currentSortKey: TSortKey | undefined;
  currentDirection: SortDirection;
  setSortKey: (key: TSortKey | undefined) => void;
  setSortDirection: (direction: SortDirection) => void;
};

export const SortHeader = <TSortKey extends string | undefined>({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  setSortDirection,
  setSortKey,
  className,
}: SortHeaderProps<TSortKey> & CustomClasses) => (
  <button
    className={classNames(
      "ml-auto flex h-6 items-center justify-center gap-1",
      className
    )}
    onClick={() => {
      if (currentSortKey !== sortKey) {
        // select to sort and start descending
        setSortKey(sortKey as TSortKey);
        setSortDirection("desc");
        return;
      } else if (currentSortKey === sortKey && currentDirection === "desc") {
        // toggle sort direction
        setSortDirection("asc");
        return;
      } else if (currentSortKey === sortKey && currentDirection === "asc") {
        // deselect
        setSortKey(undefined);
        setSortDirection("desc");
      }
    }}
  >
    <span>{label}</span>
    {currentSortKey === sortKey && (
      <Icon
        width={10}
        height={6}
        className={classNames(
          "ml-1 transform text-osmoverse-400 transition-transform",
          {
            "rotate-180": currentDirection === "asc",
          }
        )}
        id="triangle-down"
      />
    )}
  </button>
);
