import classNames from "classnames";
import Image from "next/image";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  forwardRef,
} from "react";

export const ArrowButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonHTMLAttributes<HTMLButtonElement> &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      isLink?: boolean;
      shouldInherit?: boolean;
    }
>((props, ref) => {
  const { isLink, shouldInherit = false, ...rest } = props;
  const Component = (isLink ? "a" : "button") as ElementType<typeof props>;

  return (
    <Component
      {...rest}
      ref={ref as any}
      className={classNames(
        "flex items-center gap-1 text-wosmongton-200 transition-all hover:gap-2",
        props.className
      )}
    >
      {props.children}
      <Image
        alt="earn more"
        src={"/icons/arrow-right.svg"}
        height={24}
        width={24}
      />
    </Component>
  );
});
