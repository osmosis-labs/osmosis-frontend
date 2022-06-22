import { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuSelectProps } from "./types";
import { CustomClasses } from "../types";

interface Props extends MenuSelectProps, CustomClasses {
  isOpen: boolean;
  /** Default: `"left"` */
  openDropdownHDirection?: "left" | "right";
  /** Default: `"down"` */
  openDropdownVDirection?: "down" | "up";
}

/**
 * Menu dropdown. Parent must have relative positioning.
 */
export const MenuDropdown: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  isOpen,
  openDropdownHDirection = "left",
  openDropdownVDirection = "down",
  className,
}) => (
  <div
    className={classNames(
      "absolute flex flex-col w-36 bg-card rounded-lg border border-white-faint select-none z-50",
      {
        hidden: !isOpen,
        "right-0": openDropdownHDirection === "left",
        "left-0": openDropdownHDirection === "right",
        "bottom-10": openDropdownVDirection === "up",
      },
      className
    )}
  >
    {options.map(({ id, display }, index) => (
      <button
        className={classNames(
          "px-2 cursor-pointer w-full hover:bg-white-faint text-left",
          {
            "bg-white-faint text-white-full": id === selectedOptionId,
            "text-iconDefault": id !== selectedOptionId,
            "rounded-t-lginset": index === 0,
            "rounded-b-lginset": index === options.length - 1,
          }
        )}
        key={index}
        onClick={() => onSelect(id)}
      >
        {display}
      </button>
    ))}
  </div>
);
