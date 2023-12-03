import classNames from "classnames";
import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ElementType,
  forwardRef,
} from "react";

import { Icon } from "~/components/assets";

type Classes = "arrowRight";

export const ArrowButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonHTMLAttributes<HTMLButtonElement> &
    AnchorHTMLAttributes<HTMLAnchorElement> & {
      isLink?: boolean;
      classes?: Partial<Record<Classes, string>>;
    }
>((props, ref) => {
  const { isLink, classes, ...rest } = props;
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
      <Icon
        id="arrow-right"
        className={classNames(classes?.arrowRight)}
        height={24}
        width={24}
      />
    </Component>
  );
});
