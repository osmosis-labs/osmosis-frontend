import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { ToggleProps, Disableable } from "./types";

export const CheckBox: FunctionComponent<ToggleProps & Disableable> = ({
  isOn,
  onChange,
  disabled = false,
}) => (
  <label htmlFor="toggle-checkbox">
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
      id="toggle-checkbox"
      className={classNames(
        "relative cursor-pointer h-5 w-5 rounded-sm appearance-none",
        "after:absolute after:h-5 after:w-5 after:rounded z-10", // box
        disabled
          ? isOn
            ? "opacity-50 cursor-default checked:after:bg-iconDefault" // disabled AND on
            : "opacity-50 cursor-default after:border-2 after:border-iconDefault"
          : isOn
          ? "after:bg-primary-200" // not disabled AND on
          : "after:border-2 after:border-primary-200"
      )}
      checked={isOn}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);
