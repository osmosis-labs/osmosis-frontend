import {
  cloneElement,
  ComponentProps,
  forwardRef,
  isValidElement,
  ReactNode,
} from "react";

import { Button } from "~/components/buttons/button";

/**
 * Renders an icon within a button.
 */
const IconButton = forwardRef<
  HTMLButtonElement,
  {
    icon?: ReactNode;
    "aria-label": string;
  } & ComponentProps<typeof Button>
>((props, ref) => {
  const {
    icon,
    children,
    mode = "icon-primary",
    size = "sm-no-padding",
    "aria-label": ariaLabel,
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
    <Button ref={ref} mode={mode} size={size} aria-label={ariaLabel} {...rest}>
      {_children}
    </Button>
  );
});

export default IconButton;
