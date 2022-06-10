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
      checkboxAlignedToTop?: boolean;
    }
> = ({
  isOn,
  onToggle: onToggle,
  disabled = false,
  labelClassName,
  checkClassName,
  checkboxAlignedToTop = true,
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
            "cursor-pointer h-full absolute left-0 h-5 w-5 z-20",
            disabled ? "cursor-default opacity-50" : null,
            checkClassName,
            checkboxAlignedToTop ? "top-0" : null
          )}
        >
          <img
            className={classNames(
              "absolute h-5 w-5 left-0",
              checkboxAlignedToTop ? "top-0" : null
            )}
            alt=""
            src="/icons/check-mark.svg"
          />
        </div>
      )}
      <input
        type="checkbox"
        className={classNames(
          "absolute left-0 cursor-pointer h-5 w-5 appearance-none",
          "after:absolute after:h-5 after:w-5 after:rounded z-10", // box
          disabled
            ? isOn
              ? "opacity-30 cursor-default checked:after:bg-iconDefault" // disabled AND on
              : "opacity-30 cursor-default after:border-2 after:border-iconDefault"
            : isOn
            ? "after:bg-primary-200" // not disabled AND on
            : "after:border-2 after:border-primary-200",
          className,
          checkboxAlignedToTop ? "top-0" : null
        )}
        checked={isOn}
        disabled={disabled}
        onChange={() => onToggle(!isOn)}
      />
      <div className="cursor-pointer pl-8 md:pl-6">{children}</div>
    </label>
  );
};
