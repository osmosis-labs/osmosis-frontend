import {
  getPendingWalletRequest,
  trackWalletRequest,
  WC_REQUEST_TIMEOUT_MS,
} from "../pending-request";

describe("trackWalletRequest", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("resolves with the wallet response and clears the pending request", async () => {
    const result = trackWalletRequest({
      request: Promise.resolve("signed"),
      walletName: "Keplr",
    });
    await expect(result).resolves.toBe("signed");
    expect(getPendingWalletRequest()).toBeNull();
  });

  it("rejects on cancel and drops a response that arrives afterwards", async () => {
    let answer!: (value: string) => void;
    const late = new Promise<string>((resolve) => (answer = resolve));
    const result = trackWalletRequest({ request: late, walletName: "Keplr" });

    getPendingWalletRequest()!.cancel();
    await expect(result).rejects.toThrow("Request rejected");

    answer("signed-too-late");
    await Promise.resolve();
    expect(getPendingWalletRequest()).toBeNull();
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

    answer("signed-too-late");
    await expect(result).rejects.toThrow("did not respond in time");
  });
});

describe("overlapping requests", () => {
  it("cancel rejects every in-flight request, not just the latest", async () => {
    const signing = trackWalletRequest({
      request: new Promise<string>(() => {}),
      walletName: "Keplr",
    });
    const accounts = trackWalletRequest({
      request: new Promise<string>(() => {}),
      walletName: "Keplr",
    });

    getPendingWalletRequest()!.cancel();

    await expect(signing).rejects.toThrow("Request rejected");
    await expect(accounts).rejects.toThrow("Request rejected");
    expect(getPendingWalletRequest()).toBeNull();
  });
});
