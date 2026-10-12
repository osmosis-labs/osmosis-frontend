import { SQSOrderbookTick } from "../../../sidecar/orderbooks";
import { buildOrderbookLevels } from "../pair-depth";

function tick(
  tickId: number,
  { bid = "0", ask = "0" }: { bid?: string; ask?: string }
): SQSOrderbookTick {
  const values = (tal: string) => ({
    total_amount_of_liquidity: tal,
    cumulative_total_value: tal,
    effective_total_amount_swapped: "0",
    cumulative_realized_cancels: "0",
    last_tick_sync_etas: "0",
  });
  return {
    tick_id: tickId,
    tick_state: { ask_values: values(ask), bid_values: values(bid) },
  };
}

// Raw tick prices are quote minimal per base minimal: tick 0 = 1,
// tick 9,000,000 = 10, tick 18,000,000 = 100, tick 27,000,000 = 1000.
describe("buildOrderbookLevels", () => {
  it("scales each side by its own denom's exponent (8-decimal base, 6-decimal quote)", () => {
    // BTC (8) / USDC (6): human price = raw price * 10^(8 - 6).
    const { bids, asks } = buildOrderbookLevels({
      ticks: [
        // 20,000 USDC bid at 10,000 USDC/BTC = 2 BTC
        tick(18000000, { bid: "20000000000" }),
        // 1.5 BTC ask at 100,000 USDC/BTC
        tick(27000000, { ask: "150000000" }),
      ],
      nextBidTick: 18000000,
      nextAskTick: 27000000,
      baseDecimals: 8,
      quoteDecimals: 6,
    });

    expect(bids).toHaveLength(1);
    expect(bids[0].price).toBeCloseTo(10000);
    expect(bids[0].quantity).toBeCloseTo(2);
    expect(bids[0].cumulative).toBeCloseTo(2);

    expect(asks).toHaveLength(1);
    expect(asks[0].price).toBeCloseTo(100000);
    expect(asks[0].quantity).toBeCloseTo(1.5);
  });

  it("handles a quote with more decimals than the base (6-decimal base, 18-decimal quote)", () => {
    // OSMO (6) / USDY (18): human price = raw price * 10^(6 - 18), so raw
    // price 1000 at tick 27,000,000 is 1e-9 USDY per OSMO.
    const { bids, asks } = buildOrderbookLevels({
      ticks: [tick(27000000, { ask: "3000000" })],
      nextBidTick: 18000000,
      nextAskTick: 27000000,
      baseDecimals: 6,
      quoteDecimals: 18,
    });

    expect(bids).toHaveLength(0);
    expect(asks).toHaveLength(1);
    expect(asks[0].price).toBeCloseTo(1e-9, 15);
    // 3,000,000 uosmo = 3 OSMO
    expect(asks[0].quantity).toBeCloseTo(3);
  });

  it("orders bids best first with cumulative depth outward, asks best first", () => {
    const { bids, asks } = buildOrderbookLevels({
      ticks: [
        tick(0, { bid: "1000000" }), // 1 base at price 1
        tick(9000000, { bid: "10000000" }), // 1 base at price 10
        tick(18000000, { ask: "2000000" }),
        tick(27000000, { ask: "1000000" }),
      ],
      nextBidTick: 9000000,
      nextAskTick: 18000000,
      baseDecimals: 6,
      quoteDecimals: 6,
    });

    expect(bids.map((b) => b.price)).toEqual([10, 1]);
    expect(bids.map((b) => b.cumulative)).toEqual([1, 2]);
    expect(asks.map((a) => a.price)).toEqual([100, 1000]);
    expect(asks.map((a) => a.quantity)).toEqual([2, 1]);
  });

  it("ignores liquidity on the wrong side of the contract's best bid/ask", () => {
    const { bids, asks } = buildOrderbookLevels({
      ticks: [
        // bid liquidity above the best bid, ask liquidity below the best ask
        tick(18000000, { bid: "5000000", ask: "0" }),
        tick(0, { ask: "5000000" }),
        tick(9000000, { bid: "10000000", ask: "0" }),
      ],
      nextBidTick: 9000000,
      nextAskTick: 18000000,
      baseDecimals: 6,
      quoteDecimals: 6,
    });

    expect(bids.map((b) => b.price)).toEqual([10]);
    expect(asks).toHaveLength(0);
  });

  it("returns no levels for a genuinely empty book", () => {
    expect(
      buildOrderbookLevels({
        ticks: [],
        nextBidTick: 0,
        nextAskTick: 0,
        baseDecimals: 6,
        quoteDecimals: 6,
      })
    ).toEqual({ bids: [], asks: [] });
  });
});
