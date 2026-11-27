import "@testing-library/jest-dom";

import { act, render } from "@testing-library/react";

import { TradeTool } from "~/components/trade-tool";

const mockQueryState: Record<string, string> = {};
const mockSetters: Record<string, jest.Mock> = {};
let mockFlags: { _isInitialized: boolean; limitOrders: boolean };

jest.mock("nuqs", () => {
  const parser = (defaultValue: unknown) => ({ defaultValue });
  return {
    parseAsStringEnum: () => ({ withDefault: parser }),
    parseAsStringLiteral: () => ({ withDefault: parser }),
    useQueryState: (
      key: string,
      // A key read without a parser has no default.
      { defaultValue }: { defaultValue: unknown } = { defaultValue: null }
    ) => {
      mockSetters[key] ??= jest.fn();
      return [mockQueryState[key] ?? defaultValue, mockSetters[key]];
    },
  };
});

jest.mock("next/router", () => ({
  useRouter: () => ({ isReady: true }),
}));

jest.mock("~/hooks", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  useFeatureFlags: () => mockFlags,
}));

jest.mock("~/hooks/use-wallet", () => ({
  useWallet: () => ({ isWalletConnected: false }),
}));

jest.mock("~/components/assets", () => ({ Icon: () => null }));
const mockPlaceLimitTool = jest.fn(() => null);
jest.mock("~/components/place-limit-tool", () => ({
  PlaceLimitTool: () => mockPlaceLimitTool(),
}));
jest.mock("~/components/swap-tool", () => ({ SwapTool: () => null }));
jest.mock("~/components/swap-tool/order-type-selector", () => ({
  OrderTypeSelector: () => null,
  TRADE_TYPES: ["market", "limit"],
}));
jest.mock("~/components/swap-tool/swap-tool-tabs", () => ({
  SwapToolTab: { SWAP: "swap", BUY: "buy", SELL: "sell" },
  SwapToolTabs: () => null,
}));
jest.mock("~/pages", () => ({}));
jest.mock("~/components/trade-view/use-trade-view-expanded", () => ({
  useTradeViewExpanded: () => ({
    expanded: false,
    isExpandable: false,
    setExpanded: jest.fn(),
  }),
}));
jest.mock("~/components/trade-view/hooks", () => ({
  useCanonicalOrderbookForPair: () => ({
    orderbook: undefined,
    isLoading: false,
  }),
}));

describe("TradeTool limit orders kill switch", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    for (const key of Object.keys(mockQueryState)) delete mockQueryState[key];
    for (const key of Object.keys(mockSetters)) delete mockSetters[key];
    mockQueryState.tab = "buy";
    mockFlags = { _isInitialized: true, limitOrders: true };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("corrects a stale type=limit to market when limit orders are off", () => {
    mockQueryState.type = "limit";
    mockFlags.limitOrders = false;

    render(<TradeTool setPreviousTrade={jest.fn()} />);
    act(() => {
      jest.runAllTimers();
    });

    expect(mockSetters.type).toHaveBeenCalledWith("market");
  });

  it("keeps type=limit while limit orders are on", () => {
    mockQueryState.type = "limit";

    render(<TradeTool setPreviousTrade={jest.fn()} />);
    act(() => {
      jest.runAllTimers();
    });

    expect(mockSetters.type).not.toHaveBeenCalled();
  });

  it("waits for LaunchDarkly before correcting the URL", () => {
    mockQueryState.type = "limit";
    mockFlags = { _isInitialized: false, limitOrders: false };

    render(<TradeTool setPreviousTrade={jest.fn()} />);
    act(() => {
      jest.runAllTimers();
    });

    expect(mockSetters.type).not.toHaveBeenCalled();
  });
});

describe("TradeTool default tab", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    for (const key of Object.keys(mockQueryState)) delete mockQueryState[key];
    for (const key of Object.keys(mockSetters)) delete mockSetters[key];
    mockPlaceLimitTool.mockClear();
    mockFlags = { _isInitialized: true, limitOrders: true };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // The limit tool reads `tab` from the URL and treats a missing one as
  // sell, so it must not render under the Buy tab until `tab=buy` is set.
  it("writes tab=buy and renders no tool until the URL has it", () => {
    render(<TradeTool setPreviousTrade={jest.fn()} />);
    expect(mockPlaceLimitTool).not.toHaveBeenCalled();

    act(() => {
      jest.runAllTimers();
    });

    expect(mockSetters.tab).toHaveBeenCalledWith("buy");
    expect(mockPlaceLimitTool).not.toHaveBeenCalled();
  });
});
