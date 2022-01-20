import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses } from "./types";
import React from "react";

export interface MenuOption {
  id: string;
  display: string;
}

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
      <div
        key={id}
        className={classNames(
          "h-12 px-4 cursor-pointer",
          {
            "bg-secondary-200 rounded-full": id === selectedOptionId,
          },
          className
        )}
        onClick={() => onSelect(id)}
      >
        <div
          className={classNames("relative top-3 select-none", {
            "text-iconDefault": id !== selectedOptionId,
          })}
        >
          {display}
        </div>
      </div>
    ))}
  </div>
);
