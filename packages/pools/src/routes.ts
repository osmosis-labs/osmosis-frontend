import { Dec, Int } from "@keplr-wallet/unit";
import { Pool } from "./interface";
import { NoPoolsError, NotEnoughLiquidityError } from "./errors";

export interface RoutePath {
  pools: Pool[];
  // tokenOutDenoms means the token to come out from each pool.
  // This should the same length with the pools.
  // RoutePath consists of token in -> pool -> token out -> pool -> token out...
  // But, currently, only 1 intermediate can be supported.
  tokenOutDenoms: string[];
  tokenInDenom: string;
}

export interface RoutePathWithAmount extends RoutePath {
  amount: Int;
}

export class OptimizedRoutes {
  protected _pools: ReadonlyArray<Pool>;
  protected candidatePathsCache = new Map<string, RoutePath[]>();

  constructor(pools: ReadonlyArray<Pool>) {
    this._pools = pools;
  }

  setPools(pools: ReadonlyArray<Pool>) {
    this._pools = pools;
    this.clearCache();
  }

  get pools(): ReadonlyArray<Pool> {
    return this._pools;
  }

  protected clearCache() {
    this.candidatePathsCache = new Map();
  }

  protected getCandidatePaths(
    tokenInDenom: string,
    tokenOutDenom: string,
    permitIntermediate: boolean
  ): RoutePath[] {
    if (this.pools.length === 0) {
      return [];
    }

    const cacheKey = `${tokenInDenom}/${tokenOutDenom}/${permitIntermediate}`;
    const cached = this.candidatePathsCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    let filteredRoutePaths: RoutePath[] = [];

    // Key is denom.
    const multihopCandiateHasOnlyInIntermediates: Map<string, Pool[]> =
      new Map();
    const multihopCandiateHasOnlyOutIntermediates: Map<string, Pool[]> =
      new Map();

    for (const pool of this.pools) {
      const hasTokenIn = pool.hasPoolAsset(tokenInDenom);
      const hasTokenOut = pool.hasPoolAsset(tokenOutDenom);
      if (hasTokenIn && hasTokenOut) {
        // If the pool has both token in and token out, we can swap directly from this pool.
        filteredRoutePaths.push({
          pools: [pool],
          tokenOutDenoms: [tokenOutDenom],
          tokenInDenom,
        });
      } else {
        if (permitIntermediate && (hasTokenIn || hasTokenOut)) {
          for (const poolAsset of pool.poolAssets) {
            const denom = poolAsset.denom;
            if (denom !== tokenInDenom && denom !== tokenOutDenom) {
              if (hasTokenIn) {
                const candiateData =
                  multihopCandiateHasOnlyInIntermediates.get(denom);
                if (candiateData) {
                  candiateData.push(pool);
                  multihopCandiateHasOnlyInIntermediates.set(
                    denom,
                    candiateData
                  );
                } else {
                  multihopCandiateHasOnlyInIntermediates.set(denom, [pool]);
                }
              } else {
                const candiateData =
                  multihopCandiateHasOnlyOutIntermediates.get(denom);
                if (candiateData) {
                  candiateData.push(pool);
                  multihopCandiateHasOnlyOutIntermediates.set(
                    denom,
                    candiateData
                  );
                } else {
                  multihopCandiateHasOnlyOutIntermediates.set(denom, [pool]);
                }
              }
            }
          }
        }
      }
    }

    // This method is actually used to calculate an optimized routes.
    // In the case of overlapping pools in the optimized route,
    // it is difficult because the change of the pool by each swap should be calculated in advance...
    // So, make sure that the pools do not overlap.
    // Key is pool id
    const usedFirstPoolMap: Map<string, boolean> = new Map();
    // Key is pool id
    const usedSecondPoolMap: Map<string, boolean> = new Map();

    multihopCandiateHasOnlyInIntermediates.forEach(
      (hasOnlyInPools, intermediateDenom) => {
        const hasOnlyOutIntermediates =
          multihopCandiateHasOnlyOutIntermediates.get(intermediateDenom);
        if (hasOnlyOutIntermediates) {
          let highestNormalizedLiquidityFirst = new Dec(0);
          let highestNormalizedLiquidityFirstPool: Pool | undefined;

          for (const pool of hasOnlyInPools) {
            if (!usedFirstPoolMap.get(pool.id)) {
              const normalizedLiquidity = pool.getNormalizedLiquidity(
                tokenInDenom,
                intermediateDenom
              );

              if (normalizedLiquidity.gte(highestNormalizedLiquidityFirst)) {
                highestNormalizedLiquidityFirst = normalizedLiquidity;
                highestNormalizedLiquidityFirstPool = pool;
              }
            }
          }

          if (
            highestNormalizedLiquidityFirst.isPositive() &&
            highestNormalizedLiquidityFirstPool
          ) {
            let highestNormalizedLiquiditySecond = new Dec(0);
            let highestNormalizedLiquiditySecondPool: Pool | undefined;

            for (const pool of hasOnlyOutIntermediates) {
              if (!usedSecondPoolMap.get(pool.id)) {
                const normalizedLiquidity = pool.getNormalizedLiquidity(
                  intermediateDenom,
                  tokenOutDenom
                );

                if (normalizedLiquidity.gte(highestNormalizedLiquiditySecond)) {
                  highestNormalizedLiquiditySecond = normalizedLiquidity;
                  highestNormalizedLiquiditySecondPool = pool;
                }
              }
            }

            if (
              highestNormalizedLiquiditySecond.isPositive() &&
              highestNormalizedLiquiditySecondPool
            ) {
              usedFirstPoolMap.set(
                highestNormalizedLiquidityFirstPool.id,
                true
              );
              usedSecondPoolMap.set(
                highestNormalizedLiquiditySecondPool.id,
                true
              );
              filteredRoutePaths.push({
                pools: [
                  highestNormalizedLiquidityFirstPool,
                  highestNormalizedLiquiditySecondPool,
                ],
                tokenOutDenoms: [intermediateDenom, tokenOutDenom],
                tokenInDenom,
              });
            }
          }
        }
      }
    );

    filteredRoutePaths = filteredRoutePaths.sort((path1, path2) => {
      // Priority is given to direct swap.
      // For direct swap, sort by normalized liquidity.
      // In case of multihop swap, sort by first normalized liquidity.

      const path1IsDirect = path1.pools.length === 1;
      const path2IsDirect = path2.pools.length === 1;
      if (!path1IsDirect || !path2IsDirect) {
        return path1IsDirect ? -1 : 1;
      }

      const path1NormalizedLiquidity = path1.pools[0].getNormalizedLiquidity(
        tokenInDenom,
        path1.tokenOutDenoms[0]
      );
      const path2NormalizedLiquidity = path2.pools[0].getNormalizedLiquidity(
        tokenInDenom,
        path2.tokenOutDenoms[0]
      );

      return path1NormalizedLiquidity.gte(path2NormalizedLiquidity) ? -1 : 1;
    });

    this.candidatePathsCache.set(cacheKey, filteredRoutePaths);

    return filteredRoutePaths;
  }

  getOptimizedRoutesByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    maxPools: number
  ): RoutePathWithAmount[] {
    if (!tokenIn.amount.isPositive()) {
      throw new Error("Token in amount is zero or negative");
    }

    let paths = this.getCandidatePaths(tokenIn.denom, tokenOutDenom, true);
    // TODO: if paths is single pool - confirm enough liquidity otherwise find different route
    if (paths.length === 0) {
      throw new NoPoolsError();
    }

    paths = paths.slice(0, maxPools);

    const initialSwapAmounts: Int[] = [];
    let totalLimitAmount = new Int(0);
    for (const path of paths) {
      const limitAmount = path.pools[0].getLimitAmountByTokenIn(tokenIn.denom);

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

    // No enough liquidity
    if (totalLimitAmount.lt(tokenIn.amount)) {
      throw new NotEnoughLiquidityError();
    }

    // TODO: ...

    return initialSwapAmounts.map((amount, i) => {
      return {
        ...paths[i],
        amount,
      };
    });
  }

  calculateTokenOutByTokenIn(paths: RoutePathWithAmount[]): {
    amount: Int;
    beforeSpotPriceInOverOut: Dec;
    beforeSpotPriceOutOverIn: Dec;
    afterSpotPriceInOverOut: Dec;
    afterSpotPriceOutOverIn: Dec;
    effectivePriceInOverOut: Dec;
    effectivePriceOutOverIn: Dec;
    tokenInFeeAmount: Int;
    swapFee: Dec;
    slippage: Dec;
  } {
    if (paths.length === 0) {
      throw new Error("Paths are empty");
    }

    let totalOutAmount: Int = new Int(0);
    let totalBeforeSpotPriceInOverOut: Dec = new Dec(0);
    let totalAfterSpotPriceInOverOut: Dec = new Dec(0);
    let totalEffectivePriceInOverOut: Dec = new Dec(0);
    let totalSwapFee: Dec = new Dec(0);

    let sumAmount = new Int(0);
    for (const path of paths) {
      sumAmount = sumAmount.add(path.amount);
    }

    let outDenom: string | undefined;
    for (const path of paths) {
      if (
        path.pools.length !== path.tokenOutDenoms.length ||
        path.pools.length === 0
      ) {
        throw new Error("Invalid path");
      }

      if (!outDenom) {
        outDenom = path.tokenOutDenoms[path.tokenOutDenoms.length - 1];
      } else if (
        outDenom !== path.tokenOutDenoms[path.tokenOutDenoms.length - 1]
      ) {
        throw new Error("Paths have different out denom");
      }

      const amountFraction = path.amount.toDec().quoTruncate(sumAmount.toDec());

      let previousInDenom = path.tokenInDenom;
      let previousInAmount = path.amount;

      let beforeSpotPriceInOverOut: Dec = new Dec(1);
      let afterSpotPriceInOverOut: Dec = new Dec(1);
      let effectivePriceInOverOut: Dec = new Dec(1);
      let swapFee: Dec = new Dec(0);

      for (let i = 0; i < path.pools.length; i++) {
        const pool = path.pools[i];
        const outDenom = path.tokenOutDenoms[i];

        // less fee
        const tokenOut = pool.getTokenOutByTokenIn(
          { denom: previousInDenom, amount: previousInAmount },
          outDenom
        );

        if (!tokenOut.amount.gt(new Int(0))) {
          // not enough liquidity
          console.warn("Token out is 0 through pool: ", pool.id);
          return {
            ...tokenOut,
            tokenInFeeAmount: new Int(0),
            swapFee: pool.swapFee,
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
        swapFee = swapFee.add(
          new Dec(1).sub(swapFee).mulTruncate(pool.swapFee)
        );

        if (i === path.pools.length - 1) {
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
    }

    const slippage = totalEffectivePriceInOverOut
      .quo(totalBeforeSpotPriceInOverOut)
      .sub(new Dec("1"));

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
      slippage,
    };
  }
}
