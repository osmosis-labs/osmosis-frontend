import Tippy, { TippyProps } from "@tippyjs/react";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { CustomClasses } from "../types";
import { TooltipProps } from "./types";

export const Tooltip: FunctionComponent<
  TooltipProps & CustomClasses & Omit<TippyProps, "content">
> = ({ content, trigger, children, className, ...props }) => (
  <Tippy
    className="body2 rounded-lg bg-osmoverse-700 py-2.5 px-3 md:px-2 md:py-1.5"
    content={content}
    trigger={trigger ?? "mouseenter focus"}
    {...props}
  >
    <div
      className={classNames("flex cursor-pointer align-middle", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </Tippy>
);
