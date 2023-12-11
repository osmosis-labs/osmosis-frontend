import { Dec, PricePretty } from "@keplr-wallet/unit";
import { CellContext } from "@tanstack/react-table";
import classNames from "classnames";
import { useMemo } from "react";

import { ColumnCellCell } from "~/components/earn/table/columns";
import { Strategy } from "~/components/earn/table/types/strategy";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";

interface StrategyNameCellProps {
  name: string;
  strategyMethod: string;
  platformName: string;
}

export const StrategyNameCell = ({
  name,
  platformName,
  strategyMethod,
}: StrategyNameCellProps) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col">
        <p className="text-white whitespace-nowrap text-left font-subtitle1 1.5xs:text-sm">
          {name}
        </p>
        <div className="flex items-center gap-2">
          <small className="text-sm font-subtitle1 text-osmoverse-400 1.5xs:text-xs">
            {platformName}
          </small>
          <div className="flex items-center justify-center rounded-xl bg-[#9D23E8] px-1.5">
            <span className="text-white text-sm font-subtitle1 leading-6 1.5xs:text-xs">
              {strategyMethod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const TVLCell = (item: CellContext<Strategy, number>) => {
  const fluctuation = item.row.original.tvl.fluctuation;
  const { priceStore } = useStore();
  const isFluctuationPositive = useMemo(() => fluctuation > 0, [fluctuation]);
  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  return (
    <div className="flex flex-col">
      <ColumnCellCell>
        {fiat && formatPretty(new PricePretty(fiat, new Dec(item.getValue())))}
      </ColumnCellCell>
      <small
        className={classNames("text-xs font-subtitle2 font-medium", {
          "text-bullish-400": isFluctuationPositive,
          "text-osmoverse-500": !isFluctuationPositive,
        })}
      >
        {fluctuation}%
      </small>
    </div>
  );
};
