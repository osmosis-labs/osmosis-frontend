import { getIBCExternalUrl } from "../external-url";

describe("getIBCExternalUrl", () => {
  it("should return undefined for testnet environment", () => {
    const params = {
      fromChain: { chainId: "osmosis-1", chainType: "cosmos" },
      toChain: { chainId: "cosmoshub-4", chainType: "cosmos" },
      fromAsset: { sourceDenom: "uosmo" },
      toAsset: { sourceDenom: "uatom" },
      env: "testnet",
    } as Parameters<typeof getIBCExternalUrl>[0];

    const url = getIBCExternalUrl(params);

    expect(url).toBeUndefined();
  });

  it("should return undefined for EVM fromChain", () => {
    const params = {
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "cosmoshub-4", chainType: "cosmos" },
      fromAsset: { sourceDenom: "weth-wei" },
      toAsset: { sourceDenom: "uatom" },
      env: "mainnet",
    } as Parameters<typeof getIBCExternalUrl>[0];

    const url = getIBCExternalUrl(params);

    expect(url).toBeUndefined();
  });

  it("should return undefined for EVM toChain", () => {
    const params = {
      fromChain: { chainId: "osmosis-1", chainType: "cosmos" },
      toChain: { chainId: 1, chainType: "evm" },
      fromAsset: { sourceDenom: "uosmo" },
      toAsset: { sourceDenom: "weth-wei" },
      env: "mainnet",
    } as Parameters<typeof getIBCExternalUrl>[0];

    const url = getIBCExternalUrl(params);

    expect(url).toBeUndefined();
  });

  it("should generate the correct URL for given parameters", () => {
    const params = {
      fromChain: { chainId: "osmosis-1", chainType: "cosmos" },
      toChain: { chainId: "cosmoshub-4", chainType: "cosmos" },
      fromAsset: { sourceDenom: "uosmo" },
      toAsset: { sourceDenom: "uatom" },
      env: "mainnet",
    } as Parameters<typeof getIBCExternalUrl>[0];

    const expectedUrl =
      "https://geo.tfm.com/?chainFrom=osmosis-1&token0=uosmo&chainTo=cosmoshub-4&token1=uatom";
    const result = getIBCExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });
});
