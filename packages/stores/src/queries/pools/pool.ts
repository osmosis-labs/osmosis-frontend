import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableQueryBalances,
  QueryResponse,
} from "@keplr-wallet/stores";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import {
  BasePool,
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

import {
  ConcentratedLiquidityPoolAmountProvider,
  ObservableQueryLiquiditiesNetInDirection,
} from "../concentrated-liquidity";
import { Head } from "../utils";

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

  @computed
  get poolAssetDenoms() {
    return this.pool.poolAssetDenoms;
  }

  @computed
  get pool(): BasePool & RoutablePool {
    if (this.raw["@type"] === STABLE_POOL_TYPE) {
      return new StablePool(this.raw as StablePoolRaw);
    }
    if (this.raw["@type"] === WEIGHTED_POOL_TYPE) {
      return new WeightedPool(this.raw as WeightedPoolRaw);
    }
    if (this.raw["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
      const clRaw = this.raw as ConcentratedLiquidityPoolRaw;

      return new ConcentratedLiquidityPool(
        clRaw,
        this.queryLiquiditiesInNetDirection,
        new ConcentratedLiquidityPoolAmountProvider(clRaw, this.queryBalances)
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
  get swapFee(): Dec {
    return this.pool.swapFee;
  }

  @computed
  get exitFee(): Dec {
    return this.pool.exitFee;
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
      console.warn(
        "Share currency not available for concentrated liquidity pool ID: ",
        this.pool.id
      );

      return {
        coinDenom: "CLPOOL-ERR",
        coinMinimalDenom: "clpool-err",
        coinDecimals: 0,
      };
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
      console.warn(
        "Share currency not available for concentrated liquidity pool ID: ",
        this.pool.id
      );

      return new CoinPretty(this.shareCurrency, 0).ready(false);
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
    if (this.sharePool) {
      return this.sharePool.poolAssets.map((asset) => {
        const currency = this.chainGetter
          .getChain(this.chainId)
          .forceFindCurrency(asset.denom);

        return {
          amount: new CoinPretty(currency, asset.amount),
        };
      });
    }
    return [];
  }

  constructor(
    readonly kvStore: KVStore,
    chainId: string,
    readonly chainGetter: ChainGetter,
    readonly queryLiquiditiesInNetDirection: ObservableQueryLiquiditiesNetInDirection,
    readonly queryBalances: ObservableQueryBalances,
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

  readonly hasPoolAsset: (denom: string) => boolean = computedFn(
    (denom: string) => {
      return this.poolAssets.some(
        (asset) => asset.amount.currency.coinMinimalDenom === denom
      );
    }
  );

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

  @action
  setRaw(raw: PoolRaw) {
    ObservableQueryPool.addUnknownCurrencies(
      raw,
      this.chainGetter,
      this.chainId
    );

    this.raw = raw;
  }

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

  static makeWithoutRaw(
    poolId: string,
    ...[
      kvStore,
      chainId,
      chainGetter,
      queryLiquiditiesInNetDirection,
      queryBalances,
    ]: Head<ConstructorParameters<typeof ObservableQueryPool>>
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
                    queryLiquiditiesInNetDirection,
                    queryBalances,
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

  protected static makeEndpointUrl(poolId: string) {
    return `/osmosis/poolmanager/v1beta1/pools/${poolId}`;
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
}
