import classNames from "classnames";
import { FunctionComponent, useEffect, useState } from "react";

import { useDimension } from "~/hooks";

import { Icon } from "../assets";
import { CustomClasses, Disableable } from "../types";
import { ToggleProps } from "./types";

export const CheckBox: FunctionComponent<
  ToggleProps &
    Disableable &
    CustomClasses & {
      labelClassName?: string;
      checkClassName?: string;
      isIndeterminate?: boolean;
    }
> = ({
  isOn,
  onToggle: onToggle,
  disabled = false,
  labelClassName,
  checkClassName,
  className,
  children,
  isIndeterminate,
}) => {
  const [inputRef, { width, height }] = useDimension<HTMLInputElement>();
  const [showImg, setShowImg] = useState(false);
  useEffect(() => {
    setShowImg(true);
  }, []);

  return (
    <label className={classNames("relative flex select-none ", labelClassName)}>
      <div
        style={{
          height,
          width,
        }}
        className="relative flex items-center justify-center"
      >
        {isIndeterminate && showImg && (
          <Icon
            id="minus"
            className={classNames(
              "absolute z-20 h-[11px] w-[15px] cursor-pointer text-osmoverse-800",
              disabled ? "cursor-default opacity-50" : null,
              checkClassName
            )}
          />
        )}
        {isOn && showImg && !isIndeterminate && (
          <Icon
            id="check-mark"
            className={classNames(
              "absolute z-20 h-[11px] w-[15px] cursor-pointer text-osmoverse-800",
              disabled ? "cursor-default opacity-50" : null,
              checkClassName
            )}
          />
        )}
        <input
          type="checkbox"
          ref={inputRef}
          className={classNames(
            "absolute h-6 w-6 cursor-pointer appearance-none",
            "z-10 after:absolute after:h-6 after:w-6 after:rounded-lg", // box
            disabled
              ? isOn || isIndeterminate
                ? "cursor-default opacity-30 checked:after:bg-osmoverse-400" // disabled AND on
                : "cursor-default opacity-30 after:border-2 after:border-osmoverse-400"
              : isOn || isIndeterminate
              ? "after:bg-osmoverse-300" // not disabled AND on
              : "after:border-2 after:border-osmoverse-300",
            className
          )}
          checked={isOn}
          disabled={disabled}
          onChange={() => onToggle(!isOn)}
        />
      </div>
      <div className="cursor-pointer pl-3 md:pl-1">{children}</div>
    </label>
  );
};
