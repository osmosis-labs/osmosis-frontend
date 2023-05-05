import { Dec, Int } from "@keplr-wallet/unit";
// eslint-disable-next-line import/no-extraneous-dependencies
import deepmerge from "deepmerge";

import { StablePool } from "../../stable";
import { WeightedPool } from "../../weighted";
import {
  OptimizedRoutes,
  OptimizedRoutesParams,
  Quote,
  RoutablePool,
  Route,
  RouteWithInAmount,
  TokenOutGivenInRouter,
} from "..";

// Mock RoutablePool for testing purposes
export class MockRoutablePool implements RoutablePool {
  id: string;
  poolAssetDenoms: string[];
  swapFee: Dec;
  constructor(
    id: string,
    poolAssetDenoms: string[],
    swapFee: Dec,
    readonly limitAmount: Int = new Int(100)
  ) {
    this.id = id;
    this.poolAssetDenoms = poolAssetDenoms;
    this.swapFee = swapFee;
  }
  async getLimitAmountByTokenIn(): Promise<Int> {
    // Add logic to return the limit amount for a given token
    // You can return a static value for testing purposes, or have different values for different tokens
    return this.limitAmount;
  }
  getTokenOutByTokenIn(): Promise<Quote> {
    // Implement the function

    return Promise.reject("Needs impl");
  }
  getTokenInByTokenOut(): Promise<Quote> {
    // Implement the function
    return Promise.reject("Needs impl");
  }
}

let idGen = 0;
let tokenGen = 0;
/** Will generate a chain of routable pools with each successive pool.
 *
 *  i.e. `[ 'token0', 'token1', 'token1', 'token2', 'token2', 'token3' ]`
 */
export const makeMockRoutablePool = (
  liquidity: string,
  poolAssetDenoms: string[] = [`token${tokenGen++}`, `token${tokenGen++}`],
  id: string = `pool${idGen++}`,
  swapFee: Dec = new Dec(0.01)
) => {
  tokenGen -= 1;
  return new MockRoutablePool(id, poolAssetDenoms, swapFee, new Int(liquidity));
};

/**
 * ```
 * const params: OptimizedRoutesParams = {
    pools: [
      makeWeightedPool({
        id: "2",
        firstPoolAsset: { amount: "1000" },
        secondPoolAsset: { amount: "1000" },
      }),
      makeWeightedPool(),
    ],
    incentivizedPoolIds: ["1", "2"],
    stakeCurrencyMinDenom: "uosmo",
    getPoolTotalValueLocked: (poolId: string) =>
      new Dec(10_000_000).mul(new Dec(poolId)),
    ...overrideParams,
  };
  ```
 */

// Mock OptimizedRoutes for testing purposes to get access to protected methods
export class TestOptimizedRoutes
  extends OptimizedRoutes
  implements TokenOutGivenInRouter
{
  constructor(...args: ConstructorParameters<typeof OptimizedRoutes>) {
    super(...args);
  }

  getOptimizedRoutesByTokenIn(
    ...args: Parameters<TokenOutGivenInRouter["getOptimizedRoutesByTokenIn"]>
  ) {
    return super.getOptimizedRoutesByTokenIn(...args);
  }

  calculateTokenOutByTokenIn(
    ...args: Parameters<TokenOutGivenInRouter["calculateTokenOutByTokenIn"]>
  ) {
    return super.calculateTokenOutByTokenIn(...args);
  }

  getCandidateRoutes(
    tokenInDenom: string,
    tokenOutDenom: string
  ): { routes: Route[]; poolsUsed: boolean[] } {
    return super.getCandidateRoutes(tokenInDenom, tokenOutDenom);
  }

  findBestSplitTokenIn(
    candidateRoutes: Route[],
    tokenInAmount: Int
  ): Promise<RouteWithInAmount[]> {
    return super.findBestSplitTokenIn(candidateRoutes, tokenInAmount);
  }
}

/** Make a router with protected methods exposed, with default pools.
 *
 *  All params are optionally deep-overridable via a partial object.
 */
export function makeDefaultTestRouterParams(
  overrideParams: Partial<OptimizedRoutesParams> = {}
) {
  const pools = [
    makeWeightedPool({
      firstPoolAsset: { amount: "1000" },
      secondPoolAsset: { amount: "1000" },
    }),
    makeWeightedPool({ id: "2" }),
  ];
  const params: OptimizedRoutesParams = {
    pools,
    incentivizedPoolIds: ["1", "2"],
    stakeCurrencyMinDenom: "uosmo",
    getPoolTotalValueLocked: (poolId: string) =>
      new Dec(10_000_000).mul(new Dec(poolId)),
    ...overrideParams,
  };
  return new TestOptimizedRoutes(params);
}

export class RoutesTestOptimizedRoutes
  extends OptimizedRoutes
  implements TokenOutGivenInRouter
{
  private testRoutes: Route[];

  constructor(
    testRoutes: Route[],
    ...args: ConstructorParameters<typeof OptimizedRoutes>
  ) {
    super(...args);
    this.testRoutes = testRoutes;
  }

  getOptimizedRoutesByTokenIn(
    ...args: Parameters<TokenOutGivenInRouter["getOptimizedRoutesByTokenIn"]>
  ) {
    return super.getOptimizedRoutesByTokenIn(...args);
  }

  calculateTokenOutByTokenIn(
    ...args: Parameters<TokenOutGivenInRouter["calculateTokenOutByTokenIn"]>
  ) {
    return super.calculateTokenOutByTokenIn(...args);
  }

  getCandidateRoutes(): { routes: Route[]; poolsUsed: boolean[] } {
    return { routes: this.testRoutes, poolsUsed: [] };
  }

  findBestSplitTokenIn(
    candidateRoutes: Route[],
    tokenInAmount: Int
  ): Promise<RouteWithInAmount[]> {
    return super.findBestSplitTokenIn(candidateRoutes, tokenInAmount);
  }
}

