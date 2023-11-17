import { AssetLists } from "~/config/asset-list/mock-asset-lists";

import { getAssets } from "../index";

describe("getAssets", () => {
  it("should return assets", async () => {
    const assets = await getAssets({}, AssetLists);
    expect(assets.length).toEqual(
      AssetLists.flatMap((assetList) => assetList.assets).length
    );

    const minSymbols = assets.map((asset) => asset.symbol);
    const symbols = AssetLists.flatMap((assetList) => assetList.assets).map(
      (a) => a.symbol
    );
    expect(minSymbols).toEqual(symbols);
  });

  describe("search", () => {
    it("should return assets that match search", async () => {
      const assets = await getAssets({ query: "osmo" }, AssetLists);

      // OSMO should clearly be the best search result
      expect(assets[0].symbol).toEqual("OSMO");
    });

    it("should be possible to search IBC denoms", async () => {
      const assets = await getAssets(
        {
          query:
            "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
        },
        AssetLists
      );

      // OSMO should clearly be the best search result
      expect(assets[0].symbol).toEqual("stLUNA");
    });
  });

  describe("sorting", () => {
    it("should sort assets by symbol", async () => {
      const assets = await getAssets({ keyPath: "symbol" }, AssetLists);

      expect(assets[0].symbol).toEqual("AAVE");
      expect(assets[1].symbol).toEqual("ACRE");
    });

    it("should sort assets by base", async () => {
      const assets = await getAssets({ keyPath: "base" }, AssetLists);

      expect(assets[0].symbol).toEqual("IBCX");
      expect(assets[1].symbol).toEqual("ampOSMO");
    });
  });
});
