import type { Asset } from "@osmosis-labs/types";

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  apiClient: jest.fn(),
}));

const asset = (denom: string) => ({ coinMinimalDenom: denom }) as Asset;

describe("SQS price batching and caching", () => {
  let getPrice: typeof import("../sidecar").getPriceFromSidecar;
  let apiClient: jest.Mock;
  let quote: string;
  let legacyQuote: string;

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    ({ getPriceFromSidecar: getPrice } = require("../sidecar"));
    ({ apiClient } = require("@osmosis-labs/utils"));
    ({
      QUOTE_COIN_MINIMAL_DENOM: quote,
      LEGACY_QUOTE_COIN_MINIMAL_DENOM: legacyQuote,
    } = require("../../../../../sidecar/prices"));
  });

  afterEach(() => jest.useRealTimers());

  function respond(url: string, value = "2") {
    return Object.fromEntries(
      new URL(url).searchParams
        .get("base")!
        .split(",")
        .map((denom) => [denom, { [quote]: value }])
    );
  }

  it("limits 800 assets and overlapping callers to two requests of at most 100 denoms", async () => {
    let active = 0;
    let peak = 0;
    apiClient.mockImplementation(async (url: string) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active--;
      return respond(url);
    });
    const denoms = Array.from({ length: 800 }, (_, i) => `asset-${i}`);
    const all = Promise.all(
      [...denoms, ...denoms.slice(0, 200)].map((denom) =>
        getPrice(asset(denom))
      )
    );
    await jest.advanceTimersByTimeAsync(100);
    expect((await all).every((price) => Number(price.toString()) === 2)).toBe(
      true
    );
    expect(peak).toBe(2);
    expect(apiClient).toHaveBeenCalledTimes(8);
    for (const [url] of apiClient.mock.calls) {
      expect(new URL(url).searchParams.get("base")!.split(",")).toHaveLength(
        100
      );
    }
  });

  it("releases slots after failures and suppresses transport retries for only 10 seconds", async () => {
    apiClient.mockRejectedValueOnce(new Error("upstream failed"));
    apiClient.mockImplementation(async (url: string) => respond(url));
    const all = Promise.allSettled(
      Array.from({ length: 300 }, (_, i) => getPrice(asset(`a-${i}`)))
    );
    await jest.advanceTimersByTimeAsync(1);
    expect(
      (await all).filter((result) => result.status === "fulfilled")
    ).toHaveLength(200);
    expect(apiClient).toHaveBeenCalledTimes(3);
    await expect(getPrice(asset("a-0"))).rejects.toThrow("upstream failed");
    expect(apiClient).toHaveBeenCalledTimes(3);
    await jest.advanceTimersByTimeAsync(10_001);
    const retried = getPrice(asset("a-0"));
    await jest.advanceTimersByTimeAsync(1);
    expect(Number((await retried).toString())).toBe(2);
  });

  it("expires successes after 10 seconds and missing/invalid prices after 60 seconds", async () => {
    apiClient.mockResolvedValue({
      good: { [quote]: "1.5" },
      legacy: { [legacyQuote]: "3" },
      zero: { [quote]: "0" },
      invalid: { [quote]: "not-a-price" },
      negative: { [quote]: "-1" },
    });
    const denoms = ["good", "legacy", "zero", "invalid", "negative", "missing"];
    const all = Promise.allSettled(
      denoms.map((denom) => getPrice(asset(denom)))
    );
    await jest.advanceTimersByTimeAsync(1);
    expect((await all).map((result) => result.status)).toEqual([
      "fulfilled",
      "fulfilled",
      "rejected",
      "rejected",
      "rejected",
      "rejected",
    ]);
    await Promise.allSettled(denoms.map((denom) => getPrice(asset(denom))));
    expect(apiClient).toHaveBeenCalledTimes(1);
    await jest.advanceTimersByTimeAsync(10_001);
    apiClient.mockImplementation(async (url: string) => respond(url, "4"));
    const fresh = getPrice(asset("good"));
    await jest.advanceTimersByTimeAsync(1);
    expect(Number((await fresh).toString())).toBe(4);
    await expect(getPrice(asset("missing"))).rejects.toThrow("No SQS price");
    expect(apiClient).toHaveBeenCalledTimes(2);
    await jest.advanceTimersByTimeAsync(50_001);
    const recovered = getPrice(asset("missing"));
    await jest.advanceTimersByTimeAsync(1);
    expect(Number((await recovered).toString())).toBe(4);
  });

  it("does not launch queued batches after their waiting budget expires", async () => {
    apiClient.mockImplementation(async (url: string) => {
      await new Promise((resolve) => setTimeout(resolve, 11_000));
      return respond(url);
    });
    const all = Promise.allSettled(
      Array.from({ length: 400 }, (_, i) => getPrice(asset(`a-${i}`)))
    );
    await jest.advanceTimersByTimeAsync(11_001);
    expect(
      (await all).filter((result) => result.status === "rejected")
    ).toHaveLength(200);
    expect(apiClient).toHaveBeenCalledTimes(2);
  });
});
