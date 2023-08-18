import React from "react";

import { Icon } from "~/components/assets";
import { IconLink } from "~/components/cards/icon-link";
import { Tooltip } from "~/components/tooltip";

export const RewardsCard: React.FC<{
  title: string;
  titleIconUrl: string;
  tooltipContent: string;
}> = ({ title, titleIconUrl, tooltipContent }) => {
  return (
    <div className="flex w-full flex-grow flex-col rounded-xl border-2 border-osmoverse-600">
      <div className="flex items-center justify-end p-4">
        <span className="text-osmoverse-white text-sm">{title}</span>

        <IconLink url={titleIconUrl}>
          <div className="pl-2 text-osmoverse-600">
            <Tooltip content={tooltipContent}>
              <Icon id="info" height="14px" width="14px" fill="#958FC0" />
            </Tooltip>
          </div>
        </IconLink>
      </div>
    </div>
  );
};
