import { Dec } from "@osmosis-labs/unit";
import { FC } from "react";

import { Icon } from "~/components/assets";
import { useTranslation } from "~/hooks";
import { formatPretty } from "~/utils/formatter";

interface Props {
  direction: "above" | "below";
  /** Absolute fractional deviation (e.g. 0.25 for 25%). */
  deviationPercent: Dec;
  onDismiss: () => void;
}

export const ExtremeDeviationBanner: FC<Props> = ({
  direction,
  deviationPercent,
  onDismiss,
}) => {
  const { t } = useTranslation();

  const percentLabel = formatPretty(deviationPercent.mul(new Dec(100)), {
    maxDecimals: 1,
  });
  const title =
    direction === "above"
      ? t("limitOrders.extremeDeviation.aboveTitle", { percent: percentLabel })
      : t("limitOrders.extremeDeviation.belowTitle", { percent: percentLabel });

  return (
    <div className="flex w-full items-start gap-2 rounded-lg border border-ammelia-600 bg-ammelia-600/10 p-3 text-sm text-ammelia-200">
      <Icon id="alert-triangle" width={16} height={16} className="mt-0.5" />
      <div className="flex flex-1 flex-col">
        <span className="body2 font-semibold">{title}</span>
        <span className="caption text-ammelia-200/80">
          {t("limitOrders.extremeDeviation.description")}
        </span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="text-ammelia-200/70 hover:text-ammelia-200"
      >
        <Icon id="close" width={16} height={16} />
      </button>
    </div>
  );
};
