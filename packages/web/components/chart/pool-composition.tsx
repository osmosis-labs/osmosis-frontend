import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { FunctionComponent } from "react";

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
    </div>
  );
};

export default PoolComposition;
