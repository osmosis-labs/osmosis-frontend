import { queryCoingeckoCoin, querySimplePrice } from "../../../coingecko";
import { getAssetCoingeckoCoin } from "../market";

jest.mock("../../../coingecko", () => ({
  ...jest.requireActual("../../../coingecko"),
  queryCoingeckoCoin: jest.fn(),
  querySimplePrice: jest.fn(),
}));

describe("getAssetCoingeckoCoin", () => {
  it("keeps the volume when the coin query fails, and retries soon", async () => {
    (queryCoingeckoCoin as jest.Mock).mockRejectedValue(new Error("429"));
    (querySimplePrice as jest.Mock).mockResolvedValue({
      "coin-a": { usd: 1, usd_24h_vol: 123 },
    });

    const coin = await getAssetCoingeckoCoin({ coinGeckoId: "coin-a" });
    expect(coin.volume24h?.toDec().toString()).toBe("123.000000000000000000");
    expect(coin.links).toBeUndefined();

    // The degraded entry expires after 30 seconds, not the full 30 minutes.
    (queryCoingeckoCoin as jest.Mock).mockResolvedValue({
      links: { homepage: ["https://example.com"] },
      market_cap_rank: 1,
      market_data: {},
    });
    // Only the clock: the CoinGecko batch loader dispatches on a real timer.
    jest.useFakeTimers({
      now: Date.now() + 31_000,
      doNotFake: ["setTimeout", "clearTimeout", "setImmediate", "nextTick"],
    });
    try {
      const retried = await getAssetCoingeckoCoin({ coinGeckoId: "coin-a" });
      expect(retried.marketCapRank).toBe(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it("keeps the coin data when the volume query fails", async () => {
    (queryCoingeckoCoin as jest.Mock).mockResolvedValue({
      links: { homepage: ["https://example.com"] },
      market_cap_rank: 7,
      market_data: {},
    });
    (querySimplePrice as jest.Mock).mockRejectedValue(new Error("500"));

    const coin = await getAssetCoingeckoCoin({ coinGeckoId: "coin-b" });
    expect(coin.marketCapRank).toBe(7);
    expect(coin.volume24h).toBeUndefined();
  });
});
