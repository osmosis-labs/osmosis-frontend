import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { ButtonProps } from "./types";
import { CustomClasses, Disableable } from "../types";

export const CloseButton: FunctionComponent<
  ButtonProps & CustomClasses & Disableable
> = ({ onClick, className, disabled }) => (
  <div
    className={classNames(
      "h-6 w-6 bg-wosmongton-200 rounded-full flex items-center justify-center",
      disabled ? "opacity-30 cursor-default" : "cursor-pointer",
      className
    )}
    onClick={() => {
      if (!disabled) onClick();
    }}
  >
    <Image alt="clear" src="/icons/close.svg" height={22} width={18} />
  </div>
);
