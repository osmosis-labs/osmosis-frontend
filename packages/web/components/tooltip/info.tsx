import dynamic from "next/dynamic";
import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { TooltipProps } from "./types";
import { CustomClasses } from "../types";

const Tippy = dynamic(() => import("@tippyjs/react"), { ssr: false });

export const InfoTooltip: FunctionComponent<
  TooltipProps &
    CustomClasses & {
      size?: { height: number; width: number };
      iconSrcOverride?: string;
    }
> = ({ content, trigger, size, iconSrcOverride, className }) => (
  <Tippy
    className="bg-osmoverse-900 border border-osmoverse-600 md:p-1 p-2 rounded-lg body2"
    content={content}
    trigger={trigger ?? "click"}
  >
    <div
      className={classNames("flex cursor-pointer align-middle", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <Image
        alt="info"
        src={iconSrcOverride ? iconSrcOverride : "/icons/info.svg"}
        height={16}
        width={16}
        {...size}
      />
    </div>
  </Tippy>
);
