import { FunctionComponent } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
import { ToggleProps } from "./types";

export const Switch: FunctionComponent<
  ToggleProps &
    Disableable &
    CustomClasses & {
      containerClassName?: string;
      labelPosition?: "left" | "right";
    }
> = ({
  isOn,
  onToggle,
  disabled = false,
  containerClassName,
  className,
  labelPosition = "left",
  children,
}) => (
  <label
    className={classNames(
      "flex shrink-0 items-center gap-2 subtitle2 md:subtitle1 select-none text-osmoverse-200",
      {
        "cursor-pointer": !disabled,
      },
      containerClassName
    )}
  >
    {labelPosition === "left" && (
      <div
        className={classNames(
          "mr-3 lg:mr-1",
          disabled ? "opacity-30" : undefined
        )}
      >
        {children}
      </div>
    )}
    <input
      type="checkbox"
      className={classNames(
        "cursor-pointer w-[52px] h-[32px] rounded-full appearance-none bg-osmoverse-600 transition ease-inOutBack duration-200 relative",
        "after:h-7 after:w-7 after:rounded-full after:bg-white-high after:absolute after:left-[2px] after:top-[2px] after:transform after:ease-inOutBack after:scale-100 after:transition after:duration-200", // dot
        "checked:after:transform checked:after:scale-100 checked:after:translate-x-[20px]", // dot on transform
        disabled
          ? "cursor-default after:bg-osmoverse-500 bg-osmoverse-600"
          : "checked:bg-wosmongton-500",
        className
      )}
      checked={isOn}
      disabled={disabled}
      onChange={(e) => onToggle(e.target.checked)}
    />
    {labelPosition === "right" && (
      <div
        className={classNames(
          "ml-3 lg:ml-1",
          disabled ? "opacity-30" : undefined
        )}
      >
        {children}
      </div>
    )}
  </label>
);
