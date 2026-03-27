import { apiClient } from "../api-client";
import { _clearHealthCache } from "../endpoint-health";
import {
  createMultiEndpointClient,
  MultiEndpointClient,
} from "../multi-endpoint-client";

jest.mock("../api-client", () => ({
  apiClient: jest.fn(),
}));

describe("MultiEndpointClient", () => {
  beforeEach(() => {
    (apiClient as jest.Mock).mockClear();
    _clearHealthCache();
  });

  it("should create client with single endpoint", () => {
    const client = new MultiEndpointClient([
      { address: "https://endpoint1.com" },
    ]);
    expect(client.getEndpoints()).toHaveLength(1);
  });

  it("should create client with multiple endpoints", () => {
    const client = new MultiEndpointClient([
      { address: "https://endpoint1.com" },
      { address: "https://endpoint2.com" },
    ]);
    expect(client.getEndpoints()).toHaveLength(2);
  });

  it("should throw error when no endpoints provided", () => {
    expect(() => new MultiEndpointClient([])).toThrow(
      "At least one endpoint must be provided"
    );
  });

  it("should successfully fetch from first endpoint", async () => {
    const mockResult = { data: "success" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const client = createMultiEndpointClient([
      { address: "https://endpoint1.com" },
    ]);

    const result = await client.fetch<typeof mockResult>("/status");

    expect(apiClient).toHaveBeenCalledWith(
      "https://endpoint1.com/status",
      expect.any(Object)
    );
    expect(result).toEqual(mockResult);
  });

  it("should fallback to second endpoint when first fails", async () => {
    const mockResult = { data: "success" };

    (apiClient as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("endpoint1")) {
        return Promise.reject(new Error("Endpoint 1 fail"));
      }
      return Promise.resolve(mockResult);
    });

    const client = createMultiEndpointClient(
      [
        { address: "https://endpoint1.com" },
        { address: "https://endpoint2.com" },
      ],
      { hedgeDelay: 50, timeout: 200, maxTotalTime: 2000 }
    );

    const result = await client.fetch<typeof mockResult>("/status");

    expect(apiClient).toHaveBeenCalledWith(
      "https://endpoint2.com/status",
      expect.any(Object)
    );
    expect(result).toEqual(mockResult);
  });

  it("should throw error when all endpoints fail", async () => {
    (apiClient as jest.Mock).mockRejectedValue(new Error("All failed"));

    const client = createMultiEndpointClient(
      [
        { address: "https://endpoint1.com" },
        { address: "https://endpoint2.com" },
      ],
      { hedgeDelay: 50, timeout: 200, maxTotalTime: 1000 }
    );

    await expect(client.fetch("/status")).rejects.toThrow(/endpoints failed/);
  });

  it("should sort endpoints by priority", async () => {
    const mockResult = { data: "success" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const client = createMultiEndpointClient([
      { address: "https://low-priority.com", priority: 0 },
      { address: "https://high-priority.com", priority: 10 },
      { address: "https://medium-priority.com", priority: 5 },
    ]);

    await client.fetch<typeof mockResult>("/status");

    // First call should be the highest priority
    expect((apiClient as jest.Mock).mock.calls[0][0]).toBe(
      "https://high-priority.com/status"
    );
  });

  describe("hedged request behavior", () => {
    it("should fire second endpoint after hedgeDelay if first hasn't responded", async () => {
      const mockResult = { data: "success" };

      // First endpoint is slow (300ms), second is fast
      (apiClient as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("endpoint1")) {
          return new Promise((resolve) =>
            setTimeout(() => resolve(mockResult), 300)
          );
        }
        return Promise.resolve(mockResult);
      });

      const client = createMultiEndpointClient(
        [
          { address: "https://endpoint1.com" },
          { address: "https://endpoint2.com" },
        ],
        { hedgeDelay: 100, timeout: 5000, maxTotalTime: 5000 }
      );

      const result = await client.fetch<typeof mockResult>("/status");
      expect(result).toEqual(mockResult);

      // Both endpoints should have been called (endpoint2 fires after 100ms hedge delay)
      expect(apiClient).toHaveBeenCalledWith(
        "https://endpoint2.com/status",
        expect.any(Object)
      );
    });

    it("should not fire second endpoint if first responds before hedgeDelay", async () => {
      const mockResult = { data: "success" };

      // First endpoint is fast (resolves immediately)
      (apiClient as jest.Mock).mockResolvedValue(mockResult);

      const client = createMultiEndpointClient(
        [
          { address: "https://endpoint1.com" },
          { address: "https://endpoint2.com" },
        ],
        { hedgeDelay: 500, timeout: 5000, maxTotalTime: 5000 }
      );

      const result = await client.fetch<typeof mockResult>("/status");
      expect(result).toEqual(mockResult);

      // Only the first endpoint should have been called
      expect(apiClient).toHaveBeenCalledTimes(1);
      expect(apiClient).toHaveBeenCalledWith(
        "https://endpoint1.com/status",
        expect.any(Object)
      );
    });

    it("should stop all in-flight when maxTotalTime is exceeded", async () => {
      (apiClient as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("slow")), 300)
          )
      );

      const client = createMultiEndpointClient(
        [
          { address: "https://endpoint1.com" },
          { address: "https://endpoint2.com" },
          { address: "https://endpoint3.com" },
        ],
        { hedgeDelay: 100, timeout: 5000, maxTotalTime: 500 }
      );

      await expect(client.fetch("/status")).rejects.toThrow(/endpoints failed/);
    });

    it("should include budget info in error message", async () => {
      (apiClient as jest.Mock).mockRejectedValue(new Error("fail"));

      const client = createMultiEndpointClient(
        [{ address: "https://endpoint1.com" }],
        { maxTotalTime: 5000 }
      );

      await expect(client.fetch("/status")).rejects.toThrow(/budget.*5000ms/);
    });
  });

  describe("external AbortSignal", () => {
    it("should stop immediately when signal is already aborted", async () => {
      (apiClient as jest.Mock).mockResolvedValue({ data: "ok" });

      const client = createMultiEndpointClient([
        { address: "https://endpoint1.com" },
      ]);

      const controller = new AbortController();
      controller.abort();

      await expect(
        client.fetch("/status", { signal: controller.signal })
      ).rejects.toThrow(/aborted/i);
      expect(apiClient).not.toHaveBeenCalled();
    });
  });

  describe("endpoint health integration", () => {
    it("should prefer recently successful endpoint", async () => {
      const mockResult = { data: "success" };

      // First call: endpoint1 fails, endpoint2 succeeds → health cache records endpoint2
      (apiClient as jest.Mock).mockImplementation((url: string) => {
        if (url.includes("endpoint1")) {
          return Promise.reject(new Error("fail"));
        }
        return Promise.resolve(mockResult);
      });

      const client1 = createMultiEndpointClient(
        [
          { address: "https://endpoint1.com" },
          { address: "https://endpoint2.com" },
        ],
        { hedgeDelay: 50, timeout: 200, maxTotalTime: 2000 }
      );
      await client1.fetch("/status");

      // Second call: new client, both endpoints available
      (apiClient as jest.Mock).mockClear();
      (apiClient as jest.Mock).mockResolvedValue(mockResult);

      const client2 = createMultiEndpointClient(
        [
          { address: "https://endpoint1.com" },
          { address: "https://endpoint2.com" },
        ],
        { hedgeDelay: 500, timeout: 5000, maxTotalTime: 5000 }
      );
      await client2.fetch("/status");

      // endpoint2 should be tried first (it was healthy last time)
      expect((apiClient as jest.Mock).mock.calls[0][0]).toBe(
        "https://endpoint2.com/status"
      );
    });
  });
});
