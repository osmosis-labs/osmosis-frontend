import classNames from "classnames";
import React from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import { Tooltip } from "~/components/tooltip";

export const RewardsCard: React.FC<{
  title: string;
  tooltipContent: string;
  onClick: () => void;
  image?: JSX.Element;
  containerClasses?: string;
  disabled: boolean;
}> = ({
  title,
  tooltipContent,
  onClick,
  image = null,
  containerClasses = "",
  disabled,
}) => {
  return (
    <Button
      disabled={disabled}
      mode="unstyled"
      className={classNames(
        "flex w-full flex-grow cursor-pointer flex-col rounded-xl border-2 border-osmoverse-600 disabled:cursor-not-allowed disabled:opacity-75",
        containerClasses
      )}
      onClick={onClick}
    >
      {image}
      <div className="absolute top-0 right-0 z-10 flex items-center p-4">
        <span className="text-osmoverse-white text-sm">{title}</span>
        <div className="pl-2 text-osmoverse-600 sm:hidden">
          <Tooltip content={tooltipContent}>
            <Icon id="info" height="14px" width="14px" fill="#958FC0" />
          </Tooltip>
        </div>
      </div>
    </Button>
  );
};
