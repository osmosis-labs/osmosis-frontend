import { roundMarketChartRange } from "../historical";

describe("roundMarketChartRange", () => {
  it("gives identical ranges for requests a few seconds apart", () => {
    const to = 1_700_000_010;
    const a = roundMarketChartRange({ from: to - 86_400, to });
    const b = roundMarketChartRange({ from: to + 7 - 86_400, to: to + 7 });
    expect(a).toEqual(b);
  });

  it("never cuts off the latest data point and preserves the span", () => {
    const from = 1_700_000_001;
    const to = 1_700_086_401; // exactly 1 day
    const range = roundMarketChartRange({ from, to });
    expect(range.to).toBeGreaterThanOrEqual(to);
    expect(range.to - range.from).toBe(to - from);
  });

  it("uses a wider bucket for longer spans", () => {
    const week = roundMarketChartRange({
      from: 1_700_000_001 - 7 * 86_400,
      to: 1_700_000_001,
    });
    expect(week.to % 3600).toBe(0);
    expect(roundMarketChartRange({ from: 0, to: 600 }).to).toBe(600);
  });
});
