import { Dec, Int } from "@keplr-wallet/unit";
import {
  getOsmoRoutedMultihopTotalSwapFee,
  isOsmoRoutedMultihop,
} from "@osmosis-labs/math";

import { NotEnoughLiquidityError } from "../errors";
import { NoRouteError } from "./errors";
import { calculateWeightForRoute, Route, validateRoute } from "./route";
import { MultihopSwapResult, RoutablePool, RouteWithAmount } from "./types";
import { invertRoute } from "./utils";

export type OptimizedRoutesParams = {
  pools: ReadonlyArray<RoutablePool>;
  incentivizedPoolIds: string[];
  stakeCurrencyMinDenom: string;
  routeCache?: Map<string, RouteWithAmount[]>;
  getPoolTotalValueLocked: (poolId: string) => Dec;
  maxHops?: number;
  maxRoutes?: number;
};

export class OptimizedRoutes {
  protected readonly _pools: ReadonlyArray<RoutablePool> = [];
  protected readonly _incentivizedPoolIds: string[];
  protected readonly _stakeCurrencyMinDenom: string;
  protected readonly _candidatePathsCache = new Map<string, Route[]>();
  protected readonly _getPoolTotalValueLocked: (poolId: string) => Dec;
  protected readonly _maxHops: number;
  protected readonly _maxRoutes: number;

  constructor({
    pools,
    incentivizedPoolIds: incventivizedPoolIds,
    stakeCurrencyMinDenom,
    routeCache,
    getPoolTotalValueLocked,
    maxHops = 4,
    maxRoutes = 4,
  }: OptimizedRoutesParams) {
    // Sort by the total value locked.
    this._pools = [...pools].sort((a, b) => {
      const aTvl = getPoolTotalValueLocked(a.id);
      const bTvl = getPoolTotalValueLocked(b.id);
      return Number(aTvl.sub(bTvl).toString());
    });
    this._incentivizedPoolIds = incventivizedPoolIds;
    this._stakeCurrencyMinDenom = stakeCurrencyMinDenom;
    if (routeCache) this._candidatePathsCache = routeCache;
    this._getPoolTotalValueLocked = getPoolTotalValueLocked;
    if (maxHops > 5) throw new Error("maxHops must be less than 5");
    this._maxHops = maxHops;
    if (maxRoutes > 10) throw new Error("maxRoutes must be less than 10");
    this._maxRoutes = maxRoutes;
  }

