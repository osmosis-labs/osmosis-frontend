import { CoinPretty, Dec, Int, IntPretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import { FunctionComponent } from "react";

import { useWindowSize } from "../../hooks";
import { truncateString } from "../../utils/string";

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
  const { isMobile } = useWindowSize();

  const assetPercentages = assets.map(({ weight }) =>
    weight.quo(totalWeight).mul(new Dec(100))
  );
  const gridTemplateColumns = assets.map(
    (_, index) => `${assetPercentages[index].toString()}fr`
  );

  return (
    <div
      className={classNames(
        "grid w-full md:!grid-cols-2 md:rounded-2xl md:bg-osmoverse-900 md:p-6"
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
                  "hidden h-4 w-4 rounded-full md:block",
                  colorCycle[index % colorCycle.length]
                )}
              />
              <span
                className="subtitle1 md:body2 text-osmoverse-400"
                title={amount.currency.coinDenom}
              >
                {truncateString(amount.currency.coinDenom, isMobile ? 6 : 12)}:{" "}
                {assetPercentages[index].toString()}%
              </span>
            </div>
            <h6 className="md:subtitle2 text-osmoverse-100">
              {amount.toDec().round().gt(new Int(0))
                ? amount.maxDecimals(0).hideDenom(true).toString()
                : amount.maxDecimals(8).hideDenom(true).toString()}
            </h6>
          </div>
          <div
            className={classNames(
              "flex h-2 w-full md:hidden",
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
