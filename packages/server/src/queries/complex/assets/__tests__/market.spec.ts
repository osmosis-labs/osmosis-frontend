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

    // Just past the ttl the entry is served while it refreshes; it still counts as fresh.
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
