import { apiClient } from "@osmosis-labs/utils";

import { createNodeQuery } from "../create-node-query";
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
      `https://lcd-osmosis.keplr.app${path}`,
      expect.any(Object)
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
      `https://lcd-osmosis.keplr.app${path(params)}`,
      expect.any(Object)
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
      `https://lcd-cosmoshub.keplr.app${path(params)}`,
      expect.any(Object)
    );
    expect(result).toEqual(mockResult);
  });

  it("should allow the user to pass apiClient options and call endpoint with HTTP body", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = [
      ({ address }: { address: string }) => `/test/${address}`,
      {
        address: "testAddress",
        chainId: MockChains[1].chain_id,
        body: "stringBody",
      },
    ];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
      options: ({ body }) => ({ body }),
    });
    const result = await query({ chainList: MockChains, ...params });

    expect(apiClient).toHaveBeenCalledWith(
      `https://lcd-cosmoshub.keplr.app${path(params)}`,
      expect.objectContaining({
        body: "stringBody",
      })
    );
    expect(result).toEqual(mockResult);
  });

  describe("multi-endpoint retry logic", () => {
    it("should retry on first endpoint failure and succeed on second attempt", async () => {
      const mockResult = { data: "test" };
      (apiClient as jest.Mock)
        .mockRejectedValueOnce(new Error("Network timeout"))
        .mockResolvedValueOnce(mockResult);

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        maxRetries: 2,
      });

      const result = await query({ chainList: MockChains });

      // Should have been called twice (first failure, then success)
      expect(apiClient).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResult);
    });

    it("should fallback to second endpoint when first endpoint fails all retries", async () => {
      const mockResult = { data: "success" };
      const mockChains = [
        {
          ...MockChains[0],
          apis: {
            rest: [
              { address: "https://endpoint1.com" },
              { address: "https://endpoint2.com" },
            ],
            rpc: [],
          },
        },
      ];

      // First endpoint fails 2 times, second endpoint succeeds
      (apiClient as jest.Mock)
        .mockRejectedValueOnce(new Error("Endpoint 1 fail"))
        .mockRejectedValueOnce(new Error("Endpoint 1 fail again"))
        .mockResolvedValueOnce(mockResult);

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        maxRetries: 2,
      });

      const result = await query({ chainList: mockChains });

      expect(apiClient).toHaveBeenCalledTimes(3);
      // Verify second endpoint was called
      expect(apiClient).toHaveBeenCalledWith(
        "https://endpoint2.com/test",
        expect.any(Object)
      );
      expect(result).toEqual(mockResult);
    });

    it("should throw error when all endpoints are exhausted", async () => {
      const mockChains = [
        {
          ...MockChains[0],
          apis: {
            rest: [
              { address: "https://endpoint1.com" },
              { address: "https://endpoint2.com" },
            ],
            rpc: [],
          },
        },
      ];

      // All attempts fail
      (apiClient as jest.Mock).mockRejectedValue(new Error("All failed"));

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        maxRetries: 2,
      });

      await expect(query({ chainList: mockChains })).rejects.toThrow(
        /All 2 REST endpoints failed/
      );

      // Should have tried: endpoint1 (2 times) + endpoint2 (2 times) = 4 calls
      expect(apiClient).toHaveBeenCalledTimes(4);
    });

    it("should respect custom timeout parameter", async () => {
      const mockResult = { data: "test" };
      (apiClient as jest.Mock).mockResolvedValue(mockResult);

      const customTimeout = 10000;
      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        timeout: customTimeout,
      });

      await query({ chainList: MockChains });

      // Should be called with some options
      expect(apiClient).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object)
      );
    });

    it("should throw error when chain has no REST endpoints", async () => {
      const mockChains = [
        {
          ...MockChains[0],
          apis: {
            rest: [],
            rpc: [],
          },
        },
      ];

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
      });

      await expect(query({ chainList: mockChains })).rejects.toThrow(
        /No REST endpoints available/
      );
    });
  });
});
