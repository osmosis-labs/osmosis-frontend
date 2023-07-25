import React from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { IconLink } from "~/components/cards/icon-link";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { useWindowSize } from "~/hooks";

export const UnbondingCard: React.FC = () => {
  const t = useTranslation();
  const isMobile = useWindowSize();
  return (
    <OsmoverseCard containerClasses="bg-opacity-50">
      <div className="flex flex-col gap-2 text-left">
        <div className="flex">
          <span className="caption text-sm text-osmoverse-200 md:text-xs">
            {t("stake.unbondingHeader")}
          </span>
          <IconLink url="www.google.com">
            <div className="pl-2 text-osmoverse-600">
              <Icon id="info" height="14px" width="14px" fill="#958FC0" />
            </div>
          </IconLink>
        </div>
        <div className="flex flex-col pt-2 text-lg">
          {isMobile ? <span className="h6">14 Days</span> : <h4>14 Days</h4>}
          <span className="subtitle2 md:caption text-xs text-osmoverse-400">
            {t("stake.unbondingSubtext")}
          </span>
        </div>
      </div>
    </OsmoverseCard>
  );
};
