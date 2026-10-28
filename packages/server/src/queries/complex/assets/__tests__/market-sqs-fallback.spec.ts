import { Dec } from "@osmosis-labs/unit";

import { AssetLists as assetLists } from "../../../__tests__/mock-asset-lists";
import { queryAllTokenData, type TokenData } from "../../../data-services";
import { getAsset } from "../index";
import {
  getAssetMarketActivity,
  getMarketAsset,
  isMarketDataAvailable,
} from "../market";
import { getAssetPrice } from "../price";

jest.mock("../../../data-services", () => ({
  queryAllTokenData: jest.fn(),
}));

jest.mock("../price", () => ({
  ...jest.requireActual("../price"),
  getAssetPrice: jest.fn(),
}));

const query = queryAllTokenData as jest.Mock;
const sqsPrice = getAssetPrice as jest.Mock;

const osmo = getAsset({ assetLists, anyDenom: "uosmo" });

const tokenData: TokenData = {
  price: null,
  denom: "uosmo",
  symbol: "OSMO",
  main: true,
  liquidity: 1_000_000,
  liquidity_24h_change: null,
  volume_24h: 50_000,
  volume_24h_change: null,
  name: "Osmosis",
  price_1h_change: null,
  price_24h_change: null,
  price_7d_change: null,
  exponent: 6,
  display: "osmo",
  coingecko_id: "osmosis",
  coingecko_mcap: null,
};

// The module caches token data across tests, so each test starts past its maximum age.
describe("market data without data-services prices", () => {
  afterEach(() => {
    jest.useRealTimers();
    query.mockReset();
    sqsPrice.mockReset();
  });

  it("takes the current price from SQS, or leaves it unknown", async () => {
    jest.useFakeTimers({ now: new Date("2026-10-28T10:00:00Z") });
    query.mockResolvedValue([tokenData]);
    sqsPrice.mockResolvedValueOnce(new Dec("0.25"));

    const priced = await getMarketAsset({
      assetLists,
      chainList: [],
      asset: osmo,
    });
    expect(priced.currentPrice?.toDec().toString()).toBe(
      "0.250000000000000000"
    );
    expect(priced.priceChange24h).toBeUndefined();

    sqsPrice.mockRejectedValueOnce(new Error("No SQS price"));
    const unpriced = await getMarketAsset({
      assetLists,
      chainList: [],
      asset: osmo,
    });
    expect(unpriced.currentPrice).toBeUndefined();
  });

  it("refreshes token data with no prices after the retry delay, not the ttl", async () => {
    jest.useFakeTimers({ now: new Date("2026-10-28T12:00:00Z") });
    query.mockResolvedValue([tokenData]);

    await getAssetMarketActivity({ coinMinimalDenom: "uosmo" });
    expect(query).toHaveBeenCalledTimes(1);
    // Liquidity is known, so the asset list can still be shown with SQS prices.
    expect(await isMarketDataAvailable()).toBe(true);

    jest.setSystemTime(new Date("2026-10-28T12:00:31Z"));
    await getAssetMarketActivity({ coinMinimalDenom: "uosmo" });
    expect(query).toHaveBeenCalledTimes(2);
  });

  it("reports market data unavailable when no token has liquidity", async () => {
    jest.useFakeTimers({ now: new Date("2026-10-28T14:00:00Z") });
    query.mockResolvedValue([
      { ...tokenData, liquidity: null, volume_24h: null },
    ]);

    const activity = await getAssetMarketActivity({
      coinMinimalDenom: "uosmo",
    });
    expect(activity?.liquidity).toBeUndefined();
    expect(activity?.volume24h).toBeUndefined();
    expect(await isMarketDataAvailable()).toBe(false);
  });
});
