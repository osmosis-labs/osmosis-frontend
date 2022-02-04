import { FunctionComponent } from "react";
import classNames from "classnames";
import { MenuSelectProps } from "./types";

interface Props extends MenuSelectProps {
  isOpen: boolean;
}

export const MenuDropdown: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  isOpen,
}) => (
  <div
    className={classNames(
      "absolute flex flex-col w-36 bg-card rounded-lg border border-white-faint select-none",
      {
        hidden: !isOpen,
      }
    )}
  >
    {options.map(({ id, display }, index) => (
      <span
        className={classNames(
          "px-2 cursor-pointer w-full text-ellipsis overflow-hidden hover:text-clip hover:bg-white-faint",
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
      </span>
    ))}
  </div>
);
