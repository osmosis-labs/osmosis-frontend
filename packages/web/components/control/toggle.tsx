import { FunctionComponent, useState } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
import { ToggleProps } from "./types";

export const Toggle: FunctionComponent<
  ToggleProps & Disableable & CustomClasses
> = ({ isOn, onToggle, disabled = false, className, children }) => {
  const [isHovered, setHovered] = useState(false);

  return (
    <label
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered(false)}
    >
      <div className="relative">
        <input
          type="checkbox"
          className={classNames(
            "absolute h-6 w-full rounded-lg appearance-none",
            {
              "opacity-30 bg-iconDefault": disabled && isOn,
              "opacity-10 bg-iconDefault": disabled && !isOn,
              "bg-primary-200": !disabled && isOn,
              "cursor-pointer": isHovered && !disabled,
              "bg-primary-100": isHovered && !disabled && isOn,
              "bg-surface": !disabled && !isOn,
            },
            className
          )}
          checked={isOn}
          disabled={disabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div
          className={classNames(
            "relative top-1.5 px-2 select-none text-caption",
            {
              "cursor-default": disabled,
              "cursor-pointer": isHovered && !disabled,
              "opacity-30": disabled && isOn,
              "opacity-10": disabled && !isOn,
            }
          )}
        >
          {children}
        </div>
      </div>
    </label>
  );
};
