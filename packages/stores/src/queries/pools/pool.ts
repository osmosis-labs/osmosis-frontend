import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  QueryResponse,
} from "@keplr-wallet/stores";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import {
  ConcentratedLiquidityPool,
  ConcentratedLiquidityPoolRaw,
  RoutablePool,
  SharePool,
  StablePool,
  StablePoolRaw,
  WeightedPool,
  WeightedPoolRaw,
} from "@osmosis-labs/pools";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";
import { IPriceStore } from "src/price";

import { Head } from "./types";

export type PoolRaw =
  | WeightedPoolRaw
  | StablePoolRaw
  | ConcentratedLiquidityPoolRaw;

const STABLE_POOL_TYPE = "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool";
const WEIGHTED_POOL_TYPE = "/osmosis.gamm.v1beta1.Pool";
const CONCENTRATED_LIQ_POOL_TYPE =
  "/osmosis.concentratedliquidity.v1beta1.Pool";

/** Query store that can refresh an individual pool's data from the node.
 *  Uses a few different concrete classes to represent the different types of pools.
 *  Converts the common fields of the raw pool data into more useful types, such as prettified types for display.
 */
export class ObservableQueryPool extends ObservableChainQuery<{
  pool: PoolRaw;
}> {
  /** Observe any new references resulting from pool or pools query. */
  @observable.ref
  protected raw: PoolRaw;

  protected static makeEndpointUrl(poolId: string) {
    return `/osmosis/poolmanager/v1beta1/pools/${poolId}`;
  }

  constructor(
    readonly kvStore: KVStore,
    chainId: string,
    readonly chainGetter: ChainGetter,
    raw: PoolRaw
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      ObservableQueryPool.makeEndpointUrl(raw.id)
    );

    ObservableQueryPool.addUnknownCurrencies(raw, chainGetter, chainId);
    this.raw = raw;

    makeObservable(this);
  }

  static makeWithoutRaw(
    poolId: string,
    ...[kvStore, chainId, chainGetter]: Head<
      ConstructorParameters<typeof ObservableQueryPool>
    >
  ): Promise<ObservableQueryPool> {
    return new Promise((resolve, reject) => {
      let lcdUrl = chainGetter.getChain(chainId).rest;
      if (lcdUrl.endsWith("/")) lcdUrl = lcdUrl.slice(0, lcdUrl.length - 1);
      const endpoint = ObservableQueryPool.makeEndpointUrl(poolId);
      fetch(lcdUrl + endpoint)
        .then((response) => {
          response
            .json()
            .then((data) => {
              if (response.ok) {
                resolve(
                  new ObservableQueryPool(
                    kvStore,
                    chainId,
                    chainGetter,
                    data.pool
                  )
                );
              } else {
                reject("not-found");
              }
            })
            .catch(reject);
        })
        .catch(reject);
    });
  }

  protected setResponse(
    response: Readonly<
      QueryResponse<{
        pool: PoolRaw;
      }>
    >
  ) {
    super.setResponse(response);

    this.setRaw(response.data.pool);
  }

  protected static addUnknownCurrencies(
    raw: PoolRaw,
    chainGetter: ChainGetter,
    chainId: string
  ) {
    const chainInfo = chainGetter.getChain(chainId);
    const denomsInPool: string[] = [];
    // Try to register the Denom of Asset in the Pool in Response.(For IBC tokens)
    if ("pool_assets" in raw) {
      // weighted pool
      for (const asset of raw.pool_assets) {
        denomsInPool.push(asset.token.denom);
      }
    } else if ("pool_liquidity" in raw) {
      // stable pool
      for (const asset of raw.pool_liquidity) {
        denomsInPool.push(asset.denom);
      }
    } else if ("token0" in raw && "token1" in raw) {
      // concentrated liquidity pool
      denomsInPool.push(raw.token0);
      denomsInPool.push(raw.token1);
    }

    chainInfo.addUnknownCurrencies(...denomsInPool);
  }

  @action
  setRaw(raw: PoolRaw) {
    ObservableQueryPool.addUnknownCurrencies(
      raw,
      this.chainGetter,
      this.chainId
    );

    this.raw = raw;
  }

  @computed
  get pool(): RoutablePool {
    if (this.raw["@type"] === STABLE_POOL_TYPE) {
      return new StablePool(this.raw as StablePoolRaw);
    }
    if (this.raw["@type"] === WEIGHTED_POOL_TYPE) {
      return new WeightedPool(this.raw as WeightedPoolRaw);
    }
    if (this.raw["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
      return new ConcentratedLiquidityPool(
        this.raw as ConcentratedLiquidityPoolRaw
      );
    }

    throw new Error("Raw type not recognized");
  }

  get sharePool(): SharePool | undefined {
    if (this.pool instanceof WeightedPool || this.pool instanceof StablePool) {
      return this.pool;
    }
  }

  /** Info specific to and relevant if is stableswap pool. */
  @computed
  get stableSwapInfo() {
    if (this.pool instanceof StablePool) {
      return {
        scalingFactorController: this.pool.raw.scaling_factor_controller,
        scalingFactor: this.pool.raw.scaling_factors,
        assets: this.pool.poolAssets.map((asset) => ({
          ...asset,
          amountScaled: asset.amount.toDec().quo(new Dec(asset.scalingFactor)),
        })),
      };
    }
  }

  /** Info specific to and relevant if is weighted/balancer pool. */
  @computed
  get weightedPoolInfo() {
    if (this.pool instanceof WeightedPool) {
      return {
        assets: this.pool.poolAssets.map(({ denom, amount, weight }) => ({
          denom,
          amount,
          weight: new IntPretty(weight),
          weightFraction: new RatePretty(
            weight
              .toDec()
              .quoTruncate((this.pool as WeightedPool).totalWeight.toDec())
          ),
        })),
        totalWeight: new IntPretty(this.pool.totalWeight),
        smoothWeightChange: this.pool.smoothWeightChange,
      };
    }
  }

  @computed
  get concentratedLiquidityPoolInfo() {
    if (this.pool instanceof ConcentratedLiquidityPool) {
      return {
        currentSqrtPrice: this.pool.currentSqrtPrice,
        currentTickLiquidity: this.pool.currentTickLiquidity,
        tickSpacing: this.pool.tickSpacing,
        precisionFactorAtPriceOne: this.pool.precisionFactorAtPriceOne,
      };
    }
  }

  @computed
  get type(): "weighted" | "stable" | "concentrated" {
    return this.pool.type;
  }

  @computed
  get id(): string {
    return this.pool.id;
  }

  @computed
  get swapFee(): RatePretty {
    return new RatePretty(this.pool.swapFee);
  }

  @computed
  get exitFee(): RatePretty {
    return new RatePretty(this.pool.exitFee);
  }

  /** Only relevant to SharePool types. */
  @computed
  get shareDenom(): string {
    if (!this.sharePool) {
      throw new Error("Not a share pool");
    }

    return this.sharePool.shareDenom;
  }

  /** Only relevant to SharePool types. */
  @computed
  get shareCurrency(): Currency {
    if (this.pool instanceof ConcentratedLiquidityPool) {
      throw new Error("Not a share pool");
    }

    return {
      coinDenom: `GAMM/${this.id}`,
      coinMinimalDenom: this.shareDenom,
      // Share can only have the 18 decimals.
      coinDecimals: 18,
    };
  }

  /** Only relevant to SharePool types. */
  @computed
  get totalShare(): CoinPretty {
    if (!this.sharePool) {
      throw new Error("Not a share pool");
    }

    return new CoinPretty(this.shareCurrency, this.sharePool.totalShare);
  }

  /** Only relevant to weighted pools. */
  @computed
  get smoothWeightChange():
    | {
        startTime: Date;
        endTime: Date;
        duration: Duration;
        initialPoolWeights: {
          currency: AppCurrency;
          weight: IntPretty;
          ratio: IntPretty;
        }[];
        targetPoolWeights: {
          currency: AppCurrency;
          weight: IntPretty;
          ratio: IntPretty;
        }[];
      }
    | undefined {
    if (
      !(this.pool instanceof WeightedPool) ||
      !(this.pool as WeightedPool).smoothWeightChange
    )
      return;

    const params = (this.pool as WeightedPool).smoothWeightChange;

    if (!params) return;

    const startTime = new Date(params.startTime);
    const duration = dayjs.duration(
      parseInt(params.duration.replace("s", "")) * 1000
    );
    const endTime = dayjs(startTime).add(duration).toDate();

    let totalInitialPoolWeight = new Dec(0);
    for (const weight of params.initialPoolWeights) {
      totalInitialPoolWeight = totalInitialPoolWeight.add(
        new Dec(weight.weight)
      );
    }
    const initialPoolWeights = params.initialPoolWeights.map((weight) => {
      return {
        currency: this.chainGetter
          .getChain(this.chainId)
          .forceFindCurrency(weight.token.denom),
        weight: new IntPretty(new Dec(weight.weight)),
        ratio: new IntPretty(new Dec(weight.weight))
          .quo(totalInitialPoolWeight)
          .moveDecimalPointRight(2),
      };
    });

    let totalTargetPoolWeight = new Dec(0);
    for (const weight of params.targetPoolWeights) {
      totalTargetPoolWeight = totalTargetPoolWeight.add(new Dec(weight.weight));
    }
    const targetPoolWeights = params.targetPoolWeights.map((weight) => {
      return {
        currency: this.chainGetter
          .getChain(this.chainId)
          .forceFindCurrency(weight.token.denom),
        weight: new IntPretty(new Dec(weight.weight)),
        ratio: new IntPretty(new Dec(weight.weight))
          .quo(totalTargetPoolWeight)
          .moveDecimalPointRight(2),
      };
    });

    return {
      startTime,
      endTime,
      duration,
      initialPoolWeights,
      targetPoolWeights,
    };
  }

  @computed
  get poolAssets(): {
    amount: CoinPretty;
  }[] {
    return this.pool.poolAssets.map((asset) => {
      const currency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(asset.denom);

      return {
        amount: new CoinPretty(currency, asset.amount),
      };
    });
  }

  readonly getPoolAsset: (denom: string) => {
    amount: CoinPretty;
  } = computedFn((denom: string) => {
    const asset = this.poolAssets.find(
      (asset) => asset.amount.currency.coinMinimalDenom === denom
    );

    if (!asset) {
      throw new Error(
        `Pool ${this.id} doesn't have the pool asset for ${denom}`
      );
    }

    return asset;
  });

  readonly getSpotPriceOutOverIn: (
    tokenInDenom: string,
    tokenOutDenom: string
  ) => IntPretty = computedFn((tokenInDenom: string, tokenOutDenom: string) => {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const multiplication = DecUtils.getTenExponentN(
      chainInfo.forceFindCurrency(tokenInDenom).coinDecimals -
        chainInfo.forceFindCurrency(tokenOutDenom).coinDecimals
    );

    return new IntPretty(
      this.pool
        .getSpotPriceOutOverIn(tokenInDenom, tokenOutDenom)
        .mulTruncate(multiplication)
    );
  });

  readonly getSpotPriceInOverOutWithoutSwapFee: (
    tokenInDenom: string,
    tokenOutDenom: string
  ) => IntPretty = computedFn((tokenInDenom: string, tokenOutDenom: string) => {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const multiplication = DecUtils.getTenExponentN(
      chainInfo.forceFindCurrency(tokenOutDenom).coinDecimals -
        chainInfo.forceFindCurrency(tokenInDenom).coinDecimals
    );

    return new IntPretty(
      this.pool
        .getSpotPriceInOverOutWithoutSwapFee(tokenInDenom, tokenOutDenom)
        .mulTruncate(multiplication)
    );
  });

  getSpotPriceOutOverInWithoutSwapFee: (
    tokenInDenom: string,
    tokenOutDenom: string
  ) => IntPretty = computedFn((tokenInDenom: string, tokenOutDenom: string) => {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const multiplication = DecUtils.getTenExponentN(
      chainInfo.forceFindCurrency(tokenInDenom).coinDecimals -
        chainInfo.forceFindCurrency(tokenOutDenom).coinDecimals
    );

    return new IntPretty(
      this.pool
        .getSpotPriceOutOverInWithoutSwapFee(tokenInDenom, tokenOutDenom)
        .mulTruncate(multiplication)
    );
  });

  getTokenOutByTokenIn(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string
  ): {
    amount: CoinPretty;
    afterSpotPriceInOverOut: IntPretty;
    afterSpotPriceOutOverIn: IntPretty;
    effectivePriceInOverOut: IntPretty;
    effectivePriceOutOverIn: IntPretty;
    priceImpact: RatePretty;
  } {
    return this.getTokenOutByTokenInComputedFn(
      tokenIn.denom,
      tokenIn.amount.toString(),
      tokenOutDenom
    );
  }

  /*
   Unfortunately, if reference is included in args,
   there is no guarantee that computed will memorize the result well, so to reduce this problem,
   create an internal function that accepts only primitive types as args.
   */
  protected readonly getTokenOutByTokenInComputedFn: (
    tokenInDenom: string,
    tokenInAmount: string,
    tokenOutDenom: string
  ) => {
    amount: CoinPretty;
    afterSpotPriceInOverOut: IntPretty;
    afterSpotPriceOutOverIn: IntPretty;
    effectivePriceInOverOut: IntPretty;
    effectivePriceOutOverIn: IntPretty;
    priceImpact: RatePretty;
  } = computedFn(
    (tokenInDenom: string, tokenInAmount: string, tokenOutDenom: string) => {
      const result = this.pool.getTokenOutByTokenIn(
        {
          denom: tokenInDenom,
          amount: new Int(tokenInAmount),
        },
        tokenOutDenom
      );

      const chainInfo = this.chainGetter.getChain(this.chainId);
      const outCurrency = chainInfo.forceFindCurrency(tokenOutDenom);

      const spotPriceInOverOutMul = DecUtils.getTenExponentN(
        outCurrency.coinDecimals -
          chainInfo.forceFindCurrency(tokenInDenom).coinDecimals
      );

      return {
        amount: new CoinPretty(outCurrency, result.amount),
        afterSpotPriceInOverOut: new IntPretty(
          result.afterSpotPriceInOverOut.mulTruncate(spotPriceInOverOutMul)
        ),
        afterSpotPriceOutOverIn: new IntPretty(
          result.afterSpotPriceOutOverIn.quoTruncate(spotPriceInOverOutMul)
        ),
        effectivePriceInOverOut: new IntPretty(
          result.effectivePriceInOverOut.mulTruncate(spotPriceInOverOutMul)
        ),
        effectivePriceOutOverIn: new IntPretty(
          result.effectivePriceOutOverIn.quoTruncate(spotPriceInOverOutMul)
        ),
        priceImpact: new RatePretty(result.priceImpact),
      };
    }
  );

  getTokenInByTokenOut(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string
  ): {
    amount: CoinPretty;
    afterSpotPriceInOverOut: IntPretty;
    afterSpotPriceOutOverIn: IntPretty;
    effectivePriceInOverOut: IntPretty;
    effectivePriceOutOverIn: IntPretty;
    priceImpact: RatePretty;
  } {
    return this.getTokenInByTokenOutComputedFn(
      tokenOut.denom,
      tokenOut.amount.toString(),
      tokenInDenom
    );
  }

  protected readonly getTokenInByTokenOutComputedFn: (
    tokenOutDenom: string,
    tokenOutAmount: string,
    tokenInDenom: string
  ) => {
    amount: CoinPretty;
    afterSpotPriceInOverOut: IntPretty;
    afterSpotPriceOutOverIn: IntPretty;
    effectivePriceInOverOut: IntPretty;
    effectivePriceOutOverIn: IntPretty;
    priceImpact: RatePretty;
  } = computedFn(
    (tokenOutDenom: string, tokenOutAmount: string, tokenInDenom: string) => {
      const result = this.pool.getTokenOutByTokenIn(
        {
          denom: tokenOutDenom,
          amount: new Int(tokenOutAmount),
        },
        tokenInDenom
      );

      const chainInfo = this.chainGetter.getChain(this.chainId);
      const inCurrency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(tokenInDenom);

      const spotPriceInOverOutMul = DecUtils.getTenExponentN(
        chainInfo.forceFindCurrency(tokenOutDenom).coinDecimals -
          inCurrency.coinDecimals
      );

      return {
        amount: new CoinPretty(inCurrency, result.amount),
        afterSpotPriceInOverOut: new IntPretty(
          result.afterSpotPriceInOverOut.mulTruncate(spotPriceInOverOutMul)
        ),
        afterSpotPriceOutOverIn: new IntPretty(
          result.afterSpotPriceOutOverIn.quoTruncate(spotPriceInOverOutMul)
        ),
        effectivePriceInOverOut: new IntPretty(
          result.effectivePriceInOverOut.mulTruncate(spotPriceInOverOutMul)
        ),
        effectivePriceOutOverIn: new IntPretty(
          result.effectivePriceOutOverIn.quoTruncate(spotPriceInOverOutMul)
        ),
        priceImpact: new RatePretty(result.priceImpact),
      };
    }
  );

  readonly computeTotalValueLocked = computedFn((priceStore: IPriceStore) => {
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    )!;
    let price = new PricePretty(fiatCurrency, 0);

    for (const poolAsset of this.poolAssets) {
      const poolPrice = priceStore.calculatePrice(
        poolAsset.amount,
        fiatCurrency.currency
      );
      if (poolPrice) {
        price = price.add(poolPrice);
      }
    }

    return price;
  });
}
