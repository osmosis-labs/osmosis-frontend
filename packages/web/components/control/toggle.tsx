import classNames from "classnames";
import { FunctionComponent, ReactNode, useState } from "react";

import { CustomClasses, Disableable } from "../types";
import { ToggleProps } from "./types";

export const Toggle: FunctionComponent<
  ToggleProps & Disableable & CustomClasses & { children?: ReactNode }
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
            "absolute h-6 w-full appearance-none rounded-lg",
            {
              "bg-osmoverse-400 opacity-30": disabled && isOn,
              "bg-osmoverse-400 opacity-10": disabled && !isOn,
              "bg-wosmongton-200": !disabled && isOn,
              "cursor-pointer": isHovered && !disabled,
              "bg-wosmongton-100": isHovered && !disabled && isOn,
              "bg-osmoverse-900": !disabled && !isOn,
            },
            className
          )}
          checked={isOn}
          disabled={disabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <div
          className={classNames(
            "relative top-1.5 select-none px-2 text-caption",
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
