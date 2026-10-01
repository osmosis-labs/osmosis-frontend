import { DenomHelper } from "./denom";

describe("DenomHelper", () => {
  it("treats plain and IBC denoms as native", () => {
    for (const denom of [
      "uosmo",
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    ]) {
      const helper = new DenomHelper(denom);
      expect(helper.denom).toBe(denom);
      expect(helper.type).toBe("native");
      expect(helper.contractAddress).toBe("");
    }
  });

  it("splits contract-based denoms into type and contract address", () => {
    const helper = new DenomHelper("cw20:osmo1contract:utoken");

    expect(helper.type).toBe("cw20");
    expect(helper.contractAddress).toBe("osmo1contract");
  });

  it("rejects malformed denoms", () => {
    expect(() => new DenomHelper("")).toThrow("Invalid denom");
  });
});
