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

  describe("hedged endpoint fallback", () => {
    it("should fallback to second endpoint when first fails", async () => {
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

      (apiClient as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("endpoint1")) {
          return Promise.reject(new Error("Endpoint 1 fail"));
        }
        return Promise.resolve(mockResult);
      });

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        hedgeDelay: 50,
        timeout: 200,
        maxTotalTime: 2000,
      });

      const result = await query({ chainList: mockChains });

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

      (apiClient as jest.Mock).mockRejectedValue(new Error("All failed"));

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        hedgeDelay: 50,
        timeout: 200,
        maxTotalTime: 1000,
      });

      await expect(query({ chainList: mockChains })).rejects.toThrow(
        /REST endpoints failed/
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

    it("should stop when maxTotalTime budget is exceeded", async () => {
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

      (apiClient as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("slow")), 300)
          )
      );

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        hedgeDelay: 100,
        timeout: 5000,
        maxTotalTime: 500,
      });

      await expect(query({ chainList: mockChains })).rejects.toThrow(
        /endpoints failed/
      );
    });

    it("should include budget info in error message", async () => {
      (apiClient as jest.Mock).mockRejectedValue(new Error("fail"));

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        hedgeDelay: 50,
        maxTotalTime: 5000,
      });

      await expect(query({ chainList: MockChains })).rejects.toThrow(
        /budget.*5000ms/
      );
    });

    it("should try only once when a single endpoint is configured", async () => {
      (apiClient as jest.Mock).mockRejectedValue(new Error("Network timeout"));

      const query = createNodeQuery<{ data: string }>({
        path: "/test",
        hedgeDelay: 50,
        maxTotalTime: 1000,
      });

      await expect(query({ chainList: MockChains })).rejects.toThrow(
        /All 1 REST endpoints failed/
      );
      expect(apiClient).toHaveBeenCalledTimes(1);
    });
  });
});
