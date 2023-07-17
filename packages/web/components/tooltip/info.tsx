import classNames from "classnames";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { TooltipProps } from "~/components/tooltip/types";
import { CustomClasses } from "~/components/types";

const Tippy = dynamic(() => import("@tippyjs/react"), { ssr: false });

export const InfoTooltip: FunctionComponent<
  TooltipProps &
    CustomClasses & {
      size?: { height: number; width: number };
    }
> = ({ content, trigger, size, className }) => (
  <Tippy
    className="body2 rounded-lg border border-osmoverse-600 bg-osmoverse-900 p-2 md:p-1"
    content={content}
    trigger={trigger ?? "click"}
  >
    <div
      className={classNames(
        "flex cursor-pointer align-middle text-wosmongton-300",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Icon id="info" height={16} width={16} {...size} />
    </div>
  </Tippy>
);
