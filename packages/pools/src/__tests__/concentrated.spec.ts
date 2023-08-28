import { Dec, Int } from "@keplr-wallet/unit";
import { LiquidityDepth } from "@osmosis-labs/math";

import {
  AmountsDataProvider,
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
  TickDataProvider,
  TickDepths,
} from "../concentrated";
import { NotEnoughLiquidityError } from "../errors";

export class MockTickProvider implements TickDataProvider {
  async getTickDepthsTokenOutGivenIn(
    pool: ConcentratedLiquidityPool,
    token: {
      denom: string;
      amount: Int;
    }
  ): Promise<TickDepths> {
    if (token.denom === pool.token1) {
      return {
        allTicks: JSON.parse(
          '[{"liquidity_net":"1063928513.516692280118630934","tick_index":"244"},{"liquidity_net":"12821176827.612857487321385327","tick_index":"507"},{"liquidity_net":"-19112293.184876715840844082","tick_index":"975"},{"liquidity_net":"-7042487.204272221556955330","tick_index":"1070"},{"liquidity_net":"119846363299223.491923667407418441","tick_index":"1176"},{"liquidity_net":"-12821176827.612857487321385327","tick_index":"1331"},{"liquidity_net":"25864763042758566.825780314141787151","tick_index":"1642"},{"liquidity_net":"789067578720062952.312030597659307660","tick_index":"1767"},{"liquidity_net":"5548573714963426149.345245435735691668","tick_index":"1918"},{"liquidity_net":"-789067578720062952.312030597659307660","tick_index":"1968"},{"liquidity_net":"-7533671.157383740445274322","tick_index":"2118"},{"liquidity_net":"-5548573714963426149.345245435735691668","tick_index":"2133"},{"liquidity_net":"-119846363299223.491923667407418441","tick_index":"2438"},{"liquidity_net":"-13690973.612258627731976066","tick_index":"2593"},{"liquidity_net":"75212224210553284471974.853997539381387792","tick_index":"2677"},{"liquidity_net":"-25864763042758566.825780314141787151","tick_index":"2798"},{"liquidity_net":"-991724173.842077641035110916","tick_index":"2841"},{"liquidity_net":"-1063928513.516692280118630934","tick_index":"2889"},{"liquidity_net":"-75212224210553284471974.853997539381387792","tick_index":"2954"},{"liquidity_net":"2300427651236616516001198205.268726763564344440","tick_index":"3361"},{"liquidity_net":"-2300427651236616516001198205.268726763564344440","tick_index":"3390"}]'
        ) as LiquidityDepth[],
        isMaxTicks: true,
      };
    } else {
      // token0
      return {
        allTicks: JSON.parse(
          '[{"liquidity_net":"13690973.612258627731976066","tick_index":"-420"},{"liquidity_net":"7042487.204272221556955330","tick_index":"-770"},{"liquidity_net":"7533671.157383740445274322","tick_index":"-923"},{"liquidity_net":"991724173.842077641035110916","tick_index":"-1014"},{"liquidity_net":"19112293.184876715840844082","tick_index":"-1073"}]'
        ) as LiquidityDepth[],
        isMaxTicks: true,
      };
    }
  }

  async getTickDepthsTokenInGivenOut(
    pool: ConcentratedLiquidityPool,
    token: { denom: string; amount: Int }
  ): Promise<TickDepths> {
    // TODO: verify
    if (token.denom === pool.token1) {
      return { allTicks: [], isMaxTicks: false };
    } else {
      // token0
      return { allTicks: [], isMaxTicks: false };
    }
  }
}

export class MockAmountProvider implements AmountsDataProvider {
  async getPoolAmounts(): Promise<{ token0Amount: Int; token1Amount: Int }> {
    return { token0Amount: new Int(100), token1Amount: new Int(100) };
  }
}

