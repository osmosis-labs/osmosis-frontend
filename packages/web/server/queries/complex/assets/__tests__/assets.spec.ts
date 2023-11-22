import { AssetLists } from "~/config/asset-list/mock-asset-lists";

import { getAssets } from "../index";

describe("getAssets", () => {
  it("should return assets", async () => {
    const assets = await getAssets({}, AssetLists);
    expect(assets.length).toEqual(
      AssetLists.flatMap((assetList) => assetList.assets).length
    );

    const denoms = assets.map((asset) => asset.coinDenom);
    const symbols = AssetLists.flatMap((assetList) => assetList.assets).map(
      (a) => a.symbol
    );
    expect(denoms).toEqual(symbols);
  });

  describe("search", () => {
    it("should return assets that match search", async () => {
      const assets = await getAssets({ search: { query: "acre" } }, AssetLists);

      // ACRE should clearly be the best search result
      expect(assets.length).toBeTruthy();
      expect(assets[0].coinDenom).toEqual("ACRE");
    });

    it("should be possible to search IBC denoms", async () => {
      const assets = await getAssets(
        {
          search: {
            query:
              "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
          },
        },
        AssetLists
      );

      // OSMO should clearly be the best search result
      expect(assets.length).toBeTruthy();
      expect(assets[0].coinDenom).toEqual("stLUNA");
    });
  });

  describe("sorting", () => {
    it("should sort assets by coin denom", async () => {
      const assets = await getAssets(
        { sort: { keyPath: "coinDenom" } },
        AssetLists
      );

      expect(assets.length).toBeTruthy();
      expect(assets[0].coinDenom).toEqual("AAVE");
      expect(assets[1].coinDenom).toEqual("ACRE");
    });

    it("should sort assets by coinMinimalDenom", async () => {
      const assets = await getAssets(
        { sort: { keyPath: "coinMinimalDenom" } },
        AssetLists
      );

      expect(assets.length).toBeTruthy();
      expect(assets[0].coinDenom).toEqual("IBCX");
      expect(assets[1].coinDenom).toEqual("ampOSMO");
    });
  });
});
