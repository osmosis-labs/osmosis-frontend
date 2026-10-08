import { QuoteDirection } from "@osmosis-labs/tx";
import { Dec, RatePretty } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";
import { StrictMode } from "react";

import { DefaultSlippage } from "~/config/swap";
import { AutoSlippageQuote } from "~/utils/slippage";

import { useSwapSlippage, useSwapSlippageConfig } from "../use-swap-slippage";

const quote = (signedImpact: string, liquidityCap = "10000000") => ({
  priceImpactTokenOut: new RatePretty(new Dec(signedImpact)),
  liquidityCap,
});

type Props = {
  quote: AutoSlippageQuote | undefined;
  quoteType: QuoteDirection;
  feeError?: Error | null;
  isReviewOpen?: boolean;
};

/** Renders the swap tool's slippage stack (config + driver) the way the swap
 *  tool does, under StrictMode, which double-invokes effects in dev. */
function render(initialProps: Props) {
  return renderHook(
    ({ quote, quoteType, feeError, isReviewOpen = false }: Props) => {
      const slippageConfig = useSwapSlippageConfig();
      const slippage = useSwapSlippage({
        slippageConfig,
        quote,
        quoteType,
        feeError,
        isReviewOpen,
      });
      return { slippageConfig, ...slippage };
    },
    { initialProps, wrapper: StrictMode }
  );
}

const pct = (config: { slippage: RatePretty }) =>
  config.slippage.toDec().mul(new Dec(100)).toString(1);

