import React, { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { PoolCompositionCell } from "~/components/table/cells/pool-composition";
import { useTranslation } from "~/hooks";

export interface PoolQuickActionCell
  extends Pick<PoolCompositionCell, "poolId"> {
  onAddLiquidity?: () => void;
}

export const PoolQuickActionCell: FunctionComponent<
  Partial<PoolQuickActionCell>
> = ({ onAddLiquidity }) => {
  const { t } = useTranslation();

  if (!onAddLiquidity) return null;

  return (
    <button
      type="button"
      aria-label={t("addLiquidity.title")}
      className="flex items-center text-wosmongton-300 transition-colors hover:text-wosmongton-200"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onAddLiquidity();
      }}
    >
      <Icon id="plus" className="h-5 w-5" />
    </button>
  );
};
