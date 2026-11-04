import {
  getAllowedQuoteDenom,
  USDC_BASE_DENOM,
} from "~/components/place-limit-tool/defaults";

const USDY_DENOM =
  "ibc/23104D411A6EB6031FA92FB75F227422B84989969E91DCAD56A535DD7FF0A373";
const USDC_NOBLE_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
const USDT_KAVA_DENOM =
  "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB";

describe("getAllowedQuoteDenom", () => {
  it("rejects a listed asset that is not an allowed quote, by denom or symbol", () => {
    expect(getAllowedQuoteDenom(USDY_DENOM, "buy")).toBeUndefined();
    expect(getAllowedQuoteDenom("USDY", "buy")).toBeUndefined();
    expect(getAllowedQuoteDenom("USDY", "sell")).toBeUndefined();
  });

  it("rejects an unknown quote", () => {
    expect(getAllowedQuoteDenom("not-a-denom", "buy")).toBeUndefined();
  });

  it("resolves an allowed quote given by denom or symbol", () => {
    expect(getAllowedQuoteDenom(USDC_BASE_DENOM, "buy")).toBe(USDC_BASE_DENOM);
    expect(getAllowedQuoteDenom(USDC_BASE_DENOM, "sell")).toBe(USDC_BASE_DENOM);
  });

  it("no longer offers USDC.noble as a quote on any tab", () => {
    for (const tab of ["buy", "sell", null]) {
      expect(getAllowedQuoteDenom(USDC_NOBLE_DENOM, tab)).toBeUndefined();
    }
  });

  it("applies the narrower sell allowlist on the sell tab", () => {
    expect(getAllowedQuoteDenom(USDT_KAVA_DENOM, "buy")).toBe(USDT_KAVA_DENOM);
    expect(getAllowedQuoteDenom(USDT_KAVA_DENOM, "sell")).toBeUndefined();
  });
});
