import { queryOrderbookTicksSQS } from "../orderbooks";

const tick = {
  tick_id: 18000000,
  tick_state: {
    ask_values: {
      total_amount_of_liquidity: "0",
      cumulative_total_value: "0",
      effective_total_amount_swapped: "0",
      cumulative_realized_cancels: "0",
      last_tick_sync_etas: "0",
    },
    bid_values: {
      total_amount_of_liquidity: "20000000000",
      cumulative_total_value: "20000000000",
      effective_total_amount_swapped: "0",
      cumulative_realized_cancels: "0",
      last_tick_sync_etas: "0",
    },
  },
};

function mockResponse(status: number, body: unknown) {
  jest
    .spyOn(global, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

describe("queryOrderbookTicksSQS", () => {
  beforeEach(() => {
    // apiClient logs every non-2xx response.
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requests the pool's ticks", async () => {
    mockResponse(200, { ticks: [] });
    await queryOrderbookTicksSQS({ poolId: "1931" });
    const url = new URL((global.fetch as jest.Mock).mock.calls[0][0]);
    expect(url.pathname).toBe("/passthrough/orderbook-ticks");
    expect(url.searchParams.get("poolID")).toBe("1931");
  });

  it("returns ticks on 200", async () => {
    mockResponse(200, { ticks: [tick] });
    await expect(queryOrderbookTicksSQS({ poolId: "1" })).resolves.toEqual({
      status: "ok",
      ticks: [tick],
    });
  });

  it("returns an empty book, not unavailable, for 200 with no ticks", async () => {
    mockResponse(200, { ticks: [] });
    await expect(queryOrderbookTicksSQS({ poolId: "1" })).resolves.toEqual({
      status: "ok",
      ticks: [],
    });
  });

  it.each([
    [404, "not-orderbook"],
    [503, "not-ingested"],
    [500, "malformed"],
  ])("maps %i to unavailable (%s)", async (status, reason) => {
    mockResponse(status, { message: "error" });
    await expect(queryOrderbookTicksSQS({ poolId: "1" })).resolves.toEqual({
      status: "unavailable",
      reason,
    });
  });

  it("treats a 200 without a ticks array as malformed, not empty", async () => {
    mockResponse(200, { ticks: null });
    await expect(queryOrderbookTicksSQS({ poolId: "1" })).resolves.toEqual({
      status: "unavailable",
      reason: "malformed",
    });
  });

  it.each([
    ["an empty object", {}],
    ["a missing tick_id", { tick_state: tick.tick_state }],
    ["a string tick_id", { ...tick, tick_id: "18000000" }],
    [
      "missing bid_values",
      { ...tick, tick_state: { ask_values: tick.tick_state.ask_values } },
    ],
    [
      "a non-integer liquidity string",
      {
        ...tick,
        tick_state: {
          ...tick.tick_state,
          bid_values: {
            ...tick.tick_state.bid_values,
            total_amount_of_liquidity: "1.5",
          },
        },
      },
    ],
    [
      "a numeric liquidity",
      {
        ...tick,
        tick_state: {
          ...tick.tick_state,
          ask_values: {
            ...tick.tick_state.ask_values,
            total_amount_of_liquidity: 0,
          },
        },
      },
    ],
  ])(
    "treats a tick with %s as malformed, not an empty book",
    async (_, badTick) => {
      // A valid tick alongside does not rescue the response.
      mockResponse(200, { ticks: [tick, badTick] });
      await expect(queryOrderbookTicksSQS({ poolId: "1" })).resolves.toEqual({
        status: "unavailable",
        reason: "malformed",
      });
    }
  );

  it("throws on other failures so the caller keeps its last good data", async () => {
    mockResponse(502, {});
    await expect(queryOrderbookTicksSQS({ poolId: "1" })).rejects.toThrow();
  });
});
