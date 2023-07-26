import classNames from "classnames";
import { FunctionComponent } from "react";

import { CustomClasses } from "../types";
import { MenuSelectProps } from "./types";

interface Props extends MenuSelectProps, CustomClasses {
  isOpen: boolean;
  isFloating?: boolean;
}

/**
 * Menu dropdown. Parent must have relative positioning.
 */
export const MenuDropdown: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  isOpen,
  isFloating = false,
  className,
}) => (
  <div
    className={classNames(
      "absolute z-[1000] flex select-none flex-col border border-osmoverse-600 bg-osmoverse-900 text-left",
      isFloating ? "rounded-xl" : "rounded-b-xl",
      {
        hidden: !isOpen,
      },
      className
    )}
  >
    {options.map(({ id, display }, index) => (
      <button
        className={classNames(
          "w-full cursor-pointer px-4 py-1.5 text-left transition-colors hover:bg-osmoverse-700",
          {
            "text-rust-200": id === selectedOptionId,
            "text-osmoverse-200": id !== selectedOptionId,
            "rounded-b-xlinset": index === options.length - 1,
            "rounded-t-xlinset": isFloating && index === 0,
          }
        )}
        key={id}
        onClick={() => onSelect(id)}
      >
        {display}
      </button>
    ))}
  </div>
);
