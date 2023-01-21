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
      "subtitle1 flex shrink-0 select-none items-center gap-2 text-osmoverse-200",
      {
        "cursor-pointer": !disabled,
      },
      containerClassName
    )}
  >
    {labelPosition === "left" && children && (
      <div
        className={classNames(
          "mr-2 lg:mr-1",
          disabled ? "opacity-30" : undefined
        )}
      >
        {children}
      </div>
    )}
    <input
      type="checkbox"
      className={classNames(
        "relative h-[32px] w-[52px] cursor-pointer appearance-none rounded-full bg-osmoverse-600 transition duration-200 ease-inOutBack",
        "after:absolute after:left-[2px] after:top-[2px] after:h-7 after:w-7 after:scale-100 after:transform after:rounded-full after:bg-white-high after:transition after:duration-200 after:ease-inOutBack", // dot
        "checked:after:translate-x-[20px] checked:after:scale-100 checked:after:transform", // dot on transform
        disabled
          ? "cursor-default bg-osmoverse-600 after:bg-osmoverse-500"
          : "checked:bg-wosmongton-500",
        className
      )}
      checked={isOn}
      disabled={disabled}
      onChange={(e) => onToggle(e.target.checked)}
    />
    {labelPosition === "right" && children && (
      <div
        className={classNames(
          "ml-2 lg:ml-1",
          disabled ? "opacity-30" : undefined
        )}
      >
        {children}
      </div>
    )}
  </label>
);
