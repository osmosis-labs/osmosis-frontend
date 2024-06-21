import { Dec, RatePretty } from "@keplr-wallet/unit";
import type { PoolDataRange, PoolIncentives } from "@osmosis-labs/server";
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
      total={{
        lower: totalApr,
        upper: totalApr,
      }}
      swapFee={{
        lower: poolAprs?.swapFees,
        upper: poolAprs?.swapFees,
      }}
      superfluid={{
        lower: poolAprs?.superfluid,
        upper: poolAprs?.superfluid,
      }}
      osmosis={{
        lower: poolAprs?.osmosis,
        upper: poolAprs?.osmosis,
      }}
      boost={{
        lower: boostApr,
        upper: boostApr,
      }}
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
            {osmosis.upper.toDec().equals(osmosis.lower.toDec()) ? (
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
            {boost.upper.toDec().equals(boost.lower.toDec()) ? (
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
          {total.upper.toDec().equals(total.lower.toDec()) ? (
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
    {value.lower?.toDec().equals(value.upper?.toDec() ?? new Dec(0)) ? (
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
