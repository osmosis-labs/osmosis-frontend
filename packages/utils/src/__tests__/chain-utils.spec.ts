import type { Chain } from "@osmosis-labs/types";

import { getChain } from "../chain-utils";

/**
 * Minimal chains covering the prefix shapes that matter: several real prefixes
 * are prefixes of another, and Nyx's `n` shadows every `n*` chain.
 *
 * Ordered so the shadowing chain comes first, which is the case a
 * first-match-wins scan resolves incorrectly.
 */
const chainList = [
  { chain_id: "nyx", chain_name: "nyx", prefix: "n" },
  { chain_id: "cataclysm-1", chain_name: "nibiru", prefix: "nibi" },
  { chain_id: "neutron-1", chain_name: "neutron", prefix: "neutron" },
  { chain_id: "bitbadges-1", chain_name: "bitbadges", prefix: "bb" },
  { chain_id: "bbn-1", chain_name: "babylon", prefix: "bbn" },
  { chain_id: "osmosis-1", chain_name: "osmosis", prefix: "osmo" },
].map(
  ({ chain_id, chain_name, prefix }) =>
    ({
      chain_id,
      chain_name,
      bech32Config: { bech32PrefixAccAddr: prefix },
    } as unknown as Chain)
);

describe("getChain", () => {
  it("resolves an address to the chain with the longest matching prefix", () => {
    // `nibi1...` also starts with Nyx's `n`, which appears earlier in the list.
    expect(
      getChain({ chainList, destinationAddress: "nibi1abcdef" })?.chain_id
    ).toBe("cataclysm-1");

    expect(
      getChain({ chainList, destinationAddress: "neutron1abcdef" })?.chain_id
    ).toBe("neutron-1");

    // `bbn1...` also starts with BitBadges' `bb`.
    expect(
      getChain({ chainList, destinationAddress: "bbn1abcdef" })?.chain_id
    ).toBe("bbn-1");
  });

  it("still resolves an address whose prefix is the short one", () => {
    expect(
      getChain({ chainList, destinationAddress: "n1abcdef" })?.chain_id
    ).toBe("nyx");
  });

  it("prefers an explicit chainId over an address that points elsewhere", () => {
    expect(
      getChain({
        chainList,
        chainId: "osmosis-1",
        destinationAddress: "nibi1abcdef",
      })?.chain_id
    ).toBe("osmosis-1");
  });

  it("resolves by chainId and chainName", () => {
    expect(getChain({ chainList, chainId: "bbn-1" })?.chain_name).toBe(
      "babylon"
    );
    expect(getChain({ chainList, chainName: "nibiru" })?.chain_id).toBe(
      "cataclysm-1"
    );
  });

  it("returns undefined when nothing matches", () => {
    expect(
      getChain({ chainList, destinationAddress: "zzz1abcdef" })
    ).toBeUndefined();
    expect(getChain({ chainList, chainId: "not-a-chain" })).toBeUndefined();
  });

  it("throws when given no way to identify a chain", () => {
    expect(() => getChain({ chainList })).toThrow(
      "Missing chainId, chainName or destinationAddress"
    );
  });
});
