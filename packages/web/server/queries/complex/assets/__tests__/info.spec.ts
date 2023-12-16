import { TokenMarketCap } from "../../../indexer";
import { calculateRank } from "../info";

describe("calculateRank", () => {
  it("should correctly calculate ranks based on market cap", () => {
    const marketCaps: TokenMarketCap[] = [
      { symbol: "token1", market_cap: 100 },
      { symbol: "token2", market_cap: 200 },
      { symbol: "token3", market_cap: 50 },
    ];

    const rankMap = calculateRank(marketCaps);

    expect(rankMap.get("token1")).toBe(2);
    expect(rankMap.get("token2")).toBe(1);
    expect(rankMap.get("token3")).toBe(3);
  });
});
