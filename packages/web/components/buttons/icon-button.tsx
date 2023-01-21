import React, {
  cloneElement,
  ComponentProps,
  FunctionComponent,
  isValidElement,
  ReactNode,
} from "react";
import { Button } from "./button";

/**
 * Renders an icon within a button.
 */
const IconButton: FunctionComponent<
  {
    icon?: ReactNode;
    "aria-label": string;
  } & ComponentProps<typeof Button>
> = (props) => {
  const { icon, children, "aria-label": ariaLabel, ...rest } = props;

  const element = icon || children;
  const _children = isValidElement(element)
    ? cloneElement(element as any, {
        "aria-hidden": true,
        focusable: false,
      })
    : null;

  return (
    <Button
      mode="icon-primary"
      size="sm-no-padding"
      aria-label={ariaLabel}
      {...rest}
    >
      {_children}
    </Button>
  );
};

export default IconButton;
