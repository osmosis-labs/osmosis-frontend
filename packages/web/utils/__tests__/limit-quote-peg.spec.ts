import { Dec } from "@osmosis-labs/unit";

import { getQuotePeg } from "../limit-quote-peg";

describe("limit order quote peg", () => {
  it("blocks only on the onchain price, warns on the USD price, and treats a missing onchain price as unknown", () => {
    // A bridged variant at 0.94 allUSDC: the tick would be 6% off, blocked.
    expect(getQuotePeg(new Dec("0.94"), new Dec("1")).status).toBe("block");
    // USDC itself at $0.94: allUSDC ticks are exact, so only a warning.
    expect(getQuotePeg(new Dec("1"), new Dec("0.94")).status).toBe("warn");
    // USDT holding $1 while USDC is at $0.94 reads 1.064 onchain: blocked.
    expect(getQuotePeg(new Dec("1.064"), new Dec("0.94")).status).toBe("block");
    expect(getQuotePeg(new Dec("1.002"), new Dec("0.999")).status).toBe("ok");
    // CoinGecko down: the onchain check still runs.
    expect(getQuotePeg(new Dec("1.002"), undefined).status).toBe("ok");
    // Unknown is never read as $1.
    expect(getQuotePeg(undefined, new Dec("1")).status).toBe("unknown");
  });
});
