import { apiClient } from "@osmosis-labs/utils";

import { createNodeQuery } from "../base-utils";
import { MockChains } from "./mock-chains";

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  apiClient: jest.fn(),
}));

describe("createNodeQuery", () => {
  beforeEach(() => {
    (apiClient as jest.Mock).mockClear();
  });

  it("should create a URL and call apiClient with it", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = ["/test", { address: "testAddress" }];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
    });
    const result = await query({ chainList: MockChains, ...params });

    expect(apiClient).toHaveBeenCalledWith(
      `https://lcd-osmosis.keplr.app${path}`
    );
    expect(result).toEqual(mockResult);
  });

  it("should handle function paths", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = [
      ({ address }: { address: string }) => `/test/${address}`,
      { address: "testAddress" },
    ];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
    });
    const result = await query({ chainList: MockChains, ...params });

    expect(apiClient).toHaveBeenCalledWith(
      `https://lcd-osmosis.keplr.app${path(params)}`
    );
    expect(result).toEqual(mockResult);
  });

  it("should throw when chain id is not available in ChainList", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = [
      ({ address }: { address: string }) => `/test/${address}`,
      { address: "testAddress", chainId: "invalid-chain-id" },
    ];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
    });

    await query({ chainList: MockChains, ...params }).catch((result) => {
      expect(result.message).toEqual("Chain invalid-chain-id not found");
    });
  });

  it("should allow to change endpoint by chain id", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = [
      ({ address }: { address: string }) => `/test/${address}`,
      { address: "testAddress", chainId: MockChains[1].chain_id },
    ];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
    });
    const result = await query({ chainList: MockChains, ...params });

    expect(apiClient).toHaveBeenCalledWith(
      `https://lcd-cosmoshub.keplr.app${path(params)}`
    );
    expect(result).toEqual(mockResult);
  });
});
