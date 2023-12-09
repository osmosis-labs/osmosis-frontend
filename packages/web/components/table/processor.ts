import { Dec } from "@keplr-wallet/unit";

import { AssetCell } from "~/components/table/cells";
import { DataSorter } from "~/hooks/data/data-sorter";

const linkedDenoms = [
  ["AXL", "USDC.axl", "USDT.axl", "wstETH.axl", "DOT.axl"],
  ["GRAV", "USDC.grv", "USDT.grv", "WETH.grv"],
  [
    "STRD",
    "stATOM",
    "stOSMO",
    "stSTARS",
    "stJUNO",
    "stLUNA",
    "stEVMOS",
    "stUMEE",
    "stSOMM",
  ],
  ["QCK", "qATOM", "qOSMO", "qSOMM", "qREGEN", "qSTARS"],
  ["IBCX", "stIBCX"],
];

// const nonCanonicalDenoms = [
//   "WETH.grv",
//   "USDT.axl",
//   "USDT.grv",
//   "USDC.grc",
//   "USDC.axl",
// ];

export class AssetsDataSorter extends DataSorter<AssetCell> {
  override process(key: string = ""): AssetCell[] {
    let results = super.process(key);

    if (key === "marketCapRaw") {
      results = results.sort((a, b) => {
        var aMarketCap: Dec = new Dec(a.marketCapRaw ?? "0");
        var bMarketCap: Dec = new Dec(b.marketCapRaw ?? "0");

        for (var linkedDenom in linkedDenoms) {
          if (linkedDenom.includes(a.currency.coinDenom)) {
            var parentAsset: AssetCell | undefined = results.find((result) => {
              result.assetName === linkedDenom[0];
            });
            aMarketCap = new Dec(parentAsset?.marketCapRaw ?? "0");
          }

          if (linkedDenom.includes(b.currency.coinDenom)) {
            var parentAsset: AssetCell | undefined = results.find((result) => {
              result.assetName === linkedDenom[0];
            });
            bMarketCap = new Dec(parentAsset?.marketCapRaw ?? "0");
          }
        }

        for (var linkedDenom in linkedDenoms) {
          if (linkedDenom.includes(a.currency.coinDenom)) {
            if (linkedDenom.includes(b.currency.coinDenom)) {
              return linkedDenom.indexOf(a.currency.coinDenom) <
                linkedDenom.indexOf(b.currency.coinDenom)
                ? -1
                : 1;
            }
          }
        }

        if (aMarketCap.lt(bMarketCap)) {
          return -1;
        }

        if (aMarketCap.gt(bMarketCap)) {
          return 1;
        }

        return 0;

        // return aCanonical === bCanonical ? 0 : aCanonical ? -1 : 1;
      });
    }

    return results;
  }
}
