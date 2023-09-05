import React from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";

export const RewardsCard: React.FC<{
  title: string;
  tooltipContent: string;
  onClick: () => void;
  bgImage?: JSX.Element;
}> = ({ title, tooltipContent, onClick, bgImage = null }) => {
  return (
    <div
      className="relative flex w-full flex-grow cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-osmoverse-600"
      onClick={onClick}
    >
      {bgImage}
      <div className="relative z-10 flex items-center justify-end p-4">
        <span className="text-osmoverse-white text-sm">{title}</span>
        <div className="pl-2 text-osmoverse-600">
          <Tooltip content={tooltipContent}>
            <Icon id="info" height="14px" width="14px" fill="#958FC0" />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
