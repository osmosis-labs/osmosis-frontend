import { AssetLists as MockAssetLists } from "../../../__tests__/mock-asset-lists";
import { getAsset, getAssets, getAssetWithVariants } from "../index";

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

describe("getAssetWithVariants", () => {
  it("should return the asset with its variants, with the canonical asset first", () => {
    const result = getAssetWithVariants({
      assetLists: MockAssetLists,
      anyDenom: "USDC",
    });

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "USDC.axl",
          "coinGeckoId": "axlusdc",
          "coinImageUrl": "/tokens/generated/usdc.axl.svg",
          "coinMinimalDenom": "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
          "coinName": "USD Coin (Axelar)",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "USDC",
        },
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "polygon.USDC.axl",
          "coinGeckoId": "usd-coin",
          "coinImageUrl": "/tokens/generated/polygon.usdc.axl.svg",
          "coinMinimalDenom": "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
          "coinName": "USD Coin (Polygon)",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "USDC",
        },
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "avalanche.USDC.axl",
          "coinGeckoId": "usd-coin",
          "coinImageUrl": "/tokens/generated/avalanche.usdc.axl.svg",
          "coinMinimalDenom": "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
          "coinName": "USD Coin (Avalanche)",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "USDC",
        },
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "USDC.grv",
          "coinGeckoId": "gravity-bridge-usdc",
          "coinImageUrl": "/tokens/generated/usdc.grv.svg",
          "coinMinimalDenom": "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
          "coinName": "USDC (Gravity Bridge)",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "USDC",
        },
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "USDC",
          "coinGeckoId": "usd-coin",
          "coinImageUrl": "/tokens/generated/usdc.svg",
          "coinMinimalDenom": "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
          "coinName": "USDC",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "USDC",
        },
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "USDC.wh",
          "coinGeckoId": undefined,
          "coinImageUrl": "/tokens/generated/usdc.wh.svg",
          "coinMinimalDenom": "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
          "coinName": "USD Coin (Wormhole)",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "USDC",
        },
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "solana.USDC.wh",
          "coinGeckoId": undefined,
          "coinImageUrl": "/tokens/generated/solana.usdc.wh.svg",
          "coinMinimalDenom": "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45",
          "coinName": "Solana USD Coin (Wormhole)",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "USDC",
        },
      ]
    `);
  });

  it("should throw an error if the asset is not found", () => {
    expect(() =>
      getAssetWithVariants({
        assetLists: MockAssetLists,
        anyDenom: "unotexist",
      })
    ).toThrow("unotexist not found in asset list");
  });

  it("Should still return assets even if they have no variants", () => {
    expect(
      getAssetWithVariants({
        assetLists: MockAssetLists,
        anyDenom: "ATOM",
      })
    ).toMatchInlineSnapshot(`
      [
        {
          "areTransfersDisabled": false,
          "coinDecimals": 6,
          "coinDenom": "ATOM",
          "coinGeckoId": "cosmos",
          "coinImageUrl": "/tokens/generated/atom.svg",
          "coinMinimalDenom": "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
          "coinName": "Cosmos Hub",
          "contract": undefined,
          "isAlloyed": false,
          "isUnstable": false,
          "isVerified": true,
          "variantGroupKey": "ATOM",
        },
      ]
    `);
  });
});
