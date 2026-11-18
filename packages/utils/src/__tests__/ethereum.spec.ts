/**
 * @jest-environment node
 */

import {
  EthereumChainInfo,
  getServerEvmRpcUrls,
  redactConfiguredEvmRpcUrls,
} from "../ethereum";

const polygon = EthereumChainInfo.find((chain) => chain.id === 137)!;

afterEach(() => {
  delete process.env.EVM_RPC_URL_137;
});

describe("getServerEvmRpcUrls", () => {
  it("puts configured keyed providers before the public endpoints", () => {
    process.env.EVM_RPC_URL_137 =
      " https://a.test/key-a , https://b.test/key-b ";

    expect(getServerEvmRpcUrls(polygon)).toEqual([
      "https://a.test/key-a",
      "https://b.test/key-b",
      ...polygon.rpcUrls.default.http,
    ]);
  });

  it("is the public endpoints alone when nothing is configured", () => {
    expect(getServerEvmRpcUrls(polygon)).toEqual([
      ...polygon.rpcUrls.default.http,
    ]);
  });
});

describe("redactConfiguredEvmRpcUrls", () => {
  it("removes a key carried in the path", () => {
    process.env.EVM_RPC_URL_137 = "https://polygon.provider.test/v2/s3cret";

    const redacted = redactConfiguredEvmRpcUrls(
      'HTTP request failed.\nURL: https://polygon.provider.test/v2/s3cret\nRequest body: {"method":"eth_call"}'
    );

    expect(redacted).not.toContain("s3cret");
    expect(redacted).toContain("https://polygon.provider.test/<redacted>");
  });

  it("removes a key carried in the query", () => {
    process.env.EVM_RPC_URL_137 =
      "https://lb.provider.test/rpc?network=polygon&dkey=s3cret";

    expect(
      redactConfiguredEvmRpcUrls(
        "failed: https://lb.provider.test/rpc?network=polygon&dkey=s3cret."
      )
    ).not.toContain("s3cret");
  });

  it("leaves text untouched when nothing is configured", () => {
    const text = "URL: https://polygon-bor-rpc.publicnode.com";
    expect(redactConfiguredEvmRpcUrls(text)).toBe(text);
  });
});
