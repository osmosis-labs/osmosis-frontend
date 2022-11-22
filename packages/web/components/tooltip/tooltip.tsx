import classNames from "classnames";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";
import { CustomClasses } from "../types";
import { TooltipProps } from "./types";
import type { TippyProps } from "@tippyjs/react";

const Tippy = dynamic(() => import("@tippyjs/react"), { ssr: false });

export const Tooltip: FunctionComponent<
  TooltipProps & CustomClasses & TippyProps
> = ({ content, trigger, children, className, ...props }) => (
  <Tippy
    className="bg-osmoverse-700 md:px-2 md:py-1.5 py-2.5 px-3 rounded-lg body2"
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
