import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import { QuoteDirection } from "@osmosis-labs/tx";
import { Dec, RatePretty } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";

import { DefaultSlippage } from "~/config/swap";

import { useDynamicSlippageFromQuote } from "../use-dynamic-slippage-from-quote";

/** Adverse price impact is negative in SQS quotes; pass the signed value. */
const impactQuote = (signedImpact: string) => ({
  priceImpactTokenOut: new RatePretty(new Dec(signedImpact)),
});

type HookProps = Parameters<typeof useDynamicSlippageFromQuote>[0];

const render = (props: HookProps) =>
  renderHook((p: HookProps) => useDynamicSlippageFromQuote(p), {
    initialProps: props,
  });

describe("useDynamicSlippageFromQuote", () => {
  it("writes the suggested tier to the config for exact-in quotes", () => {
    const slippageConfig = new ObservableSlippageConfig();
    const { result } = render({
      quote: impactQuote("-0.05"),
      slippageConfig,
      quoteType: "out-given-in",
    });

    expect(result.current.autoAdjustedSlippage).toBe("2.0");
    expect(slippageConfig.manualSlippageStr).toBe("2.0");
    expect(slippageConfig.slippage.toDec().equals(new Dec("0.02"))).toBe(true);
  });

  it("never overwrites an explicit user override", () => {
    const slippageConfig = new ObservableSlippageConfig();
    slippageConfig.markUserOverride();
    slippageConfig.setManualSlippage("7");

    const { rerender } = render({
      quote: impactQuote("-0.05"),
      slippageConfig,
      quoteType: "out-given-in",
    });
    expect(slippageConfig.manualSlippageStr).toBe("7");

    rerender({
      quote: impactQuote("-0.2"),
      slippageConfig,
      quoteType: "out-given-in",
    });
    expect(slippageConfig.manualSlippageStr).toBe("7");
  });

  it("pins exact-out to the default, correcting the store's legacy 0.5% boot value", () => {
    const slippageConfig = new ObservableSlippageConfig();
    // The store boots in manual mode at 0.5% before any hook touches it.
    expect(slippageConfig.manualSlippageStr).toBe("0.5");

    const { result } = render({
      quote: impactQuote("-0.2"),
      slippageConfig,
      quoteType: "in-given-out",
    });

    // Display and submitted tolerance must both be the static default,
    // regardless of how extreme the (untrustworthy) exact-out impact is.
    expect(result.current.autoAdjustedSlippage).toBe(DefaultSlippage);
    expect(slippageConfig.manualSlippageStr).toBe(DefaultSlippage);
  });

  it("preserves an exact-out user override", () => {
    const slippageConfig = new ObservableSlippageConfig();
    slippageConfig.markUserOverride();
    slippageConfig.setManualSlippage("7");

    render({
      quote: impactQuote("-0.2"),
      slippageConfig,
      quoteType: "in-given-out",
    });
    expect(slippageConfig.manualSlippageStr).toBe("7");
  });

  it("unwinds an exact-in auto-set when the direction switches to exact-out", () => {
    const slippageConfig = new ObservableSlippageConfig();
    const { rerender } = render({
      quote: impactQuote("-0.2"),
      slippageConfig,
      quoteType: "out-given-in" as QuoteDirection,
    });
    expect(slippageConfig.manualSlippageStr).toBe("5.0");

    rerender({
      quote: impactQuote("-0.2"),
      slippageConfig,
      quoteType: "in-given-out",
    });
    expect(slippageConfig.manualSlippageStr).toBe(DefaultSlippage);
  });

  it("does not touch a preset selected by the error hook", () => {
    const slippageConfig = new ObservableSlippageConfig();
    slippageConfig.setSelectableSlippages([new Dec("0.01"), new Dec("0.03")]);
    slippageConfig.select(1);
    expect(slippageConfig.isManualSlippage).toBe(false);

    render({
      quote: impactQuote("-0.2"),
      slippageConfig,
      quoteType: "out-given-in",
    });

    expect(slippageConfig.isManualSlippage).toBe(false);
    expect(slippageConfig.slippage.toDec().equals(new Dec("0.03"))).toBe(true);
  });

  it("resetAutoAdjust clears the override so auto-adjust re-engages", () => {
    const slippageConfig = new ObservableSlippageConfig();
    slippageConfig.markUserOverride();
    slippageConfig.setManualSlippage("7");

    const { result, rerender } = render({
      quote: impactQuote("-0.05"),
      slippageConfig,
      quoteType: "out-given-in" as QuoteDirection,
    });
    expect(slippageConfig.manualSlippageStr).toBe("7");

    act(() => result.current.resetAutoAdjust());
    rerender({
      quote: impactQuote("-0.05"),
      slippageConfig,
      quoteType: "out-given-in",
    });

    expect(slippageConfig.manualSlippageStr).toBe("2.0");
  });

  it("makes no config writes while there is no quote", () => {
    const slippageConfig = new ObservableSlippageConfig();
    render({
      quote: undefined,
      slippageConfig,
      quoteType: "out-given-in",
    });
    expect(slippageConfig.manualSlippageStr).toBe("0.5");
  });
});
