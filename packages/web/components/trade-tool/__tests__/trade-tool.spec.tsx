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
      { defaultValue }: { defaultValue: unknown }
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

jest.mock("~/stores", () => ({
  useStore: () => ({
    accountStore: { osmosisChainId: "osmosis-1", getWallet: () => undefined },
  }),
}));

jest.mock("~/components/assets", () => ({ Icon: () => null }));
jest.mock("~/components/place-limit-tool", () => ({
  PlaceLimitTool: () => null,
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
