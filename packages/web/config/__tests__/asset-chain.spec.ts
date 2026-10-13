import type { Asset, Chain } from "@osmosis-labs/types";

import { resolveAssetChain } from "../asset-chain";

const osmosis = { chain_name: "osmosis", chain_id: "osmosis-1" } as Chain;
const cosmoshub = { chain_name: "cosmoshub", chain_id: "cosmoshub-4" } as Chain;
const chains = [cosmoshub, osmosis]; // Osmosis need not be the first entry.
const asset = {
  chainName: "bitcoin",
  symbol: "BTC",
  transferMethods: [],
  counterparty: [],
} as unknown as Asset;

it("keeps stranded, preview and native assets on Osmosis", () => {
  expect(resolveAssetChain(asset, chains, "osmosis-1")).toBe(osmosis);
  expect(
    resolveAssetChain(
      { ...asset, preview: true, haltWithdrawals: true },
      chains,
      "osmosis-1"
    )
  ).toBe(osmosis);
  expect(
    resolveAssetChain({ ...asset, chainName: "osmosis" }, chains, "osmosis-1")
  ).toBe(osmosis);
});

it("does not drop externally bridged non-Cosmos assets with no wallet config", () => {
  const bridged = {
    ...asset,
    transferMethods: [
      {
        type: "external_interface",
        name: "Bridge",
        depositUrl: "https://bridge",
      },
    ],
    counterparty: [
      {
        chainType: "non-cosmos",
        chainName: "bitcoin",
        sourceDenom: "sat",
        symbol: "BTC",
        decimals: 8,
      },
    ],
  } as Asset;
  expect(resolveAssetChain(bridged, chains, "osmosis-1")).toBe(osmosis);
});

it("chooses the last IBC method without changing the transfer methods", () => {
  const methods = [{ type: "ibc", counterparty: { chainName: "cosmoshub" } }];
  const ibcAsset = { ...asset, transferMethods: methods } as Asset;
  expect(resolveAssetChain(ibcAsset, chains, "osmosis-1")).toBe(cosmoshub);
  expect(ibcAsset.transferMethods).toEqual(methods);
});

it("uses Osmosis grouping for display-only chain entries without inventing config", () => {
  const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const ibcAsset = {
      ...asset,
      transferMethods: [{ type: "ibc", counterparty: { chainName: "blg24" } }],
    } as Asset;
    const displayOnly = { chain_name: "blg24", prettyName: "BLG24" } as Chain;
    expect(
      resolveAssetChain(ibcAsset, [...chains, displayOnly], "osmosis-1")
    ).toBe(osmosis);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Missing wallet chain")
    );
    expect(displayOnly).not.toHaveProperty("chain_id");
  } finally {
    warn.mockRestore();
  }
});

it("requires a real Osmosis chain entry", () => {
  expect(() => resolveAssetChain(asset, [cosmoshub], "osmosis-1")).toThrow();
});
