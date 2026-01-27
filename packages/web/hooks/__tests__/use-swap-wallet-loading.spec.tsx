/* eslint-disable import/no-extraneous-dependencies */
import { renderHook } from "@testing-library/react";

import { useSwap, useSwapAssets } from "../use-swap";

jest.mock("@trpc/react-query", () => {
  const mockRouteTokenOutGivenInUseQuery = jest.fn();
  const mockRouteTokenInGivenOutUseQuery = jest.fn();

  return {
    createTRPCReact: () => ({
      local: {
        quoteRouter: {
          routeTokenOutGivenIn: { useQuery: mockRouteTokenOutGivenInUseQuery },
          routeTokenInGivenOut: { useQuery: mockRouteTokenInGivenOutUseQuery },
        },
      },
    }),
    __mock: {
      mockRouteTokenOutGivenInUseQuery,
      mockRouteTokenInGivenOutUseQuery,
    },
  };
});

jest.mock("react-use", () => {
  const actual = jest.requireActual("react-use");

  return {
    ...actual,
    useAsync: () => ({ value: undefined }),
  };
});

jest.mock("~/utils/trpc", () => {
  const mockUseInfiniteQuery = jest.fn();

  return {
    api: {
      useUtils: () => ({
        local: {
          oneClickTrading: {
            getSessionAuthenticator: { fetch: jest.fn() },
          },
        },
      }),
      edge: {
        assets: {
          getUserAssets: {
            useInfiniteQuery: mockUseInfiniteQuery,
          },
        },
      },
    },
    __mock: {
      mockUseInfiniteQuery,
    },
  };
});

jest.mock("~/stores", () => ({
  useStore: () => ({
    chainStore: {
      osmosis: { chainId: "osmosis-1" },
    },
    accountStore: {
      osmosisChainId: "osmosis-1",
      getWallet: () => ({
        address: undefined,
        txTypeInProgress: "",
        isWalletConnected: false,
        client: {
          getAccount: jest.fn().mockResolvedValue({ isNanoLedger: true }),
        },
        walletInfo: { prettyName: "Keplr" },
      }),
      shouldBeSignedWithOneClickTrading: jest.fn().mockResolvedValue(false),
      signAndBroadcast: jest.fn(),
    },
  }),
}));

jest.mock("~/hooks/use-wallet-select", () => ({
  useWalletSelect: () => ({
    isLoading: true,
    isOpen: false,
    onOpenWalletSelect: jest.fn(),
  }),
}));

jest.mock("~/hooks/use-feature-flags", () => ({
  useFeatureFlags: () => ({
    swapToolSimulateFee: false,
  }),
}));

jest.mock("~/hooks/one-click-trading", () => ({
  useOneClickTradingSession: () => ({
    isOneClickTradingEnabled: false,
  }),
  use1CTSwapReviewMessages: () => ({
    oneClickMessages: undefined,
    isLoadingOneClickMessages: false,
    shouldSend1CTTx: false,
  }),
}));

jest.mock("~/hooks/use-amplitude-analytics", () => ({
  useAmplitudeAnalytics: () => ({
    logEvent: jest.fn(),
  }),
}));

jest.mock("~/hooks/language", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("~/hooks/use-show-preview-assets", () => ({
  useShowPreviewAssets: () => ({
    showPreviewAssets: false,
  }),
}));

jest.mock("~/hooks/use-estimate-tx-fees", () => ({
  useEstimateTxFees: () => ({
    data: undefined,
    isLoading: false,
    error: undefined,
  }),
}));

jest.mock("~/hooks/use-debounced-state", () => ({
  useDebouncedState: (initialValue: unknown) => [initialValue, jest.fn()],
}));

jest.mock("~/hooks/input/use-amount-input", () => {
  const { CoinPretty } = require("@osmosis-labs/unit");

  return {
    useAmountInput: ({ currency }: { currency?: any }) => {
      const amount = currency ? new CoinPretty(currency, "1") : undefined;
      const balance = currency ? new CoinPretty(currency, "1000") : undefined;

      return {
        amount,
        debouncedInAmount: amount,
        balance,
        inputAmount: "1",
        isTyping: false,
        isEmpty: false,
        price: undefined,
        fiatValue: undefined,
        error: undefined,
        setAmount: jest.fn(),
        reset: jest.fn(),
      };
    },
  };
});

jest.mock("nuqs", () => ({
  parseAsString: { withDefault: (value: string) => value },
  parseAsBoolean: { withDefault: (value: boolean) => value },
  useQueryState: (key: string, defaultValue: unknown) => [
    defaultValue,
    jest.fn(),
  ],
}));

const trpcReactMock = jest.requireMock("@trpc/react-query") as {
  __mock: {
    mockRouteTokenOutGivenInUseQuery: jest.Mock;
    mockRouteTokenInGivenOutUseQuery: jest.Mock;
  };
};

const trpcMock = jest.requireMock("~/utils/trpc") as {
  __mock: {
    mockUseInfiniteQuery: jest.Mock;
  };
};

describe("wallet loading fallback", () => {
  const { mockRouteTokenOutGivenInUseQuery, mockRouteTokenInGivenOutUseQuery } =
    trpcReactMock.__mock;
  const { mockUseInfiniteQuery } = trpcMock.__mock;

  beforeEach(() => {
    mockUseInfiniteQuery.mockReset();
    mockRouteTokenOutGivenInUseQuery.mockReset();
    mockRouteTokenInGivenOutUseQuery.mockReset();

    mockUseInfiniteQuery.mockImplementation(() => ({
      data: { pages: [] },
      isLoading: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }));

    mockRouteTokenOutGivenInUseQuery.mockImplementation(() => ({
      data: undefined,
      isSuccess: false,
      isError: false,
      error: null,
    }));

    mockRouteTokenInGivenOutUseQuery.mockImplementation(() => ({
      data: undefined,
      isSuccess: false,
      isError: false,
      error: null,
    }));
  });

  it("keeps asset list query enabled while wallet is loading", () => {
    renderHook(() => useSwapAssets({ useQueryParams: false }));

    const [, options] = mockUseInfiniteQuery.mock.calls[0];
    expect(options.enabled).toBe(true);
  });

  it("keeps swap quotes enabled while wallet is loading", () => {
    renderHook(() => useSwap());

    const hasEnabledQuote = mockRouteTokenOutGivenInUseQuery.mock.calls.some(
      ([input, options]) => input?.tokenInAmount === "1" && options?.enabled
    );

    expect(hasEnabledQuote).toBe(true);
  });
});
