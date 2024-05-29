import Tippy, { TippyProps } from "@tippyjs/react";
import classNames from "classnames";
import { PropsWithChildren } from "react";

import { TooltipProps } from "~/components/tooltip/types";
import { CustomClasses } from "~/components/types";

export const Tooltip = ({
  content,
  trigger,
  children,
  className,
  rootClassNames,
  enablePropagation,
  ...props
}: PropsWithChildren<
  TooltipProps &
    CustomClasses &
    Omit<TippyProps, "content"> & {
      rootClassNames?: string;
      enablePropagation?: boolean;
    }
>) => (
  <Tippy
    className={classNames(
      "body2 rounded-lg bg-osmoverse-700 px-3 py-2.5 md:px-2 md:py-1.5",
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
