import classNames from "classnames";
import { FunctionComponent, useEffect, useState } from "react";

import { Icon } from "../assets";
import { CustomClasses, Disableable } from "../types";
import { ToggleProps } from "./types";

export const CheckBox: FunctionComponent<
  ToggleProps &
    Disableable &
    CustomClasses & {
      labelClassName?: string;
      checkClassName?: string;
      checkMarkClassName?: string;
      checkMarkIconUrl?: string;
    }
> = ({
  isOn,
  onToggle: onToggle,
  disabled = false,
  labelClassName,
  checkClassName,
  // TODO: remove these prop after removing dependencies
  checkMarkClassName,
  checkMarkIconUrl = "/icons/check-mark.svg",
  className,
  children,
}) => {
  const [showImg, setShowImg] = useState(false);
  useEffect(() => {
    setShowImg(true);
  }, []);

  return (
    <label
      className={classNames(
        "relative flex h-6 w-6 select-none items-center gap-4",
        labelClassName
      )}
    >
      {isOn && showImg && (
        <Icon
          id="check-mark"
          className={classNames(
            "absolute top-1/2 left-1/2 z-20 h-[11px] w-[15px] -translate-x-1/2 -translate-y-1/2 cursor-pointer text-osmoverse-800",
            disabled ? "cursor-default opacity-50" : null,
            checkClassName
          )}
        />
      )}
      <input
        type="checkbox"
        className={classNames(
          "absolute top-0 left-0 h-6 w-6 cursor-pointer appearance-none",
          "z-10 after:absolute after:h-6 after:w-6 after:rounded-lg", // box
          disabled
            ? isOn
              ? "cursor-default opacity-30 checked:after:bg-osmoverse-400" // disabled AND on
              : "cursor-default opacity-30 after:border-2 after:border-osmoverse-400"
            : isOn
            ? "after:bg-osmoverse-300" // not disabled AND on
            : "after:border-2 after:border-osmoverse-300",
          className
        )}
        checked={isOn}
        disabled={disabled}
        onChange={() => onToggle(!isOn)}
      />
      <div className="cursor-pointer pl-8 md:pl-6">{children}</div>
    </label>
  );
};
