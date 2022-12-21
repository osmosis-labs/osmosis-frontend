import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, Disableable } from "../types";
import { ButtonProps } from "./types";

export const BorderButton: FunctionComponent<
  ButtonProps & CustomClasses & Disableable
> = ({ onClick, className, disabled, children }) => (
  <button
    className={classNames(
      "rounded-lg border-[1.5px] border-wosmongton-300 py-2 px-5 text-wosmongton-300 transition-colors hover:border-wosmongton-100 hover:text-wosmongton-100",
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);
