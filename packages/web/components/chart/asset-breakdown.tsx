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
      className={classNames(
        "grid w-full md:!grid-cols-2 md:p-6 md:rounded-2xl md:bg-osmoverse-900"
      )}
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
            <div className="md:flex md:items-center md:gap-1">
              <div
                className={classNames(
                  "hidden md:block h-4 w-4 rounded-full",
                  colorCycle[index % colorCycle.length]
                )}
              />
              <span className="subtitle1 md:body2 text-osmoverse-400">
                {amount.currency.coinDenom}:{" "}
                {assetPercentages[index].toString()}%
              </span>
            </div>
            <h5 className="md:subtitle2 text-osmoverse-100">
              {amount.maxDecimals(0).hideDenom(true).toString()}
            </h5>
          </div>
          <div
            className={classNames(
              "md:hidden flex w-full h-3",
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
