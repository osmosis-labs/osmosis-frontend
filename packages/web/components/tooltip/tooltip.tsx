import classNames from "classnames";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";
import { CustomClasses } from "../types";
import { TooltipProps } from "./types";

const Tippy = dynamic(() => import("@tippyjs/react"), { ssr: false });

export const Tooltip: FunctionComponent<TooltipProps & CustomClasses> = ({
  content,
  trigger,
  children,
  className,
}) => (
  <Tippy
    className="bg-osmoverse-900 border border-osmoverse-600 md:p-1 p-2 rounded-lg body2"
    content={content}
    trigger={trigger ?? "click"}
  >
    <div
      className={classNames("flex cursor-pointer align-middle", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </Tippy>
);
