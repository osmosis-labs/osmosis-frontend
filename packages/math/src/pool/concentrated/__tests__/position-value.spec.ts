import { Dec } from "@osmosis-labs/unit";

import {
  calcCapitalEfficiency,
  calcPositionValueVsHold,
} from "../position-value";

const closeTo = (value: Dec, expected: number, tolerance = 1e-4) => {
  expect(Math.abs(Number(value.toString()) - expected)).toBeLessThan(tolerance);
};

describe("calcCapitalEfficiency", () => {
  it("approaches 1x for a near-full range", () => {
    const efficiency = calcCapitalEfficiency({
      lowerPrice: new Dec("0.000000000001"),
      upperPrice: new Dec("1000000000000"),
      spotPrice: new Dec(1),
    });
    expect(efficiency).toBeDefined();
    closeTo(efficiency!, 1, 1e-2);
  });

  it("matches the closed form for a symmetric-in-sqrt ±~20% range", () => {
    // pa=0.8, pb=1.25, p=1: 2 / (2 − √0.8 − 1/√1.25) ≈ 9.4721
    const efficiency = calcCapitalEfficiency({
      lowerPrice: new Dec("0.8"),
      upperPrice: new Dec("1.25"),
      spotPrice: new Dec(1),
    });
    expect(efficiency).toBeDefined();
    closeTo(efficiency!, 9.4721, 1e-3);
  });

  it("clamps an out-of-range spot to the nearest edge", () => {
    const atEdge = calcCapitalEfficiency({
      lowerPrice: new Dec("0.8"),
      upperPrice: new Dec("1.25"),
      spotPrice: new Dec("0.8"),
    });
    const below = calcCapitalEfficiency({
      lowerPrice: new Dec("0.8"),
      upperPrice: new Dec("1.25"),
      spotPrice: new Dec("0.5"),
    });
    expect(atEdge).toBeDefined();
    expect(below).toBeDefined();
    expect(below!.equals(atEdge!)).toBe(true);
  });

  it("returns undefined on degenerate input", () => {
    expect(
      calcCapitalEfficiency({
        lowerPrice: new Dec("1.25"),
        upperPrice: new Dec("0.8"),
        spotPrice: new Dec(1),
      })
    ).toBeUndefined();
    expect(
      calcCapitalEfficiency({
        lowerPrice: new Dec(0),
        upperPrice: new Dec("1.25"),
        spotPrice: new Dec(1),
      })
    ).toBeUndefined();
  });
});

describe("calcPositionValueVsHold", () => {
  const range = {
    lowerPrice: new Dec("0.8"),
    upperPrice: new Dec("1.25"),
    entryPrice: new Dec(1),
  };

  it("shows no divergence when exit equals entry", () => {
    const result = calcPositionValueVsHold({
      ...range,
      exitPrice: new Dec(1),
    });
    expect(result).toBeDefined();
    closeTo(result!.positionValue, 1);
    closeTo(result!.holdValue, 1);
    closeTo(result!.deltaVsHold, 0);
  });

  it("computes the known divergence at the range edges (~-5.87%)", () => {
    // Symmetric-in-sqrt range: identical IL at both edges.
    const atUpper = calcPositionValueVsHold({
      ...range,
      exitPrice: new Dec("1.25"),
    });
    const atLower = calcPositionValueVsHold({
      ...range,
      exitPrice: new Dec("0.8"),
    });
    expect(atUpper).toBeDefined();
    expect(atLower).toBeDefined();
    closeTo(atUpper!.positionValue, 1.059017, 1e-5);
    closeTo(atUpper!.holdValue, 1.125, 1e-6);
    closeTo(atUpper!.deltaVsHold, -0.058652, 1e-5);
    closeTo(atLower!.deltaVsHold, -0.058652, 1e-5);
  });

  it("matches the classic full-range IL at a 2x move (~-5.72%)", () => {
    const result = calcPositionValueVsHold({
      lowerPrice: new Dec("0.000000000001"),
      upperPrice: new Dec("1000000000000"),
      entryPrice: new Dec(1),
      exitPrice: new Dec(2),
    });
    expect(result).toBeDefined();
    // 2√r/(1+r) − 1 with r=2 → −0.05719
    closeTo(result!.deltaVsHold, -0.05719, 1e-3);
  });

  it("holds value flat beyond the exited edge (all one-sided)", () => {
    const atEdge = calcPositionValueVsHold({
      ...range,
      exitPrice: new Dec("1.25"),
    });
    const beyond = calcPositionValueVsHold({
      ...range,
      exitPrice: new Dec("2.5"),
    });
    expect(atEdge).toBeDefined();
    expect(beyond).toBeDefined();
    // Position value is frozen once fully one-sided (all quote above range)…
    closeTo(beyond!.positionValue, Number(atEdge!.positionValue.toString()));
    // …while the hold portfolio keeps riding the base asset up, so the
    // divergence keeps widening.
    expect(beyond!.deltaVsHold.lt(atEdge!.deltaVsHold)).toBe(true);
  });

  it("returns undefined on degenerate input", () => {
    expect(
      calcPositionValueVsHold({
        lowerPrice: new Dec("1.25"),
        upperPrice: new Dec("0.8"),
        entryPrice: new Dec(1),
        exitPrice: new Dec(1),
      })
    ).toBeUndefined();
  });
});
