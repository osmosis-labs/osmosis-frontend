import { prettifyTxError } from "~/components/alert/prettify";

import {
  hasPendingWalletRequest,
  trackWalletRequest,
  WC_REQUEST_TIMEOUT_MS,
} from "../pending-request";

describe("trackWalletRequest", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("resolves with the wallet response and clears the pending flag", async () => {
    const result = trackWalletRequest({
      request: Promise.resolve("signed"),
      walletName: "Keplr",
    });
    expect(hasPendingWalletRequest()).toBe(true);
    await expect(result).resolves.toBe("signed");
    expect(hasPendingWalletRequest()).toBe(false);
  });

  it("rejects at the hard timeout and drops a late response", async () => {
    let answer!: (value: string) => void;
    const late = new Promise<string>((resolve) => (answer = resolve));
    const result = trackWalletRequest({ request: late, walletName: "Keplr" });
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

  it("stays pending until every overlapping request has settled", async () => {
    let answerAccounts!: (value: string) => void;
    const accounts = trackWalletRequest({
      request: new Promise<string>((resolve) => (answerAccounts = resolve)),
      walletName: "Keplr",
    });
    const signing = trackWalletRequest({
      request: new Promise<string>(() => {}),
      walletName: "Keplr",
    });
    signing.catch(() => {});

    answerAccounts("accounts");
    await accounts;
    expect(hasPendingWalletRequest()).toBe(true);

    jest.advanceTimersByTime(WC_REQUEST_TIMEOUT_MS);
    await expect(signing).rejects.toThrow("did not respond in time");
    expect(hasPendingWalletRequest()).toBe(false);
  });

  it("times out with a message the toast can translate", async () => {
    const result = trackWalletRequest({
      request: new Promise<string>(() => {}),
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
