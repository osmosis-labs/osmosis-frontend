import { getSquidExternalUrl } from "../external-urls";

describe("getSquidExternalUrl", () => {
  it("should generate the correct URL for given parameters", () => {
    const params = {
      fromChain: { chainId: "8453" },
      toChain: { chainId: "osmosis-1" },
      fromAsset: { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
      },
    } as Parameters<typeof getSquidExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE%2Cibc%2FEA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5";
    const result = getSquidExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });

  it("should encode asset addresses correctly", () => {
    const params = {
      fromChain: { chainId: "8453" },
      toChain: { chainId: "osmosis-1" },
      fromAsset: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
      },
    } as Parameters<typeof getSquidExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=8453%2Cosmosis-1&tokens=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = getSquidExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });

  it("should handle numeric chain IDs correctly", () => {
    const params = {
      fromChain: { chainId: "43114" },
      toChain: { chainId: "osmosis-1" },
      fromAsset: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },
      toAsset: {
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
      },
    } as Parameters<typeof getSquidExternalUrl>[0];

    const expectedUrl =
      "https://app.squidrouter.com/?chains=43114%2Cosmosis-1&tokens=0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E%2Cibc%2F498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
    const result = getSquidExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });
});
