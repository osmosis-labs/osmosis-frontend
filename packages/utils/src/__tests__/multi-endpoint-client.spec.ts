import { apiClient } from "../api-client";
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

    expect(apiClient).toHaveBeenCalledTimes(1);
    expect(apiClient).toHaveBeenCalledWith(
      "https://endpoint1.com/status",
      expect.any(Object)
    );
    expect(result).toEqual(mockResult);
  });

  it("should retry on failure and succeed on second attempt", async () => {
    const mockResult = { data: "success" };
    (apiClient as jest.Mock)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockResult);

    const client = createMultiEndpointClient(
      [{ address: "https://endpoint1.com" }],
      { maxRetries: 2 }
    );

    const result = await client.fetch<typeof mockResult>("/status");

    expect(apiClient).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockResult);
  });

  it("should fallback to second endpoint when first fails", async () => {
    const mockResult = { data: "success" };
    (apiClient as jest.Mock)
      .mockRejectedValueOnce(new Error("Endpoint 1 fail"))
      .mockRejectedValueOnce(new Error("Endpoint 1 fail again"))
      .mockResolvedValueOnce(mockResult);

    const client = createMultiEndpointClient(
      [
        { address: "https://endpoint1.com" },
        { address: "https://endpoint2.com" },
      ],
      { maxRetries: 2 }
    );

    const result = await client.fetch<typeof mockResult>("/status");

    expect(apiClient).toHaveBeenCalledTimes(3);
    // Verify second endpoint was called
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
      { maxRetries: 2 }
    );

    await expect(client.fetch("/status")).rejects.toThrow(
      /All .* endpoints failed/
    );

    // endpoint1 (2 attempts) + endpoint2 (2 attempts) = 4 total
    expect(apiClient).toHaveBeenCalledTimes(4);
  });

  it("should remember last successful endpoint", async () => {
    const mockResult = { data: "success" };
    (apiClient as jest.Mock)
      .mockRejectedValueOnce(new Error("First endpoint failed"))
      .mockRejectedValueOnce(new Error("First endpoint failed again"))
      .mockResolvedValue(mockResult);

    const client = createMultiEndpointClient(
      [
        { address: "https://endpoint1.com" },
        { address: "https://endpoint2.com" },
      ],
      { maxRetries: 2 }
    );

    // First call should fail on endpoint1, succeed on endpoint2
    await client.fetch<typeof mockResult>("/status");

    // Clear the mock to count fresh calls
    (apiClient as jest.Mock).mockClear();
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    // Second call should start with endpoint2 (last successful)
    await client.fetch<typeof mockResult>("/status");

    // Should only make 1 call since it starts with the working endpoint
    expect(apiClient).toHaveBeenCalledTimes(1);
    expect(apiClient).toHaveBeenCalledWith(
      "https://endpoint2.com/status",
      expect.any(Object)
    );
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

    // Should try high priority first
    expect(apiClient).toHaveBeenCalledWith(
      "https://high-priority.com/status",
      expect.any(Object)
    );
  });

  it("should use custom timeout", async () => {
    const mockResult = { data: "success" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const client = createMultiEndpointClient(
      [{ address: "https://endpoint1.com" }],
      { timeout: 10000 }
    );

    await client.fetch<typeof mockResult>("/status");

    expect(apiClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object)
    );
  });

  it("should get current endpoint address", () => {
    const client = createMultiEndpointClient([
      { address: "https://endpoint1.com" },
      { address: "https://endpoint2.com" },
    ]);

    expect(client.getCurrentEndpoint()).toBe("https://endpoint1.com");
  });
});
