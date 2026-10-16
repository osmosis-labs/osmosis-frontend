import { Dec } from "@osmosis-labs/unit";

import {
  appendFeMemoTag,
  FeMemoTag,
  formatWarnPct,
  OneClickFeMemoTag,
} from "../memo";

describe("formatWarnPct", () => {
  it.each([
    ["0", "0.00"],
    ["0.0001", "0.01"],
    ["0.124", "12.40"],
    ["1", "100.00"],
    // half-up rounding at the 2nd decimal place
    ["0.99895", "99.90"],
    ["0.99894", "99.89"],
    ["0.12405", "12.41"],
  ])("formats fraction %s as %s", (fraction, expected) => {
    expect(formatWarnPct(new Dec(fraction))).toBe(expected);
  });
});

describe("appendFeMemoTag", () => {
  describe("without flags (unwarned txs)", () => {
    it("produces exactly the bare base tag on an empty memo", () => {
      expect(appendFeMemoTag("", FeMemoTag)).toBe("OsmosisFE");
      expect(appendFeMemoTag("", OneClickFeMemoTag)).toBe("1CT");
    });

    it("appends the tag after a non-empty memo exactly as before", () => {
      expect(appendFeMemoTag("user memo", FeMemoTag)).toBe(
        "user memo \nOsmosisFE"
      );
      expect(appendFeMemoTag("user memo", OneClickFeMemoTag)).toBe(
        "user memo \n1CT"
      );
    });

    it("treats an empty flags object as no flags", () => {
      expect(appendFeMemoTag("", FeMemoTag, {})).toBe("OsmosisFE");
    });
  });

  describe("with warn-accept flags", () => {
    it("stamps an acknowledged bridge total-loss as loss=", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, { totalLoss: new Dec("0.9989") })
      ).toBe("OsmosisFE/warn:loss=99.89");
    });

    it("stamps an acknowledged price impact as pi=", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, { priceImpact: new Dec("0.124") })
      ).toBe("OsmosisFE/warn:pi=12.40");
    });

    it("stamps an accepted trade slippage tolerance as slip=", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, { slippageTolerance: new Dec("0.06") })
      ).toBe("OsmosisFE/warn:slip=6.00");
    });

    it("stamps an accepted distance past market as mktfill=", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, {
          marketFillDistance: new Dec("0.0325"),
        })
      ).toBe("OsmosisFE/warn:mktfill=3.25");
    });

    it("keeps loss and slip distinct so the two cannot be conflated", () => {
      // Same acknowledged figure, different meanings: a realized bridge loss
      // versus a tolerance a trade most likely never reaches.
      expect(
        appendFeMemoTag("", FeMemoTag, { totalLoss: new Dec("0.06") })
      ).toBe("OsmosisFE/warn:loss=6.00");
      expect(
        appendFeMemoTag("", FeMemoTag, { slippageTolerance: new Dec("0.06") })
      ).toBe("OsmosisFE/warn:slip=6.00");
    });

    it("stamps every flag in fixed order: loss, pi, slip, mktfill", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, {
          marketFillDistance: new Dec("0.0325"),
          slippageTolerance: new Dec("0.06"),
          priceImpact: new Dec("0.124"),
          totalLoss: new Dec("0.9989"),
        })
      ).toBe("OsmosisFE/warn:loss=99.89,pi=12.40,slip=6.00,mktfill=3.25");
    });

    it("stamps the trade pair a high-impact swap produces", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, {
          priceImpact: new Dec("0.124"),
          slippageTolerance: new Dec("0.06"),
        })
      ).toBe("OsmosisFE/warn:pi=12.40,slip=6.00");
    });

    it("stamps the 1CT variant for one-click sessions", () => {
      expect(
        appendFeMemoTag("", OneClickFeMemoTag, {
          priceImpact: new Dec("0.124"),
        })
      ).toBe("1CT/warn:pi=12.40");
    });

    it("stamps a zero acknowledged figure (presence, not truthiness)", () => {
      expect(appendFeMemoTag("", FeMemoTag, { totalLoss: new Dec(0) })).toBe(
        "OsmosisFE/warn:loss=0.00"
      );
      expect(
        appendFeMemoTag("", FeMemoTag, { marketFillDistance: new Dec(0) })
      ).toBe("OsmosisFE/warn:mktfill=0.00");
    });

    it("appends the flagged tag after a non-empty memo", () => {
      expect(
        appendFeMemoTag("user memo", FeMemoTag, {
          totalLoss: new Dec("0.9989"),
        })
      ).toBe("user memo \nOsmosisFE/warn:loss=99.89");
    });

    it("stays well under the 100-byte memo budget with every flag set", () => {
      const worstCase = appendFeMemoTag("", FeMemoTag, {
        totalLoss: new Dec("9.99895"),
        priceImpact: new Dec("9.99895"),
        slippageTolerance: new Dec("9.99895"),
        marketFillDistance: new Dec("9.99895"),
      });
      expect(new TextEncoder().encode(worstCase).length).toBeLessThan(100);
    });
  });
});
