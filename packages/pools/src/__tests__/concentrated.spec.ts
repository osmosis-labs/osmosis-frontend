import {
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
} from "../concentrated";

class TestPool extends ConcentratedLiquidityPool {
  constructor(
    ...args: ConstructorParameters<typeof ConcentratedLiquidityPool>
  ) {
    super(...args);
  }

  validateDenoms(...denoms: string[]) {
    return super.validateDenoms(...denoms);
  }
}

const raw1: ConcentratedLiquidityPoolRaw = JSON.parse(
  '{"@type":"/osmosis.concentratedliquidity.v1beta1.Pool","address":"osmo1lzwv0glchfcw0fpwzdwfdsepmvluv6z6eh4qunxdml33sj06q3yq7xwtde","id":"4","current_tick_liquidity":"141421356.237309510000200000","token0":"uion","token1":"uosmo","current_sqrt_price":"0.014142135623730951","current_tick":"-350000","tick_spacing":"1","precision_factor_at_price_one":"-4","swap_fee":"0.010000000000000000","last_liquidity_update":"2023-03-21T02:07:13.890847048Z"}'
);

describe("ConcentratedLiquidityPool", () => {
  let p: TestPool;
  beforeEach(() => {
    p = new TestPool(raw1);
  });

  it("validateDenoms: properly validates denoms", () => {
    expect(() => p.validateDenoms("uosmo", "uion")).not.toThrow();
    expect(() => p.validateDenoms("uion", "uosmo")).not.toThrow();
    expect(() => p.validateDenoms("uosmo", "uosmo")).toThrow();
    expect(() => p.validateDenoms("uion", "uion")).toThrow();
    expect(() => p.validateDenoms("uion", "someotherasset")).toThrow();
  });
});
