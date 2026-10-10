import type { Asset, AssetList } from "@osmosis-labs/types";

import {
  decodeAssetList,
  decodeAssetLists,
  encodeAssetList,
  encodeAssetLists,
} from "../compact-asset-list";

const asset = {
  chainName: "osmosis",
  sourceDenom: "uosmo",
  coinMinimalDenom: "uosmo",
  symbol: "OSMO",
  name: "Osmosis",
  decimals: 6,
  categories: [],
  transferMethods: [],
  counterparty: [],
  isAlloyed: false,
  verified: false,
  unstable: false,
  disabled: false,
  preview: false,
  relative_image_url: "/tokens/generated/osmo.svg",
} as Asset;

it("roundtrips all metadata, including halts, unknown fields and missing optionals", () => {
  const list = {
    chainName: "osmosis",
    assets: [
      asset,
      {
        ...asset,
        coinMinimalDenom: "ibc/ABC",
        haltDeposits: true,
        depositHaltReason: "manual",
        haltWithdrawals: true,
        withdrawalHaltReason: "bridge_down",
        unstable: true,
        unstableReason: "manual",
        lastDowntimeDate: "2026-01-01T00:00:00Z",
        futureMetadata: { nested: [1, null, false] },
      } as Asset,
    ],
  };
  const compact = encodeAssetList(list);
  expect(decodeAssetList(JSON.parse(JSON.stringify(compact)))).toEqual(list);
  expect(decodeAssetList(compact).assets[0]).not.toHaveProperty("haltDeposits");
  expect(compact.rows.every((row) => row[row.length - 1] !== null)).toBe(true);
});

it("restores grouping, order, symbols and local image paths without shared defaults", () => {
  const lists: AssetList[] = [
    { chain_name: "osmosis", chain_id: "osmosis-1", assets: [asset, asset] },
    { chain_name: "empty", chain_id: "empty-1", assets: [] },
    {
      chain_name: "cosmoshub",
      chain_id: "cosmoshub-4",
      assets: [{ ...asset, symbol: "ATOM" }],
    },
  ];
  const compact = encodeAssetLists(lists);
  const decoded = decodeAssetLists(compact);
  expect(decoded).toEqual(lists);
  decoded[0].assets[0].categories.push("meme");
  expect(decoded[0].assets[1].categories).toEqual([]);
  expect(() => decodeAssetLists({ ...compact, groups: [] })).toThrow(
    "coverage"
  );
  expect(() =>
    decodeAssetLists({
      ...compact,
      groups: [{ chain_name: "bad", chain_id: "bad", count: -1 }],
    })
  ).toThrow("group");
});

it("handles empty lists and does not invent absent fields", () => {
  const list = {
    chainName: "osmosis",
    assets: [asset, { symbol: "X" } as Asset],
  };
  expect(decodeAssetList(encodeAssetList(list))).toEqual(list);
  expect(decodeAssetLists(encodeAssetLists([]))).toEqual([]);
});

it("rejects lossy nulls, invalid versions, duplicate/unsafe columns and corrupt rows", () => {
  const compact = encodeAssetList({ chainName: "osmosis", assets: [asset] });
  expect(() =>
    encodeAssetList({
      chainName: "osmosis",
      assets: [{ ...asset, symbol: null } as unknown as Asset],
    })
  ).toThrow();
  expect(() => decodeAssetList({ ...compact, format: "v2" } as any)).toThrow();
  expect(() =>
    decodeAssetList({ ...compact, fields: ["symbol", "symbol"] })
  ).toThrow();
  expect(() =>
    decodeAssetList({ ...compact, fields: ["__proto__"] })
  ).toThrow();
  expect(() =>
    decodeAssetList({
      ...compact,
      rows: [Array(compact.fields.length + 1).fill(null)],
    })
  ).toThrow();
  expect(() =>
    decodeAssetList({ ...compact, defaults: { verified: true } })
  ).toThrow();
});
