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
    it("stamps an acknowledged total-loss as slip=", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, { slippage: new Dec("0.9989") })
      ).toBe("OsmosisFE/warn:slip=99.89");
    });

    it("stamps an acknowledged price impact as pi=", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, { priceImpact: new Dec("0.124") })
      ).toBe("OsmosisFE/warn:pi=12.40");
    });

    it("stamps both flags in fixed order: slip before pi", () => {
      expect(
        appendFeMemoTag("", FeMemoTag, {
          slippage: new Dec("0.9989"),
          priceImpact: new Dec("0.124"),
        })
      ).toBe("OsmosisFE/warn:slip=99.89,pi=12.40");
    });

    it("stamps the 1CT variant for one-click sessions", () => {
      expect(
        appendFeMemoTag("", OneClickFeMemoTag, {
          priceImpact: new Dec("0.124"),
        })
      ).toBe("1CT/warn:pi=12.40");
    });

    it("stamps a zero acknowledged figure (presence, not truthiness)", () => {
      expect(appendFeMemoTag("", FeMemoTag, { slippage: new Dec(0) })).toBe(
        "OsmosisFE/warn:slip=0.00"
      );
    });

    it("appends the flagged tag after a non-empty memo", () => {
      expect(
        appendFeMemoTag("user memo", FeMemoTag, {
          slippage: new Dec("0.9989"),
        })
      ).toBe("user memo \nOsmosisFE/warn:slip=99.89");
    });

    it("stays well under the 100-byte memo budget", () => {
      const worstCase = appendFeMemoTag("", FeMemoTag, {
        slippage: new Dec("9.99895"),
        priceImpact: new Dec("9.99895"),
      });
      expect(new TextEncoder().encode(worstCase).length).toBeLessThan(100);
    });
  });
});
