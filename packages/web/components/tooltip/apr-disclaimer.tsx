import { FunctionComponent } from "react";

import { useTranslation } from "~/hooks";

import { InfoTooltip } from "./info";

export const AprDisclaimerTooltip: FunctionComponent = () => {
  return <InfoTooltip content={<AprDisclaimer />} />;
};

export const AprDisclaimer: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <div className="flex max-w-xs flex-col gap-3 p-2">
      <span className="subtitle1 text-osmoverse-100">
        {t("pools.aprBreakdown.explainer.title")}
      </span>
      <p className="caption text-osmoverse-200">
        {t("pools.aprBreakdown.explainer.p1")}
      </p>
      <p className="caption text-osmoverse-200">
        {t("pools.aprBreakdown.explainer.p2")}
      </p>
      <p className="caption text-osmoverse-200">
        {t("pools.aprBreakdown.explainer.p3")}
      </p>
    </div>
  );
};