  /** Find optimal routes for a given amount of token in and out token, best first. */
  async getOptimizedRoutesByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string
  ): Promise<RouteWithAmount[]> {
    if (!tokenIn.amount.isPositive()) {
      return [];
    }

    let routes = this.getCandidateRoutes(tokenIn.denom, tokenOutDenom);

    // find routes with swapped in/out tokens since getCandidateRoutes is a greedy algorithm
    const reverseRoutes = this.getCandidateRoutes(tokenOutDenom, tokenIn.denom);
    const invertedRoutes = reverseRoutes.map(invertRoute);
    routes = [...routes, ...invertedRoutes];

    if (routes.length === 0) {
      throw new NoRouteError();
    }

    // sort routes by weight
    const routeWeights = await Promise.all(
      routes.map((route) =>
        calculateWeightForRoute(route, this._getPoolTotalValueLocked)
      )
    );
    routes = routes.sort((path1, path2) => {
      const path1Index = routes.indexOf(path1);
      const path2Index = routes.indexOf(path2);
      const path1Weight = routeWeights[path1Index];
      const path2Weight = routeWeights[path2Index];

      return path1Weight.gte(path2Weight) ? -1 : 1;
    });

    // determine if the routes have enough liquidity --

    // Is direct swap, but not enough liquidity
    if (routes.length > 1 && routes[0].pools.length === 1) {
      const directSwapLimit = await routes[0].pools[0].getLimitAmountByTokenIn(
        tokenIn.denom
      );
      if (directSwapLimit.lt(tokenIn.amount)) {
        routes = routes.slice(1); // remove direct swap route
      }
    }

    const initialSwapAmounts: Int[] = [];
    let totalLimitAmount = new Int(0);
    for (const route of routes) {
      const limitAmount = await route.pools[0].getLimitAmountByTokenIn(
        tokenIn.denom
      );
      totalLimitAmount = totalLimitAmount.add(limitAmount);
      if (totalLimitAmount.lt(tokenIn.amount)) {
        initialSwapAmounts.push(limitAmount);
      } else {
        let sumInitialSwapAmounts = new Int(0);
        for (const initialSwapAmount of initialSwapAmounts) {
          sumInitialSwapAmounts = sumInitialSwapAmounts.add(initialSwapAmount);
        }
        const diff = tokenIn.amount.sub(sumInitialSwapAmounts);
        initialSwapAmounts.push(diff);
        break;
      }
    }

    // Not enough liquidity
    if (totalLimitAmount.lt(tokenIn.amount)) {
      throw new NotEnoughLiquidityError(
        `Limit amount ${totalLimitAmount.toString()} is less than ${tokenIn.amount.toString()}`
      );
    }

    // only take routes with valid initialAmounts
    return initialSwapAmounts.map((amount, i) => {
      return {
        ...routes[i],
        initialAmount: amount,
      };
    });
  }

  /** Calculate the amount of token out by simulating a swap through a route. */
  async calculateTokenOutByTokenIn(
    route: RouteWithAmount
  ): Promise<MultihopSwapResult> {
    validateRoute(route);

    let totalOutAmount: Int = new Int(0);
    let totalBeforeSpotPriceInOverOut: Dec = new Dec(0);
    let totalAfterSpotPriceInOverOut: Dec = new Dec(0);
    let totalEffectivePriceInOverOut: Dec = new Dec(0);
    let totalSwapFee: Dec = new Dec(0);
    /** Special case when routing through _only_ 2 OSMO pools. */
    let isMultihopOsmoFeeDiscount = false;
    const sumAmount = route.initialAmount;

    const amountFraction = route.initialAmount
      .toDec()
      .quoTruncate(sumAmount.toDec());

    let previousInDenom = route.tokenInDenom;
    let previousInAmount = route.initialAmount;

    let beforeSpotPriceInOverOut: Dec = new Dec(1);
    let afterSpotPriceInOverOut: Dec = new Dec(1);
    let effectivePriceInOverOut: Dec = new Dec(1);
    let swapFee: Dec = new Dec(0);

    for (let i = 0; i < route.pools.length; i++) {
      const pool = route.pools[i];
      const outDenom = route.tokenOutDenoms[i];

      let poolSwapFee = pool.swapFee;
      if (
        isOsmoRoutedMultihop(
          route.pools.map((routePool) => ({
            id: routePool.id,
            isIncentivized: this._incentivizedPoolIds.includes(routePool.id),
          })),
          route.tokenOutDenoms[0],
          this._stakeCurrencyMinDenom
        )
      ) {
        isMultihopOsmoFeeDiscount = true;
        const { maxSwapFee, swapFeeSum } = getOsmoRoutedMultihopTotalSwapFee(
          route.pools
        );
        poolSwapFee = maxSwapFee.mul(poolSwapFee.quo(swapFeeSum));
      }

      const tokenOut = await pool.getTokenOutByTokenIn(
        { denom: previousInDenom, amount: previousInAmount },
        outDenom,
        poolSwapFee
      );

      if (!tokenOut.amount.gt(new Int(0))) {
        // not enough liquidity
        console.warn("Token out is 0 through pool:", pool.id);

        return {
          ...tokenOut,
          tokenInFeeAmount: new Int(0),
          swapFee,
          multiHopOsmoDiscount: false,
        };
      }

      beforeSpotPriceInOverOut = beforeSpotPriceInOverOut.mulTruncate(
        tokenOut.beforeSpotPriceInOverOut
      );
      afterSpotPriceInOverOut = afterSpotPriceInOverOut.mulTruncate(
        tokenOut.afterSpotPriceInOverOut
      );
      effectivePriceInOverOut = effectivePriceInOverOut.mulTruncate(
        tokenOut.effectivePriceInOverOut
      );
      swapFee = swapFee.add(new Dec(1).sub(swapFee).mulTruncate(poolSwapFee));

      // is last pool
      if (i === route.pools.length - 1) {
        totalOutAmount = totalOutAmount.add(tokenOut.amount);

        totalBeforeSpotPriceInOverOut = totalBeforeSpotPriceInOverOut.add(
          beforeSpotPriceInOverOut.mulTruncate(amountFraction)
        );
        totalAfterSpotPriceInOverOut = totalAfterSpotPriceInOverOut.add(
          afterSpotPriceInOverOut.mulTruncate(amountFraction)
        );
        totalEffectivePriceInOverOut = totalEffectivePriceInOverOut.add(
          effectivePriceInOverOut.mulTruncate(amountFraction)
        );
        totalSwapFee = totalSwapFee.add(swapFee.mulTruncate(amountFraction));
      } else {
        previousInDenom = outDenom;
        previousInAmount = tokenOut.amount;
      }
    }

    const priceImpact = totalEffectivePriceInOverOut
      .quo(totalBeforeSpotPriceInOverOut)
      .sub(new Dec(1));

    return {
      amount: totalOutAmount,
      beforeSpotPriceInOverOut: totalBeforeSpotPriceInOverOut,
      beforeSpotPriceOutOverIn: new Dec(1).quoTruncate(
        totalBeforeSpotPriceInOverOut
      ),
      afterSpotPriceInOverOut: totalAfterSpotPriceInOverOut,
      afterSpotPriceOutOverIn: new Dec(1).quoTruncate(
        totalAfterSpotPriceInOverOut
      ),
      effectivePriceInOverOut: totalEffectivePriceInOverOut,
      effectivePriceOutOverIn: new Dec(1).quoTruncate(
        totalEffectivePriceInOverOut
      ),
      tokenInFeeAmount: sumAmount.sub(
        new Dec(sumAmount).mulTruncate(new Dec(1).sub(totalSwapFee)).round()
      ),
      swapFee: totalSwapFee,
      multiHopOsmoDiscount: isMultihopOsmoFeeDiscount,
      priceImpact,
    };
  }

  /** Find routes through pools without optimization. */
  protected getCandidateRoutes(
    tokenInDenom: string,
    tokenOutDenom: string
  ): Route[] {
    if (this._pools.length === 0) {
      return [];
    }
    const cacheKey = `${tokenInDenom}/${tokenOutDenom}`;
    const cached = this._candidatePathsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const poolsUsed = Array<boolean>(this._pools.length).fill(false);
    const routes: Route[] = [];

    const findRoutes = (
      tokenInDenom: string,
      tokenOutDenom: string,
      currentRoute: RoutablePool[],
      currentTokenOuts: string[],
      poolsUsed: boolean[],
      _previousTokenOuts?: string[]
    ) => {
      if (currentRoute.length > this._maxHops) return;

      if (
        currentRoute.length > 0 &&
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        currentRoute[currentRoute.length - 1]!.poolAssetDenoms.includes(
          tokenOutDenom
        )
      ) {
        const foundRoute: Route = {
          pools: [...currentRoute],
          tokenOutDenoms: [...currentTokenOuts, tokenOutDenom],
          tokenInDenom,
        };
        routes.push(foundRoute);
        return;
      }

      if (routes.length > this._maxRoutes) {
        // only find top routes by iterating all pools by high liquidity first
        return;
      }

      for (let i = 0; i < this._pools.length; i++) {
        if (poolsUsed[i]) {
          continue; // skip pool
        }

        const previousTokenOuts = _previousTokenOuts
          ? _previousTokenOuts
          : [tokenInDenom]; // imaginary prev pool

        const curPool = this._pools[i];

        let prevPoolCurPoolTokenMatch: string | undefined;
        curPool.poolAssetDenoms.forEach((denom) =>
          previousTokenOuts.forEach((d) => {
            if (d === denom) {
              prevPoolCurPoolTokenMatch = denom;
            }
          })
        );
        if (!prevPoolCurPoolTokenMatch) {
          continue; // skip pool
        }

        currentRoute.push(curPool);
        if (
          currentRoute.length > 1 &&
          prevPoolCurPoolTokenMatch !== tokenInDenom &&
          prevPoolCurPoolTokenMatch !== tokenOutDenom
        ) {
          currentTokenOuts.push(prevPoolCurPoolTokenMatch);
        }
        poolsUsed[i] = true;
        findRoutes(
          tokenInDenom,
          tokenOutDenom,
          currentRoute,
          currentTokenOuts,
          poolsUsed,
          curPool.poolAssetDenoms.filter(
            (denom) => denom !== prevPoolCurPoolTokenMatch
          )
        );
        poolsUsed[i] = false;
        currentTokenOuts.pop();
        currentRoute.pop();
      }
    };

    findRoutes(tokenInDenom, tokenOutDenom, [], [], poolsUsed);
    this._candidatePathsCache.set(cacheKey, routes);
    return routes.filter(({ pools }) => pools.length <= this._maxHops);
  }
}
