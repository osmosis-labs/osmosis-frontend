import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
import { ToggleProps } from "./types";

export const CheckBox: FunctionComponent<
  ToggleProps & Disableable & CustomClasses & { labelClassName?: string }
> = ({
  isOn,
  onToggle: onToggle,
  disabled = false,
  labelClassName,
  className,
  children,
}) => (
  <div>
    <label
      className={classNames(
        "relative flex items-center select-none",
        labelClassName
      )}
    >
      {isOn && (
        <div
          className={classNames(
            "cursor-pointer h-full mt-1 absolute top-1/5 -left-0.5 z-20 my-auto",
            disabled ? "cursor-default opacity-50" : null
          )}
        >
          <Image alt="" src="/icons/check-mark.svg" height={24} width={24} />
        </div>
      )}
      <input
        type="checkbox"
        className={classNames(
          "cursor-pointer h-5 w-5 appearance-none",
          "after:absolute after:h-5 after:w-5 after:rounded z-10", // box
          disabled
            ? isOn
              ? "opacity-30 cursor-default checked:after:bg-iconDefault" // disabled AND on
              : "opacity-30 cursor-default after:border-2 after:border-iconDefault"
            : isOn
            ? "after:bg-primary-200" // not disabled AND on
            : "after:border-2 after:border-primary-200",
          className
        )}
        checked={isOn}
        disabled={disabled}
        onChange={() => onToggle(!isOn)}
      />
      <div className="cursor-pointer pl-2 md:pl-px">{children}</div>
    </label>
  </div>
);
