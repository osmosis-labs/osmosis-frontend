import { CoinPretty, RatePretty } from "@keplr-wallet/unit";
import Image from "next/image";
import { FunctionComponent } from "react";

const PoolComposition: FunctionComponent<{
  assets: {
    ratio: RatePretty;
    asset: CoinPretty;
  }[];
}> = ({ assets }) => {
  return (
    <ul className="space-y-1">
      {assets.map(({ asset }) => (
        <li key={asset.denom} className="flex items-center tracking-wide">
          {asset.currency.coinImageUrl && (
            <div className="mr-2 h-[20px] w-[20px]">
              <Image
                src={asset.currency.coinImageUrl}
                width={20}
                height={20}
                alt="asset image"
              />
            </div>
          )}
          <span className="mr-1 text-osmoverse-300">{asset.denom}</span>
          <span className="text-osmoverse-100">
            {asset.trim(true).hideDenom(true).maxDecimals(4).toString()}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default PoolComposition;
