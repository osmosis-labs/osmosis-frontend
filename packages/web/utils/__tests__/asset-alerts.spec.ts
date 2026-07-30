import {
  AssetAlert,
  getActiveAssetAlerts,
  getMatchedSymbolsText,
  HeldAsset,
  interpolateBannerText,
  isAlertWithinDateRange,
} from "../asset-alerts";

const INT3_DOGE =
  "ibc/B3DFDC2958A2BE482532DA3B6B5729B469BE7475598F7487D98B1B3E085245DE";
const INT3_BTC =
  "ibc/2F4258D6E1E01B203D6CA83F2C7E4959615053A21EC2C2FC196F7911CAC832EF";
const ATOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

const HELD_DOGE: HeldAsset = { denom: INT3_DOGE, coinDenom: "DOGE.int3" };
const HELD_BTC: HeldAsset = { denom: INT3_BTC, coinDenom: "BTC.int3" };
const HELD_ATOM: HeldAsset = { denom: ATOM, coinDenom: "ATOM" };

const makeAlert = (overrides?: {
  denoms?: string[];
  startDate?: string;
  endDate?: string;
  localStorageKey?: string;
}): AssetAlert => ({
  denoms: overrides?.denoms ?? [INT3_DOGE, INT3_BTC],
  banner: {
    enTextOrLocalizationPath: "header",
    localStorageKey: overrides?.localStorageKey ?? "int3face-sunset",
    link: {
      enTextOrLocalizationKey: "link",
      url: "https://example.com/int3face-sunset",
      isExternal: true,
    },
    isWarning: true,
    startDate: overrides?.startDate,
    endDate: overrides?.endDate,
  },
  localization: {
    en: {
      header: "The Int3face bridge is closing. Bridge out your {symbols}.",
      link: "Learn more",
    },
  },
});

const NOW = new Date("2026-08-01T12:00:00Z");

