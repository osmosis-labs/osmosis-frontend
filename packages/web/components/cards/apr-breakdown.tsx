import { RatePretty } from "@keplr-wallet/unit";
import type { PoolIncentives } from "@osmosis-labs/server";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { FunctionComponent } from "react";

import { EXCLUDED_EXTERNAL_BOOSTS_POOL_IDS } from "~/config";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";

import { Icon } from "../assets";
import { AprDisclaimerTooltip } from "../tooltip/apr-disclaimer";
import { CustomClasses } from "../types";

/**
 * Pools that are excluded from showing external boost incentives APRs.
 */
const ExcludedExternalBoostPools: string[] =
  (EXCLUDED_EXTERNAL_BOOSTS_POOL_IDS ?? []) as string[];

/** @deprecated uses Mobx query stores, do not use */
export const AprBreakdownLegacy: FunctionComponent<
  { poolId: string; showDisclaimerTooltip?: boolean } & CustomClasses
> = observer(({ poolId, className, showDisclaimerTooltip }) => {
  const { queriesExternalStore } = useStore();
  const poolAprs = queriesExternalStore.queryPoolAprs.getForPool(poolId);

  let totalApr = poolAprs?.totalApr;
  let boostApr = poolAprs?.boost;

  if (
    poolAprs?.poolId &&
    ExcludedExternalBoostPools.includes(poolAprs.poolId) &&
    totalApr &&
    boostApr
  ) {
    totalApr = new RatePretty(totalApr.toDec().sub(boostApr.toDec()));
    boostApr = undefined;
  }

  return (
    <AprBreakdown
      total={totalApr}
      swapFee={poolAprs?.swapFees}
      superfluid={poolAprs?.superfluid}
      osmosis={poolAprs?.osmosis}
      boost={boostApr}
      className={className}
      showDisclaimerTooltip={showDisclaimerTooltip}
    />
  );
});

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
    <div className={classNames("flex w-60 flex-col gap-4 p-5", className)}>
      <div className="flex flex-col gap-2">
        {swapFee && (
          <BreakdownRow
            label={t("pools.aprBreakdown.swapFees")}
            value={swapFee}
          />
        )}
        {osmosis && (
          <div className="body2 flex w-full place-content-between items-center px-3 text-bullish-500">
            <div className="flex place-content-between items-center gap-1">
              <p>OSMO {t("pools.aprBreakdown.boost")}</p>
              <Icon id="boost" color={theme.colors.bullish[500]} />
            </div>
            <p>{osmosis.maxDecimals(1).toString()}</p>
          </div>
        )}
        {superfluid && (
          <BreakdownRow
            label={t("pools.aprBreakdown.superfluid")}
            value={superfluid}
          />
        )}
        {boost && (
          <div className="body2 flex w-full place-content-between items-center px-3 text-bullish-500">
            <div className="flex place-content-between items-center gap-1">
              <p>{t("pools.aprBreakdown.externalBoost")}</p>
              <Icon id="boost" color={theme.colors.bullish[500]} />
            </div>
            <p>{boost.maxDecimals(1).toString()}</p>
          </div>
        )}
      </div>

      {total && (
        <div
          className={classNames(
            "subtitle1 flex w-full place-content-between items-center rounded-lg bg-osmoverse-825 py-1 px-3",
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
          <p>{total.maxDecimals(1).toString()}</p>
        </div>
      )}
    </div>
  );
};

const BreakdownRow: FunctionComponent<{
  label: string;
  value: RatePretty;
}> = ({ label, value }) => (
  <div className="body2 flex w-full place-content-between items-center px-3">
    <p className="text-white-full">{label}</p>
    <p className="text-osmoverse-200">{value.maxDecimals(1).toString()}</p>
  </div>
);
