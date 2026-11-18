import { prettifyTxError } from "~/components/alert/prettify";

import {
  cancelWalletRequests,
  hasPendingWalletRequest,
  resetWalletRequestCancel,
  trackWalletRequest,
  WC_REQUEST_TIMEOUT_MS,
} from "../pending-request";

describe("trackWalletRequest", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    resetWalletRequestCancel();
    jest.useRealTimers();
  });

  it("resolves with the wallet response and clears the pending flag", async () => {
    const result = trackWalletRequest({
      send: () => Promise.resolve("signed"),
      walletName: "Keplr",
    });
    expect(hasPendingWalletRequest()).toBe(true);
    await expect(result).resolves.toBe("signed");
    expect(hasPendingWalletRequest()).toBe(false);
  });

  it("rejects at the hard timeout and drops a late response", async () => {
    let answer!: (value: string) => void;
    const result = trackWalletRequest({
      send: () => new Promise<string>((resolve) => (answer = resolve)),
      walletName: "Keplr",
    });
    const settled = jest.fn();
    result.catch(settled);

    jest.advanceTimersByTime(WC_REQUEST_TIMEOUT_MS - 1);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    await expect(result).rejects.toThrow("did not respond in time");
    expect(hasPendingWalletRequest()).toBe(false);

    answer("signed-too-late");
    await expect(result).rejects.toThrow("did not respond in time");
  });

  it("times out with a message the toast can translate", async () => {
    const result = trackWalletRequest({
      send: () => new Promise<string>(() => {}),
      walletName: "Keplr Mobile",
    });
    jest.advanceTimersByTime(WC_REQUEST_TIMEOUT_MS);
    const error: Error = await result.catch((e) => e);

    expect(prettifyTxError(error.message, [])).toEqual([
      "errors.walletRequestTimedOut",
      { wallet: "Keplr Mobile" },
    ]);
  });
});

describe("cancelWalletRequests", () => {
  afterEach(() => resetWalletRequestCancel());

  it("rejects every open request and drops responses that arrive afterwards", async () => {
    let answer!: (value: string) => void;
    const signing = trackWalletRequest({
      send: () => new Promise<string>((resolve) => (answer = resolve)),
      walletName: "Keplr",
    });
    const accounts = trackWalletRequest({
      send: () => new Promise<string>(() => {}),
      walletName: "Keplr",
    });

    cancelWalletRequests();

    await expect(signing).rejects.toThrow("Request rejected");
    await expect(accounts).rejects.toThrow("Request rejected");
    expect(hasPendingWalletRequest()).toBe(false);

    answer("signed-too-late");
    await expect(signing).rejects.toThrow("Request rejected");
  });

  it("refuses requests started after a cancel without sending them, until reset", async () => {
    cancelWalletRequests();

    const send = jest.fn(() => Promise.resolve("signed"));
    await expect(
      trackWalletRequest({ send, walletName: "Keplr" })
    ).rejects.toThrow("Request rejected");
    expect(send).not.toHaveBeenCalled();

    resetWalletRequestCancel();
    await expect(
      trackWalletRequest({ send, walletName: "Keplr" })
    ).resolves.toBe("signed");
  });
});
