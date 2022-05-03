import { FunctionComponent } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
import { ToggleProps } from "./types";

export const Switch: FunctionComponent<
  ToggleProps & Disableable & CustomClasses
> = ({ isOn, onToggle, disabled = false, className, children }) => (
  <label className="flex items-center gap-2 caption">
    <input
      type="checkbox"
      className={classNames(
        "cursor-pointer h-8 w-12 rounded-full appearance-none bg-iconDefault transition duration-200 relative",
        "after:h-6 after:w-6 after:rounded-full after:bg-white-high after:absolute after:left-1 after:top-1 after:transform after:scale-110 after:transition after:duration-200", // dot
        "checked:after:transform checked:after:scale-110 checked:after:translate-x-4", // dot on transform
        disabled
          ? "opacity-30 cursor-default bg-iconDefault"
          : "checked:bg-primary-200",
        className
      )}
      checked={isOn}
      disabled={disabled}
      onChange={(e) => onToggle(e.target.checked)}
    />
    {children}
  </label>
);
