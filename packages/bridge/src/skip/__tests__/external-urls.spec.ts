import { getSkipExternalUrl } from "../external-urls";

describe("getSkipExternalUrl", () => {
  it("should generate the correct URL for given parameters", () => {
    const params = {
      fromChain: { chainId: "cosmoshub-4" },
      toChain: { chainId: "agoric-3" },
      fromAsset: { address: "uatom" },
      toAsset: { address: "ubld" },
    } as Parameters<typeof getSkipExternalUrl>[0];

    const expectedUrl =
      "https://ibc.fun/?src_chain=cosmoshub-4&src_asset=uatom&dest_chain=agoric-3&dest_asset=ubld";
    const result = getSkipExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });

  it("should encode asset addresses correctly", () => {
    const params = {
      fromChain: { chainId: "akashnet-2" },
      toChain: { chainId: "andromeda-1" },
      fromAsset: {
        address:
          "ibc/2e5d0ac026ac1afa65a23023ba4f24bb8ddf94f118edc0bad6f625bfc557cded",
      },
      toAsset: {
        address:
          "ibc/976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97",
      },
    } as Parameters<typeof getSkipExternalUrl>[0];

    const expectedUrl =
      "https://ibc.fun/?src_chain=akashnet-2&src_asset=ibc%2F2e5d0ac026ac1afa65a23023ba4f24bb8ddf94f118edc0bad6f625bfc557cded&dest_chain=andromeda-1&dest_asset=ibc%2F976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97";
    const result = getSkipExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });

  it("should handle numeric chain IDs correctly", () => {
    const params = {
      fromChain: { chainId: 42161 },
      toChain: { chainId: "andromeda-1" },
      fromAsset: { address: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8" },
      toAsset: {
        address:
          "ibc/976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97",
      },
    } as Parameters<typeof getSkipExternalUrl>[0];

    const expectedUrl =
      "https://ibc.fun/?src_chain=42161&src_asset=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&dest_chain=andromeda-1&dest_asset=ibc%2F976c73350f6f48a69de740784c8a92931c696581a5c720d96ddf4afa860fff97";
    const result = getSkipExternalUrl(params);

    expect(result).toBe(expectedUrl);
  });
});
