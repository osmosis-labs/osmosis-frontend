import Image from "next/image";
import {
  FunctionComponent,
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ElementType,
} from "react";
import classNames from "classnames";

export const ArrowButton: FunctionComponent<
  ButtonHTMLAttributes<HTMLButtonElement> &
    AnchorHTMLAttributes<HTMLAnchorElement> & { isLink?: boolean }
> = (props) => {
  const { isLink, ...rest } = props;
  const Component = (isLink ? "a" : "button") as ElementType<typeof props>;

  return (
    <Component
      {...rest}
      className={classNames(
        "flex items-center gap-1 text-wosmongton-200 transition-all hover:gap-2",
        props.className
      )}
    >
      {props.children}
      <Image
        alt="earn more"
        src="/icons/arrow-right.svg"
        height={24}
        width={24}
      />
    </Component>
  );
};
