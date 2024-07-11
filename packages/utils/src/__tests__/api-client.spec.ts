import { apiClient, ApiClientError, HTTPMethod } from "../api-client";

describe("apiClient", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    global.fetch = jest.fn();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
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

  it("should omit HTTP headers from being logged to console", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ code: 123, message: "Bad Request" }))
    );

    await apiClient("http://example.com", {
      headers: { MyHeader: "ABCD" },
    }).catch((error) => {
      expect(error).toBeInstanceOf(ApiClientError);
      // no header content in console log
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("MyHeader")
      );
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("ABCD")
      );

      // but there is a log with the message
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Bad Request")
      );
    });
  });

  it("should handle messages ending with a dot correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Bad Request." }), {
        status: 400,
      })
    );

    await apiClient("http://example.com").catch((error) => {
      expect(error).toBeInstanceOf(ApiClientError);
      expect(error.message).toEqual("Fetch error. Bad Request.");
      expect(error.status).toEqual(400);
      expect(error.data).toEqual({
        message: "Bad Request.",
      });
    });
  });

  it("should handle messages starting with 'Fetch error.' correctly", async () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Fetch error. Something went wrong" }), {
        status: 500,
      })
    );

    await apiClient("http://example.com").catch((error) => {
      expect(error).toBeInstanceOf(ApiClientError);
      expect(error.message).toEqual("Fetch error. Something went wrong.");
      expect(error.status).toEqual(500);
      expect(error.data).toEqual({
        message: "Fetch error. Something went wrong",
      });
    });
  });
});
