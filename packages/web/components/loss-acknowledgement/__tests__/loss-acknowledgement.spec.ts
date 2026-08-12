import { Dec } from "@osmosis-labs/unit";

import {
  deriveBridgeMemoFlags,
  hasActiveWarning,
  needsAcknowledgement,
  normalizePriceImpact,
  shouldResetAcknowledgement,
} from "~/components/loss-acknowledgement";
import {
  AckReArmTolerance,
  HighPriceImpactGate,
} from "~/config/trade-warnings";

import { baseFigures, warnedSlippage } from "./loss-figures.fixture";

describe("normalizePriceImpact", () => {
  it("converts a negative provider-reported impact to a positive magnitude", () => {
    expect(normalizePriceImpact(new Dec("-0.12")).toString()).toBe(
      new Dec("0.12").toString()
    );
  });

  it("leaves an already-positive impact unchanged", () => {
    expect(normalizePriceImpact(new Dec("0.12")).toString()).toBe(
      new Dec("0.12").toString()
    );
  });

  // The regression this guards: Nomic (a bundled-swap provider) reports
  // impact negatively, so an un-normalized figure fails `gte` against the gate
  // and the warning silently never fires — no error, no misrender, just an
  // ungated high-loss transfer.
  it("makes a negative impact beyond the gate trip it, where the raw value would not", () => {
    const raw = HighPriceImpactGate.add(new Dec(0.05)).neg();

    expect(raw.gte(HighPriceImpactGate)).toBe(false);
    expect(normalizePriceImpact(raw).gte(HighPriceImpactGate)).toBe(true);
  });

  it("does not trip the gate for a small negative impact", () => {
    const raw = HighPriceImpactGate.sub(new Dec(0.05)).neg();

    expect(normalizePriceImpact(raw).gte(HighPriceImpactGate)).toBe(false);
  });
});

describe("hasActiveWarning", () => {
  it("is false when no warning is active", () => {
    expect(
      hasActiveWarning(
        baseFigures({
          warnSlippage: false,
          warnPriceImpact: false,
          swapImpactUnknown: false,
        })
      )
    ).toBe(false);
  });

  it.each([
    ["warnSlippage", { warnSlippage: true }],
    ["warnPriceImpact", { warnSlippage: false, warnPriceImpact: true }],
    ["swapImpactUnknown", { warnSlippage: false, swapImpactUnknown: true }],
  ] as const)("is true when %s is active", (_, overrides) => {
    expect(hasActiveWarning(baseFigures(overrides))).toBe(true);
  });
});

describe("shouldResetAcknowledgement", () => {
  it("does not reset when figures are identical", () => {
    expect(shouldResetAcknowledgement(baseFigures(), baseFigures())).toBe(
      false
    );
  });

  // Identity is compared as one opaque key, so this is a single string compare
  // rather than the per-field matrix it replaced. What still matters is that it
  // admits no tolerance: a different operation re-arms even when every loss
  // figure is identical.
  it("resets when the identity key changes, with figures unchanged", () => {
    expect(
      shouldResetAcknowledgement(
        baseFigures(),
        baseFigures({ identityKey: "Wormhole|osmosis-1|bitcoin|allBTC|sat|1" })
      )
    ).toBe(true);
  });

  describe("newly active warning types", () => {
    it("resets when price impact newly warns, even within tolerance", () => {
      // acknowledged with only the slippage warning active; price impact then
      // crosses its own threshold by less than the re-arm tolerance — the user
      // never saw a price-impact warning, so the acknowledgement is stale
      const acknowledged = baseFigures({ priceImpact: new Dec(0.095) });
      const current = baseFigures({
        priceImpact: new Dec(0.1),
        warnPriceImpact: true,
      });
      expect(
        current.priceImpact.sub(acknowledged.priceImpact).lte(AckReArmTolerance)
      ).toBe(true);
      expect(shouldResetAcknowledgement(acknowledged, current)).toBe(true);
    });

    it("resets when slippage newly warns", () => {
      const acknowledged = baseFigures({
        warnSlippage: false,
        warnPriceImpact: true,
        priceImpact: new Dec(0.12),
        slippage: new Dec(0),
      });
      const current = baseFigures({
        warnPriceImpact: true,
        priceImpact: new Dec(0.12),
      });
      expect(shouldResetAcknowledgement(acknowledged, current)).toBe(true);
    });

    it("resets when swap impact newly becomes unknown", () => {
      const acknowledged = baseFigures();
      const current = baseFigures({ swapImpactUnknown: true });
      expect(shouldResetAcknowledgement(acknowledged, current)).toBe(true);
    });

    it("does not reset when a warning clears", () => {
      const acknowledged = baseFigures({
        warnPriceImpact: true,
        priceImpact: new Dec(0.12),
      });
      const current = baseFigures({ priceImpact: new Dec(0) });
      expect(shouldResetAcknowledgement(acknowledged, current)).toBe(false);
    });
  });

  describe("worsening beyond tolerance", () => {
    it("does not reset when slippage worsens within tolerance", () => {
      const current = baseFigures({
        slippage: warnedSlippage.add(AckReArmTolerance),
      });
      expect(shouldResetAcknowledgement(baseFigures(), current)).toBe(false);
    });

    it("resets when slippage worsens beyond tolerance", () => {
      const current = baseFigures({
        slippage: warnedSlippage.add(AckReArmTolerance).add(new Dec(0.0001)),
      });
      expect(shouldResetAcknowledgement(baseFigures(), current)).toBe(true);
    });

    it("resets when price impact worsens beyond tolerance", () => {
      const acknowledged = baseFigures({
        warnPriceImpact: true,
        priceImpact: new Dec(0.12),
      });
      const current = baseFigures({
        warnPriceImpact: true,
        priceImpact: new Dec(0.12).add(AckReArmTolerance).add(new Dec(0.0001)),
      });
      expect(shouldResetAcknowledgement(acknowledged, current)).toBe(true);
    });

    it("never resets on improvement", () => {
      const current = baseFigures({
        slippage: warnedSlippage.sub(new Dec(0.05)),
        priceImpact: new Dec(0),
      });
      expect(shouldResetAcknowledgement(baseFigures(), current)).toBe(false);
    });
  });
});

