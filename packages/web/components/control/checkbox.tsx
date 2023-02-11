import classNames from "classnames";
import { FunctionComponent, useEffect, useState } from "react";

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
        "relative flex select-none items-center gap-4",
        labelClassName
      )}
    >
      {isOn && showImg && (
        <div
          className={classNames(
            "absolute top-0 left-0 z-20 h-5 w-5 cursor-pointer",
            disabled ? "cursor-default opacity-50" : null,
            checkClassName
          )}
        >
          <img
            className={classNames(
              "absolute top-0 left-0 h-5 w-5",
              checkMarkClassName
            )}
            alt=""
            src={checkMarkIconUrl}
          />
        </div>
      )}
      <input
        type="checkbox"
        className={classNames(
          "absolute top-0 left-0 h-5 w-5 cursor-pointer appearance-none",
          "z-10 after:absolute after:h-5 after:w-5 after:rounded", // box
          disabled
            ? isOn
              ? "cursor-default opacity-30 checked:after:bg-osmoverse-400" // disabled AND on
              : "cursor-default opacity-30 after:border-2 after:border-osmoverse-400"
            : isOn
            ? "after:bg-wosmongton-200" // not disabled AND on
            : "after:border-2 after:border-wosmongton-200",
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
