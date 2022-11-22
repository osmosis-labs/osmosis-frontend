import { FunctionComponent, useState, useEffect } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
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
        "relative flex items-center gap-4 select-none",
        labelClassName
      )}
    >
      {isOn && showImg && (
        <div
          className={classNames(
            "cursor-pointer absolute top-0 left-0 h-5 w-5 z-20",
            disabled ? "cursor-default opacity-50" : null,
            checkClassName
          )}
        >
          <img
            className={classNames(
              "absolute h-5 w-5 top-0 left-0",
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
          "absolute top-0 left-0 cursor-pointer h-5 w-5 appearance-none",
          "after:absolute after:h-5 after:w-5 after:rounded z-10", // box
          disabled
            ? isOn
              ? "opacity-30 cursor-default checked:after:bg-osmoverse-400" // disabled AND on
              : "opacity-30 cursor-default after:border-2 after:border-osmoverse-400"
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
