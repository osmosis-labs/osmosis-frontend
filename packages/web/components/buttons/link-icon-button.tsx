import { VariantProps } from "class-variance-authority";
import { AnchorHTMLAttributes } from "react";
import { cloneElement, forwardRef, isValidElement, ReactNode } from "react";

import { buttonCVA } from "~/components/buttons/button";
import { CustomClasses } from "~/components/types";

/**
 * Renders an icon within a button.
 */
const LinkIconButton = forwardRef<
  HTMLAnchorElement,
  {
    icon?: ReactNode;
    "aria-label": string;
  } & VariantProps<typeof buttonCVA> &
    CustomClasses &
    AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  const {
    icon,
    children,
    mode = "icon-primary",
    size = "sm-no-padding",
    "aria-label": ariaLabel,
    className,
    ...rest
  } = props;

  const element = icon || children;
  const _children = isValidElement(element)
    ? cloneElement(element as any, {
        "aria-hidden": true,
        focusable: false,
      })
    : null;

  return (
    <a
      ref={ref}
      className={buttonCVA({
        className,
        mode,
        size,
      })}
      aria-label={ariaLabel}
      {...rest}
    >
      {_children}
    </a>
  );
});

export default LinkIconButton;
