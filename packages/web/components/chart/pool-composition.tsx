import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { FunctionComponent } from "react";
import { PieChart } from "./pie-chart";

const ColorCycle = ["#2994D0", "#CA2EBD", "#FA825D", "#29D0B2"];

function getColorByIndex(colorCycle: string[], index: number) {
  return colorCycle[index % colorCycle.length];
}

const PoolComposition: FunctionComponent<{
  assets: {
    ratio: RatePretty;
    asset: CoinPretty;
  }[];
  colorCycle?: typeof ColorCycle;
}> = ({ assets, colorCycle = ColorCycle }) => {
  return (
    <div className="flex items-end space-x-8">
      <ul>
        {assets.map(({ asset }, index) => (
          <li key={asset.denom} className="flex items-center tracking-wider">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ background: getColorByIndex(colorCycle, index) }}
            />
            <span className="mr-1">
              {asset.trim(true).hideDenom(true).maxDecimals(4).toString()}
            </span>
            <span className="text-osmoverse-200">{asset.denom}</span>
          </li>
        ))}
      </ul>

      <PieChart
        width={80}
        height={80}
        data={assets.map(({ asset, ratio }, index) => {
          return {
            id: asset.denom,
            label: asset.denom,
            value: ratio.symbol("").toString(),
            formattedValue:
              "$" + asset.maxDecimals(4).hideDenom(true).trim(true).toString(),
            percentage: ratio.toString(),
            color: getColorByIndex(colorCycle, index),
          };
        })}
        tooltip={({ datum }) => {
          return (
            <div className="flex flex-col bg-osmoverse-800 px-3 py-2 rounded-md ">
              <p className="whitespace-nowrap tracking-wide">
                {datum.data.label}: {datum.data.percentage}
              </p>
              <p className="tracking-wider text-osmoverse-300 text-sm">
                {datum.data.formattedValue}
              </p>
            </div>
          );
        }}
      />
    </div>
  );
};

export default PoolComposition;
