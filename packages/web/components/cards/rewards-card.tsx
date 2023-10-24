import React from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { Tooltip } from "~/components/tooltip";

export const RewardsCard: React.FC<{
  title: string;
  tooltipContent: string;
  disabledTooltipContent?: string;
  onClick: () => void;
  image?: JSX.Element;
  disabled: boolean;
}> = ({
  title,
  tooltipContent,
  disabledTooltipContent,
  onClick,
  image = null,
  disabled,
}) => {
  return (
    <Button
      disabled={disabled}
      mode="unstyled"
      className="relative flex min-h-[50px] w-full flex-grow cursor-pointer flex-col !items-end justify-start overflow-hidden rounded-[28px] border-[1px] border-osmoverse-600 bg-osmoverse-800 !p-0 disabled:cursor-not-allowed disabled:opacity-75"
      onClick={onClick}
    >
      {image}
      <div className="z-10 flex items-center gap-2 p-4">
        <span className="text-osmoverse-white text-sm">{title}</span>
        {disabled && (
          <div className="text-osmoverse-600 sm:hidden">
            <Tooltip content={disabledTooltipContent}>
              <Icon id="info" height="14px" width="14px" fill="#EF3456" />
            </Tooltip>
          </div>
        )}
        {!disabled && (
          <div className="text-osmoverse-600 sm:hidden">
            <Tooltip content={tooltipContent}>
              <Icon id="info" height="14px" width="14px" fill="#958FC0" />
            </Tooltip>
          </div>
        )}
      </div>
    </Button>
  );
};
