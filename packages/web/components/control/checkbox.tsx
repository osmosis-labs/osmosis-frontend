import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { Disableable, CustomClasses } from "../types";
import { ToggleProps } from "./types";

export const CheckBox: FunctionComponent<
  ToggleProps &
    Disableable &
    CustomClasses & {
      label?: string;
    }
> = ({ isOn, onToggle, disabled = false, className, label }) => (
  <label
    className="flex items-center cursor-pointer"
    htmlFor="toggle-checkbox"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle(isOn);
    }}
  >
    {isOn && (
      <div
        className={classNames(
          "cursor-pointer absolute z-50 flex items-center justify-center",
          disabled ? "cursor-default opacity-50" : null
        )}
      >
        <Image alt="" src="/icons/check-mark.svg" height={20} width={20} />
      </div>
    )}
    <input
      type="checkbox"
      id="toggle-checkbox"
      className={classNames(
        "relative cursor-pointer h-5 w-5 appearance-none",
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
    />
    {label}
  </label>
);