describe("getActiveAssetAlerts", () => {
  it("returns an alert with its matched assets when a held denom matches within range", () => {
    const alert = makeAlert({
      startDate: "2026-07-30T00:00:00Z",
      endDate: "2026-08-15T00:00:00Z",
    });

    expect(
      getActiveAssetAlerts({
        alerts: [alert],
        heldAssets: [HELD_ATOM, HELD_DOGE],
        now: NOW,
      })
    ).toEqual([{ ...alert, matchedAssets: [HELD_DOGE] }]);
  });

  it("collects every held asset matching the alert", () => {
    expect(
      getActiveAssetAlerts({
        alerts: [makeAlert()],
        heldAssets: [HELD_BTC, HELD_ATOM, HELD_DOGE],
        now: NOW,
      })[0].matchedAssets
    ).toEqual([HELD_DOGE, HELD_BTC]); // in the alert's denom order
  });

  it("excludes alerts whose denoms are not held", () => {
    expect(
      getActiveAssetAlerts({
        alerts: [makeAlert()],
        heldAssets: [HELD_ATOM],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("matches on the full minimal denom, not a partial or symbol match", () => {
    expect(
      getActiveAssetAlerts({
        alerts: [makeAlert()],
        heldAssets: [{ denom: INT3_DOGE.slice(0, 20) }, { denom: "DOGE" }],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("returns an empty array when nothing is held", () => {
    expect(
      getActiveAssetAlerts({
        alerts: [makeAlert()],
        heldAssets: [],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("returns an empty array when alerts are undefined", () => {
    expect(
      getActiveAssetAlerts({
        alerts: undefined,
        heldAssets: [HELD_DOGE],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("excludes alerts before their start date and after their end date", () => {
    const upcoming = makeAlert({ startDate: "2026-08-02T00:00:00Z" });
    const expired = makeAlert({ endDate: "2026-07-31T00:00:00Z" });

    expect(
      getActiveAssetAlerts({
        alerts: [upcoming, expired],
        heldAssets: [HELD_DOGE],
        now: NOW,
      })
    ).toEqual([]);
  });

  it("returns multiple matching alerts for stacking", () => {
    const first = makeAlert({ localStorageKey: "first-alert" });
    const second = makeAlert({
      denoms: [INT3_BTC],
      localStorageKey: "second-alert",
    });

    expect(
      getActiveAssetAlerts({
        alerts: [first, second],
        heldAssets: [HELD_DOGE, HELD_BTC],
        now: NOW,
      })
    ).toEqual([
      { ...first, matchedAssets: [HELD_DOGE, HELD_BTC] },
      { ...second, matchedAssets: [HELD_BTC] },
    ]);
  });
});

describe("getMatchedSymbolsText", () => {
  it("joins the matched symbols for display", () => {
    const [alert] = getActiveAssetAlerts({
      alerts: [makeAlert()],
      heldAssets: [HELD_DOGE, HELD_BTC],
      now: NOW,
    });

    expect(getMatchedSymbolsText(alert)).toBe("DOGE.int3, BTC.int3");
  });

  it("falls back to a shortened denom when the asset is unlisted", () => {
    const [alert] = getActiveAssetAlerts({
      alerts: [makeAlert()],
      heldAssets: [{ denom: INT3_DOGE }],
      now: NOW,
    });

    expect(getMatchedSymbolsText(alert)).toBe("ibc/B3...245DE");
  });

  it("caps long symbol lists with a +N suffix", () => {
    const denoms = ["d1", "d2", "d3", "d4", "d5", "d6", "d7"];
    const heldAssets = denoms.map((denom, i) => ({
      denom,
      coinDenom: `SYM${i + 1}`,
    }));

    const [alert] = getActiveAssetAlerts({
      alerts: [makeAlert({ denoms })],
      heldAssets,
      now: NOW,
    });

    expect(getMatchedSymbolsText(alert)).toBe(
      "SYM1, SYM2, SYM3, SYM4, SYM5 +2"
    );
    expect(getMatchedSymbolsText(alert, 6)).toBe(
      "SYM1, SYM2, SYM3, SYM4, SYM5, SYM6 +1"
    );
    expect(getMatchedSymbolsText(alert, 7)).toBe(
      "SYM1, SYM2, SYM3, SYM4, SYM5, SYM6, SYM7"
    );
  });
});

describe("interpolateBannerText", () => {
  it("replaces every occurrence of a placeholder", () => {
    expect(
      interpolateBannerText("Move {symbols}. Your {symbols} expire.", {
        symbols: "DOGE.int3",
      })
    ).toBe("Move DOGE.int3. Your DOGE.int3 expire.");
  });

  it("returns text without placeholders unchanged", () => {
    expect(
      interpolateBannerText("No placeholders here.", { symbols: "DOGE.int3" })
    ).toBe("No placeholders here.");
  });

  it("supports multiple interpolation keys", () => {
    expect(
      interpolateBannerText("{a} and {b}", { a: "first", b: "second" })
    ).toBe("first and second");
  });
});

describe("isAlertWithinDateRange", () => {
  it("is always within range without dates", () => {
    expect(isAlertWithinDateRange(makeAlert(), NOW)).toBe(true);
  });

  it("treats a missing bound as unbounded", () => {
    expect(
      isAlertWithinDateRange(makeAlert({ startDate: "2026-07-30" }), NOW)
    ).toBe(true);
    expect(
      isAlertWithinDateRange(makeAlert({ endDate: "2026-08-15" }), NOW)
    ).toBe(true);
  });

  it("is out of range before start or after end", () => {
    expect(
      isAlertWithinDateRange(
        makeAlert({ startDate: "2026-08-02T00:00:00Z" }),
        NOW
      )
    ).toBe(false);
    expect(
      isAlertWithinDateRange(
        makeAlert({ endDate: "2026-07-31T00:00:00Z" }),
        NOW
      )
    ).toBe(false);
  });

  it("includes the start boundary and excludes the end boundary", () => {
    expect(
      isAlertWithinDateRange(makeAlert({ startDate: NOW.toISOString() }), NOW)
    ).toBe(true);
    expect(
      isAlertWithinDateRange(makeAlert({ endDate: NOW.toISOString() }), NOW)
    ).toBe(false);
  });
});
