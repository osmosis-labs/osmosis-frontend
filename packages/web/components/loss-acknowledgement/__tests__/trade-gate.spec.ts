import { Dec, RatePretty } from "@osmosis-labs/unit";

import { hasActiveWarning } from "~/components/loss-acknowledgement";
import {
  deriveTradeMemoFlags,
  getTradeWarnings,
  hasQuoteDriftedBeyondSlippage,
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

describe("hasQuoteDriftedBeyondSlippage", () => {
  const tolerance = new Dec("0.005");

  it("fires when the output drops by the tolerance", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        initial: new Dec("100"),
        current: new Dec("99.5"),
        slippageTolerance: tolerance,
      })
    ).toBe(true);
  });

  it("does not fire for a drop just inside the tolerance", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        initial: new Dec("100"),
        current: new Dec("99.6"),
        slippageTolerance: tolerance,
      })
    ).toBe(false);
  });

  it("never fires when the quote improves", () => {
    expect(
      hasQuoteDriftedBeyondSlippage({
        initial: new Dec("100"),
        current: new Dec("120"),
        slippageTolerance: tolerance,
      })
    ).toBe(false);
  });

  // The absolute-difference predecessor subtracted token amounts and compared
  // them against the tolerance *fraction*, so its behaviour tracked the denom's
  // scale instead of the size of the move. Both cases below are a 1% drop.
  describe("scale independence", () => {
    it("fires for a small-denom asset, where an absolute compare could not", () => {
      const initial = new Dec("0.001");
      const current = new Dec("0.00099");

      // what the old predicate compared: 0.00001 >= 0.005 → false
      expect(initial.sub(current).gte(tolerance)).toBe(false);
      expect(
        hasQuoteDriftedBeyondSlippage({
          initial,
          current,
          slippageTolerance: tolerance,
        })
      ).toBe(true);
    });

    it("treats a large-supply asset identically", () => {
      expect(
        hasQuoteDriftedBeyondSlippage({
          initial: new Dec("1000000"),
          current: new Dec("990000"),
          slippageTolerance: tolerance,
        })
      ).toBe(true);
    });

    it("does not fire on a large-supply asset for a move inside the tolerance", () => {
      const initial = new Dec("1000000");
      const current = new Dec("999999");

      // what the old predicate compared: 1 >= 0.005 → true, a false alarm
      expect(initial.sub(current).gte(tolerance)).toBe(true);
      expect(
        hasQuoteDriftedBeyondSlippage({
          initial,
          current,
          slippageTolerance: tolerance,
        })
      ).toBe(false);
    });
  });

  describe("quote direction", () => {
    it("fires when an in-given-out quote asks for more input", () => {
      expect(
        hasQuoteDriftedBeyondSlippage({
          initial: new Dec("100"),
          current: new Dec("101"),
          slippageTolerance: tolerance,
          quoteType: "in-given-out",
        })
      ).toBe(true);
    });

    it("does not fire when an in-given-out quote asks for less input", () => {
      expect(
        hasQuoteDriftedBeyondSlippage({
          initial: new Dec("100"),
          current: new Dec("99"),
          slippageTolerance: tolerance,
          quoteType: "in-given-out",
        })
      ).toBe(false);
    });

    // Paying more is worsening for in-given-out but improving for out-given-in,
    // so the same pair of amounts must resolve differently.
    it("reads the same movement oppositely for the two directions", () => {
      const amounts = {
        initial: new Dec("100"),
        current: new Dec("101"),
        slippageTolerance: tolerance,
      };

      expect(
        hasQuoteDriftedBeyondSlippage({ ...amounts, quoteType: "out-given-in" })
      ).toBe(false);
      expect(
        hasQuoteDriftedBeyondSlippage({ ...amounts, quoteType: "in-given-out" })
      ).toBe(true);
    });
  });

  describe("missing or unusable inputs", () => {
    it("does not fire when the baseline is zero, rather than dividing by it", () => {
      expect(
        hasQuoteDriftedBeyondSlippage({
          initial: new Dec(0),
          current: new Dec(0),
          slippageTolerance: tolerance,
        })
      ).toBe(false);
    });

    it.each([
      ["no baseline", { current: new Dec("99"), slippageTolerance: tolerance }],
      [
        "no current quote",
        { initial: new Dec("100"), slippageTolerance: tolerance },
      ],
      ["no tolerance", { initial: new Dec("100"), current: new Dec("99") }],
    ])("does not fire with %s", (_, input) => {
      expect(hasQuoteDriftedBeyondSlippage(input)).toBe(false);
    });
  });
});
