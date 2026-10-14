import type { TokenHistoricalPrice } from "@osmosis-labs/server";

import {
  filterFutureData,
  getCustomTimeFrame,
  isHistoricalChartStale,
  toCoingeckoHistoricalData,
} from "../asset-info-utils";

const NOW_MS = Date.UTC(2025, 5, 15, 12, 0, 0);
const NOW_SEC = NOW_MS / 1000;

describe("getCustomTimeFrame", () => {
  it.each([
    ["1h", "price", 5, 14],
    ["1h", "volume", 5, 14],
    ["1d", "price", 15, 97],
    ["7d", "price", 60, 168],
    ["7d", "volume", 720, 15],
    ["1mo", "price", 240, 180],
    ["1mo", "volume", 1440, 30],
    ["1y", "price", 1440, 365],
    ["1y", "volume", 10080, 54],
    ["all", "price", 10080, undefined],
    ["all", "volume", 43800, undefined],
  ] as const)("%s %s", (range, dataType, timeFrame, numRecentFrames) => {
    expect(getCustomTimeFrame(range, dataType)).toEqual({
      timeFrame,
      numRecentFrames,
    });
  });
});

describe("toCoingeckoHistoricalData", () => {
  const prices: [number, number][] = [
    [(NOW_SEC - 30 * 60) * 1000, 3], // 30 min ago
    [(NOW_SEC - 5 * 3600) * 1000, 2], // 5 hours ago
    [(NOW_SEC - 10 * 86400) * 1000, 1], // 10 days ago
    [(NOW_SEC + 3600) * 1000, 4], // in the future
  ];
  const data = { prices } as unknown as Parameters<
    typeof toCoingeckoHistoricalData
  >[0];

  it("maps every point and keeps all of them for the 'all' range", () => {
    const result = toCoingeckoHistoricalData(data, "all", NOW_MS)!;
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({
      time: NOW_SEC - 30 * 60,
      close: 3,
      high: 3,
      low: 3,
      open: 3,
      volume: 0,
    });
  });

  it("keeps only points inside the window and not in the future", () => {
    expect(
      toCoingeckoHistoricalData(data, "1h", NOW_MS)!.map((p) => p.close)
    ).toEqual([3]);
    expect(
      toCoingeckoHistoricalData(data, "1d", NOW_MS)!.map((p) => p.close)
    ).toEqual([3, 2]);
    expect(
      toCoingeckoHistoricalData(data, "7d", NOW_MS)!.map((p) => p.close)
    ).toEqual([3, 2]);
    expect(
      toCoingeckoHistoricalData(data, "1mo", NOW_MS)!.map((p) => p.close)
    ).toEqual([3, 2, 1]);
  });
});

describe("filterFutureData", () => {
  it("drops points after now", () => {
    const point = (time: number) => ({ time }) as TokenHistoricalPrice;
    expect(
      filterFutureData(
        [point(NOW_SEC - 1), point(NOW_SEC), point(NOW_SEC + 1)],
        NOW_MS
      )
    ).toEqual([point(NOW_SEC - 1), point(NOW_SEC)]);
  });
});

describe("isHistoricalChartStale", () => {
  const base = {
    isLoading: false,
    isUnavailable: false,
    usingCoingeckoFallback: false,
    latestPricePointTimeSec: NOW_SEC - 2 * 3600,
    range: "7d" as const,
    nowMs: NOW_MS,
  };

  it("is stale past the default one hour threshold", () => {
    expect(isHistoricalChartStale(base)).toBe(true);
    expect(
      isHistoricalChartStale({
        ...base,
        latestPricePointTimeSec: NOW_SEC - 30 * 60,
      })
    ).toBe(false);
  });

  it("uses a 15 minute threshold for the 1h range", () => {
    expect(
      isHistoricalChartStale({
        ...base,
        range: "1h",
        latestPricePointTimeSec: NOW_SEC - 20 * 60,
      })
    ).toBe(true);
    expect(
      isHistoricalChartStale({
        ...base,
        range: "1d",
        latestPricePointTimeSec: NOW_SEC - 20 * 60,
      })
    ).toBe(false);
  });

  it("is never stale while loading, unavailable, on coingecko, or without a timestamp", () => {
    expect(isHistoricalChartStale({ ...base, isLoading: true })).toBe(false);
    expect(isHistoricalChartStale({ ...base, isUnavailable: true })).toBe(
      false
    );
    expect(
      isHistoricalChartStale({ ...base, usingCoingeckoFallback: true })
    ).toBe(false);
    expect(
      isHistoricalChartStale({ ...base, latestPricePointTimeSec: undefined })
    ).toBe(false);
  });
});
