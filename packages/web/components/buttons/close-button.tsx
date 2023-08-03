import classNames from "classnames";
import Image from "next/image";
import { FunctionComponent } from "react";

import { ButtonProps } from "~/components/buttons/types";
import { CustomClasses, Disableable } from "~/components/types";

export const CloseButton: FunctionComponent<
  ButtonProps & CustomClasses & Disableable
> = ({ onClick, className, disabled }) => (
  <div
    className={classNames(
      "flex h-6 w-6 items-center justify-center rounded-full bg-wosmongton-200",
      disabled ? "cursor-default opacity-30" : "cursor-pointer",
      className
    )}
    onClick={() => {
      if (!disabled) onClick();
    }}
  >
    <Image alt="clear" src="/icons/close.svg" height={22} width={18} />
  </div>
);
