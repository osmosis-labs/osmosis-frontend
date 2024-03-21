import Tippy, { TippyProps } from "@tippyjs/react";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { TooltipProps } from "~/components/tooltip/types";
import { CustomClasses } from "~/components/types";

export const Tooltip: FunctionComponent<
  TooltipProps &
    CustomClasses &
    Omit<TippyProps, "content"> & {
      rootClassNames?: string;
      enablePropagation?: boolean;
    }
> = ({
  content,
  trigger,
  children,
  className,
  rootClassNames,
  enablePropagation,
  ...props
}) => (
  <Tippy
    className={classNames(
      "body2 rounded-lg bg-osmoverse-700 py-2.5 px-3 md:px-2 md:py-1.5",
      rootClassNames
    )}
    content={content}
    trigger={trigger ?? "mouseenter focus"}
    {...props}
  >
    <div
      className={classNames("flex cursor-pointer align-middle", className)}
      onClick={enablePropagation ? undefined : (e) => e.stopPropagation()}
    >
      {children}
    </div>
  </Tippy>
);
