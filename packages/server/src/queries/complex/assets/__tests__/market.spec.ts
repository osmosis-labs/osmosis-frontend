import { AssetLists as assetLists } from "../../../__tests__/mock-asset-lists";
import { queryAllTokenData, type TokenData } from "../../../data-services";
import { getAssetMarketActivity } from "../market";
import { isHoldingValueUnknown } from "../price";

jest.mock("../../../data-services", () => ({
  queryAllTokenData: jest.fn(),
}));

const tokenData: TokenData = {
  price: 2,
  denom: "uosmo",
  symbol: "OSMO",
  main: true,
  liquidity: 1_000_000,
  liquidity_24h_change: 1,
  volume_24h: 50_000,
  volume_24h_change: 3,
  name: "Osmosis",
  price_1h_change: 0.5,
  price_24h_change: 2,
  price_7d_change: -4,
  exponent: 6,
  display: "osmo",
  coingecko_id: "osmosis",
  coingecko_mcap: 1_000_000_000,
};

describe("getAssetMarketActivity", () => {
  afterEach(() => jest.useRealTimers());

  it("drops prices from token data served stale during an outage", async () => {
    jest.useFakeTimers({ now: new Date("2026-10-19T10:00:00Z") });
    (queryAllTokenData as jest.Mock).mockResolvedValueOnce([tokenData]);

    const fresh = await getAssetMarketActivity({ coinMinimalDenom: "uosmo" });
    expect(fresh?.price?.toDec().toString()).toBe("2.000000000000000000");

    // Just past the ttl the entry is served while it refreshes in the background (which
    // fails here); it still counts as fresh.
    (queryAllTokenData as jest.Mock).mockRejectedValue(new Error("500"));
    jest.setSystemTime(new Date("2026-10-19T10:06:00Z"));
    const refreshing = await getAssetMarketActivity({
      coinMinimalDenom: "uosmo",
    });
    expect(refreshing?.price?.toDec().toString()).toBe("2.000000000000000000");

    // Past the refresh grace the data services are still failing; prices are dropped.
    jest.setSystemTime(new Date("2026-10-19T10:08:00Z"));

    const stale = await getAssetMarketActivity({ coinMinimalDenom: "uosmo" });
    expect(stale?.price).toBeUndefined();
    expect(stale?.price24hChange).toBeUndefined();
    expect(stale?.marketCap).toBeUndefined();
    expect(stale?.liquidity).toBeUndefined();
    expect(stale?.volume24h?.toDec().toString()).toBe(
      "50000.000000000000000000"
    );
  });

  it("fetches fresh data instead of dropping prices after an idle period", async () => {
    // Same cache as above: its entry was fetched at 10:00. A quiet instance's next request
    // is long past the refresh grace while the data services are healthy.
    jest.useFakeTimers({ now: new Date("2026-10-19T10:30:00Z") });
    (queryAllTokenData as jest.Mock).mockResolvedValue([
      { ...tokenData, price: 3 },
    ]);

    const activity = await getAssetMarketActivity({
      coinMinimalDenom: "uosmo",
    });
    expect(activity?.price?.toDec().toString()).toBe("3.000000000000000000");
  });

  it("falls back without retrying or renewing the entry when a fresh fetch fails", async () => {
    // The entry above was fetched at 10:30; by 10:40 it needs a fresh fetch, which fails.
    jest.useFakeTimers({ now: new Date("2026-10-19T10:40:00Z") });
    const query = queryAllTokenData as jest.Mock;
    query.mockRejectedValue(new Error("500"));
    const callsBefore = query.mock.calls.length;

    const stale = await getAssetMarketActivity({ coinMinimalDenom: "uosmo" });
    expect(stale?.price).toBeUndefined();
    expect(stale?.volume24h).toBeDefined();
    expect(query.mock.calls.length).toBe(callsBefore + 1);

    // Within the retry delay, no new fresh fetch.
    jest.setSystemTime(new Date("2026-10-19T10:40:10Z"));
    await getAssetMarketActivity({ coinMinimalDenom: "uosmo" });
    expect(query.mock.calls.length).toBe(callsBefore + 1);

    // The failed fetches didn't renew the entry: past its 1 h maximum age it's gone.
    jest.setSystemTime(new Date("2026-10-19T11:31:00Z"));
    await expect(
      getAssetMarketActivity({ coinMinimalDenom: "uosmo" })
    ).rejects.toThrow();
    const callsAfterExpiry = query.mock.calls.length;

    // With no entry, the retry delay still applies: no fetch on the next request.
    jest.setSystemTime(new Date("2026-10-19T11:31:10Z"));
    await expect(
      getAssetMarketActivity({ coinMinimalDenom: "uosmo" })
    ).rejects.toThrow();
    expect(query.mock.calls.length).toBe(callsAfterExpiry);
  });
});

describe("getAssetMarketActivity with a lost refresh", () => {
  afterEach(() => jest.useRealTimers());

  it("doesn't hold requests on a background refresh that never settles", async () => {
    // Fresh module state, so the cache and retry delay from the tests above don't apply.
    let market!: typeof import("../market");
    let query!: jest.Mock;
    jest.isolateModules(() => {
      market = require("../market");
      query = require("../../../data-services").queryAllTokenData;
    });

    jest.useFakeTimers({ now: new Date("2026-10-20T10:00:00Z") });
    query.mockResolvedValueOnce([tokenData]);
    await market.getAssetMarketActivity({ coinMinimalDenom: "uosmo" });

    // Past the ttl the cached entry is served and refreshed in the background. That refresh
    // never settles, as when the serverless runtime stalls it after its request has ended.
    query.mockReturnValue(new Promise(() => undefined));
    jest.setSystemTime(new Date("2026-10-20T10:06:00Z"));
    await market.getAssetMarketActivity({ coinMinimalDenom: "uosmo" });

    // Past the grace a request waits for a refresh, but not on the lost one, and not for
    // longer than a fetch may take.
    jest.setSystemTime(new Date("2026-10-20T10:08:00Z"));
    const callsBefore = query.mock.calls.length;
    const pending = market.getAssetMarketActivity({
      coinMinimalDenom: "uosmo",
    });
    await jest.advanceTimersByTimeAsync(4_000);
    const stale = await pending;
    expect(stale?.price).toBeUndefined();
    expect(stale?.volume24h).toBeDefined();
    // It started a new fetch instead of joining the lost refresh.
    expect(query.mock.calls.length).toBe(callsBefore + 1);
  });
});

describe("isHoldingValueUnknown", () => {
  const sail =
    "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail";

  it("is unknown for a held asset that should have a price", () => {
    expect(
      isHoldingValueUnknown({
        assetLists,
        coinMinimalDenom: sail,
        amount: "5000",
      })
    ).toBe(true);
  });

  it("is known for spam and for dust that can round to a zero value", () => {
    expect(
      isHoldingValueUnknown({
        assetLists,
        coinMinimalDenom: "factory/osmo1spam/test",
        amount: "1000000",
      })
    ).toBe(false);
    expect(
      isHoldingValueUnknown({ assetLists, coinMinimalDenom: sail, amount: "0" })
    ).toBe(false);
  });
});
