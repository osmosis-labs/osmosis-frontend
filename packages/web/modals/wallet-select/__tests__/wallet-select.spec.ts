import { State, WalletStatus } from "@cosmos-kit/core";

import { getModalView } from "../index";

describe("getModalView", () => {
  it('should return "connecting" when walletStatus is Connecting and qrState is Init', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Connecting,
    });
    expect(result).toBe("connecting");
  });

  it('should return "qrCode" when walletStatus is Connecting and qrState is not Init', () => {
    const result = getModalView({
      // @ts-expect-error
      qrState: "other", // Assuming other is a valid state
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Connecting,
    });
    expect(result).toBe("qrCode");
  });

  it('should return "initializeOneClickTradingError" when walletStatus is Connected and hasOneClickTradingError is true', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: true,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Connected,
    });
    expect(result).toBe("initializeOneClickTradingError");
  });

  it('should return "initializingOneClickTrading" when walletStatus is Connected, isInitializingOneClickTrading is true, and hasBroadcastedTx is false', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: true,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Connected,
    });
    expect(result).toBe("initializingOneClickTrading");
  });

  it('should return "broadcastedOneClickTrading" when walletStatus is Connected, isInitializingOneClickTrading is true, and hasBroadcastedTx is true', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: true,
      hasOneClickTradingError: false,
      hasBroadcastedTx: true,
      walletStatus: WalletStatus.Connected,
    });
    expect(result).toBe("broadcastedOneClickTrading");
  });

  it('should return "connected" when walletStatus is Connected and no other conditions are met', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Connected,
    });
    expect(result).toBe("connected");
  });

  it('should return "error" when walletStatus is Error and qrState is Init', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Error,
    });
    expect(result).toBe("error");
  });

  it('should return "qrCode" when walletStatus is Error and qrState is not Init', () => {
    const result = getModalView({
      // @ts-expect-error
      qrState: "other", // Assuming "other" is a valid state
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Error,
    });
    expect(result).toBe("qrCode");
  });

  it('should return "rejected" when walletStatus is Rejected', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Rejected,
    });
    expect(result).toBe("rejected");
  });

  it('should return "doesNotExist" when walletStatus is NotExist', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.NotExist,
    });
    expect(result).toBe("doesNotExist");
  });

  it('should return "list" when walletStatus is Disconnected', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: WalletStatus.Disconnected,
    });
    expect(result).toBe("list");
  });

  it('should return "list" when walletStatus is undefined', () => {
    const result = getModalView({
      qrState: State.Init,
      isInitializingOneClickTrading: false,
      hasOneClickTradingError: false,
      hasBroadcastedTx: false,
      walletStatus: undefined,
    });
    expect(result).toBe("list");
  });
});
