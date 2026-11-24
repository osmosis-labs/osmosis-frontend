import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { Asset, AssetList } from "@osmosis-labs/types";
import { makeMinimalAsset } from "@osmosis-labs/utils";

import { AssetLists as MockAssetLists } from "../../../__tests__/mock-asset-lists";
import { getAssets } from "../index";
import { findPriceAsset } from "../price";

/** The web package's generated asset list (gitignored, present after `yarn generate`). */
const GENERATED_ASSET_LISTS_PATH = join(
  __dirname,
  "../../../../../../web/config/generated/asset-lists.data.json"
);

/** Reference: the `findMinDenomOrSymbol` path of `filterAssetList` before indexing. */
function referenceFindAssets(
  assetLists: AssetList[],
  findMinDenomOrSymbol: string,
  includePreview: boolean
) {
  return assetLists
    .flatMap(({ assets }) => assets)
    .filter((asset) => includePreview || !asset.preview)
    .filter(
      (asset) =>
        findMinDenomOrSymbol.toUpperCase() ===
          asset.coinMinimalDenom.toUpperCase() ||
        findMinDenomOrSymbol.toUpperCase() === asset.symbol.toUpperCase()
    )
    .map(makeMinimalAsset);
}

/** Reference: the lookup in `getAssetPrice` before indexing. */
function referenceFindPriceAsset(
  assetLists: AssetList[],
  {
    coinMinimalDenom,
    chainId,
    address,
    sourceDenom,
  }: {
    coinMinimalDenom?: string;
    chainId?: number | string;
    address?: string;
    sourceDenom?: string;
  }
): Asset | undefined {
  return assetLists
    .map((assets) => assets.assets)
    .flat()
    .find(
      (asset) =>
        (coinMinimalDenom && asset.coinMinimalDenom === coinMinimalDenom) ||
        (chainId &&
          address &&
          asset.counterparty.some(
            (counterparty) =>
              "chainId" in counterparty &&
              "address" in counterparty &&
              counterparty.chainId === chainId &&
              counterparty.address.toLowerCase() === address.toLowerCase()
          )) ||
        (sourceDenom && asset.sourceDenom === sourceDenom)
    );
}

function expectSameLookups(assetLists: AssetList[]) {
  const assets = assetLists.flatMap(({ assets }) => assets);

  const keys = new Set<string>(["", "NOT-A-DENOM"]);
  for (const asset of assets) {
    keys.add(asset.coinMinimalDenom.toUpperCase());
    keys.add(asset.symbol.toUpperCase());
    // As given, to cover case-insensitive matching of mixed-case inputs.
    keys.add(asset.coinMinimalDenom);
    keys.add(asset.symbol.toLowerCase());
  }
  for (const key of keys) {
    for (const includePreview of [true, false]) {
      const actual = getAssets({
        assetLists,
        findMinDenomOrSymbol: key,
        includePreview,
      });
      // The empty key isn't a lookup (it lists all assets), so it's only checked
      // through the price lookup below.
      if (key === "") continue;
      expect(actual).toEqual(
        referenceFindAssets(assetLists, key, includePreview)
      );
    }
  }

  type PriceQuery = Parameters<typeof findPriceAsset>[1];
  const queries: PriceQuery[] = [
    { coinMinimalDenom: "" },
    { coinMinimalDenom: "not-a-denom" },
    { sourceDenom: "not-a-denom" },
    { chainId: 1, address: "0xnot-an-address" },
  ];
  for (const asset of assets) {
    queries.push({ coinMinimalDenom: asset.coinMinimalDenom });
    queries.push({ sourceDenom: asset.sourceDenom });
    // Several criteria at once: the first asset matching any of them wins.
    queries.push({
      coinMinimalDenom: asset.coinMinimalDenom,
      sourceDenom: asset.sourceDenom,
    });
    for (const counterparty of asset.counterparty) {
      if (!("chainId" in counterparty) || !("address" in counterparty)) {
        continue;
      }
      const { chainId, address } = counterparty;
      queries.push({ chainId, address });
      queries.push({ chainId, address: address.toUpperCase() });
      // A chain id of the other type must not match (strict comparison).
      queries.push({ chainId: String(chainId), address });
      queries.push({ chainId, address, sourceDenom: asset.sourceDenom });
    }
  }
  for (const query of queries) {
    expect(findPriceAsset(assetLists, query)).toBe(
      referenceFindPriceAsset(assetLists, query)
    );
  }
}

describe("asset list index", () => {
  it("matches the unindexed lookups on the mock asset lists", () => {
    expectSameLookups(MockAssetLists);
  });

  // The full list is only present once `yarn generate` ran in the web package.
  (existsSync(GENERATED_ASSET_LISTS_PATH) ? it : it.skip)(
    "matches the unindexed lookups on the generated asset lists",
    () => {
      const assetLists = JSON.parse(
        readFileSync(GENERATED_ASSET_LISTS_PATH, "utf8")
      ) as AssetList[];
      expectSameLookups(assetLists);
    }
  );

  it("covers denom/symbol collisions and preview assets", () => {
    const base = MockAssetLists[0].assets[0];
    const assetLists: AssetList[] = [
      {
        ...MockAssetLists[0],
        assets: [
          { ...base, coinMinimalDenom: "ufoo", symbol: "BAR", preview: true },
          { ...base, coinMinimalDenom: "bar", symbol: "FOO", preview: false },
          { ...base, coinMinimalDenom: "Foo", symbol: "foo", preview: false },
          { ...base, coinMinimalDenom: "ufoo", symbol: "UFOO", preview: false },
        ],
      },
    ];
    expectSameLookups(assetLists);
    expect(
      getAssets({ assetLists, findMinDenomOrSymbol: "foo" }).map(
        (asset) => asset.coinMinimalDenom
      )
    ).toEqual(["bar", "Foo"]);
    expect(
      getAssets({
        assetLists,
        findMinDenomOrSymbol: "bar",
        includePreview: true,
      }).map((asset) => asset.coinMinimalDenom)
    ).toEqual(["ufoo", "bar"]);
  });
});
