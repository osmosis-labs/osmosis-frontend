import { RatePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { Tooltip } from "~/components/tooltip";
import { useTranslation } from "~/hooks";
import { useStore } from "~/stores";
import { theme } from "~/tailwind.config";

export const ClAprBreakdownCell: FunctionComponent<{
  poolId: string;
  apr: RatePretty;
}> = observer(({ poolId, apr }) => {
  const { queriesExternalStore } = useStore();
  const poolAprs = queriesExternalStore.queryPoolAprs.getForPool(poolId);

  return (
    <Tooltip
      rootClassNames="!rounded-[20px] drop-shadow-md"
      content={<BreakdownPopup poolId={poolId} />}
    >
      <p
        className={classNames("ml-auto flex items-center gap-1.5", {
          "text-bullish-500": Boolean(poolAprs.boost),
        })}
      >
        {poolAprs?.boost ? (
          <div className="rounded-full bg-[#003F4780]">
            <Icon id="boost" className="h-4 w-4 text-bullish-500" />
          </div>
        ) : (
          <Icon id="info" className="h-4 w-4 text-osmoverse-400" />
        )}
        {apr.maxDecimals(0).toString()}
      </p>
    </Tooltip>
  );
});

const BreakdownPopup: FunctionComponent<{ poolId: string }> = observer(
  ({ poolId }) => {
    const { queriesExternalStore } = useStore();
    const poolAprs = queriesExternalStore.queryPoolAprs.getForPool(poolId);
    const { t } = useTranslation();

    return (
      <div className="flex w-60 flex-col gap-4 p-5">
        <div className="flex flex-col gap-2">
          {poolAprs?.swapFees && (
            <BreakdownRow
              label={t("pools.aprBreakdown.swapFees")}
              value={poolAprs.swapFees}
            />
          )}
          {poolAprs?.osmosis && (
            <BreakdownRow label={"Osmosis"} value={poolAprs.osmosis} />
          )}
          {poolAprs?.boost && (
            <div className="body2 flex w-full place-content-between items-center px-3 text-bullish-500">
              <div className="flex place-content-between items-center gap-1">
                <p>{t("pools.aprBreakdown.boost")}</p>
                <Icon id="boost" color={theme.colors.bullish[500]} />
              </div>
              <p>{poolAprs.boost.maxDecimals(1).toString()}</p>
            </div>
          )}
        </div>

        {poolAprs?.totalApr && (
          <div
            className={classNames(
              "subtitle1 flex w-full place-content-between items-center rounded-lg bg-osmoverse-825 py-1 px-3",
              {
                "text-bullish-500": Boolean(poolAprs.boost),
              }
            )}
          >
            <p>{t("pools.aprBreakdown.total")}</p>
            <p>{poolAprs.totalApr.maxDecimals(1).toString()}</p>
          </div>
        )}
      </div>
    );
  }
);

const BreakdownRow: FunctionComponent<{
  label: string;
  value: RatePretty;
}> = ({ label, value }) => (
  <div className="body2 flex w-full place-content-between items-center px-3">
    <p className="text-white-full">{label}</p>
    <p className="text-osmoverse-200">{value.maxDecimals(1).toString()}</p>
  </div>
);