export function routeToString(route: Route | RouteWithInAmount) {
  const pools = route.pools.map((pool) => pool.id).join(" -> ");
  if ("initialAmount" in route) {
    return `${pools} in:(${route.initialAmount.toString()})`;
  }
  return pools;
}

/** Create a router that always returns the given `forcedRoutes` from `getCandidateRoutes`
 *
 *  Pools irrelevant.
 */
export function makeRouterWithForceRoutes(
  forcedRoutes: Route[],
  overrideParams: Partial<OptimizedRoutesParams> = {}
) {
  const pools = [
    makeWeightedPool({
      firstPoolAsset: { amount: "1000" },
      secondPoolAsset: { amount: "1000" },
    }),
    makeWeightedPool({ id: "2" }),
  ];
  const params: OptimizedRoutesParams = {
    pools,
    incentivizedPoolIds: ["1", "2"],
    stakeCurrencyMinDenom: "uosmo",
    getPoolTotalValueLocked: (poolId: string) =>
      new Dec(10_000_000).mul(new Dec(poolId)),
    ...overrideParams,
  };
  return new RoutesTestOptimizedRoutes(forcedRoutes, params);
}

/**
 * NOTE: Pool ID is used as TVL
 * ```
 * const {
    id,
    swapFee,
    firstPoolAsset,
    secondPoolAsset,
    totalWeight,
  }: Parameters<typeof makeWeightedPool>[0] = deepmerge(
    {
      id: "1",
      swapFee: "0.01",
      firstPoolAsset: {
        denom: "uion",
        amount: "10000",
        weight: "5368709120",
      },
      secondPoolAsset: {
        denom: "uosmo",
        amount: "10000",
        weight: "5368709120",
      },
      totalWeight: "10737418240",
    },
    poolParams
  );
  ```
 */
export function makeWeightedPool(
  poolParams: Partial<{
    id: string;
    swapFee: string;
    firstPoolAsset: Partial<{
      denom: string;
      amount: string;
      weight: string;
    }>;
    secondPoolAsset: Partial<{
      denom: string;
      amount: string;
      weight: string;
    }>;
    totalWeight: string;
  }> = {}
): WeightedPool {
  const {
    id,
    swapFee,
    firstPoolAsset,
    secondPoolAsset,
    totalWeight,
  }: Parameters<typeof makeWeightedPool>[0] = deepmerge(
    {
      id: "1",
      swapFee: "0.01",
      firstPoolAsset: {
        denom: "uion",
        amount: "10000",
        weight: "5368709120",
      },
      secondPoolAsset: {
        denom: "uosmo",
        amount: "10000",
        weight: "5368709120",
      },
      totalWeight: "10737418240",
    },
    poolParams
  );
  return new WeightedPool(
    JSON.parse(
      `{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1500hy75krs9e8t50aav6fahk8sxhajn9ctp40qwvvn8tcprkk6wszun4a5","id":"${id}","pool_params":{"swap_fee":"${swapFee}","exit_fee":"0","smooth_weight_change_params":null},"future_pool_governor":"168h","total_shares":{"denom":"gamm/pool/${id}","amount":"100000000000000000000"},"pool_assets":[{"token":{"denom":"${firstPoolAsset.denom}","amount":"${firstPoolAsset.amount}"},"weight":"${firstPoolAsset.weight}"},{"token":{"denom":"${secondPoolAsset.denom}","amount":"${secondPoolAsset.amount}"},"weight":"${secondPoolAsset.weight}"}],"total_weight":"${totalWeight}"}`
    )
  );
}

/**
 * NOTE: Pool ID is used as TVL
 * ```
 * const {
    id,
    swapFee,
    firstPoolAsset,
    secondPoolAsset,
  }: Parameters<typeof makeStablePool>[0] = deepmerge(
    {
      id: "1",
      swapFee: "0.01",
      firstPoolAsset: {
        denom: "uion",
        amount: "10000",
        scalingFactor: "1",
      },
      secondPoolAsset: {
        denom: "uosmo",
        amount: "10000",
        scalingFactor: "1",
      },
    },
    poolParams
  );
  ```
 */
export function makeStablePool(
  poolParams: Partial<{
    id: string;
    swapFee: string;
    firstPoolAsset: Partial<{
      denom: string;
      amount: string;
      scalingFactor: string;
    }>;
    secondPoolAsset: Partial<{
      denom: string;
      amount: string;
      scalingFactor: string;
    }>;
  }> = {}
): StablePool {
  const {
    id,
    swapFee,
    firstPoolAsset,
    secondPoolAsset,
  }: Parameters<typeof makeStablePool>[0] = deepmerge(
    {
      id: "1",
      swapFee: "0.01",
      firstPoolAsset: {
        denom: "uion",
        amount: "10000",
        scalingFactor: "1",
      },
      secondPoolAsset: {
        denom: "uosmo",
        amount: "10000",
        scalingFactor: "1",
      },
    },
    poolParams
  );
  return new StablePool(
    JSON.parse(
      `{"@type":"/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool","address":"osmo1mw0ac6rwlp5r8wapwk3zs6g29h8fcscxqakdzw9emkne6c8wjp9q0t3v8t","id":"${id}","pool_params":{"swap_fee":"${swapFee}","exit_fee":"0"},"future_pool_governor":"","total_shares":{"denom":"gamm/pool/${id}","amount":"100000000000000000000"},"pool_liquidity":[{"denom":"${firstPoolAsset.denom}","amount":"${firstPoolAsset.amount}"},{"denom":"${secondPoolAsset.denom}","amount":"${secondPoolAsset.amount}"}],"scaling_factors":["${firstPoolAsset.scalingFactor}","${secondPoolAsset.scalingFactor}"],"scaling_factor_controller":""}`
    )
  );
}

