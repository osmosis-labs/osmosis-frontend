import { Dec, RatePretty } from "@osmosis-labs/unit";

import { hasActiveWarning } from "~/components/loss-acknowledgement";
import {
  deriveTradeMemoFlags,
  getTradeWarnings,
} from "~/components/loss-acknowledgement/trade-gate";
import { HighPriceImpactGate, HighSlippageGate } from "~/config/trade-warnings";

/** A hair either side of a threshold, small enough not to cross any other. */
const epsilon = new Dec(0.0001);

/** Router quotes report impact negatively — see `Quote.priceImpactTokenOut`. */
const quotedImpact = (magnitude: Dec) => new RatePretty(magnitude.neg());

describe("getTradeWarnings", () => {
  describe("price impact", () => {
    // The regression this guards: the router reports impact negatively, so an
    // un-normalized figure fails `gte` against the gate and the checkbox
    // silently never appears — no error, no misrender, just an ungated trade.
    it("gates on the magnitude of a negatively-reported impact", () => {
      const { priceImpact, warnPriceImpact } = getTradeWarnings({
        priceImpactTokenOut: quotedImpact(HighPriceImpactGate.add(epsilon)),
      });

      expect(priceImpact.isPositive()).toBe(true);
      expect(warnPriceImpact).toBe(true);
    });

    it("gates exactly at the threshold", () => {
      expect(
        getTradeWarnings({
          priceImpactTokenOut: quotedImpact(HighPriceImpactGate),
        }).warnPriceImpact
      ).toBe(true);
    });

    it("does not gate just below the threshold", () => {
      expect(
        getTradeWarnings({
          priceImpactTokenOut: quotedImpact(HighPriceImpactGate.sub(epsilon)),
        }).warnPriceImpact
      ).toBe(false);
    });

    it("gates a positively-reported impact identically", () => {
      expect(
        getTradeWarnings({
          priceImpactTokenOut: new RatePretty(HighPriceImpactGate),
        }).warnPriceImpact
      ).toBe(true);
    });

    // Fails open, never closed: a checkbox the user cannot clear is worse than
    // no checkbox, and the slippage gate still applies.
    it("fails open when the quote reports no impact", () => {
      const warnings = getTradeWarnings({ priceImpactTokenOut: undefined });

      expect(warnings.warnPriceImpact).toBe(false);
      expect(warnings.priceImpact.isZero()).toBe(true);
    });

    it("still gates on slippage when impact data is missing", () => {
      expect(
        getTradeWarnings({ slippage: HighSlippageGate }).warnSlippage
      ).toBe(true);
    });
  });

  describe("slippage tolerance", () => {
    it("gates exactly at the threshold", () => {
      expect(
        getTradeWarnings({ slippage: HighSlippageGate }).warnSlippage
      ).toBe(true);
    });

    it("does not gate just below the threshold", () => {
      expect(
        getTradeWarnings({ slippage: HighSlippageGate.sub(epsilon) })
          .warnSlippage
      ).toBe(false);
    });

    it("treats an absent tolerance as zero rather than gating", () => {
      const warnings = getTradeWarnings({});

      expect(warnings.warnSlippage).toBe(false);
      expect(warnings.slippage.isZero()).toBe(true);
    });
  });

  describe("filling past the market price", () => {
    it("gates a true limit order priced across the book", () => {
      const warnings = getTradeWarnings({
        orderType: "limit",
        isBeyondOppositePrice: true,
        percentAdjusted: new Dec("0.0325"),
      });

      expect(warnings.warnMarketFill).toBe(true);
      expect(warnings.marketFillDistance?.toString()).toBe(
        new Dec("0.0325").toString()
      );
    });

    // Direction only decides the sign of `price / spot - 1`; the distance the
    // user is acknowledging is the magnitude either way.
    it("stamps the magnitude for a sell order's negative adjustment", () => {
      expect(
        getTradeWarnings({
          orderType: "limit",
          isBeyondOppositePrice: true,
          percentAdjusted: new Dec("-0.0325"),
        }).marketFillDistance?.toString()
      ).toBe(new Dec("0.0325").toString());
    });

    it("does not gate a market order, which fills at market by definition", () => {
      expect(
        getTradeWarnings({
          orderType: "market",
          isBeyondOppositePrice: true,
          percentAdjusted: new Dec("0.0325"),
        }).warnMarketFill
      ).toBe(false);
    });

    it("does not gate a limit order resting on its own side of the book", () => {
      expect(
        getTradeWarnings({
          orderType: "limit",
          isBeyondOppositePrice: false,
          percentAdjusted: new Dec("0.0325"),
        }).warnMarketFill
      ).toBe(false);
    });

    // The boolean is the gate; the figure is only what gets stamped.
    it("still gates when the distance figure is unavailable", () => {
      const warnings = getTradeWarnings({
        orderType: "limit",
        isBeyondOppositePrice: true,
      });

      expect(warnings.warnMarketFill).toBe(true);
      expect(warnings.marketFillDistance).toBeUndefined();
    });
  });

  it("composes into LossFigures the acknowledgement model accepts", () => {
    const figures = {
      identityKey: "OSMO|ATOM|market|1000000",
      ...getTradeWarnings({
        priceImpactTokenOut: quotedImpact(HighPriceImpactGate),
      }),
    };

    expect(hasActiveWarning(figures)).toBe(true);
  });

  it("reports no active warning for an unremarkable trade", () => {
    const figures = {
      identityKey: "OSMO|ATOM|market|1000000",
      ...getTradeWarnings({
        priceImpactTokenOut: quotedImpact(new Dec("0.02")),
        slippage: new Dec("0.005"),
        orderType: "market" as const,
      }),
    };

    expect(hasActiveWarning(figures)).toBe(false);
  });
});

