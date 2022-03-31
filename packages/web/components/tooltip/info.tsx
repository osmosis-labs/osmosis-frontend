import Image from "next/image";
import Tippy from "@tippyjs/react";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { TooltipProps } from "./types";
import { CustomClasses } from "../types";

export const InfoTooltip: FunctionComponent<TooltipProps & CustomClasses> = ({
  content,
  trigger,
  className,
}) => (
  <Tippy
    className="bg-surface border border-secondary-200/30 p-2 rounded-lg text-body2"
    content={content}
    trigger={trigger ?? "click"}
  >
    <div
      className={classNames(
        "inline cursor-pointer pl-1 align-middle",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Image alt="info" src="/icons/info.svg" height={16} width={16} />
    </div>
  </Tippy>
);
