import React from "react";
import { useTranslation } from "react-multi-lang";

import { Icon } from "~/components/assets";
import { OsmoverseCard } from "~/components/cards/osmoverse-card";
import { Tooltip } from "~/components/tooltip";
import { useWindowSize } from "~/hooks";

export const UnbondingCard: React.FunctionComponent = () => {
  const t = useTranslation();
  const isMobile = useWindowSize();
  return (
    <OsmoverseCard containerClasses="bg-opacity-50">
      <div className="flex flex-col gap-2 text-left">
        <div className="flex">
          <span className="caption flex gap-2 text-sm text-osmoverse-200 md:text-xs">
            {t("stake.unbondingHeader")}
            <Tooltip content={t("stake.unbondingPeriodTooltip")}>
              <Icon id="info" height="14px" width="14px" fill="#958FC0" />
            </Tooltip>
          </span>
        </div>
        <div className="flex flex-col pt-1 text-lg">
          {/* TODO figure out how to get estimated unbonding time */}
          {isMobile ? <span className="h6">14 Days</span> : <h4>14 Days</h4>}
          <span className="subtitle2 md:caption text-xs leading-4 text-osmoverse-400">
            {t("stake.unbondingSubtext")}
          </span>
        </div>
      </div>
    </OsmoverseCard>
  );
};
