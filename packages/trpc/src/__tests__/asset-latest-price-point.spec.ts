import { getAssetHistoricalPrice } from "@osmosis-labs/server";

import {
  createCallerFactory,
  createInnerTRPCContext,
  createTRPCRouter,
} from "..";
import { assetsRouter } from "../assets";

jest.mock("@osmosis-labs/server", () => {
  const actual = jest.requireActual("@osmosis-labs/server");

  return {
    ...actual,
    getAssetHistoricalPrice: jest.fn(),
  };
});

const mockedGetAssetHistoricalPrice = jest.mocked(getAssetHistoricalPrice);

const makeCaller = () => {
  const router = createTRPCRouter({ assets: assetsRouter });
  return createCallerFactory(router)(
    createInnerTRPCContext({ assetLists: [], chainList: [] })
  );
};

const pricePoint = (time: number) => ({
  time,
  open: 0.5,
  high: 0.5,
  low: 0.5,
  close: 0.5,
  volume: 0,
});

const expectCalledWithTimeFrames = (frames: number[]) => {
  expect(mockedGetAssetHistoricalPrice).toHaveBeenCalledTimes(frames.length);
  frames.forEach((tf, i) => {
    expect(mockedGetAssetHistoricalPrice).toHaveBeenNthCalledWith(
      i + 1,
      expect.objectContaining({ timeFrame: tf })
    );
  });
};

describe("getAssetLatestPricePoint cascade", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns the 5-min point when the 5-min bucket has data; does not call coarser frames", async () => {
    const point = pricePoint(1_700_000_000);
    mockedGetAssetHistoricalPrice.mockResolvedValueOnce([point]);

    const result = await makeCaller().assets.getAssetLatestPricePoint({
      coinMinimalDenom: "uatom",
    });

    expect(result).toEqual(point);
    expectCalledWithTimeFrames([5]);
  });

  it("falls back to the 60-min bucket when the 5-min bucket is empty", async () => {
    const point = pricePoint(1_700_000_000);
    mockedGetAssetHistoricalPrice
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([point]);

    const result = await makeCaller().assets.getAssetLatestPricePoint({
      coinMinimalDenom: "uatom",
    });

    expect(result).toEqual(point);
    expectCalledWithTimeFrames([5, 60]);
  });

  it("falls back to the 1440-min bucket when 5-min and 60-min are empty (MTN-73 NAM-style stale asset)", async () => {
    const dayBucketPoint = pricePoint(1_697_414_400); // ~20d before 1_700_000_000
    mockedGetAssetHistoricalPrice
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([dayBucketPoint]);

    const result = await makeCaller().assets.getAssetLatestPricePoint({
      coinMinimalDenom: "ibc/NAM-DENOM",
    });

    expect(result).toEqual(dayBucketPoint);
    expectCalledWithTimeFrames([5, 60, 1440]);
  });

  it("returns null when all three buckets are empty", async () => {
    mockedGetAssetHistoricalPrice
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await makeCaller().assets.getAssetLatestPricePoint({
      coinMinimalDenom: "ibc/UNLISTED",
    });

    expect(result).toBeNull();
    expectCalledWithTimeFrames([5, 60, 1440]);
  });

  it("propagates realtime only to the 5-min bucket; coarser frames request realtime=false", async () => {
    mockedGetAssetHistoricalPrice
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    await makeCaller().assets.getAssetLatestPricePoint({
      coinMinimalDenom: "uatom",
      realtime: true,
    });

    expect(mockedGetAssetHistoricalPrice).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ timeFrame: 5, realtime: true })
    );
    expect(mockedGetAssetHistoricalPrice).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ timeFrame: 60, realtime: false })
    );
    expect(mockedGetAssetHistoricalPrice).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ timeFrame: 1440, realtime: false })
    );
  });

  it("returns null and continues the cascade when a layer throws", async () => {
    const dayBucketPoint = pricePoint(1_697_414_400);
    mockedGetAssetHistoricalPrice
      .mockRejectedValueOnce(new Error("upstream timeout"))
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([dayBucketPoint]);

    const result = await makeCaller().assets.getAssetLatestPricePoint({
      coinMinimalDenom: "uatom",
    });

    expect(result).toEqual(dayBucketPoint);
    expectCalledWithTimeFrames([5, 60, 1440]);
  });
});
