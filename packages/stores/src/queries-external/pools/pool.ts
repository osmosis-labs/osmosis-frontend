import { KVStore } from "@keplr-wallet/common";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import { ChainGetter, QueryResponse } from "@osmosis-labs/keplr-stores";
import { BigDec, StableSwapMath, WeightedPoolMath } from "@osmosis-labs/math";
import {
  CONCENTRATED_LIQ_POOL_TYPE,
  COSMWASM_POOL_TYPE,
  STABLE_POOL_TYPE,
  WEIGHTED_POOL_TYPE,
} from "@osmosis-labs/server";
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@osmosis-labs/unit";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { ObservableQueryExternalBase } from "../base";
import { ALLOYED_POOL_CODE_IDS_MAINNET, PoolRaw, PoolType } from "./types";

/** Query store that can refresh an individual pool's data from the node.
 *  Converts the common fields of the raw pool data into more useful types, such as prettified types for display.
 */
export class ObservableQueryPool extends ObservableQueryExternalBase<{
  pool: PoolRaw;
}> {
  /** Observe any new references resulting from pool or pools query. */
  @observable.ref
  protected raw: PoolRaw;

  @computed
  get poolAssetDenoms() {
    if ("pool_assets" in this.raw) {
      return this.raw.pool_assets.map((asset) => asset.token.denom);
    }
    if ("pool_liquidity" in this.raw) {
      return this.raw.pool_liquidity.map((asset) => asset.denom);
    }
    if ("token0" in this.raw && "token1" in this.raw) {
      return [this.raw.token0, this.raw.token1];
    }
    if (this.raw["@type"] === COSMWASM_POOL_TYPE) {
      return (this.raw.tokens ?? []).map(({ denom }) => denom);
    }
    return [];
  }

  @computed
  get type(): PoolType {
    return getPoolType(this.raw, this.alloyedCodeIds);
  }

  get sharePool():
    | {
        totalShare: Int;
        shareDenom: string;
        poolAssets: { denom: string; amount: Int }[];
        swapFee: Dec;
        exitFee: Dec;
      }
    | undefined {
    if (this.type !== "weighted" && this.type !== "stable") {
      return;
    }

    if (!("total_shares" in this.raw)) {
      return;
    }

    return {
      totalShare: new Int(this.raw.total_shares.amount),
      shareDenom: this.raw.total_shares.denom,
      poolAssets: this.sharePoolAssets,
      swapFee: this.swapFeeDec,
      exitFee: this.exitFeeDec,
    };
  }

  /** Info specific to and relevant if is stableswap pool. */
  @computed
  get stableSwapInfo() {
    if (this.raw["@type"] !== STABLE_POOL_TYPE) {
      return;
    }

    const { id, pool_liquidity, scaling_factors } = this.raw;
    const assets = pool_liquidity.map((asset, index) => {
      const scalingFactor = parseInt(scaling_factors[index]);
      if (isNaN(scalingFactor))
        throw new Error(`Invalid scaling factor in pool id: ${id}`);

      const amount = new Int(asset.amount);
      return {
        denom: asset.denom,
        amount,
        scalingFactor,
        amountScaled: amount.toDec().quo(new Dec(scalingFactor)),
      };
    });

    return {
      scalingFactorController: this.raw.scaling_factor_controller,
      scalingFactor: this.raw.scaling_factors,
      assets,
    };
  }

  /** Info specific to and relevant if is weighted/balancer pool. */
  @computed
  get weightedPoolInfo() {
    if (this.raw["@type"] !== WEIGHTED_POOL_TYPE) {
      return;
    }

    const totalWeight = new Int(this.raw.total_weight);
    return {
      assets: this.raw.pool_assets.map(({ token, weight }) => {
        const weightInt = new Int(weight);
        return {
          denom: token.denom,
          amount: new Int(token.amount),
          weight: new IntPretty(weightInt),
          weightFraction: new RatePretty(
            weightInt.toDec().quoTruncate(totalWeight.toDec())
          ),
        };
      }),
      totalWeight: new IntPretty(totalWeight),
      smoothWeightChange: this.rawSmoothWeightChange,
    };
  }

  @computed
  get concentratedLiquidityPoolInfo() {
    if (this.raw["@type"] !== CONCENTRATED_LIQ_POOL_TYPE) {
      return;
    }

    // adjust decimals based on currency decimals
    const multiplicationQuoteOverBase = DecUtils.getTenExponentN(
      (this.poolAssets[0]?.amount.currency.coinDecimals ?? 0) -
        (this.poolAssets[1]?.amount.currency.coinDecimals ?? 0)
    );

    const currentSqrtPrice = new BigDec(this.raw.current_sqrt_price);
    const tickSpacing = parseInt(this.raw.tick_spacing);
    if (isNaN(tickSpacing)) {
      throw new Error(
        `Invalid tick spacing in pool id: ${this.raw.id}, tick spacing: ${this.raw.tick_spacing}`
      );
    }
    const exponentAtPriceOne = parseInt(this.raw.exponent_at_price_one);
    if (isNaN(exponentAtPriceOne)) {
      throw new Error(
        `Invalid exponent at price one in pool id: ${this.raw.id}, factor: ${this.raw.exponent_at_price_one}`
      );
    }

    return {
      currentSqrtPrice,
      currentPrice: currentSqrtPrice
        .mul(currentSqrtPrice)
        .toDec()
        .mul(multiplicationQuoteOverBase),
      multiplicationQuoteOverBase,
      currentTickLiquidity: new Dec(this.raw.current_tick_liquidity),
      tickSpacing,
      exponentAtPriceOne,
    };
  }

  @computed
  get id(): string {
    return "pool_id" in this.raw ? this.raw.pool_id : this.raw.id;
  }

  @computed
  get swapFee(): RatePretty {
    return new RatePretty(this.swapFeeDec);
  }

  @computed
  get exitFee(): RatePretty {
    return new RatePretty(this.exitFeeDec);
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
    if (this.type === "concentrated") {
      console.warn(
        "Share currency not available for concentrated liquidity pool ID: ",
        this.id
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
        this.id
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
    const params = this.rawSmoothWeightChange;
    if (this.type !== "weighted" || !params) return;

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

    if (this.raw["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
      const osmosisChain = this.chainGetter.getChain(this.chainId);
      const token0Currency = osmosisChain.forceFindCurrency(this.raw.token0);
      const token1Currency = osmosisChain.forceFindCurrency(this.raw.token1);

      return [
        {
          amount: new CoinPretty(
            token0Currency,
            new Int(this.raw.token0Amount ?? "0")
          ),
        },
        {
          amount: new CoinPretty(
            token1Currency,
            new Int(this.raw.token1Amount ?? "0")
          ),
        },
      ];
    }

    if (this.raw["@type"] === COSMWASM_POOL_TYPE && this.raw.tokens) {
      return this.raw.tokens.map((asset) => {
        const currency = this.chainGetter
          .getChain(this.chainId)
          .forceFindCurrency(asset.denom);

        return {
          amount: new CoinPretty(currency, new Int(asset.amount)),
        };
      });
    }

    console.warn("No pool assets available for pool", this.id);
    return [];
  }

  constructor(
    readonly kvStore: KVStore,
    readonly chainId: string,
    readonly baseUrl: string,
    readonly chainGetter: ChainGetter,
    raw: PoolRaw,
    readonly alloyedCodeIds: string[] = ALLOYED_POOL_CODE_IDS_MAINNET
  ) {
    super(
      kvStore,
      baseUrl,
      `/api/pools/${"pool_id" in raw ? raw.pool_id : raw.id}`
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

  readonly hasPoolAsset = computedFn((coinMinimalDenom: string) => {
    return this.poolAssets.some(
      (asset) => asset.amount.currency.coinMinimalDenom === coinMinimalDenom
    );
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
      this.spotPriceOutOverIn(tokenInDenom, tokenOutDenom, true).mulTruncate(
        multiplication
      )
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
      this.spotPriceInOverOut(tokenInDenom, tokenOutDenom, false).mulTruncate(
        multiplication
      )
    );
  });

  readonly getSpotPriceOutOverInWithoutSwapFee: (
    tokenInDenom: string,
    tokenOutDenom: string
  ) => IntPretty = computedFn((tokenInDenom: string, tokenOutDenom: string) => {
    const chainInfo = this.chainGetter.getChain(this.chainId);

    const multiplication = DecUtils.getTenExponentN(
      chainInfo.forceFindCurrency(tokenInDenom).coinDecimals -
        chainInfo.forceFindCurrency(tokenOutDenom).coinDecimals
    );

    return new IntPretty(
      this.spotPriceOutOverIn(tokenInDenom, tokenOutDenom, false).mulTruncate(
        multiplication
      )
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

  // TODO: Improve performance, to do so, we should in sequence try:
  // - add a += op to Dec
  // - Make priceStore.calculatePrice return something in the form of a Dec
  // - Try changing the Dec usage to Number (float) in the codebase
  // - Make a priceStore function to calculate result in float
  readonly computeTotalValueLocked = computedFn((priceStore: IPriceStore) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const fiatCurrency = priceStore.getFiatCurrency(
      priceStore.defaultVsCurrency
    )!;
    let mutPrice = new Dec(0);
    for (const poolAsset of this.poolAssets) {
      // TODO: Get this into a dec to begin with
      const poolPrice = priceStore.calculatePrice(
        poolAsset.amount,
        fiatCurrency.currency
      );
      if (poolPrice) {
        // TODO Get this into a += op to begin with. Were wasting heap.
        // TODO (Later refactor), stay in floats all the way through.
        mutPrice = mutPrice.add(poolPrice.toDec());
      }
    }

    return new PricePretty(fiatCurrency, mutPrice);
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

  /** Async & static fetch and construct a new query pool using the individual pool query. */
  static async makeWithoutRaw(
    poolId: string,
    ...[
      kvStore,
      chainId,
      baseUrl,
      chainGetter,
      _raw,
      alloyedCodeIds,
    ]: ConstructorParameters<typeof ObservableQueryPool>
  ): Promise<ObservableQueryPool> {
    try {
      // fetch pool
      const response = await fetch(baseUrl + `/pool/${poolId}`);
      const data = (await response.json()) as { pool: PoolRaw };
      if (!response.ok) {
        throw new Error();
      }

      if (!isSupportedPool(data.pool)) {
        throw new Error("Individual pool not supported");
      }

      // construct resulting pool
      return new ObservableQueryPool(
        kvStore,
        chainId,
        baseUrl,
        chainGetter,
        data.pool,
        alloyedCodeIds
      );
    } catch {
      throw new Error("not-found");
    }
  }

  /** Add any currencies found within pool data to the registry. */
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
    } else if (raw["@type"] === COSMWASM_POOL_TYPE && raw.tokens) {
      denomsInPool.push(...raw.tokens.map(({ denom }) => denom));
    }

    chainInfo.addUnknownCurrencies(...denomsInPool);
  }

  protected get swapFeeDec(): Dec {
    if ("pool_params" in this.raw) {
      return new Dec(this.raw.pool_params.swap_fee);
    }
    if ("spread_factor" in this.raw) {
      return new Dec(this.raw.spread_factor);
    }
    return new Dec(0);
  }

  protected get exitFeeDec(): Dec {
    if ("pool_params" in this.raw) {
      return new Dec(this.raw.pool_params.exit_fee);
    }
    return new Dec(0);
  }

  protected get sharePoolAssets(): { denom: string; amount: Int }[] {
    if ("pool_assets" in this.raw) {
      return this.raw.pool_assets.map((asset) => ({
        denom: asset.token.denom,
        amount: new Int(asset.token.amount),
      }));
    }
    if ("pool_liquidity" in this.raw) {
      return this.raw.pool_liquidity.map((asset) => ({
        denom: asset.denom,
        amount: new Int(asset.amount),
      }));
    }
    return [];
  }

  protected get rawSmoothWeightChange() {
    if (this.raw["@type"] !== WEIGHTED_POOL_TYPE) {
      return;
    }

    const params = this.raw.pool_params.smooth_weight_change_params;
    if (params == null) {
      return;
    }

    const { start_time, duration, initial_pool_weights, target_pool_weights } =
      params;
    return {
      startTime: start_time,
      duration,
      initialPoolWeights: initial_pool_weights,
      targetPoolWeights: target_pool_weights,
    };
  }

  protected spotPriceInOverOut(
    tokenInDenom: string,
    tokenOutDenom: string,
    includeSwapFee: boolean
  ): Dec {
    this.assertPoolAssets(tokenInDenom, tokenOutDenom);

    if (this.raw["@type"] === WEIGHTED_POOL_TYPE) {
      const inPoolAsset = this.raw.pool_assets.find(
        (asset) => asset.token.denom === tokenInDenom
      );
      const outPoolAsset = this.raw.pool_assets.find(
        (asset) => asset.token.denom === tokenOutDenom
      );
      if (!inPoolAsset || !outPoolAsset) {
        throw new Error(
          `Pool ${this.id} doesn't have the pool asset for ${tokenInDenom}, ${tokenOutDenom}`
        );
      }

      return WeightedPoolMath.calcSpotPrice(
        new Dec(inPoolAsset.token.amount),
        new Dec(inPoolAsset.weight),
        new Dec(outPoolAsset.token.amount),
        new Dec(outPoolAsset.weight),
        includeSwapFee ? this.swapFeeDec : new Dec(0)
      );
    }

    if (this.raw["@type"] === STABLE_POOL_TYPE) {
      const { pool_liquidity, scaling_factors } = this.raw;
      return StableSwapMath.calcSpotPrice(
        pool_liquidity.map((asset, index) => {
          const scalingFactor = parseInt(scaling_factors[index]);
          if (isNaN(scalingFactor)) throw new Error("Invalid scaling factor");
          return {
            denom: asset.denom,
            amount: new Dec(asset.amount),
            scalingFactor,
          };
        }),
        tokenInDenom,
        tokenOutDenom
      );
    }

    if (this.raw["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
      return this.clSpotPrice(tokenOutDenom);
    }

    if (this.type === "transmuter" || this.type === "alloyed") {
      return new Dec(1);
    }

    throw new Error(`Spot price not available for pool ${this.id}`);
  }

  protected spotPriceOutOverIn(
    tokenInDenom: string,
    tokenOutDenom: string,
    includeSwapFee: boolean
  ): Dec {
    this.assertPoolAssets(tokenInDenom, tokenOutDenom);

    if (this.raw["@type"] === CONCENTRATED_LIQ_POOL_TYPE) {
      return this.clSpotPrice(tokenInDenom);
    }

    if (this.type === "transmuter" || this.type === "alloyed") {
      return new Dec(1);
    }

    return new Dec(1).quoTruncate(
      this.spotPriceInOverOut(tokenInDenom, tokenOutDenom, includeSwapFee)
    );
  }

  protected clSpotPrice(baseDenom: string): Dec {
    if (this.raw["@type"] !== CONCENTRATED_LIQ_POOL_TYPE) {
      throw new Error(`Pool ${this.id} is not concentrated`);
    }

    const sqrtPrice = new Dec(this.raw.current_sqrt_price);
    if (baseDenom === this.raw.token0) {
      return sqrtPrice.pow(new Int(2));
    }
    return new Dec(1).quo(sqrtPrice.pow(new Int(2)));
  }

  protected assertPoolAssets(...tokenDenoms: string[]) {
    const uniqueSet = new Set(tokenDenoms);
    if (uniqueSet.size !== tokenDenoms.length) {
      throw new Error(`Duplicate denoms`);
    }

    if (!tokenDenoms.every((denom) => this.poolAssetDenoms.includes(denom))) {
      throw new Error(
        `Pool ${this.id} doesn't have the pool asset for ${tokenDenoms.join(
          ", "
        )}`
      );
    }
  }
}

export function isSupportedPool(
  poolRaw: PoolRaw,
  poolIdBlacklist: string[] = [],
  transmuterCodeIds: string[] = [],
  alloyedCodeIds: string[] = []
) {
  const allSupportedCosmwasmCodeIds = [...transmuterCodeIds, ...alloyedCodeIds];
  const poolId = "pool_id" in poolRaw ? poolRaw.pool_id : poolRaw.id;
  return (
    (poolRaw["@type"] === STABLE_POOL_TYPE ||
      poolRaw["@type"] === WEIGHTED_POOL_TYPE ||
      poolRaw["@type"] === CONCENTRATED_LIQ_POOL_TYPE ||
      (poolRaw["@type"] === COSMWASM_POOL_TYPE &&
        "code_id" in poolRaw &&
        allSupportedCosmwasmCodeIds.includes(poolRaw.code_id))) &&
    !poolIdBlacklist.includes(poolId)
  );
}

function getPoolType(raw: PoolRaw, alloyedCodeIds: string[]): PoolType {
  if (raw["@type"] === STABLE_POOL_TYPE) return "stable";
  if (raw["@type"] === WEIGHTED_POOL_TYPE) return "weighted";
  if (raw["@type"] === CONCENTRATED_LIQ_POOL_TYPE) return "concentrated";
  if (raw["@type"] === COSMWASM_POOL_TYPE) {
    if ("code_id" in raw && alloyedCodeIds.includes(raw.code_id)) {
      return "alloyed";
    }
    return "transmuter";
  }
  return "cosmwasm";
}
