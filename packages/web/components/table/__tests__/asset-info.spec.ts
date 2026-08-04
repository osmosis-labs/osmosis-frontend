import { getCategoryFilters } from "~/components/table/asset-info";

describe("getCategoryFilters", () => {
  it("excludes variants for the new category", () => {
    // The regression this guards: a newly listed alloy constituent (e.g.
    // cbDOGE.axl, a constituent of allDOGE) otherwise appears on the New
    // screen next to the alloy it backs.
    expect(getCategoryFilters("new").excludeVariants).toBe(true);
  });

  it("excludes variants for top gainers", () => {
    expect(getCategoryFilters("topGainers").excludeVariants).toBe(true);
  });

  it("keeps variants for every other category", () => {
    expect(getCategoryFilters("defi").excludeVariants).toBe(false);
    expect(getCategoryFilters(undefined).excludeVariants).toBe(false);
  });

  it("applies the market-quality gates to top gainers only", () => {
    expect(getCategoryFilters("topGainers")).toEqual({
      excludeVariants: true,
      excludeStablecoins: true,
      minLiquidity: 5000,
      minVolume24h: 1000,
      maxPriceChange24h: 1000,
    });
  });

  it("leaves the new category ungated apart from variant exclusion", () => {
    // New is date-ordered, so a liquidity or volume floor would silently hide
    // legitimately new small listings.
    expect(getCategoryFilters("new")).toEqual({
      excludeVariants: true,
      excludeStablecoins: false,
      minLiquidity: undefined,
      minVolume24h: undefined,
      maxPriceChange24h: undefined,
    });
  });
});
