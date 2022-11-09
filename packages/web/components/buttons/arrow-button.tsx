import Image from "next/image";
import { FunctionComponent, ButtonHTMLAttributes } from "react";
import classNames from "classnames";

export const ArrowButton: FunctionComponent<
  ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => (
  <button
    className={classNames(
      "flex items-center gap-1 text-wosmongton-200 hover:gap-2 transition-all",
      props.className
    )}
    {...props}
  >
    {props.children}
    <Image
      alt="earn more"
      src="/icons/arrow-right.svg"
      height={24}
      width={24}
    />
  </button>
);
