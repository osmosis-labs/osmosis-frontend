import React from "react";
import { useTranslation } from "react-multi-lang";

import { OsmoverseCard } from "./osmoverse-card";

export const EstimatedEarningCard = () => {
  const t = useTranslation();
  return (
    <OsmoverseCard containerClasses="bg-opacity-50">
      <div className="flex flex-col gap-2 text-left">
        <span className="caption text-sm text-osmoverse-200 md:text-xs">
          {t("stake.estimatedEarnings")}
        </span>
        <div className="mt-5 mb-2 flex items-center justify-around">
          <span className="caption text-sm text-osmoverse-200 md:text-xs">
            $32.80/day
          </span>
          <span className="caption text-sm text-osmoverse-200 md:text-xs">
            $500.80/month
          </span>
        </div>
      </div>
    </OsmoverseCard>
  );
};