describe("deriveTradeMemoFlags", () => {
  const basis = (input: Parameters<typeof getTradeWarnings>[0]) => ({
    identityKey: "OSMO|ATOM|market|1000000",
    ...getTradeWarnings(input),
  });

  it("is undefined when nothing was acknowledged", () => {
    expect(deriveTradeMemoFlags(null)).toBeUndefined();
  });

  it("is undefined when no warning fired, so an unwarned trade stamps nothing", () => {
    expect(
      deriveTradeMemoFlags(basis({ slippage: new Dec("0.005") }))
    ).toBeUndefined();
  });

  // The whole point of the separate keys: a tolerance must never be recorded as
  // a realized loss, which is what `loss=` means.
  it("stamps an accepted tolerance as slippageTolerance, never as totalLoss", () => {
    const flags = deriveTradeMemoFlags(basis({ slippage: HighSlippageGate }));

    expect(flags?.slippageTolerance?.toString()).toBe(
      HighSlippageGate.toString()
    );
    expect(flags?.totalLoss).toBeUndefined();
  });

  it("stamps the acknowledged price impact as a positive magnitude", () => {
    const flags = deriveTradeMemoFlags(
      basis({ priceImpactTokenOut: quotedImpact(new Dec("0.124")) })
    );

    expect(flags?.priceImpact?.toString()).toBe(new Dec("0.124").toString());
  });

  it("stamps the distance past market for a crossing limit order", () => {
    const flags = deriveTradeMemoFlags(
      basis({
        orderType: "limit",
        isBeyondOppositePrice: true,
        percentAdjusted: new Dec("0.0325"),
      })
    );

    expect(flags?.marketFillDistance?.toString()).toBe(
      new Dec("0.0325").toString()
    );
  });

  it("yields no flags for a crossing order with no distance figure", () => {
    expect(
      deriveTradeMemoFlags(
        basis({ orderType: "limit", isBeyondOppositePrice: true })
      )
    ).toBeUndefined();
  });

  it("stamps every acknowledged figure at once", () => {
    const flags = deriveTradeMemoFlags(
      basis({
        priceImpactTokenOut: quotedImpact(new Dec("0.124")),
        slippage: HighSlippageGate,
        orderType: "limit",
        isBeyondOppositePrice: true,
        percentAdjusted: new Dec("0.0325"),
      })
    );

    expect(flags?.priceImpact).toBeDefined();
    expect(flags?.slippageTolerance).toBeDefined();
    expect(flags?.marketFillDistance).toBeDefined();
    expect(flags?.totalLoss).toBeUndefined();
  });
});
