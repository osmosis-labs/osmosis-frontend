import { RatePretty } from "@keplr-wallet/unit";
import type { PoolDataRange, PoolIncentives } from "@osmosis-labs/server";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";

import { Icon } from "../assets";
import { AprDisclaimerTooltip } from "../tooltip/apr-disclaimer";
import { CustomClasses } from "../types";

export const AprBreakdown: FunctionComponent<
  PoolIncentives["aprBreakdown"] &
    CustomClasses & { showDisclaimerTooltip?: boolean }
> = ({
  total,
  swapFee,
  superfluid,
  osmosis,
  boost,
  className,
  showDisclaimerTooltip = false,
}) => {
  const { t } = useTranslation();

  return (
    <div className={classNames("flex w-72 flex-col gap-4 p-5", className)}>
      <div className="flex flex-col gap-2">
        {swapFee?.upper && swapFee?.lower && (
          <BreakdownRow
            label={t("pools.aprBreakdown.swapFees")}
            value={swapFee!}
          />
        )}
        {osmosis?.upper && osmosis?.lower && (
          <div className="body2 flex w-full place-content-between items-center px-3 text-bullish-500">
            <div className="flex place-content-between items-center gap-1">
              <p>OSMO {t("pools.aprBreakdown.boost")}</p>
              <Icon id="boost" color={theme.colors.bullish[500]} />
            </div>
            {osmosis.upper.maxDecimals(1).toString() ===
            osmosis.lower.maxDecimals(1).toString() ? (
              <p>{osmosis.upper.maxDecimals(1).toString()}</p>
            ) : (
              <p>
                {osmosis.lower.maxDecimals(1).toString()} -{" "}
                {osmosis.upper.maxDecimals(1).toString()}
              </p>
            )}
          </div>
        )}
        {superfluid?.upper && superfluid?.lower && (
          <BreakdownRow
            label={t("pools.aprBreakdown.superfluid")}
            value={superfluid}
          />
        )}
        {boost?.upper && boost?.lower && (
          <div className="body2 flex w-full place-content-between items-center px-3 text-bullish-500">
            <div className="flex place-content-between items-center gap-1">
              <p>{t("pools.aprBreakdown.externalBoost")}</p>
              <Icon id="boost" color={theme.colors.bullish[500]} />
            </div>
            {boost.upper.maxDecimals(1).toString() ===
            boost.lower.maxDecimals(1).toString() ? (
              <p>{boost.upper.maxDecimals(1).toString()}</p>
            ) : (
              <p>
                {boost.lower.maxDecimals(1).toString()} -{" "}
                {boost.upper.maxDecimals(1).toString()}
              </p>
            )}
          </div>
        )}
      </div>

      {total?.upper && total?.lower && (
        <div
          className={classNames(
            "subtitle1 flex w-full place-content-between items-center rounded-lg bg-osmoverse-825 px-3 py-1",
            {
              "text-bullish-500": Boolean(boost),
            }
          )}
        >
          {showDisclaimerTooltip ? (
            <div className="flex items-center gap-1">
              <p>{t("pools.aprBreakdown.total")}</p>
              <AprDisclaimerTooltip />
            </div>
          ) : (
            <p>{t("pools.aprBreakdown.total")}</p>
          )}
          {total.upper.maxDecimals(1).toString() ===
          total.lower.maxDecimals(1).toString() ? (
            <p>{total.upper.maxDecimals(1).toString()}</p>
          ) : (
            <p>
              {total.lower.maxDecimals(1).toString()} -{" "}
              {total.upper.maxDecimals(1).toString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const BreakdownRow: FunctionComponent<{
  label: string;
  value: PoolDataRange<RatePretty | undefined>;
}> = ({ label, value }) => (
  <div className="body2 flex w-full place-content-between items-center px-3">
    <p className="text-white-full">{label}</p>
    {value.lower?.maxDecimals(1).toString() ===
    value.upper?.maxDecimals(1).toString() ? (
      <p className="text-osmoverse-200">
        {value.upper?.maxDecimals(1).toString()}
      </p>
    ) : (
      <p className="text-osmoverse-200">
        {value.lower?.maxDecimals(2).toString()} -{" "}
        {value.upper?.maxDecimals(2).toString()}
      </p>
    )}
  </div>
);
