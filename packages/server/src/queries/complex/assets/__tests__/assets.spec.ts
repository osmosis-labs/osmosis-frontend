import { AssetLists as MockAssetLists } from "../../../__tests__/mock-asset-lists";
import { getAsset, getAssets } from "../index";

describe("getAssets", () => {
  describe("search", () => {
    it("should return assets that match search", () => {
      const assets = getAssets({
        search: { query: "acre" },
        assetLists: MockAssetLists,
      });

      // ACRE should clearly be the best search result
      expect(assets.length).toBeTruthy();
      expect(assets[0].coinDenom).toEqual("ACRE");
    });

    it("should be possible to search IBC denoms", () => {
      const assets = getAssets({
        search: {
          query:
            "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
        },
        assetLists: MockAssetLists,
      });

      // OSMO should clearly be the best search result
      expect(assets.length).toBeTruthy();
      expect(assets[0].coinDenom).toEqual("stLUNA");
    });

    it("should not return preview assets", () => {
      const assets = getAssets({
        search: { query: "PURSE" },
        assetLists: MockAssetLists,
      });

      expect(
        assets.find(({ coinDenom }) => coinDenom === "PURSE")
      ).toBeUndefined();
    });

    it("should filter unverified assets if specified", async () => {
      const assets = getAssets({
        assetLists: MockAssetLists,
        onlyVerified: true,
      });

      expect(assets.some((asset) => !asset.isVerified)).toBeFalsy();
    });

    it("should include unverified assets by default", async () => {
      const assets = getAssets({
        assetLists: MockAssetLists,
      });

      expect(assets.some((asset) => !asset.isVerified)).toBeTruthy();
    });

    it("should filter assets by category", () => {
      const assets = getAssets({
        assetLists: MockAssetLists,
        categories: ["defi"],
      });

      expect(assets.some((asset) => asset.coinDenom === "OSMO")).toBeTruthy();
      expect(assets.some((asset) => asset.coinDenom === "ION")).toBeFalsy();
    });
  });
});

describe("getAsset", () => {
  it("should return the asset that matches the provided denom", async () => {
    const asset = getAsset({
      assetLists: MockAssetLists,
      anyDenom: "ACRE",
    });

    expect(asset).toBeTruthy();
    expect(asset.coinDenom).toEqual("ACRE");
  });

  it("should throw if no asset matches the provided denom", () => {
    expect(() =>
      getAsset({ assetLists: MockAssetLists, anyDenom: "NON_EXISTING_DENOM" })
    ).toThrow();
  });
});
