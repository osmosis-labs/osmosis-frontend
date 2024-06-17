import { getSquidExternalUrl } from "../external-url";

describe("getSquidExternalUrl", () => {
  it("should generate the correct URL for given parameters", () => {
    const params = {
      fromChain: { chainId: 8453, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      env: "mainnet",
      toAddress: "destination-address",
    } satisfies Parameters<typeof getSquidExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE%2Cibc%2FEA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5";
    const result = getSquidExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });

  it("should encode asset addresses correctly", () => {
    const params = {
      fromChain: { chainId: 8453, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "eth",
      },
      env: "mainnet",
      toAddress: "destination-address",
    } satisfies Parameters<typeof getSquidExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = getSquidExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });

  it("should handle numeric chain IDs correctly", () => {
    const params = {
      fromChain: { chainId: 43114, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        decimals: 18,
        denom: "USDC",
        sourceDenom: "usdc",
      },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 18,
        denom: "USDC",
        sourceDenom: "usdc",
      },
      env: "mainnet",
      toAddress: "destination-address",
    } satisfies Parameters<typeof getSquidExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=43114%2Cosmosis-1&tokens=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = getSquidExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });
});