// taken from https://lcd-osmosis.keplr.app/osmosis/gamm/v1beta1/pools
export const allPools: RoutablePool[] = JSON.parse(
  '[{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1mw0ac6rwlp5r8wapwk3zs6g29h8fcscxqakdzw9emkne6c8wjp9q0t3v8t","id":"1","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/1","amount":"233600372942274505170839823"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"2338092985217"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"33544710306214"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1500hy75krs9e8t50aav6fahk8sxhajn9ctp40qwvvn8tcprkk6wszun4a5","id":"2","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/2","amount":"266340063176096506488071431"},"pool_assets":[{"token":{"denom":"uion","amount":"642344747"},"weight":"858993459200000"},{"token":{"denom":"uosmo","amount":"153891818746"},"weight":"214748364800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1c9gj5nwxhuh2gz7wwg4r8e8tw8v7ggy9lh2hu7kkdgh0t450754qh9cpvd","id":"3","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/3","amount":"88047111691789468216196533"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"2648100272017"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"1007180160521"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1lzwv0glchfcw0fpwzdwfdsepmvluv6z6eh4qunxdml33sj06q3yq7xwtde","id":"4","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/4","amount":"14133970273333648671445378"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"1727215414347"},"weight":"708669603840000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"23621096363"},"weight":"365072220160000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1j5l9ysw5xv0uqz9uh7mcg0l5rlerqm695ec9kkg2t8rp600zv47q82eqwa","id":"5","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/5","amount":"4657288037475085657362594287"},"pool_assets":[{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"195556011875347"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"133137264528"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1p0rpttlp8v2hy7m82l2t9p6545788f2ac3yksgrlycke2wr4mu0qdr7ytu","id":"6","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/6","amount":"8055277179644180281274283459"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"7888620673"},"weight":"322122547200000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"388154264442170"},"weight":"751619276800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo13jr3p5p070h4pu7sxhtldag9899sev9pwx0r2vlvpkyravpxlqssnzsuq9","id":"7","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/7","amount":"271680286144423500181152291"},"pool_assets":[{"token":{"denom":"ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0","amount":"3960587822376"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"160460672639"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1605py4r32r73csszlqpz6n5t5sgax9gjjfnm68jnd7pv6qe4l54ql0w8ku","id":"8","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/8","amount":"36123157544161026298495145"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"10511389592"},"weight":"644245094400000"},{"token":{"denom":"ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0","amount":"2469980520988"},"weight":"429496729600000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo19fm8jtzyw8ujsnsqm5rznudn8fhhkykjh4ra8rvx9lsfslw2pc2sp36h3r","id":"9","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/9","amount":"1581465778359595193918207128"},"pool_assets":[{"token":{"denom":"ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1","amount":"1852385806289502"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"1615829286412"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1krp38zzc3zz5as9ndqkyskhkzv6x9e30ckcq5g4lcsu5wpwcqy0sa3dea2","id":"10","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/10","amount":"307951431432828046333106445"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"25182664237"},"weight":"536870912000000"},{"token":{"denom":"ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1","amount":"415510514817391"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1zka4v4c04jr74ludyls2lfzfttzx67qzd070xtnfq90yzyacgn9qv6vend","id":"11","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/11","amount":"17249645360434800527"},"pool_assets":[{"token":{"denom":"uion","amount":"3830"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"3730160"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1f602n58fsvphaledcyyxeczukyee0dnum08psrqrl894s3cc57zq6jyvyq","id":"12","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/12","amount":"690428475018949295"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1753"},"weight":"536870912000000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"22661"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo15u5e6evufc9gjd28n4z9rvhku8lfg3arpejm0gnzhzx05w9h7e7q8665jn","id":"13","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/13","amount":"316523409007964950369"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"4575004023"},"weight":"536870912000000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"167309187610"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1kpf2xfutvfqfum9aj2juvjcjcxzp7k3le389v6ql6lurzcq0hausa6uyx8","id":"14","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/14","amount":"5932569595219933564"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1552638"},"weight":"536870912000000"},{"token":{"denom":"uion","amount":"22893"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1qm24s5jk9mz8wtc5luad8fsenrp5v5m7prjmfhunm0plcyg74u2qrsr325","id":"15","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/15","amount":"32622038176987947075935473"},"pool_assets":[{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"299967367947"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"118062425891"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1hecg2sghe8y69el3r9s0ysvlgqrwhg626lwujq5wzh0hah8zsqgspe678n","id":"16","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/16","amount":"100000000000000"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"98"},"weight":"1073741824"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"11"},"weight":"9663676416"}],"total_weight":"10737418240"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1l45a67tujfxl99qt39a09cqf9ep0vtqyn8xnuua66yvjtc7e8lvsua2hjn","id":"17","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/17","amount":"100000000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"2345"},"weight":"536870912000000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"57035137"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo17ff0mxg5j6xtuh7ma623ejcntuzuvpewu9dyjk00wkadh75au3qs0gp8pv","id":"18","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/18","amount":"200000000000000000"},"pool_assets":[{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"5331601"},"weight":"536870912000000"},{"token":{"denom":"uion","amount":"3"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1d0elgsavwgez5xf0fdan3krzfjm5jkdtcgxzlvunu4jndycs8u8qzs5h33","id":"19","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/19","amount":"220161401685494759"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"118140"},"weight":"536870912000000"},{"token":{"denom":"uion","amount":"55"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo18ltnsk33a45827l42v89wws3u2evagpfua7v57nnhslnggxkqkgq4qjmcf","id":"20","pool_params":{"swap_fee":"0.000300000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/20","amount":"1883611202938209"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"32"},"weight":"429496729600000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"2"},"weight":"644245094400000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1fcl04ma3dhc080jscyzkgf65u2ctv9v67ec03an3cff0gnfqkllqqkufhx","id":"21","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/21","amount":"200000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"1766"},"weight":"1073741824"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"88"},"weight":"1073741824"}],"total_weight":"2147483648"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo15e9w6y0g8z5as77g29azqwvp37dp96njn7h0vt5suz3un5vw95dsj4uurl","id":"22","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/22","amount":"108375070202632045393171"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"188926986270"},"weight":"536870912000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"2255961132"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo137n2magslhhhp77rt0qv2l4s4fksjncj2t8vd43sn9uwzeypqw9ql0enq2","id":"23","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/23","amount":"4493037723"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"1"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"1"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1dt568undkrrlullpzz0c27548vjdrhnsxwhygxrdtacv2dns2ryqa28jhs","id":"24","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/24","amount":"369548614244727"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"5280"},"weight":"730144440320000"},{"token":{"denom":"uosmo","amount":"552"},"weight":"343597383680000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1pm55q4srdfx8yen3ejl2jy5whc5xcfgu2ylq40yc4vk4zrzzsuxsz86tf5","id":"25","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/25","amount":"646616250000000"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"401"},"weight":"1063004405760000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"201"},"weight":"5368709120000"},{"token":{"denom":"uosmo","amount":"201"},"weight":"5368709120000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1a6rvlkd2jw32mjf2pt78fte7f2hqu7gvr0yqsqek2c7anftrunkqqq798z","id":"26","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/26","amount":"3125000000000000000"},"pool_assets":[{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"44839630"},"weight":"322122547200000"},{"token":{"denom":"uion","amount":"67"},"weight":"751619276800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1ap0j7jw0z9zf8hwc7yu3v0s7xasr7h235ggqdh6z0yzcvrvga88sgpg2d5","id":"27","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/27","amount":"260000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"2"},"weight":"107374182400000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"2"},"weight":"268435456000000"},{"token":{"denom":"uosmo","amount":"7"},"weight":"697932185600000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1hpfr8caa9swnqj2wapqwjfakqkfvdq70uvjv37pdst3xunsde2hqkz0na4","id":"28","pool_params":{"swap_fee":"0.020000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/28","amount":"82519531250000000"},"pool_assets":[{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"1176"},"weight":"536870912000000"},{"token":{"denom":"uion","amount":"1"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo18yxeq5kpup4k47vhjgu8j4y8d82sna7sdtjlz7hkuphnqtsmh8asc9vgca","id":"29","pool_params":{"swap_fee":"0.001000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/29","amount":"1338796875000000000"},"pool_assets":[{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"45"},"weight":"107374182400000"},{"token":{"denom":"uion","amount":"2"},"weight":"966367641600000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1240p460sk6qsc8n2pqv0lcl826xdslxypfvgcqgy3g95z47jmqxqanasn0","id":"30","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/30","amount":"65594202213713"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"1"},"weight":"365072220160000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1"},"weight":"354334801920000"},{"token":{"denom":"uosmo","amount":"234"},"weight":"354334801920000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1jkxwvg4dua49hsfymvfl9s2wenmguqrq3dl0ttms047w6zv2n5sqh4svnn","id":"31","pool_params":{"swap_fee":"0.030000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/31","amount":"100000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"10836"},"weight":"268435456000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"226"},"weight":"268435456000000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"2657"},"weight":"268435456000000"},{"token":{"denom":"uosmo","amount":"1609"},"weight":"268435456000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1maw9j25fppqf3c2l4ufxxhn7leu58ke2c5lm9r8ehm60fnzgpzfsu8jzhk","id":"32","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/32","amount":"10681152343750"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"3"},"weight":"322122547200000"},{"token":{"denom":"uosmo","amount":"5"},"weight":"751619276800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1pppq6lxkyrhh74npg87t2hgzqvamdck0u2qkycptdlczpx95h9tqn4c8d3","id":"33","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/33","amount":"760193450325730329"},"pool_assets":[{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"385735"},"weight":"214748364800000"},{"token":{"denom":"uion","amount":"588"},"weight":"644245094400000"},{"token":{"denom":"uosmo","amount":"217244"},"weight":"214748364800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo13mczv44wvyqn6fys7f9mcv57d9fmg6e7yfkypaykp99amqfw7chq9wa5q9","id":"34","pool_params":{"swap_fee":"0.050000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/34","amount":"62633235546784698"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"68343"},"weight":"697932185600000"},{"token":{"denom":"uosmo","amount":"9532"},"weight":"375809638400000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1p9pa7umdvry4u4338hgu4x5pkepnk9pcqddpg65zdj0k3a3ucjts85hj73","id":"35","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/35","amount":"2638218570427470217"},"pool_assets":[{"token":{"denom":"uion","amount":"295"},"weight":"1020054732800000"},{"token":{"denom":"uosmo","amount":"12338"},"weight":"53687091200000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1sknzx8cw662aspm7f5xygfhuh9hkf76qqgqwshaqhmp9m920ahlqanwq25","id":"36","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/36","amount":"13626758674126858"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"10089"},"weight":"751619276800000"},{"token":{"denom":"uosmo","amount":"46220"},"weight":"322122547200000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1avm2f4fegrla4wcxft7ct3rksnuxvjl3mhv9gljg2e0c2swvlmqsaxy3xv","id":"37","pool_params":{"swap_fee":"0.030000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/37","amount":"101060131178420656"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"9538"},"weight":"536870912000000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"3152359"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo18ahq029ylafhmmf25wqu6lvpz6nz4nf533sv6hlqht6d49p23ehszdp5gh","id":"38","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/38","amount":"1000200000000000000000"},"pool_assets":[{"token":{"denom":"ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0","amount":"1767"},"weight":"536870912000000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"14362"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1gfzdnqyy95cgvjl3vkr7vs3ra9f06xu7mu0w4ldxj6rqszkhvnts0vs24p","id":"39","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/39","amount":"10959629474713576483086"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"530475"},"weight":"53687091200000"},{"token":{"denom":"uosmo","amount":"144379187"},"weight":"1020054732800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo10vxhvl8cju4fn4kfjeay7qczl9xsffy08lpkw88netd5qcuqaunssganxl","id":"40","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/40","amount":"9100000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"33117"},"weight":"268435456000000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"3802"},"weight":"268435456000000"},{"token":{"denom":"uosmo","amount":"14049"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1vm909at9gj8whxxgqt4enq3uls2lpjkyuac52ppsa69sp4zttfqq0qpw9v","id":"41","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/41","amount":"4586365628523816"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"3"},"weight":"268435456000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1"},"weight":"268435456000000"},{"token":{"denom":"uosmo","amount":"164"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1txawpctjs6phpqsnkx2r5qud7yvekw93394anhuzz4dquy5jggssgqtn0l","id":"42","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/42","amount":"130143260214986526751732"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"2274789023944"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"390796614300"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1zmxelh7k08hy085shm5y08mqeaqmahee7u77lpnf2h4eufnsyn6qucvfjy","id":"43","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/43","amount":"100000000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"6902819"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"2623313"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1j6dyr2udygnkc94gvdfgx7tt6ct348mm20gfcudj44eardh9u8qsqyjtjs","id":"44","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/44","amount":"148688913361653"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"12"},"weight":"483183820800000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"1354"},"weight":"483183820800000"},{"token":{"denom":"uosmo","amount":"257"},"weight":"107374182400000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1plswdqqd9nn7jy3s62vnjjmshwkk0us07shttqsmdph2gkgt6ejqmqef5c","id":"45","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/45","amount":"3763407299322293"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"11"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"58"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1uc9j2thyq26jvktz4dsnya508dzr6ksjgl2w0lspsf2rdt64qu2qvgdz52","id":"46","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/46","amount":"146250000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"10077"},"weight":"536870912000000"},{"token":{"denom":"ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1","amount":"6993398"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1s4vmxgjtt7g95znpu6ymwh65t6guqhzss2eaac0l2hn25vzuq3pq03eyte","id":"47","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/47","amount":"755393300431926335"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"129462"},"weight":"268435456000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"4063"},"weight":"268435456000000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"95008606"},"weight":"268435456000000"},{"token":{"denom":"uosmo","amount":"69877"},"weight":"268435456000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1r57khl30h7ewsqe0lkr4kk7m58nlsg2qjzgxzsjal2jec9q3xcnqshf4sn","id":"48","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/48","amount":"100000000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"600093"},"weight":"805306368000000"},{"token":{"denom":"uion","amount":"95"},"weight":"10737418240000"},{"token":{"denom":"uosmo","amount":"2702083"},"weight":"257698037760000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1pu8jjw9vqpte2aqxd6y4fxjfrgp6ra79cvh3a3tefcwpheywpw7qqkqegf","id":"49","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/49","amount":"516500204345505502"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1"},"weight":"354334801920000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"1"},"weight":"354334801920000"},{"token":{"denom":"uosmo","amount":"126"},"weight":"365072220160000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1l5ehe7cqgf5fplxegqaukwygaz8g2h62yhdt06te6uem30l2j9mswf6qct","id":"50","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/50","amount":"43408356813250459"},"pool_assets":[{"token":{"denom":"uion","amount":"1"},"weight":"53687091200000"},{"token":{"denom":"uosmo","amount":"2074"},"weight":"1020054732800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo106vz3g36x84avkrrt2v602khu0t9lppptdd2gp0mr0l35pmqv5fqe2wmhj","id":"51","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/51","amount":"18938918811381503"},"pool_assets":[{"token":{"denom":"gamm/pool/50","amount":"91589561558938"},"weight":"32212254720000"},{"token":{"denom":"uion","amount":"2"},"weight":"21474836480000"},{"token":{"denom":"uosmo","amount":"872"},"weight":"1020054732800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo17sx52jq5kedxjaha8ylsh9gauclxd98fmktshvnjqu5d3jga3c4sj2rey9","id":"52","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/52","amount":"33271875000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"4662"},"weight":"214748364800000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"571"},"weight":"805306368000000"},{"token":{"denom":"uosmo","amount":"188"},"weight":"53687091200000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1240gapkk48w3guv7exqmc630clkxhzw4reqyadezmssrhd263rwsp5rg6w","id":"53","pool_params":{"swap_fee":"0.020000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/53","amount":"11214636186952874020"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"23984"},"weight":"354334801920000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"7676"},"weight":"354334801920000"},{"token":{"denom":"uosmo","amount":"31009"},"weight":"365072220160000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1xjd0l22txgpce4fh2kgjy7gmvhszzl05nzw7e7lc76qddxrywqpscj5pl8","id":"54","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/54","amount":"4195810024297903599"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"73437"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"24533"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo14rjjpwlhg3vdqtuvjx7jkfnvas3uhhyak4r6pnewup00qm0thjmsstmrv2","id":"55","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/55","amount":"6832473684210526"},"pool_assets":[{"token":{"denom":"gamm/pool/1","amount":"3443229580605727"},"weight":"644245094400000"},{"token":{"denom":"gamm/pool/2","amount":"6076188108496233"},"weight":"408021893120000"},{"token":{"denom":"uion","amount":"1"},"weight":"21474836480000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1r32kkdc46p78k6lsaqld3dl7dvdquunue3w60amuylg8q945mqzqehqgcs","id":"56","pool_params":{"swap_fee":"0.003300000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/56","amount":"200000000000000"},"pool_assets":[{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"49"},"weight":"354334801920000"},{"token":{"denom":"uion","amount":"1"},"weight":"365072220160000"},{"token":{"denom":"uosmo","amount":"117"},"weight":"354334801920000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo19cjafdcm2ek3su5gq4s3kncvzcrvjqhrk90ywt5ea4dhx8hvd8pq9emldh","id":"57","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/57","amount":"2340000000000000"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"40"},"weight":"536870912000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"4"},"weight":"268435456000000"},{"token":{"denom":"uosmo","amount":"23"},"weight":"268435456000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1hg2963kvsu2arwx69hcqmsl2ms4x5pjw9x7w43lvspn5tgz4aqksk0sk5c","id":"58","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/58","amount":"50684701566915128"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"412"},"weight":"579820584960000"},{"token":{"denom":"uosmo","amount":"1669"},"weight":"493921239040000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1edal9l38mgcm2hj27hgz0mcqapkp9yla3pgtusxap824hwqvfttq00m4wy","id":"59","pool_params":{"swap_fee":"0.015000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/59","amount":"900000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"11628"},"weight":"536870912000000"},{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"56401"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1gaern4gnnuu05dlzfr9ax5hl9hwt6tcymklv3vy4cs0tz8kkqqnqlxesce","id":"60","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/60","amount":"10276233495483"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"2"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1lmk3mgsj2ajp4s34jzfsqscz60nfys4rlsg5u8k03a9420ggyh2qldlmzq","id":"61","pool_params":{"swap_fee":"0.000200000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/61","amount":"100000000000000000000"},"pool_assets":[{"token":{"denom":"gamm/pool/38","amount":"1000000000000000000000"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"12000"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1snexrsplcnsstsmwp99jf3uua2f9pazcd0drgmmfr6kj22sdwm7scdkrdj","id":"62","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/62","amount":"550000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"14701"},"weight":"966367641600000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"865"},"weight":"107374182400000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1x6uvl8ef00hwl2ymgxfq40q9zjnykjw9u2w55466yl256lpqdpgqs9hpfg","id":"63","pool_params":{"swap_fee":"0.002500000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/63","amount":"181925888504990182"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"8392"},"weight":"1063004405760000"},{"token":{"denom":"ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0","amount":"31807"},"weight":"10737418240000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1490hxcj3c29epcfe2yhcs4q9egcpdyqr4srztnpjhme69nz6n6us9hnkvp","id":"64","pool_params":{"swap_fee":"0.002500000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/64","amount":"900000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"62615"},"weight":"644245094400000"},{"token":{"denom":"ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0","amount":"6529719"},"weight":"214748364800000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"399577203"},"weight":"214748364800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1nhrx74smgl6c5kmdlu0g4qheefekzavwtwftxrrfdwfz2tlz4vjsvkf6nr","id":"65","pool_params":{"swap_fee":"0.050000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/65","amount":"65000000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"4422"},"weight":"53687091200000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"59458"},"weight":"53687091200000"},{"token":{"denom":"uosmo","amount":"723742"},"weight":"966367641600000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1jm5tyuxars5j84jdeeqkp0zpyfk2ea84x7fec8jq03x00708f3qqwr3f57","id":"66","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/66","amount":"25000000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"21813"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"287016"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo159kv0ac2mnrp8txfy7yhrt4zxrdu5gz40ppvjasgwxunkv6jxhysznhdfa","id":"67","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/67","amount":"100000000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"843"},"weight":"354334801920000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"8036714"},"weight":"365072220160000"},{"token":{"denom":"uosmo","amount":"5558"},"weight":"354334801920000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1xzwgqxu9y7dhqq8ka33p9rs9ayej8cs742jn2akvuj0jkdvvuktqf4xdxv","id":"68","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/68","amount":"199925752542370849"},"pool_assets":[{"token":{"denom":"gamm/pool/1","amount":"40856068525180551"},"weight":"536870912000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1231"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1ztk3sfcrdvv2lnmjzfad5qerkevp3y5ny8s3n5t8c94pxwu0putqw3dqtw","id":"69","pool_params":{"swap_fee":"0.050000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/69","amount":"69818827813013860"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"70575"},"weight":"536870912000000"},{"token":{"denom":"uion","amount":"947"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1grzzz4rwj8l06wuf83dwhhhss39zv3302edgpa3tx6s6g45etsrqjjrz3v","id":"70","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/70","amount":"1600151422474148101"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"43636"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"607041"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1lrze9qqhh0r07z0zrsqhymxv6d6cc35c8m0789fg97awatqz7mesa8qe4w","id":"71","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/71","amount":"12500000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"1"},"weight":"322122547200000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1"},"weight":"429496729600000"},{"token":{"denom":"uosmo","amount":"1"},"weight":"322122547200000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1hjkkjcc88t8mf2h4n2rzdxtdpmscv53ek33vs48jxk5x0d2uf9hs59teze","id":"72","pool_params":{"swap_fee":"0.001000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/72","amount":"163350000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"6237"},"weight":"644245094400000"},{"token":{"denom":"uion","amount":"54"},"weight":"429496729600000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo12vkrtnxwpkq7hnsnchs06ya7rv0vdpchxrgt7jktjm4kupzx8l2s6nfhny","id":"73","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/73","amount":"1100413253859563"},"pool_assets":[{"token":{"denom":"gamm/pool/41","amount":"165061988078940"},"weight":"536870912000000"},{"token":{"denom":"gamm/pool/53","amount":"110041325385960"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1gy7usssxrzsepfpn9z07456cqqmumtmn5mw3wgc5jpmwt2ha8qdqwxy09x","id":"74","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/74","amount":"544529400000000"},"pool_assets":[{"token":{"denom":"gamm/pool/1","amount":"746141301445"},"weight":"536870912000000"},{"token":{"denom":"gamm/pool/73","amount":"108905880000001"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1cgw34ya7ndpmplgv5wyec4mz7hq3crc64uqq02qv6zk9vxun2rksk8fcja","id":"75","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/75","amount":"226800000000000"},"pool_assets":[{"token":{"denom":"gamm/pool/73","amount":"52164000000000"},"weight":"536870912000000"},{"token":{"denom":"gamm/pool/74","amount":"113400000000000"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1ufy3zq6va40qmpn6w6yg7l6cf9akd53gpxskt8r4dggrly0a77nsea7sru","id":"76","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/76","amount":"603599913600000"},"pool_assets":[{"token":{"denom":"gamm/pool/41","amount":"66395990496009"},"weight":"365072220160000"},{"token":{"denom":"gamm/pool/53","amount":"30179995680004"},"weight":"354334801920000"},{"token":{"denom":"gamm/pool/73","amount":"78467988768010"},"weight":"354334801920000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo169vvq6ger6xg6hae08234uwwawjzndrtextz2s9n3mhmf6gamgzqsk97w5","id":"77","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/77","amount":"2400000000000000"},"pool_assets":[{"token":{"denom":"gamm/pool/76","amount":"600000000000000"},"weight":"354334801920000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1"},"weight":"365072220160000"},{"token":{"denom":"uosmo","amount":"1"},"weight":"354334801920000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1sqan5vpspvyqtjj4spykrstq7ltgkvdsxuky5rurzzswejsdgd9qes5tjx","id":"78","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/78","amount":"838088989257812"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"428"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"4758"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1gxdq040aa9qk9d5uvtlt00uwhaskslthdq9k2kpkwm430u4cnyqsj7ml7k","id":"79","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/79","amount":"10800710283559354"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"125"},"weight":"858993459200000"},{"token":{"denom":"uosmo","amount":"312"},"weight":"214748364800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1y5dfzzdhyh9azqczjazk5v8vacf8we8f4gwlmyjc57s39jcgcp2s6d4l4k","id":"80","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/80","amount":"2630902015920852"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"4437"},"weight":"751619276800000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"121"},"weight":"322122547200000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1c8gdt3cquepqadv6ys2m9ht8eys40c2ws46ntwm7zknr2hwcsuhsly32ft","id":"81","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/81","amount":"151200000000"},"pool_assets":[{"token":{"denom":"gamm/pool/13","amount":"5242081"},"weight":"536870912000000"},{"token":{"denom":"gamm/pool/5","amount":"12082393453247"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1zg4rlhp843nn3jk0uz2kvk4zzvp7wm6qpvlnuv7dnp4jlz9pmpws90duk8","id":"82","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/82","amount":"100000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"22543"},"weight":"536870912000000"},{"token":{"denom":"ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0","amount":"205653"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1c0utzzgn56dhacxt2rzf8mvgkql54xnu78fhpnxqnx6hld9hue0qe79a7c","id":"83","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/83","amount":"775000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"12417"},"weight":"966367641600000"},{"token":{"denom":"uosmo","amount":"407"},"weight":"107374182400000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1js8gkwluk3uux73v9u83f0egh7862sezq2f80l2c9eetylr9meqq698nvz","id":"84","pool_params":{"swap_fee":"0.002000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/84","amount":"7651325971041832"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"182"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"14182"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1cyllu6l6dw88t2wlk5ex4femwvj8nh249uff5uzzt2409aw0gy7su6lq2h","id":"85","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/85","amount":"6250000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"202"},"weight":"214748364800000"},{"token":{"denom":"uosmo","amount":"4234"},"weight":"858993459200000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1u4nna8ml32n0u3fwcrfl0c3e7j8feaay0l5nzc2z850us2dkd9jqmvumll","id":"86","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/86","amount":"250000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"40154"},"weight":"805306368000000"},{"token":{"denom":"uosmo","amount":"145500"},"weight":"268435456000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1xe9d4uyaq5ek8u85kgvxusdadnx7u9k09cauv4f8gn9e7xr4xycq7rwn88","id":"87","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/87","amount":"20000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"1"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1kze098t3xxs3w6mfhxkdeehrktjd49582g8vtgfh5cke2jfh2hhsqqjvgx","id":"88","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/88","amount":"86400000000000000"},"pool_assets":[{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"19962928"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"21344"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1k9a068d7990a52fncvt70magqvzsfkeg9a6qnqehv20qwwdqfrdqux5s24","id":"89","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/89","amount":"13230540450000000000"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"609893"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"140219"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1w4w9gj02z3hv7qlry8mpju625qrevrtf2f2nmywu45j3j4mnahuskfrf38","id":"90","pool_params":{"swap_fee":"0.000300000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/90","amount":"31117757031642383"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"37430"},"weight":"536870912000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"1166"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1ajghgy4ltm4ghn5smlrr29egrk3mq72642jsq8hqqet4cnwv4kssm9mrw8","id":"91","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/91","amount":"104241110457839912"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"28731"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"390830"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo15eqya8as2ytwxzwfeyjs0xra4yxdeakp70397fzvhfa0vf0z3lmslnkzgv","id":"92","pool_params":{"swap_fee":"0.002500000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/92","amount":"21125000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"242"},"weight":"268435456000000"},{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"23"},"weight":"161061273600000"},{"token":{"denom":"ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0","amount":"4477"},"weight":"161061273600000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"79"},"weight":"214748364800000"},{"token":{"denom":"uion","amount":"1"},"weight":"161061273600000"},{"token":{"denom":"uosmo","amount":"90"},"weight":"107374182400000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1j4xmzkea5t8s077t0s39vs5psp6f6dacpjswn64ln2v4pncwxg3qjs30zl","id":"93","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/93","amount":"1562500000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"22944"},"weight":"644245094400000"},{"token":{"denom":"uosmo","amount":"193208"},"weight":"429496729600000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo160j48r4s762qjtjpgufmdaham3ywkqe8hzp4scqyz4ll93savexqzkmewx","id":"94","pool_params":{"swap_fee":"0.005000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/94","amount":"1293571916344036236285"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"130034"},"weight":"214748364800000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"73182016"},"weight":"214748364800000"},{"token":{"denom":"ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293","amount":"141025"},"weight":"214748364800000"},{"token":{"denom":"ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1","amount":"67577426"},"weight":"214748364800000"},{"token":{"denom":"uosmo","amount":"58576"},"weight":"214748364800000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1cxfkytmxzs55c00anuftly389mzg3gzvncfm8s4u9zeulhj8hsfq87snws","id":"95","pool_params":{"swap_fee":"0.010000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/95","amount":"1409395429923417"},"pool_assets":[{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"3"},"weight":"536870912000000"},{"token":{"denom":"ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1","amount":"1859"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1zrm4msu7q238tlhkdyk2pu3px47z47n0tgwrlpf6c08f4ppmwycqfeas0n","id":"96","pool_params":{"swap_fee":"0.001000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/96","amount":"5850000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"20"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"127"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo124qc2hs5jgp2shrmtv2usxyrt52k447702pczyct0zqadlkkh2csvh5pzv","id":"97","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/97","amount":"200000000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"4686"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"41888"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1uny6uzpdfqa9q2cea7ycnuwfr8s6c2zvyt6s7yh2rvvzt0zvhl6q6hdhdu","id":"98","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/98","amount":"200000000000000000"},"pool_assets":[{"token":{"denom":"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4","amount":"5344"},"weight":"536870912000000"},{"token":{"denom":"ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076","amount":"7018"},"weight":"536870912000000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo1haqvxq0ykcxa5wjzpvpdpu96jdss0v0du7hfly595rhlamtzlmzq9a748l","id":"99","pool_params":{"swap_fee":"0.003000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/99","amount":"195312500000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"2"},"weight":"1073741824000"},{"token":{"denom":"ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84","amount":"84576048"},"weight":"1072668082176000"}],"total_weight":"1073741824000000"},{"@type":"/osmosis.gamm.v1beta1.Pool","address":"osmo14jz33kmx87yv94x4hzh3ylrpt6kwkqvjlsaz06aus2equyjv9w3s5nw2kc","id":"100","pool_params":{"swap_fee":"0.000000000000000000","exit_fee":"0.000000000000000000","smooth_weight_change_params":null},"future_pool_governor":"24h","total_shares":{"denom":"gamm/pool/100","amount":"25000000000000"},"pool_assets":[{"token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"12"},"weight":"536870912000000"},{"token":{"denom":"uosmo","amount":"214"},"weight":"536870912000000"}],"total_weight":"1073741824000000"}]'
).map((poolRaw: any) => {
  if (poolRaw["@type"] === "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool") {
    return new StablePool(poolRaw);
  } else {
    return new WeightedPool(poolRaw);
  }
});
