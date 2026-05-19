import { PositionStatus } from "@osmosis-labs/server";
import { Dec, PricePretty } from "@osmosis-labs/unit";

import { compareUserPositionsByStatusThenValue } from "../concentrated-liquidity";

const usd = { currency: "usd", symbol: "$", maxDecimals: 2, locale: "en-US" };
const price = (amount: number | string) =>
  new PricePretty(usd, new Dec(amount));

type SortInput = Parameters<typeof compareUserPositionsByStatusThenValue>[0];
const pos = (
  id: string,
  status: PositionStatus | undefined,
  value: number | string
): SortInput => ({ id, status, currentValue: price(value) });

describe("compareUserPositionsByStatusThenValue", () => {
  it("orders status groups: out of range, near bounds, in range, full range", () => {
    const positions = [
      pos("p-full", "fullRange", 100),
      pos("p-in", "inRange", 100),
      pos("p-near", "nearBounds", 100),
      pos("p-out", "outOfRange", 100),
    ];
    const sorted = [...positions].sort(compareUserPositionsByStatusThenValue);
    expect(sorted.map((p) => p.id)).toEqual([
      "p-out",
      "p-near",
      "p-in",
      "p-full",
    ]);
  });

  it("orders by USD value descending within a status group", () => {
    const positions = [
      pos("p-small", "inRange", 1),
      pos("p-large", "inRange", 1000),
      pos("p-medium", "inRange", 50),
    ];
    const sorted = [...positions].sort(compareUserPositionsByStatusThenValue);
    expect(sorted.map((p) => p.id)).toEqual(["p-large", "p-medium", "p-small"]);
  });

  it("buckets unknown statuses after all known ones, before tiebreaker on id", () => {
    const positions = [
      pos("p-unknown-2", undefined, 100),
      pos("p-in", "inRange", 0),
      pos("p-unknown-1", undefined, 100),
    ];
    const sorted = [...positions].sort(compareUserPositionsByStatusThenValue);
    expect(sorted.map((p) => p.id)).toEqual([
      "p-in",
      "p-unknown-1",
      "p-unknown-2",
    ]);
  });

  it("buckets unbonding and superfluid statuses with unknowns (not ranked here)", () => {
    const positions = [
      pos("p-unbonding", "unbonding", 100),
      pos("p-in", "inRange", 0),
      pos("p-superfluid", "superfluidStaked", 100),
    ];
    const sorted = [...positions].sort(compareUserPositionsByStatusThenValue);
    // inRange has a known order (2), the others fall to UNKNOWN_STATUS_ORDER (99);
    // tiebreaker on id within the unknown bucket.
    expect(sorted.map((p) => p.id)).toEqual([
      "p-in",
      "p-superfluid",
      "p-unbonding",
    ]);
  });

  it("falls back to position id when both status and value are equal", () => {
    const positions = [
      pos("p-z", "inRange", 0),
      pos("p-a", "inRange", 0),
      pos("p-m", "inRange", 0),
    ];
    const sorted = [...positions].sort(compareUserPositionsByStatusThenValue);
    expect(sorted.map((p) => p.id)).toEqual(["p-a", "p-m", "p-z"]);
  });
});