describe("useSwapSlippage", () => {
  it("starts in manual mode at the default, never on a preset", () => {
    const { result } = render({ quote: undefined, quoteType: "out-given-in" });

    expect(result.current.slippageConfig.isManualSlippage).toBe(true);
    expect(pct(result.current.slippageConfig)).toBe("0.1");
    expect(result.current.source).toBe("default");
  });

  it("applies the auto tier for exact-in, under StrictMode", () => {
    // A preset select() in a mount effect would turn auto-adjust off once
    // StrictMode re-runs effects after the presets exist.
    const { result } = render({
      quote: quote("-0.05"),
      quoteType: "out-given-in",
    });

    expect(result.current.source).toBe("auto");
    expect(pct(result.current.slippageConfig)).toBe("2.0");
  });

  it("follows the quote as its tier changes", () => {
    const { result, rerender } = render({
      quote: quote("-0.05"),
      quoteType: "out-given-in",
    });
    rerender({ quote: quote("-0.001"), quoteType: "out-given-in" });

    expect(result.current.source).toBe("default");
    expect(pct(result.current.slippageConfig)).toBe("0.1");
  });

  it("pins exact-out to the default", () => {
    const { result } = render({
      quote: quote("-0.2"),
      quoteType: "in-given-out",
    });

    expect(result.current.source).toBe("default");
    expect(pct(result.current.slippageConfig)).toBe("0.1");
  });

  it("never overwrites a value the user typed", () => {
    const { result, rerender } = render({
      quote: quote("-0.05"),
      quoteType: "out-given-in",
    });

    act(() => {
      result.current.slippageConfig.markUserOverride();
      result.current.slippageConfig.setManualSlippage("7");
    });
    rerender({ quote: quote("-0.2"), quoteType: "out-given-in" });

    expect(result.current.source).toBe("user");
    expect(pct(result.current.slippageConfig)).toBe("7.0");
  });

  it("re-applies the auto tier when the user clears their value", () => {
    const { result, rerender } = render({
      quote: quote("-0.05"),
      quoteType: "out-given-in",
    });
    act(() => {
      result.current.slippageConfig.markUserOverride();
      result.current.slippageConfig.setManualSlippage("7");
    });

    // What the review modal does when the field is emptied.
    act(() => {
      result.current.slippageConfig.clearUserOverride();
      result.current.slippageConfig.setIsManualSlippage(false);
    });
    rerender({ quote: quote("-0.05"), quoteType: "out-given-in" });

    expect(result.current.slippageConfig.isManualSlippage).toBe(true);
    expect(pct(result.current.slippageConfig)).toBe("2.0");
  });

  it("resetForReview drops a typed value so the next review starts on auto", () => {
    const { result, rerender } = render({
      quote: quote("-0.05"),
      quoteType: "out-given-in",
    });
    act(() => {
      result.current.slippageConfig.markUserOverride();
      result.current.slippageConfig.setManualSlippage("7");
    });

    act(() => result.current.resetForReview());
    rerender({ quote: quote("-0.05"), quoteType: "out-given-in" });

    expect(result.current.source).toBe("auto");
    expect(pct(result.current.slippageConfig)).toBe("2.0");
  });

  describe("fee simulation errors", () => {
    const feeError = new Error(
      "Fetch error. failed to execute message; message index: 0: Swap requires 1008000uosmo, which is greater than the amount 1001000uosmo"
    );

    it("raises exact-out to the required tier and keeps it once the error clears", () => {
      const { result, rerender } = render({
        quote: quote("-0.001"),
        quoteType: "in-given-out",
      });
      rerender({
        quote: quote("-0.001"),
        quoteType: "in-given-out",
        feeError,
      });

      expect(result.current.source).toBe("fee-error");
      expect(pct(result.current.slippageConfig)).toBe("1.0");

      // The raised tolerance lets the simulation succeed; dropping back would
      // only reproduce the error.
      rerender({
        quote: quote("-0.001"),
        quoteType: "in-given-out",
        feeError: null,
      });
      expect(pct(result.current.slippageConfig)).toBe("1.0");
    });

    it("is cleared by reset and by a direction switch", () => {
      const { result, rerender } = render({
        quote: quote("-0.001"),
        quoteType: "in-given-out",
      });
      rerender({
        quote: quote("-0.001"),
        quoteType: "in-given-out",
        feeError,
      });
      expect(result.current.source).toBe("fee-error");

      act(() => result.current.reset());
      rerender({
        quote: quote("-0.001"),
        quoteType: "in-given-out",
        feeError,
      });
      expect(result.current.source).toBe("default");

      const fresh = new Error(feeError.message);
      rerender({
        quote: quote("-0.001"),
        quoteType: "in-given-out",
        feeError: fresh,
      });
      expect(result.current.source).toBe("fee-error");
      rerender({
        quote: quote("-0.001"),
        quoteType: "out-given-in",
        feeError: fresh,
      });
      expect(result.current.source).toBe("default");
    });
  });

  it("reports unknown route liquidity only for exact-in quotes", () => {
    const { result, rerender } = render({
      quote: quote("-0.001", "0"),
      quoteType: "out-given-in",
    });
    expect(result.current.liquidityUnknown).toBe(true);
    expect(pct(result.current.slippageConfig)).toBe(
      new Dec(DefaultSlippage).toString(1)
    );

    rerender({ quote: quote("-0.001", "0"), quoteType: "in-given-out" });
    expect(result.current.liquidityUnknown).toBe(false);
  });

  describe("while the review is open", () => {
    it("holds the auto tier when a quote refresh crosses a tier boundary", () => {
      // A widening alone would not trip the quote-drift banner, which compares
      // against the tolerance itself.
      const { result, rerender } = render({
        quote: quote("-0.003"),
        quoteType: "out-given-in",
      });
      rerender({
        quote: quote("-0.003"),
        quoteType: "out-given-in",
        isReviewOpen: true,
      });
      expect(pct(result.current.slippageConfig)).toBe("0.2");

      rerender({
        quote: quote("-0.2"),
        quoteType: "out-given-in",
        isReviewOpen: true,
      });
      expect(result.current.source).toBe("auto");
      expect(pct(result.current.slippageConfig)).toBe("0.2");

      // Released on close: the live tier applies again.
      rerender({
        quote: quote("-0.2"),
        quoteType: "out-given-in",
        isReviewOpen: false,
      });
      expect(pct(result.current.slippageConfig)).toBe("5.0");
    });

    it("latches the tier current at open, not one from an earlier review", () => {
      const { result, rerender } = render({
        quote: quote("-0.003"),
        quoteType: "out-given-in",
        isReviewOpen: true,
      });
      rerender({
        quote: quote("-0.003"),
        quoteType: "out-given-in",
        isReviewOpen: false,
      });
      rerender({
        quote: quote("-0.05"),
        quoteType: "out-given-in",
        isReviewOpen: false,
      });
      rerender({
        quote: quote("-0.05"),
        quoteType: "out-given-in",
        isReviewOpen: true,
      });
      expect(pct(result.current.slippageConfig)).toBe("2.0");
    });

    it("still applies a typed value", () => {
      const { result, rerender } = render({
        quote: quote("-0.003"),
        quoteType: "out-given-in",
        isReviewOpen: true,
      });
      act(() => {
        result.current.slippageConfig.markUserOverride();
        result.current.slippageConfig.setManualSlippage("3");
      });
      rerender({
        quote: quote("-0.003"),
        quoteType: "out-given-in",
        isReviewOpen: true,
      });
      expect(result.current.source).toBe("user");
      expect(pct(result.current.slippageConfig)).toBe("3.0");
    });
  });
});
