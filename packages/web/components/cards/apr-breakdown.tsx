import { RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";

import { Icon } from "../assets";
import { CustomClasses } from "../types";

export const AprBreakdown: FunctionComponent<
  { poolId: string } & CustomClasses
> = observer(({ poolId, className }) => {
  const { queriesExternalStore } = useStore();
  const poolAprs = queriesExternalStore.queryPoolAprs.getForPool(poolId);
  const { t } = useTranslation();

  return (
    <div className={classNames("flex w-60 flex-col gap-4 p-5", className)}>
      <div className="flex flex-col gap-2">
        {poolAprs?.swapFees && (
          <BreakdownRow
            label={t("pools.aprBreakdown.swapFees")}
            value={poolAprs.swapFees}
          />
        )}
        {poolAprs?.osmosis && (
          <div className="body2 flex w-full place-content-between items-center px-3 text-bullish-500">
            <div className="flex place-content-between items-center gap-1">
              <p>OSMO {t("pools.aprBreakdown.boost")}</p>
              <Icon id="boost" color={theme.colors.bullish[500]} />
            </div>
            <p>{poolAprs.osmosis.maxDecimals(1).toString()}</p>
          </div>
        )}
        {poolAprs?.boost && (
          <div className="body2 flex w-full place-content-between items-center px-3 text-bullish-500">
            <div className="flex place-content-between items-center gap-1">
              <p>{t("pools.aprBreakdown.externalBoost")}</p>
              <Icon id="boost" color={theme.colors.bullish[500]} />
            </div>
            <p>{poolAprs.boost.maxDecimals(1).toString()}</p>
          </div>
        )}
        {poolAprs?.superfluid && (
          <BreakdownRow
            label={t("pools.aprBreakdown.superfluid")}
            value={poolAprs.superfluid}
          />
        )}
      </div>

      {poolAprs?.totalApr && (
        <div
          className={classNames(
            "subtitle1 flex w-full place-content-between items-center rounded-lg bg-osmoverse-825 py-1 px-3",
            {
              "text-bullish-500": Boolean(poolAprs?.boost),
            }
          )}
        >
          <p>{t("pools.aprBreakdown.total")}</p>
          <p>{poolAprs.totalApr.maxDecimals(1).toString()}</p>
        </div>
      )}
    </div>
  );
});

const BreakdownRow: FunctionComponent<{
  label: string;
  value: RatePretty;
}> = ({ label, value }) => (
  <div className="body2 flex w-full place-content-between items-center px-3">
    <p className="text-white-full">{label}</p>
    <p className="text-osmoverse-200">{value.maxDecimals(1).toString()}</p>
  </div>
);
