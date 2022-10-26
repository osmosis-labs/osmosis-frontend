import { FunctionComponent } from "react";
import classNames from "classnames";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";

const ColorCycle = [
  "bg-ion-500",
  "bg-rust-500",
  "bg-bullish-600",
  "bg-ammelia-600",
];

export const AssetBreakdownChart: FunctionComponent<{
  assets: {
    amount: CoinPretty;
    weight: IntPretty;
  }[];
  totalWeight: IntPretty;
  colorCycle?: typeof ColorCycle;
}> = ({ assets, totalWeight, colorCycle = ColorCycle }) => {
  const assetPercentages = assets.map(({ weight }) =>
    weight.quo(totalWeight).mul(new Dec(100))
  );
  const gridTemplateColumns = assets.map(
    (_, index) => `${assetPercentages[index].toString()}fr`
  );

  return (
    <div
      className={classNames("grid w-full")}
      style={{
        gridTemplateColumns: gridTemplateColumns.join(" "),
      }}
    >
      {assets.map(({ amount }, index) => (
        <div
          key={amount.currency.coinDenom}
          className={classNames("flex flex-col gap-2.5")}
        >
          <div>
            <span className="subtitle1 text-osmoverse-400">
              {amount.currency.coinDenom}: {assetPercentages[index].toString()}%
            </span>
            <h5 className="text-osmoverse-100">
              {amount.maxDecimals(0).hideDenom(true).toString()}
            </h5>
          </div>
          <div
            className={classNames(
              "flex w-full h-3",
              colorCycle[index % colorCycle.length],
              {
                "rounded-l-full": index === 0,
                "rounded-r-full": index === assets.length - 1,
              }
            )}
          />
        </div>
      ))}
    </div>
  );
};
