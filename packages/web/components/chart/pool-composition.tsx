import { CoinPretty } from "@osmosis-labs/unit";
import { FunctionComponent } from "react";

import { EntityImage } from "~/components/ui/entity-image";

export const PoolComposition: FunctionComponent<{
  assets: CoinPretty[];
}> = ({ assets }) => {
  return (
    <ul className="space-y-1">
      {assets.map((asset) => (
        <li key={asset.denom} className="flex items-center tracking-wide">
          {asset.currency.coinImageUrl && (
            <div className="mr-2 h-[20px] w-[20px]">
              <EntityImage
                logoURIs={{
                  png: asset.currency.coinImageUrl,
                }}
                name={asset.currency.coinDenom}
                symbol={asset.currency.coinDenom}
                width={20}
                height={20}
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
