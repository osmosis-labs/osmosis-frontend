import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses } from "../types";
import { MenuOption } from "./types";

interface Props extends CustomClasses {
  options: MenuOption[];
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
}

export const MenuToggle: FunctionComponent<Props> = ({
  options,
  selectedOptionId,
  onSelect,
  className,
}) => (
  <div className="flex rounded-full bg-card">
    {options.map(({ id, display }) => (
      <label
        key={id}
        htmlFor={"menu-radio"}
        className={classNames(
          "relative h-12 px-3 select-none cursor-pointer",
          {
            "bg-secondary-200 rounded-full": id === selectedOptionId,
          },
          className
        )}
      >
        <input
          id="menu-radio"
          type="radio"
          className={classNames(
            "absolute w-full h-full appearance-none cursor-pointer z-20",
            "after:absolute after:w-full after:h-full",
            {
              "text-iconDefault": id !== selectedOptionId,
            }
          )}
          value={id}
          radioGroup={options.reduce((ids, { id }) => ids + id, "")}
          checked={id === selectedOptionId}
          onChange={() => onSelect(id)}
        ></input>
        <span
          className={classNames("relative top-3 z-10", {
            "text-iconDefault": id !== selectedOptionId,
          })}
        >
          {display}
        </span>
      </label>
    ))}
  </div>
);
