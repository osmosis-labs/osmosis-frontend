import { queryMarketChart } from "../../../../coingecko";
import { getCoinGeckoCoinMarketChart } from "../historical";

jest.mock("../../../../coingecko", () => ({
  ...jest.requireActual("../../../../coingecko"),
  queryMarketChart: jest.fn(),
}));

const mockQueryMarketChart = queryMarketChart as jest.MockedFunction<
  typeof queryMarketChart
>;

const chart = (prices: number[][]) => ({
  prices,
  market_caps: [],
  total_volumes: [],
});

describe("getCoinGeckoCoinMarketChart", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockQueryMarketChart.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("shares one upstream request for calls a minute apart", async () => {
    mockQueryMarketChart.mockResolvedValue(chart([[1, 1]]));

    jest.setSystemTime(1_700_000_010_000);
    await getCoinGeckoCoinMarketChart({ id: "shared", timeFrame: "1d" });
    // same 5 minute bucket, but past the previous 10 second TTL
    jest.setSystemTime(1_700_000_070_000);
    await getCoinGeckoCoinMarketChart({ id: "shared", timeFrame: "1d" });

    expect(mockQueryMarketChart).toHaveBeenCalledTimes(1);
    expect(mockQueryMarketChart).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 1_700_000_100 - 86_400,
        to: 1_700_000_100,
      })
    );
  });

  it("starts the all range at 0", async () => {
    mockQueryMarketChart.mockResolvedValue(chart([[1, 1]]));

    jest.setSystemTime(1_700_000_010_000);
    await getCoinGeckoCoinMarketChart({ id: "all", timeFrame: "all" });

    expect(mockQueryMarketChart).toHaveBeenCalledWith(
      expect.objectContaining({ from: 0, to: 1_700_006_400 })
    );
  });

  it("returns an empty chart without caching it", async () => {
    mockQueryMarketChart.mockResolvedValue(chart([]));

    jest.setSystemTime(1_700_000_010_000);
    const first = await getCoinGeckoCoinMarketChart({
      id: "empty",
      timeFrame: "1d",
    });
    await getCoinGeckoCoinMarketChart({ id: "empty", timeFrame: "1d" });

    expect(first.prices).toEqual([]);
    expect(mockQueryMarketChart).toHaveBeenCalledTimes(2);
  });

  it("returns an empty chart to concurrent callers of the same key", async () => {
    mockQueryMarketChart.mockResolvedValue(chart([]));

    jest.setSystemTime(1_700_000_010_000);
    const results = await Promise.all([
      getCoinGeckoCoinMarketChart({ id: "concurrent", timeFrame: "1d" }),
      getCoinGeckoCoinMarketChart({ id: "concurrent", timeFrame: "1d" }),
    ]);

    expect(results.map((r) => r.prices)).toEqual([[], []]);
  });
});
