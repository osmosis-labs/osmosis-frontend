import type { Asset, AssetList } from "@osmosis-labs/types";

/** An asset with its position in the flattened asset lists, so lookups that combine
 *  several indexes can still return the first match in list order. */
type IndexedAsset = { asset: Asset; position: number };

/** Exact-match lookups over one asset list array. */
export type AssetListIndex = {
  /** Every asset (preview included) whose upper-cased `coinMinimalDenom` or `symbol`
   *  is the key, in list order, each asset at most once per key. */
  byUpperDenomOrSymbol: Map<string, Asset[]>;
  /** First asset per exact `coinMinimalDenom`. */
  byMinimalDenom: Map<string, IndexedAsset>;
  /** First asset per exact `sourceDenom`. */
  bySourceDenom: Map<string, IndexedAsset>;
  /** First asset per counterparty chain id and lower-cased address, see `counterpartyKey`. */
  byCounterparty: Map<string, IndexedAsset>;
};

const indexes = new WeakMap<AssetList[], AssetListIndex>();

/** Key for a counterparty lookup. The chain id's type is part of the key since the
 *  lookup compares chain ids strictly (`1` and `"1"` differ). */
export function counterpartyKey(chainId: number | string, address: string) {
  return `${typeof chainId}:${chainId}\u0000${address.toLowerCase()}`;
}

function setFirst<K>(map: Map<K, IndexedAsset>, key: K, value: IndexedAsset) {
  if (!map.has(key)) map.set(key, value);
}

function buildIndex(assetLists: AssetList[]): AssetListIndex {
  const index: AssetListIndex = {
    byUpperDenomOrSymbol: new Map(),
    byMinimalDenom: new Map(),
    bySourceDenom: new Map(),
    byCounterparty: new Map(),
  };
  let position = 0;
  for (const { assets } of assetLists) {
    for (const asset of assets) {
      const entry = { asset, position };
      position += 1;

      const upperDenom = asset.coinMinimalDenom.toUpperCase();
      const upperSymbol = asset.symbol.toUpperCase();
      for (const key of upperDenom === upperSymbol
        ? [upperDenom]
        : [upperDenom, upperSymbol]) {
        const matches = index.byUpperDenomOrSymbol.get(key);
        if (matches) matches.push(asset);
        else index.byUpperDenomOrSymbol.set(key, [asset]);
      }

      setFirst(index.byMinimalDenom, asset.coinMinimalDenom, entry);
      setFirst(index.bySourceDenom, asset.sourceDenom, entry);
      for (const counterparty of asset.counterparty ?? []) {
        if (
          "chainId" in counterparty &&
          "address" in counterparty &&
          typeof counterparty.address === "string"
        ) {
          setFirst(
            index.byCounterparty,
            counterpartyKey(counterparty.chainId, counterparty.address),
            entry
          );
        }
      }
    }
  }
  return index;
}

/** Returns the exact-match index for the given asset list array, built on first use.
 *  Indexes are kept per array identity: asset lists come from a cached query or the
 *  bundled config and are never mutated, so an index stays valid for the array's life. */
export function getAssetListIndex(assetLists: AssetList[]): AssetListIndex {
  let index = indexes.get(assetLists);
  if (!index) {
    index = buildIndex(assetLists);
    indexes.set(assetLists, index);
  }
  return index;
}
