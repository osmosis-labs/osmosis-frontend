import {
  determineNextFallbackFromDenom,
  determineNextFallbackToDenom,
} from "../use-swap";

describe("determineNextFromDenom", () => {
  const DefaultDenoms = ["ATOM", "OSMO"];

  test("fromAssetDenom === initialFromDenom and toAssetDenom === DefaultDenoms[0]", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialFromDenom: "ATOM",
        initialToDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("fromAssetDenom === initialFromDenom and toAssetDenom !== DefaultDenoms[0]", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "OSMO",
        toAssetDenom: "OSMO",
        initialFromDenom: "OSMO",
        initialToDenom: "ATOM",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });

  test("fromAssetDenom !== initialFromDenom and initialFromDenom === toAssetDenom", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialFromDenom: "ATOM",
        initialToDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("fromAssetDenom !== initialFromDenom and initialFromDenom !== toAssetDenom", () => {
    expect(
      determineNextFallbackFromDenom({
        fromAssetDenom: "BTC",
        toAssetDenom: "ETH",
        initialFromDenom: "ATOM",
        initialToDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });
});

describe("determineNextToDenom", () => {
  const DefaultDenoms = ["ATOM", "OSMO"];

  test("toAssetDenom === initialToDenom and fromAssetDenom !== DefaultDenoms[1]", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialToDenom: "ATOM",
        initialFromDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("toAssetDenom === initialToDenom and fromAssetDenom === DefaultDenoms[1]", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "OSMO",
        toAssetDenom: "OSMO",
        initialToDenom: "OSMO",
        initialFromDenom: "ATOM",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });

  test("toAssetDenom !== initialToDenom and initialToDenom === fromAssetDenom", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "ATOM",
        toAssetDenom: "ATOM",
        initialToDenom: "ATOM",
        initialFromDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("OSMO");
  });

  test("toAssetDenom !== initialToDenom and initialToDenom !== fromAssetDenom", () => {
    expect(
      determineNextFallbackToDenom({
        fromAssetDenom: "ETH",
        toAssetDenom: "BTC",
        initialToDenom: "ATOM",
        initialFromDenom: "OSMO",
        DefaultDenoms,
      })
    ).toBe("ATOM");
  });
});
