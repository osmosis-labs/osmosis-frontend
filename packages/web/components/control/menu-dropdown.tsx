import { FunctionComponent } from "react";
import classNames from "classnames";
import { nanoid } from "nanoid";
import { MenuSelectProps } from "./types";
import { CustomClasses } from "../types";

interface Props extends MenuSelectProps, CustomClasses {
  isOpen: boolean;
}

/**
 * Menu dropdown. Parent must have relative positioning.
 */
export const MenuDropdown: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  isOpen,
  className,
}) => (
  <div
    className={classNames(
      "absolute flex flex-col w-fit bg-card rounded-lg border border-white-faint select-none",
      {
        hidden: !isOpen,
      },
      className
    )}
  >
    {options.map(({ id, display }, index) => (
      <span
        className={classNames(
          "px-2 cursor-pointer w-full hover:bg-white-faint",
          {
            "bg-white-faint text-white-full": id === selectedOptionId,
            "text-iconDefault": id !== selectedOptionId,
            "rounded-t-lginset": index === 0,
            "rounded-b-lginset": index === options.length - 1,
          }
        )}
        key={nanoid()}
        onClick={() => onSelect(id)}
      >
        {display}
      </span>
    ))}
  </div>
);
