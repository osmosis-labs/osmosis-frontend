import type { OneClickTradingInfo } from "@osmosis-labs/tx";
import { act, renderHook } from "@testing-library/react";

import { useOneClickTradingSession } from "../use-one-click-trading-session";

let mockWalletState: {
  address: string | undefined;
  oneClickTradingInfo: OneClickTradingInfo | null;
  useOneClickTrading: boolean;
  isStateHydrated: boolean;
};

jest.mock("~/hooks/use-wallet", () => ({
  useWallet: () => mockWalletState,
}));
jest.mock("~/hooks/use-feature-flags", () => ({
  useFeatureFlags: () => ({ oneClickTrading: true }),
}));
jest.mock("~/hooks/language", () => ({
  useTranslation: () => ({ t: undefined }),
}));

function session(seconds = 60): OneClickTradingInfo {
  const now = Math.floor(Date.now() / 1000);
  return {
    authenticatorId: "1",
    publicKey: "public-key",
    sessionKey: "session-key",
    userOsmoAddress: "osmo1test",
    networkFeeLimit: "1000",
    spendLimit: { decimals: 6, amount: "1000000" },
    sessionPeriod: {
      end: String(BigInt(now + seconds) * BigInt(1_000_000_000)),
    },
    humanizedSessionPeriod: "1hour",
    sessionStartedAtUnix: now,
    allowedMessages: [],
    hasSeenExpiryToast: false,
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  mockWalletState = {
    address: "osmo1test",
    oneClickTradingInfo: session(),
    useOneClickTrading: true,
    isStateHydrated: true,
  };
});

afterEach(() => jest.useRealTimers());

it("updates immediately when the preference changes", () => {
  const { result, rerender } = renderHook(() => useOneClickTradingSession());
  expect(result.current.isOneClickTradingEnabled).toBe(true);
  mockWalletState.useOneClickTrading = false;
  rerender();
  expect(result.current.isOneClickTradingEnabled).toBe(false);
});

it("expires once and accepts a replacement session without stale timer state", () => {
  const onExpire = jest.fn();
  const { result, rerender, unmount } = renderHook(() =>
    useOneClickTradingSession({ onExpire })
  );
  const initial = mockWalletState.oneClickTradingInfo;
  act(() => jest.advanceTimersByTime(60_000));
  expect(result.current.isOneClickTradingExpired).toBe(true);
  expect(result.current.isOneClickTradingEnabled).toBe(false);
  expect(onExpire).toHaveBeenCalledWith({ oneClickTradingInfo: initial });
  expect(onExpire).toHaveBeenCalledTimes(1);
  mockWalletState.oneClickTradingInfo = session(120);
  rerender();
  expect(result.current.isOneClickTradingExpired).toBe(false);
  expect(result.current.isOneClickTradingEnabled).toBe(true);
  unmount();
  act(() => jest.advanceTimersByTime(120_000));
  expect(onExpire).toHaveBeenCalledTimes(1);
});

it("hides another account's session and cancels its expiry callback", () => {
  const onExpire = jest.fn();
  const { result, rerender } = renderHook(() =>
    useOneClickTradingSession({ onExpire })
  );
  mockWalletState.address = "osmo1other";
  rerender();
  expect(result.current.oneClickTradingInfo).toBeUndefined();
  expect(result.current.isOneClickTradingEnabled).toBe(false);
  act(() => jest.advanceTimersByTime(60_000));
  expect(onExpire).not.toHaveBeenCalled();
});

it("reports hydration and ignores already expired sessions", () => {
  mockWalletState.isStateHydrated = false;
  mockWalletState.oneClickTradingInfo = session(-1);
  const { result } = renderHook(() => useOneClickTradingSession());
  expect(result.current.isLoadingInfo).toBe(true);
  expect(result.current.isOneClickTradingExpired).toBe(true);
  expect(result.current.isOneClickTradingEnabled).toBe(false);
});
