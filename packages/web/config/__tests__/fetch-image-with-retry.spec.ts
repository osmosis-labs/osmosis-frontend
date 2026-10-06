import { fetchImageWithRetry } from "../utils";

const IMAGE_URL = "https://example.com/logo.svg";

const makeResponse = (
  status: number,
  headers: Record<string, string> = {}
): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    headers: new Headers(headers),
    body: { cancel: jest.fn(() => Promise.resolve()) },
  } as unknown as Response);

const bodyCancel = (response: Response) =>
  (response.body as unknown as { cancel: jest.Mock }).cancel;

describe("fetchImageWithRetry", () => {
  const fetchMock = jest.fn();
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    jest.useRealTimers();
    global.fetch = originalFetch;
  });

  it("retries a rate limit and returns the eventual image", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(429))
      .mockResolvedValueOnce(makeResponse(503))
      .mockResolvedValueOnce(makeResponse(200));

    const pending = fetchImageWithRetry(IMAGE_URL);
    await jest.runAllTimersAsync();

    await expect(pending).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("waits for Retry-After before retrying", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(429, { "retry-after": "5" }))
      .mockResolvedValueOnce(makeResponse(200));

    const pending = fetchImageWithRetry(IMAGE_URL);
    await jest.advanceTimersByTimeAsync(4_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("honours an HTTP-date Retry-After", async () => {
    const retryAt = new Date(Date.now() + 5_000).toUTCString();
    fetchMock
      .mockResolvedValueOnce(makeResponse(429, { "retry-after": retryAt }))
      .mockResolvedValueOnce(makeResponse(200));

    const pending = fetchImageWithRetry(IMAGE_URL);
    await jest.advanceTimersByTimeAsync(4_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1_500);
    await expect(pending).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("caps a Retry-After longer than the delay budget", async () => {
    fetchMock
      .mockResolvedValueOnce(makeResponse(429, { "retry-after": "600" }))
      .mockResolvedValueOnce(makeResponse(200));

    const pending = fetchImageWithRetry(IMAGE_URL);
    await jest.advanceTimersByTimeAsync(30_000);

    await expect(pending).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("releases the body of every rejected response", async () => {
    const rateLimited = makeResponse(429);
    const ok = makeResponse(200);
    fetchMock.mockResolvedValueOnce(rateLimited).mockResolvedValueOnce(ok);

    const pending = fetchImageWithRetry(IMAGE_URL);
    await jest.runAllTimersAsync();
    await pending;

    expect(bodyCancel(rateLimited)).toHaveBeenCalledTimes(1);
    expect(bodyCancel(ok)).not.toHaveBeenCalled();

    const dead = makeResponse(404);
    fetchMock.mockReset().mockResolvedValue(dead);
    await expect(fetchImageWithRetry(IMAGE_URL)).rejects.toThrow("404");
    expect(bodyCancel(dead)).toHaveBeenCalledTimes(1);
  });

  it("retries network errors", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValueOnce(makeResponse(200));

    const pending = fetchImageWithRetry(IMAGE_URL);
    await jest.runAllTimersAsync();

    await expect(pending).resolves.toMatchObject({ status: 200 });
  });

  it("fails at once on a dead URL", async () => {
    fetchMock.mockResolvedValue(makeResponse(404));

    const pending = fetchImageWithRetry(IMAGE_URL);
    const assertion = expect(pending).rejects.toThrow("404");
    await jest.runAllTimersAsync();

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("gives up after the last attempt instead of returning nothing", async () => {
    fetchMock.mockResolvedValue(makeResponse(429));

    const pending = fetchImageWithRetry(IMAGE_URL);
    const assertion = expect(pending).rejects.toThrow("429");
    await jest.runAllTimersAsync();

    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
