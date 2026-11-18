import type { SortDirection } from "@osmosis-labs/utils";
import classNames from "classnames";
import type { PropsWithChildren } from "react";

import { Icon } from "~/components/assets";
import { CustomClasses, Disableable } from "~/components/types";

type SortHeaderProps<TSortKey extends string | undefined> = PropsWithChildren<{
  label: string;
  sortKey: NonNullable<TSortKey>;
  currentSortKey: TSortKey | undefined;
  currentDirection: SortDirection;
  setSortKey: (key: TSortKey | undefined) => void;
  setSortDirection: (direction: SortDirection) => void;
}>;

export const SortHeader = <TSortKey extends string | undefined>({
  label,
  sortKey,
  currentSortKey,
  currentDirection,
  setSortDirection,
  setSortKey,
  className,
  disabled,
  children,
}: SortHeaderProps<TSortKey> & CustomClasses & Disableable) => {
  const button = (
    <button
      className={classNames(
        "flex h-6 items-center justify-center gap-1",
        children ? undefined : ["ml-auto", className]
      )}
      disabled={disabled}
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
      {label}
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

  // Children (such as an info tooltip) sit beside the button rather than in it,
  // so they keep their own focus and a click on them never sorts.
  if (!children) return button;
  return (
    <div
      className={classNames(
        "ml-auto flex h-6 items-center justify-center gap-1",
        className
      )}
    >
      {children}
      {button}
    </div>
  );
};
