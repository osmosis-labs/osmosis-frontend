import React from "react";

import { Icon } from "~/components/assets";
import { IconLink } from "~/components/cards/icon-link";

export const RewardsCard: React.FC<{ title: string; titleIconUrl: string }> = ({
  title,
  titleIconUrl,
}) => {
  return (
    <div className="flex w-full flex-col justify-center rounded-xl border-2 border-osmoverse-600">
      <div className="flex items-center justify-end p-3">
        <span className="text-osmoverse-white text-sm">{title}</span>

        <IconLink url={titleIconUrl}>
          <div className="pl-2 text-osmoverse-600">
            <Icon id="info" height="14px" width="14px" fill="#958FC0" />
          </div>
        </IconLink>
      </div>
    </div>
  );
};
