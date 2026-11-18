import { CoinPretty, Dec, Int, RatePretty } from "@osmosis-labs/unit";
import { renderHook } from "@testing-library/react";

import { useClZapQuote } from "../use-cl-zap-quote";

const mockUseOutGivenIn = jest.fn();
const mockUseInGivenOut = jest.fn();

jest.mock("~/utils/trpc", () => ({
  api: {
    local: {
      quoteRouter: {
        routeTokenOutGivenIn: {
          useQuery: (...args: unknown[]) => mockUseOutGivenIn(...args),
        },
        routeTokenInGivenOut: {
          useQuery: (...args: unknown[]) => mockUseInGivenOut(...args),
        },
      },
    },
  },
}));

const usdcDenom = "ibc/USDC";
const osmoDenom = "uosmo";

/** A representative `/router/quote` (out-given-in) response shape. */
const makeQuoteResponse = () => ({
  amount: new CoinPretty(
    { coinDenom: "OSMO", coinMinimalDenom: osmoDenom, coinDecimals: 6 },
    new Int("995000")
  ),
  priceImpactTokenOut: new RatePretty(new Dec("0.001")),
  swapFee: new RatePretty(new Dec("0.0005")),
  split: [
    {
      initialAmount: new Int("1000000"),
      tokenInDenom: usdcDenom,
      tokenOutDenoms: [osmoDenom],
      pools: [
        {
          id: "1",
          type: "concentrated",
          spreadFactor: new RatePretty(new Dec("0.0005")),
          dynamicSpreadFactor: false,
          inCurrency: undefined,
          outCurrency: undefined,
        },
      ],
    },
  ],
});

beforeEach(() => {
  mockUseOutGivenIn.mockReset();
  mockUseInGivenOut.mockReset();
  mockUseOutGivenIn.mockReturnValue({
    data: makeQuoteResponse(),
    isLoading: false,
    isError: false,
    error: null,
  });
  mockUseInGivenOut.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  });
});

describe("useClZapQuote", () => {
  it("fires routeTokenOutGivenIn with the right denoms and amount", () => {
    renderHook(() =>
      useClZapQuote({
        tokenInAmount: "1000000",
        tokenInDenom: usdcDenom,
        tokenOutDenom: osmoDenom,
      })
    );

    const [input, options] = mockUseOutGivenIn.mock.calls.at(-1)!;
    expect(input).toEqual({
      tokenInAmount: "1000000",
      tokenInDenom: usdcDenom,
      tokenOutDenom: osmoDenom,
    });
    expect(options.enabled).toBe(true);
  });

  it("disables the query for a zero input and never falls through to routeTokenInGivenOut", () => {
    const { result } = renderHook(() =>
      useClZapQuote({
        tokenInAmount: "0",
        tokenInDenom: usdcDenom,
        tokenOutDenom: osmoDenom,
      })
    );

    const [, options] = mockUseOutGivenIn.mock.calls[0];
    expect(options.enabled).toBe(false);
    expect(result.current.isEnabled).toBe(false);
    // exact-out must never be used to derive an exact-in split
    expect(mockUseInGivenOut).not.toHaveBeenCalled();
  });

  it("holds the quote across an amount change but flags it as refreshing", () => {
    const { result, rerender } = renderHook(
      ({ tokenInAmount }: { tokenInAmount: string }) =>
        useClZapQuote({
          tokenInAmount,
          tokenInDenom: usdcDenom,
          tokenOutDenom: osmoDenom,
        }),
      { initialProps: { tokenInAmount: "1000000" } }
    );
    const held = result.current.quote;
    expect(held).toBeDefined();
    expect(result.current.isRefreshing).toBe(false);

    // The pool price moved, so the derived swap amount changed: the held
    // quote stays on screen but must be flagged so submit stays blocked.
    mockUseOutGivenIn.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    rerender({ tokenInAmount: "1000100" });

    expect(result.current.quote).toBe(held);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it("drops the held quote when the direction flips, even at the same amount", () => {
    const { result, rerender } = renderHook(
      (props: { tokenInDenom: string; tokenOutDenom: string }) =>
        useClZapQuote({ tokenInAmount: "1000000", ...props }),
      { initialProps: { tokenInDenom: usdcDenom, tokenOutDenom: osmoDenom } }
    );
    expect(result.current.quote).toBeDefined();

    // Flip the direction while the new fetch is still pending. In a centered
    // range the swap amount is commonly identical for both sides, so the held
    // quote can only be rejected on its denoms: exposing the old USDC->OSMO
    // quote here would let submit compose its route with the new token-in.
    mockUseOutGivenIn.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });
    rerender({ tokenInDenom: osmoDenom, tokenOutDenom: usdcDenom });

    expect(result.current.quote).toBeUndefined();
    expect(result.current.isLoading).toBe(true);
  });
});
