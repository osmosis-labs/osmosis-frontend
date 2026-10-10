import type { Asset, AssetList } from "@osmosis-labs/types";

/** Wire contract: assetlists/.github/workflows/utility/compact_assetlist.mjs.
 * null is missing/default, trailing nulls are omitted; nested metadata is intact.
 * Fields travel with the data, so new optional fields survive older consumers.
 */
export interface CompactAssetList {
  format: "osmosis-assetlist-v1";
  chainName: string;
  fields: string[];
  defaults: Record<string, unknown>;
  rows: unknown[][];
}

const DEFAULTS: Record<string, unknown> = {
  categories: [],
  transferMethods: [],
  counterparty: [],
  isAlloyed: false,
  verified: false,
  unstable: false,
  disabled: false,
  preview: false,
};
const same = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
const unsafe = (key: string) =>
  ["__proto__", "constructor", "prototype"].includes(key);

/** Used at build time, not in the browser. */
export function encodeAssetList({
  chainName,
  assets,
}: {
  chainName: string;
  assets: Asset[];
}): CompactAssetList {
  const records = assets as unknown as Record<string, unknown>[];
  const defaults = Object.fromEntries(
    Object.entries(DEFAULTS).filter(
      ([key]) =>
        records.length > 0 &&
        records.every((asset) => Object.hasOwn(asset, key))
    )
  );
  const keys = [...new Set(records.flatMap(Object.keys))];
  for (const asset of records) {
    for (const [key, value] of Object.entries(asset)) {
      if (unsafe(key) || value == null) {
        throw new Error(`Unsupported asset field: ${key}`);
      }
    }
  }
  const counts = new Map(
    keys.map((key) => [
      key,
      records.filter(
        (asset) => Object.hasOwn(asset, key) && !same(asset[key], defaults[key])
      ).length,
    ])
  );
  const fields = keys.sort(
    (a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b, "en")
  );
  const rows = records.map((asset) => {
    const row = fields.map((key) =>
      !Object.hasOwn(asset, key) || same(asset[key], defaults[key])
        ? null
        : asset[key]
    );
    while (row.length && row[row.length - 1] === null) row.pop();
    return row;
  });
  return { format: "osmosis-assetlist-v1", chainName, fields, defaults, rows };
}

export function decodeAssetList(data: CompactAssetList): {
  chainName: string;
  assets: Asset[];
} {
  if (
    data.format !== "osmosis-assetlist-v1" ||
    !Array.isArray(data.fields) ||
    !Array.isArray(data.rows) ||
    new Set(data.fields).size !== data.fields.length ||
    data.fields.some((key) => typeof key !== "string" || unsafe(key)) ||
    !data.defaults ||
    Object.keys(data.defaults).some(
      (key) =>
        !data.fields.includes(key) ||
        !Object.hasOwn(DEFAULTS, key) ||
        !same(data.defaults[key], DEFAULTS[key])
    )
  ) {
    throw new Error("Invalid compact asset list");
  }
  const assets = data.rows.map((row) => {
    if (!Array.isArray(row) || row.length > data.fields.length) {
      throw new Error("Invalid asset row");
    }
    // Fresh arrays per asset: consumers may mutate metadata.
    const asset = Object.fromEntries(
      Object.entries(data.defaults).map(([key, value]) => [
        key,
        Array.isArray(value) ? [...value] : value,
      ])
    );
    row.forEach((value, i) => {
      if (value !== null) asset[data.fields[i]] = value;
    });
    return asset as unknown as Asset;
  });
  return { chainName: data.chainName, assets };
}

export interface CompactAssetLists {
  table: CompactAssetList;
  groups: { chain_name: string; chain_id: string; count: number }[];
}

/** Preserve the public AssetLists API, but embed rows rather than repeated keys. */
export function encodeAssetLists(lists: AssetList[]): CompactAssetLists {
  return {
    table: encodeAssetList({
      chainName: "",
      assets: lists.flatMap(({ assets }) => assets),
    }),
    groups: lists.map(({ chain_name, chain_id, assets }) => ({
      chain_name,
      chain_id,
      count: assets.length,
    })),
  };
}

export function decodeAssetLists(data: CompactAssetLists): AssetList[] {
  const { assets } = decodeAssetList(data.table);
  let offset = 0;
  const lists = data.groups.map(({ count, ...chain }) => {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error("Invalid asset group");
    }
    const group = { ...chain, assets: assets.slice(offset, offset + count) };
    offset += count;
    return group;
  });
  if (offset !== assets.length) throw new Error("Invalid asset group coverage");
  return lists;
}
