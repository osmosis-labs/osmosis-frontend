import { dayjs } from "../../../../utils/dayjs";
import {
  estimateShareExitCoins,
  getConcentratedHoldings,
  getOrderHoldings,
  groupShareLocks,
} from "../forced-migration-holdings";

const USDC_NOBLE =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const NOT_UNLOCKING = new Date("0001-01-01T00:00:00Z");

const lock = (
  id: string,
  amount: string,
  { unlockingUntil }: { unlockingUntil?: string } = {}
) => ({
  ID: id,
  coins: [{ denom: "gamm/pool/1", amount }],
  isCurrentlyUnlocking: Boolean(unlockingUntil),
  endTime: unlockingUntil ? new Date(unlockingUntil) : NOT_UNLOCKING,
  duration: dayjs.duration(14 * 24 * 60 * 60 * 1000),
});

describe("groupShareLocks", () => {
  it("splits shares into available, locked, superfluid and unlocking", () => {
    const groups = groupShareLocks({
      bankShares: [{ denom: "gamm/pool/1", amount: "10" }],
      locks: [
        lock("1", "20"),
        lock("2", "30"),
        lock("3", "40", { unlockingUntil: "2026-12-01T00:00:00Z" }),
        lock("4", "50"),
      ],
      syntheticByLockId: new Map([
        [
          "2",
          [
            {
              synth_denom: "gamm/pool/1/superbonding/osmovaloper1x",
              end_time: "0001-01-01T00:00:00Z",
            },
          ],
        ],
        // Undelegated but not yet unbonded: on its way out, so not nagged.
        [
          "4",
          [
            {
              synth_denom: "gamm/pool/1/superunbonding/osmovaloper1x",
              end_time: "2026-11-15T00:00:00Z",
            },
          ],
        ],
      ]),
    });

    const byState = Object.fromEntries(groups.map((g) => [g.state, g]));
    expect(byState.available.shares).toBe("10");
    expect(byState.locked.shares).toBe("50");
    expect(byState.locked.locks).toEqual([
      { lockId: "1", isSynthetic: false },
      { lockId: "2", isSynthetic: true },
    ]);
    expect(byState.locked.unlockDurationSeconds).toBe(14 * 24 * 60 * 60);
    expect(byState.unlocking.shares).toBe("90");
    expect(byState.unlocking.unlockEndTime).toBe("2026-12-01T00:00:00.000Z");
  });
});

describe("estimateShareExitCoins", () => {
  it("pays out pro rata, less the exit fee, rounded down", () => {
    expect(
      estimateShareExitCoins({
        totalShares: "1000",
        reserves: [
          { denom: USDC_NOBLE, amount: "1000001" },
          { denom: "uosmo", amount: "333" },
        ],
        exitFee: "0.01",
        shares: "100",
      })
    ).toEqual([
      { denom: USDC_NOBLE, amount: "99000" },
      { denom: "uosmo", amount: "32" },
    ]);
  });
});

describe("getConcentratedHoldings", () => {
  const position = (id: string, usdc: string) => ({
    position: {
      position_id: id,
      address: "osmo1x",
      join_time: "",
      liquidity: "100.000000000000000000",
      lower_tick: "-100",
      pool_id: "1464",
      upper_tick: "100",
    },
    asset0: { denom: "uosmo", amount: "5" },
    asset1: { denom: USDC_NOBLE, amount: usdc },
  });

  it("classifies by superfluid and unbonding state, and skips positions without the denom", () => {
    const holdings = getConcentratedHoldings({
      positions: [
        position("1", "10"),
        position("2", "20"),
        position("3", "30"),
        position("4", "0"),
      ],
      oldDenoms: new Set([USDC_NOBLE]),
      lockDurations: new Map([["99", 1209600]]),
      unbonding: [{ positionId: "3", endTime: "2026-12-01T00:00:00Z" }],
      delegated: [{ positionId: "2", lockId: "99" }],
      undelegating: [],
    });

    expect(
      holdings.map(({ positionId, state }) => [positionId, state])
    ).toEqual([
      ["1", "available"],
      ["2", "superfluidStaked"],
      ["3", "unlocking"],
    ]);
    expect(holdings[1].lockId).toBe("99");
    expect(holdings[1].unlockDurationSeconds).toBe(1209600);
    expect(holdings[0].coins.map(({ denom }) => denom)).toEqual([
      "uosmo",
      USDC_NOBLE,
    ]);
  });
});

describe("getOrderHoldings", () => {
  const order = (
    direction: "bid" | "ask",
    overrides: Partial<{
      quantity: string;
      output: string;
      percentFilled: string;
      percentClaimed: string;
    }> = {}
  ) => ({
    tick_id: 1,
    order_id: 2,
    order_direction: direction,
    owner: "osmo1x",
    quantity: "1000000",
    etas: "0",
    placed_quantity: "1000000",
    placed_at: 0,
    price: "1",
    percentClaimed: "0",
    totalFilled: "0",
    percentFilled: "0",
    orderbookAddress: "osmo1book",
    status: "open" as const,
    output: "500",
    quote_asset: { symbol: USDC_NOBLE },
    base_asset: { symbol: "uosmo" },
    ...overrides,
  });

  it("counts a bid's unfilled amount and an ask's unclaimed proceeds in the old denom", () => {
    const [bid, partialBid, ask] = getOrderHoldings({
      orders: [
        order("bid"),
        // Half filled, nothing claimed yet: `quantity` is still the placed
        // amount onchain, but only half of it is unfilled noble.
        order("bid", { percentFilled: "0.5" }),
        // Fully filled, unclaimed: the order holds no noble any more.
        order("bid", { percentFilled: "1" }),
        order("ask", {
          output: "2000000",
          percentFilled: "0.5",
          percentClaimed: "0.25",
        }),
        // Placed with OSMO and not filled: nothing in USDC.noble yet.
        order("ask"),
      ],
      oldDenoms: new Set([USDC_NOBLE]),
    });

    expect(bid).toMatchObject({
      inDenom: USDC_NOBLE,
      oldDenomAmount: "1000000",
    });
    expect(partialBid).toMatchObject({
      remaining: "500000",
      oldDenomAmount: "500000",
    });
    expect(ask).toMatchObject({
      outDenom: USDC_NOBLE,
      unclaimed: "500000",
      oldDenomAmount: "500000",
    });
  });
});
