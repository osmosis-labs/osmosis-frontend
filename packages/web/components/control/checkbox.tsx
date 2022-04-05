import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
import { ToggleProps } from "./types";

export const CheckBox: FunctionComponent<
  ToggleProps & Disableable & CustomClasses
> = ({ isOn, onToggle: onToggle, disabled = false, className, children }) => (
  <div>
    <label className="relative flex">
      {isOn && (
        <div
          className={classNames(
            "cursor-pointer absolute z-50",
            disabled ? "cursor-default opacity-50" : null
          )}
        >
          <Image alt="" src="/icons/check-mark.svg" height={20} width={20} />
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
        onClick={(e) => onToggle(!isOn)}
      />
      <div className="cursor-pointer">{children}</div>
    </label>
  </div>
);
