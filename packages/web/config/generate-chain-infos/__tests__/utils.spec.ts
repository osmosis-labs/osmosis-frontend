import { chains } from "chain-registry";

import { getChainInfos } from "../utils";

describe("getChainInfos", () => {
  test("should return merged ChainInfoWithExplorer & Chain objects", () => {
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
});
