import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { AprBreakdownLegacy } from "~/components/cards/apr-breakdown";
import { Tooltip } from "~/components/tooltip";
import { useStore } from "~/stores";

export const AprBreakdownCell: FunctionComponent<{
  poolId: string;
}> = observer(({ poolId }) => {
  const { queriesExternalStore } = useStore();
  const poolAprs = queriesExternalStore.queryPoolAprs.getForPool(poolId);

  return (
    <Tooltip
      rootClassNames="!rounded-[20px] drop-shadow-md"
      content={<AprBreakdownLegacy poolId={poolId} />}
    >
      <div
        className={classNames("ml-auto flex items-center gap-1.5", {
          "text-bullish-500": Boolean(poolAprs?.boost || poolAprs?.osmosis),
        })}
      >
        {(poolAprs?.boost || poolAprs?.osmosis) && (
          <div className="rounded-full bg-[#003F4780]">
            <Icon id="boost" className="h-4 w-4 text-bullish-500" />
          </div>
        )}
        {poolAprs?.totalApr?.maxDecimals(0).toString() ?? ""}
      </div>
    </Tooltip>
  );
});
