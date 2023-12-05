import { ColumnCellCell } from "~/components/earn/tabs/table-helpers";

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
        <p className="text-white font-subtitle1">{name}</p>
        <div className="flex gap-2">
          <small className="text-sm font-subtitle1 text-osmoverse-400">
            {platformName}
          </small>
          <div className="flex items-center justify-center rounded-xl bg-[#9D23E8] px-1.5">
            <span className="text-white text-sm font-subtitle1 leading-6">
              {strategyMethod}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface TVLCellProps {
  value: number;
  fluct: number;
}

export const TVLCell = ({ fluct, value }: TVLCellProps) => {
  return (
    <div className="flex flex-col">
      <ColumnCellCell>{value}</ColumnCellCell>
      <small className="text-xs font-subtitle2 font-medium text-bullish-400">
        {fluct}%
      </small>
    </div>
  );
};
