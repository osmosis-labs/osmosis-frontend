import classNames from "classnames";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip/tooltip";
import { TooltipProps } from "~/components/tooltip/types";
import { CustomClasses } from "~/components/types";

export const InfoTooltip: FunctionComponent<
  TooltipProps &
    CustomClasses & {
      size?: { height: number; width: number };
    }
> = ({ content, trigger, size, className }) => (
  <Tooltip
    rootClassNames="!border-0 !bg-osmoverse-800 !p-2 drop-shadow-md md:!p-1"
    className={classNames("text-wosmongton-300", className)}
    content={content}
    trigger={trigger ?? "click"}
  >
    <Icon id="info" height={16} width={16} {...size} />
  </Tooltip>
);
