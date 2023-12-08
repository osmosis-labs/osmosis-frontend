import { Dec } from "@keplr-wallet/unit";

import { AssetCell } from "~/components/table/cells";
import { DataSorter } from "~/hooks/data/data-sorter";

const nonCanonicalDenoms = [
  "WETH.grv",
  "USDT.axl",
  "USDT.grv",
  "USDC.grc",
  "USDC.axl",
];

export class AssetsDataSorter extends DataSorter<AssetCell> {
  override process(key: string = ""): AssetCell[] {
    let results = super.process(key);

    if (key === "marketCapRaw") {
      results = results.sort((a, b) => {
        const aMarketCap: Dec = new Dec(a.marketCapRaw ?? "0");
        const bMarketCap: Dec = new Dec(b.marketCapRaw ?? "0");

        const aCanonical = nonCanonicalDenoms.includes(a.currency.coinDenom);
        const bCanonical = nonCanonicalDenoms.includes(b.currency.coinDenom);

        if (aMarketCap.lt(bMarketCap)) {
          return -1;
        }

        if (aMarketCap.gt(bMarketCap)) {
          return 1;
        }

        return aCanonical === bCanonical ? 0 : aCanonical ? -1 : 1;
      });
    }

    return results;
  }
}
