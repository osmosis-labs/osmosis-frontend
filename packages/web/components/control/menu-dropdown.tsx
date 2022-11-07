import { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuSelectProps } from "./types";
import { CustomClasses } from "../types";

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
      "absolute flex flex-col bg-osmoverse-900 border border-osmoverse-600 select-none z-[1000]",
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
          "px-4 py-1.5 cursor-pointer w-full hover:bg-osmoverse-700 transition-colors text-right",
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
