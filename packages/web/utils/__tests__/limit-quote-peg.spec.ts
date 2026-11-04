import { Dec } from "@osmosis-labs/unit";

import { getQuotePegStatus } from "../limit-quote-peg";

describe("limit order quote peg", () => {
  it("warns at 1% off $1, blocks at 5%, and treats a missing price as unknown", () => {
    expect(getQuotePegStatus(new Dec("1.002"))).toBe("ok");
    expect(getQuotePegStatus(new Dec("0.985"))).toBe("warn");
    expect(getQuotePegStatus(new Dec("0.99"))).toBe("warn");
    expect(getQuotePegStatus(new Dec("1.01"))).toBe("warn");
    expect(getQuotePegStatus(new Dec("0.95"))).toBe("block");
    expect(getQuotePegStatus(new Dec("1.05"))).toBe("block");
    // A bridged variant at 0.94 allUSDC: the tick would be 6% off.
    expect(getQuotePegStatus(new Dec("0.94"))).toBe("block");
    expect(getQuotePegStatus(new Dec("1.064"))).toBe("block");
    // Unknown is never read as $1.
    expect(getQuotePegStatus(undefined)).toBe("unknown");
  });
});
