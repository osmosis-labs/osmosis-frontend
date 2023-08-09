import { chains } from "chain-registry";

describe("getChainInfos", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("should return merged ChainInfoWithExplorer & Chain objects", () => {
    const { getChainInfos } = require("../utils");

    const result = getChainInfos();

    for (const chainInfo of result) {
      const originalChain = chains.find(
        ({ chain_id }) => chain_id === chainInfo.chainId
      );

      expect(originalChain).toBeDefined();
      expect(chainInfo.chain_name).toBe(chainInfo.chainName);

      const excludedKeys = [
        "chain_name",
        "peers",
        "explorers",
        "codebase",
        "staking",
        "$schema",
        "apis",
      ];

      // Verify that the properties are merged
      for (const key in originalChain) {
        if (!excludedKeys.includes(key)) {
          expect(chainInfo[key as keyof typeof originalChain]).toBe(
            originalChain[key as keyof typeof originalChain]
          );
        }
      }

      // Verify that the rpc and rest API addresses are set correctly
      expect(chainInfo?.apis?.rpc?.[0].address).toBe(chainInfo.rpc);
      expect(chainInfo?.apis?.rest?.[0].address).toBe(chainInfo.rest);
    }
  });

  it("should return the correct chain information when OSMOSIS_CHAIN_ID_OVERWRITE is not set", () => {
    // Set OSMOSIS_CHAIN_ID_OVERWRITE to undefined
    delete process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE;

    const { getChainInfos } = require("../utils");

    const result = getChainInfos();
    const expectedChainId = "osmosis-1";

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].chainId).toBe(expectedChainId);
    expect(result[0].bech32_prefix).toBe("osmo");
  });

  it("should return the correct chain information when OSMOSIS_CHAIN_ID_OVERWRITE is set", () => {
    // Set OSMOSIS_CHAIN_ID_OVERWRITE to a custom value
    process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE = "custom-chain-id";

    const { getChainInfos } = require("../utils");

    const result = getChainInfos();
    const expectedChainId = "custom-chain-id";

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].chainId).toBe(expectedChainId);
    expect(result[0].bech32_prefix).toBe("osmo");
  });
});
