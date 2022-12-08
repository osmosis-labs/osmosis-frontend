import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, Disableable } from "../types";
import { ButtonProps } from "./types";

export const BorderButton: FunctionComponent<
  ButtonProps & CustomClasses & Disableable
> = ({ onClick, className, disabled, children }) => (
  <button
    className={classNames(
      "border-[1.5px] border-wosmongton-300 hover:border-wosmongton-100 text-wosmongton-300 hover:text-wosmongton-100 py-2 px-5 rounded-lg transition-colors",
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
