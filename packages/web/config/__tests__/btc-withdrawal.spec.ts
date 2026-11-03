import {
  ALL_BTC_MINIMAL_DENOM,
  isAllBtcDenom,
  isAllowedAllBtcWithdrawalDestination,
} from "../btc-withdrawal";

describe("allBTC withdrawal destinations", () => {
  it("matches allBTC by denom only", () => {
    expect(isAllBtcDenom(ALL_BTC_MINIMAL_DENOM)).toBe(true);
    expect(isAllBtcDenom("allBTC")).toBe(false);
    expect(isAllBtcDenom(undefined)).toBe(false);
  });

  it("allows only WBTC on Ethereum and cbBTC on Base", () => {
    expect(
      isAllowedAllBtcWithdrawalDestination(
        1,
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
      )
    ).toBe(true);
    expect(
      isAllowedAllBtcWithdrawalDestination(
        "8453",
        "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf"
      )
    ).toBe(true);
    // right token, wrong chain
    expect(
      isAllowedAllBtcWithdrawalDestination(
        8453,
        "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599"
      )
    ).toBe(false);
    expect(isAllowedAllBtcWithdrawalDestination("cosmoshub-4", "uatom")).toBe(
      false
    );
  });
});
