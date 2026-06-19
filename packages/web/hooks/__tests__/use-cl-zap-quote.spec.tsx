/* eslint-disable import/no-extraneous-dependencies */
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

    expect(mockUseOutGivenIn).toHaveBeenCalledTimes(1);
    const [input, options] = mockUseOutGivenIn.mock.calls[0];
    expect(input).toEqual({
      tokenInAmount: "1000000",
      tokenInDenom: usdcDenom,
      tokenOutDenom: osmoDenom,
    });
    expect(options.enabled).toBe(true);
  });

  it("returns the SQS quote verbatim", () => {
    const { result } = renderHook(() =>
      useClZapQuote({
        tokenInAmount: "1000000",
        tokenInDenom: usdcDenom,
        tokenOutDenom: osmoDenom,
      })
    );

    expect(result.current.quote?.amount.toCoin().amount).toBe("995000");
    expect(result.current.quote?.split[0].pools[0].id).toBe("1");
    expect(result.current.isEnabled).toBe(true);
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

  it("disables the query when in and out denoms match", () => {
    renderHook(() =>
      useClZapQuote({
        tokenInAmount: "1000000",
        tokenInDenom: usdcDenom,
        tokenOutDenom: usdcDenom,
      })
    );

    const [, options] = mockUseOutGivenIn.mock.calls[0];
    expect(options.enabled).toBe(false);
  });

  it("respects an external enabled=false gate (e.g. no swap needed)", () => {
    renderHook(() =>
      useClZapQuote({
        tokenInAmount: "1000000",
        tokenInDenom: usdcDenom,
        tokenOutDenom: osmoDenom,
        enabled: false,
      })
    );

    const [, options] = mockUseOutGivenIn.mock.calls[0];
    expect(options.enabled).toBe(false);
  });
});