/** This is an extension simply to gain access to protected methods */
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
    p = new TestPool(raw1, new MockTickProvider(), new MockAmountProvider());
  });

  it("validateDenoms: properly validates denoms", () => {
    expect(() => p.validateDenoms("uosmo", "uion")).not.toThrow();
    expect(() => p.validateDenoms("uion", "uosmo")).not.toThrow();
    expect(() => p.validateDenoms("uosmo", "uosmo")).toThrow();
    expect(() => p.validateDenoms("uion", "uion")).toThrow();
    expect(() => p.validateDenoms("uion", "someotherasset")).toThrow();
  });
});

// these are correlated, from generated localnet values (not realistic)
const mockCLRawIon0Osmo1: ConcentratedLiquidityPoolRaw = JSON.parse(
  '{"@type":"/osmosis.concentratedliquidity.v1beta1.Pool","address":"osmo19e2mf7cywkv7zaug6nk5f87d07fxrdgrladvymh2gwv5crvm3vnsuewhh7","incentives_address":"osmo156gncm3w2hdvuxxaejue8nejxgdgsrvdf7jftntuhxnaarhxcuas4ywjxf","id":"1","current_tick_liquidity":"1039103599.000868946610160716","token0":"uion","token1":"uosmo","current_sqrt_price":"1.581138830084189666","current_tick":"15","tick_spacing":"1","exponent_at_price_one":"-1","swap_fee":"0.000000000000000000","last_liquidity_update":"2023-04-07T17:41:50.880583631Z"}'
);
const mockTicksOsmoIn: LiquidityDepth[] = JSON.parse(
  '[{"liquidity_net":"1063928513.516692280118630934","tick_index":"244"},{"liquidity_net":"12821176827.612857487321385327","tick_index":"507"},{"liquidity_net":"-19112293.184876715840844082","tick_index":"975"},{"liquidity_net":"-7042487.204272221556955330","tick_index":"1070"},{"liquidity_net":"119846363299223.491923667407418441","tick_index":"1176"},{"liquidity_net":"-12821176827.612857487321385327","tick_index":"1331"},{"liquidity_net":"25864763042758566.825780314141787151","tick_index":"1642"},{"liquidity_net":"789067578720062952.312030597659307660","tick_index":"1767"},{"liquidity_net":"5548573714963426149.345245435735691668","tick_index":"1918"},{"liquidity_net":"-789067578720062952.312030597659307660","tick_index":"1968"},{"liquidity_net":"-7533671.157383740445274322","tick_index":"2118"},{"liquidity_net":"-5548573714963426149.345245435735691668","tick_index":"2133"},{"liquidity_net":"-119846363299223.491923667407418441","tick_index":"2438"},{"liquidity_net":"-13690973.612258627731976066","tick_index":"2593"},{"liquidity_net":"75212224210553284471974.853997539381387792","tick_index":"2677"},{"liquidity_net":"-25864763042758566.825780314141787151","tick_index":"2798"},{"liquidity_net":"-991724173.842077641035110916","tick_index":"2841"},{"liquidity_net":"-1063928513.516692280118630934","tick_index":"2889"},{"liquidity_net":"-75212224210553284471974.853997539381387792","tick_index":"2954"},{"liquidity_net":"2300427651236616516001198205.268726763564344440","tick_index":"3361"},{"liquidity_net":"-2300427651236616516001198205.268726763564344440","tick_index":"3390"}]'
).map(
  ({
    liquidity_net,
    tick_index,
  }: {
    liquidity_net: string;
    tick_index: string;
  }) => {
    return {
      tickIndex: new Int(tick_index),
      netLiquidity: new Dec(liquidity_net),
    };
  }
);
// const mockTicksIonIn: LiquidityDepth[] = JSON.parse(
//   // TODO: use
//   '[{"liquidity_net":"13690973.612258627731976066","tick_index":"-420"},{"liquidity_net":"7042487.204272221556955330","tick_index":"-770"},{"liquidity_net":"7533671.157383740445274322","tick_index":"-923"},{"liquidity_net":"991724173.842077641035110916","tick_index":"-1014"},{"liquidity_net":"19112293.184876715840844082","tick_index":"-1073"}]'
// ).map(
//   ({
//     liquidity_net,
//     tick_index,
//   }: {
//     liquidity_net: string;
//     tick_index: string;
//   }) => {
//     return {
//       tickIndex: new Int(tick_index),
//       netLiquidity: new Dec(liquidity_net),
//     };
//   }
// );

