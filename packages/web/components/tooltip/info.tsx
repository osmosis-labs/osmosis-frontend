import Image from "next/image";
import Tippy from "@tippyjs/react";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { TooltipProps } from "./types";
import { CustomClasses } from "../types";

export const InfoTooltip: FunctionComponent<
  TooltipProps &
    CustomClasses & {
      style?: "iconDefault" | "secondary-200";
      size?: { height: number; width: number };
    }
> = ({ content, trigger, style = "iconDefault", size, className }) => (
  <Tippy
    className="bg-surface border border-secondary-200/30 md:p-1 p-2 rounded-lg text-body2"
    content={content}
    trigger={trigger ?? "click"}
  >
    <div
      className={classNames("flex cursor-pointer align-middle", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Image
        alt="info"
        src={
          style === "secondary-200"
            ? "/icons/info-secondary-200.svg"
            : "/icons/info.svg"
        }
        height={16}
        width={16}
        {...size}
      />
    </div>
  </Tippy>
);
