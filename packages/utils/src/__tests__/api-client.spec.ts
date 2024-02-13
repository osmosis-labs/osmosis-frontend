import { apiClient, ApiClientError, HTTPMethod } from "../api-client";

describe("apiClient", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it("should make a GET request when no data is provided", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ foo: "bar" }))
    );

    const result = await apiClient("http://example.com");

    expect(fetch).toHaveBeenCalledWith(
      "http://example.com",
      expect.objectContaining({ method: HTTPMethod.GET })
    );
    expect(result).toEqual({ foo: "bar" });
  });

  it("should make a POST request when data is provided", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ foo: "bar" }))
    );

    const result = await apiClient("http://example.com", {
      data: { baz: "qux" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://example.com",
      expect.objectContaining({
        method: HTTPMethod.POST,
        body: JSON.stringify({ baz: "qux" }),
      })
    );
    expect(result).toEqual({ foo: "bar" });
  });

  it("should throw an ApiClientError when the response is not ok", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Bad Request" }), {
        status: 400,
      })
    );

    await apiClient("http://example.com").catch((error) => {
      expect(error).toBeInstanceOf(ApiClientError);
      expect(error.message).toEqual("Fetch error. Bad Request.");
      expect(error.status).toEqual(400);
      expect(error.data).toEqual({
        message: "Bad Request",
      });
    });
  });

  it("should throw an ApiClientError when the response contains a code", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 123, message: "Bad Request" }))
    );

    await apiClient("http://example.com").catch((error) => {
      expect(error).toBeInstanceOf(ApiClientError);
      expect(error.message).toEqual(
        "A chain error has occurred. Code: 123. Message: Bad Request"
      );
      expect(error.status).toEqual(200);
      expect(error.data).toEqual({ code: 123, message: "Bad Request" });
    });
  });
});
