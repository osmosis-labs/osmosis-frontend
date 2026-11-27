import { PricePretty } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";

import { useLimitPrice } from "~/hooks/limit-orders/use-place-limit";

// Only the price hook is under test; stub the rest of the module's imports.
jest.mock("~/stores", () => ({ useStore: jest.fn() }));
jest.mock("~/hooks/use-swap", () => ({
  useSwap: jest.fn(),
  useSwapAssets: jest.fn(),
}));
jest.mock("~/hooks/limit-orders/use-orderbook", () => ({
  useOrderbook: jest.fn(),
}));
jest.mock("~/hooks/one-click-trading", () => ({
  use1CTSwapReviewMessages: jest.fn(),
}));
jest.mock("~/hooks/mutations/one-click-trading", () => ({
  onAdd1CTSession: jest.fn(),
}));
jest.mock(
  "~/hooks/mutations/one-click-trading/use-remove-one-click-trading-session",
  () => ({ onEnd1CTSession: jest.fn() })
);
jest.mock("~/hooks/use-estimate-tx-fees", () => ({
  useEstimateTxFees: jest.fn(),
}));
jest.mock("~/hooks/input/use-amount-input", () => ({
  useAmountInput: jest.fn(),
}));
jest.mock("~/hooks/queries/assets/use-price", () => ({ usePrice: jest.fn() }));
jest.mock("~/hooks/queries/assets/use-coin-fiat-value", () => ({
  mulPrice: jest.fn(),
}));
jest.mock("~/hooks/language", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("~/components/localization", () => ({ tError: jest.fn() }));
jest.mock("~/utils/trpc", () => ({
  api: {
    edge: {
      assets: {
        getAssetPrice: {
          useQuery: () => ({
            data: new PricePretty(
              { currency: "usd", symbol: "$", maxDecimals: 2, locale: "en-US" },
              2
            ),
            isLoading: false,
            isFetchedAfterMount: true,
            isError: false,
            isRefetching: false,
          }),
        },
      },
    },
  },
}));

type Props = Parameters<typeof useLimitPrice>[0];

const BTC = "factory/btc";
const USDC = "ibc/usdc";
const USDT = "ibc/usdt";

describe("useLimitPrice", () => {
  const initialProps: Props = {
    orderDirection: "bid",
    baseDenom: BTC,
    quoteDenom: USDC,
    orderbookAddress: "osmo1btcusdc",
  };

  it("keeps a set price while the pair and book are unchanged", () => {
    const { result, rerender } = renderHook((p: Props) => useLimitPrice(p), {
      initialProps,
    });
    act(() => result.current.setPrice("60000"));
    rerender({ ...initialProps });
    expect(result.current.orderPrice).toBe("60000");
  });

  it("resets the price when only the quote denom changes", () => {
    const { result, rerender } = renderHook((p: Props) => useLimitPrice(p), {
      initialProps,
    });
    act(() => result.current.setPrice("60000"));
    expect(result.current.orderPrice).toBe("60000");

    rerender({ ...initialProps, quoteDenom: USDT });
    expect(result.current.orderPrice).toBe("");
  });

  it("resets the price when the orderbook changes", () => {
    const { result, rerender } = renderHook((p: Props) => useLimitPrice(p), {
      initialProps,
    });
    act(() => result.current.setPrice("60000"));
    rerender({ ...initialProps, orderbookAddress: "osmo1other" });
    expect(result.current.orderPrice).toBe("");
  });
});