describe("needsAcknowledgement", () => {
  it("is false with no current figures", () => {
    expect(needsAcknowledgement(null, undefined)).toBe(false);
    expect(needsAcknowledgement(baseFigures(), undefined)).toBe(false);
  });

  it("is false when no warning is active, regardless of basis", () => {
    const calm = baseFigures({ warnSlippage: false, slippage: new Dec(0) });
    expect(needsAcknowledgement(null, calm)).toBe(false);
    expect(needsAcknowledgement(baseFigures(), calm)).toBe(false);
  });

  it("is true when warned and unacknowledged", () => {
    expect(needsAcknowledgement(null, baseFigures())).toBe(true);
  });

  it("is false when the basis matches the warned figures", () => {
    expect(needsAcknowledgement(baseFigures(), baseFigures())).toBe(false);
  });

  it("is true when the basis is stale (worse beyond tolerance)", () => {
    const worse = baseFigures({
      slippage: warnedSlippage.add(AckReArmTolerance).add(new Dec(0.0001)),
    });
    expect(needsAcknowledgement(baseFigures(), worse)).toBe(true);
  });
});

describe("deriveBridgeMemoFlags", () => {
  it("is undefined when nothing was acknowledged", () => {
    expect(deriveBridgeMemoFlags(null)).toBeUndefined();
  });

  it("stamps only the total-loss figure when only the total-loss warning fired", () => {
    const flags = deriveBridgeMemoFlags(baseFigures());
    expect(flags?.totalLoss).toEqual(warnedSlippage);
    expect(flags?.priceImpact).toBeUndefined();
  });

  it("stamps only the price-impact figure when only its warning fired", () => {
    const impact = new Dec("0.124");
    const flags = deriveBridgeMemoFlags(
      baseFigures({
        warnSlippage: false,
        warnPriceImpact: true,
        priceImpact: impact,
      })
    );
    expect(flags?.priceImpact).toEqual(impact);
    expect(flags?.totalLoss).toBeUndefined();
  });

  it("stamps both acknowledged figures when both warnings fired", () => {
    const impact = new Dec("0.124");
    const flags = deriveBridgeMemoFlags(
      baseFigures({ warnPriceImpact: true, priceImpact: impact })
    );
    expect(flags?.totalLoss).toEqual(warnedSlippage);
    expect(flags?.priceImpact).toEqual(impact);
  });

  it("yields no flags for an unknown-impact-only acknowledgement (no figure to stamp)", () => {
    expect(
      deriveBridgeMemoFlags(
        baseFigures({
          warnSlippage: false,
          warnPriceImpact: false,
          swapImpactUnknown: true,
        })
      )
    ).toBeUndefined();
  });
});
