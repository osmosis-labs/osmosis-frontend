import { FunctionComponent } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
import { ToggleProps } from "./types";

export const Switch: FunctionComponent<
  ToggleProps & Disableable & CustomClasses & { containerClassName?: string }
> = ({
  isOn,
  onToggle,
  disabled = false,
  containerClassName,
  className,
  children,
}) => (
  <label
    className={classNames(
      "flex shrink-0 items-center gap-2 subtitle2 md:caption select-none",
      {
        "cursor-pointer": !disabled,
      },
      containerClassName
    )}
  >
    <input
      type="checkbox"
      className={classNames(
        "cursor-pointer w-7 h-[18px] rounded-full appearance-none bg-iconDefault transition duration-200 relative",
        "after:h-4 after:w-4 after:rounded-full after:bg-white-high after:absolute after:left-px after:top-px after:transform after:scale-100 after:transition after:duration-200", // dot
        "checked:after:transform checked:after:scale-100 checked:after:translate-x-2.5", // dot on transform
        disabled
          ? "opacity-30 cursor-default bg-iconDefault"
          : "checked:bg-primary-200",
        className
      )}
      checked={isOn}
      disabled={disabled}
      onChange={(e) => onToggle(e.target.checked)}
    />
    <div className={disabled ? "opacity-30" : undefined}>{children}</div>
  </label>
);