describe("ConcentratedLiquidityPool.getTokenOutByTokenIn", () => {
  // data from this test case
  // https://github.com/osmosis-labs/osmosis/blob/e7b5c4a6f88004fe8a6976fd7e4cb5e90339d629/x/concentrated-liquidity/swaps_test.go#L505

  const mockClPool = mockCLRawIon0Osmo1;
  const mockTicks = mockTicksOsmoIn;

  let mockPool: any;
  let tickDataProvider: any;

  beforeEach(() => {
    tickDataProvider = {
      getTickDepthsTokenOutGivenIn: jest.fn(),
    };

    mockPool = new ConcentratedLiquidityPool(
      mockClPool,
      tickDataProvider as any,
      new MockAmountProvider()
    );
  });

  test("Making a request with enough ticks in the tickDataProvider", async () => {
    tickDataProvider.getTickDepthsTokenOutGivenIn.mockResolvedValueOnce({
      allTicks: mockTicks,
      isMaxTicks: false,
    });

    const tokenIn = { denom: "uosmo", amount: new Int(1_000_000) };
    const tokenOutDenom = "uion";

    const result = await mockPool.getTokenOutByTokenIn(tokenIn, tokenOutDenom);

    expect(result.amount.isZero()).toBeFalsy();
    expect(tickDataProvider.getTickDepthsTokenOutGivenIn).toHaveBeenCalledTimes(
      1
    );
  });

  test("Making a request while having to request more ticks from the tickDataProvider a few times, then completing the calculation", async () => {
    tickDataProvider.getTickDepthsTokenOutGivenIn
      .mockResolvedValueOnce({
        allTicks: [],
        isMaxTicks: false,
      })
      .mockResolvedValueOnce({
        allTicks: [],
        isMaxTicks: false,
      })
      .mockResolvedValueOnce({
        allTicks: [],
        isMaxTicks: false,
      })
      .mockResolvedValueOnce({
        allTicks: [],
        isMaxTicks: false,
      })
      .mockResolvedValueOnce({
        allTicks: mockTicks.slice(0, 1),
        isMaxTicks: false,
      });

    const tokenIn = { denom: "uosmo", amount: new Int(1_000_000) };
    const tokenOutDenom = "uion";

    const result = await mockPool.getTokenOutByTokenIn(tokenIn, tokenOutDenom);

    expect(result.amount.isZero()).toBeFalsy();
    expect(tickDataProvider.getTickDepthsTokenOutGivenIn).toHaveBeenCalledTimes(
      5
    );
  });

  test("Making a request while having to request more ticks from the tickDataProvider to the point where the provider runs out of ticks, and the NotEnoughLiquidityError exception is thrown", async () => {
    tickDataProvider.getTickDepthsTokenOutGivenIn
      .mockResolvedValueOnce({
        allTicks: [],
        isMaxTicks: false,
      })
      .mockResolvedValueOnce({
        allTicks: [],
        isMaxTicks: true,
      });

    const tokenIn = { denom: "uosmo", amount: new Int(1_000_000) };
    const tokenOutDenom = "uion";

    await expect(
      mockPool.getTokenOutByTokenIn(tokenIn, tokenOutDenom)
    ).rejects.toThrow(NotEnoughLiquidityError);
    expect(tickDataProvider.getTickDepthsTokenOutGivenIn).toHaveBeenCalledTimes(
      2
    );
  });
});
