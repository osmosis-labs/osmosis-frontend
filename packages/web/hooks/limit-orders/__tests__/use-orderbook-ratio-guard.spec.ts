import { Dec } from "@osmosis-labs/unit";
import { renderHook } from "@testing-library/react";

import { useOrderbookRatioGuard } from "../use-orderbook-ratio-guard";

type MockPriceQuery = {
  data?: { toDec: () => Dec };
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
};

const mockUseQuery = jest.fn<
  MockPriceQuery,
  [{ coinMinimalDenom: string }, { enabled: boolean }]
>();

jest.mock("~/utils/trpc", () => ({
  api: {
    edge: {
      assets: {
        getAssetPrice: {
          useQuery: (...args: unknown[]) =>
            (mockUseQuery as unknown as (...a: unknown[]) => MockPriceQuery)(
              ...args
            ),
        },
      },
    },
  },
}));

const BASE = "factory/osmo1abc/alloyed/allETH";
const QUOTE = "ibc/USDC";

const settled = (price: string): MockPriceQuery => ({
  data: { toDec: () => new Dec(price) },
  isLoading: false,
  isFetching: false,
  isError: false,
});

/** Routes each query to a result by denom so base and quote can differ. */
function mockPrices(byDenom: Record<string, MockPriceQuery>) {
  mockUseQuery.mockImplementation(({ coinMinimalDenom }) => {
    const result = byDenom[coinMinimalDenom];
    if (!result) throw new Error(`unexpected denom ${coinMinimalDenom}`);
    return result;
  });
}

function render(
  overrides: { baseDecimals?: number; quoteDecimals?: number } = {}
) {
  return renderHook(() =>
    useOrderbookRatioGuard({
      baseDenom: BASE,
      quoteDenom: QUOTE,
      baseDecimals: 18,
      quoteDecimals: 6,
      ...overrides,
    })
  ).result.current;
}

describe("useOrderbookRatioGuard", () => {
  beforeEach(() => {
    mockUseQuery.mockReset();
  });

  it("does not apply to non-18-decimal bases and leaves the price queries disabled", () => {
    mockPrices({ [BASE]: settled("1"), [QUOTE]: settled("1") });

    const { is18DecimalBase, isBlocked } = render({ baseDecimals: 6 });

    expect(is18DecimalBase).toBe(false);
    expect(isBlocked).toBe(false);
    for (const [, options] of mockUseQuery.mock.calls) {
      expect(options.enabled).toBe(false);
    }
  });

  it("allows a settled ratio of at least 100 quote units per base", () => {
    mockPrices({ [BASE]: settled("2500"), [QUOTE]: settled("1") });
    expect(render().isBlocked).toBe(false);
  });

  it("blocks a settled ratio below 100", () => {
    mockPrices({ [BASE]: settled("99.99"), [QUOTE]: settled("1") });
    expect(render().isBlocked).toBe(true);
  });

  it("blocks a zero quote price instead of dividing by it", () => {
    mockPrices({ [BASE]: settled("2500"), [QUOTE]: settled("0") });
    expect(render().isBlocked).toBe(true);
  });

  it("blocks while a price is still loading", () => {
    mockPrices({
      [BASE]: { isLoading: true, isFetching: true, isError: false },
      [QUOTE]: settled("1"),
    });
    expect(render().isBlocked).toBe(true);
  });

  it("blocks during a background refetch even when a permissive cached price is present", () => {
    mockPrices({
      [BASE]: { ...settled("2500"), isFetching: true },
      [QUOTE]: settled("1"),
    });
    expect(render().isBlocked).toBe(true);
  });

  it("blocks when a refetch failed and only stale cached data remains", () => {
    mockPrices({
      [BASE]: settled("2500"),
      [QUOTE]: { ...settled("1"), isError: true },
    });
    expect(render().isBlocked).toBe(true);
  });

  it("blocks when a price is missing after loading finished", () => {
    mockPrices({
      [BASE]: { isLoading: false, isFetching: false, isError: false },
      [QUOTE]: settled("1"),
    });
    expect(render().isBlocked).toBe(true);
  });
});
