import { FunctionComponent } from "react";
import classNames from "classnames";
import { ToggleProps, Disableable, CustomClasses } from "./types";

export const Toggle: FunctionComponent<
  ToggleProps & Disableable & CustomClasses
> = ({ isOn, onChange, disabled = false, className, children }) => (
  <label htmlFor="toggle">
    <div className="relative cursor-pointer">
      <input
        type="checkbox"
        id="toggle"
        className={classNames(
          "absolute h-8 w-full rounded-lg appearance-none",
          {
            "opacity-50 bg-iconDefault": disabled && isOn,
            "opacity-20 bg-iconDefault": disabled && !isOn,
            "bg-primary-200": !disabled && isOn,
            "bg-surface": !disabled && !isOn,
          },
          className
        )}
        checked={isOn}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={classNames("relative top-1 px-2 select-none", {
          "cursor-default": disabled,
          "opacity-50": disabled && isOn,
          "opacity-20": disabled && !isOn,
        })}
      >
        {children}
      </div>
    </div>
  </label>
);
