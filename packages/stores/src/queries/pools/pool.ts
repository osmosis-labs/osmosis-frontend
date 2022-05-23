import {
  ChainGetter,
  ObservableChainQuery,
  QueryResponse,
} from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { Currency } from "@keplr-wallet/types";
import {
  CoinPretty,
  DecUtils,
  Int,
  IntPretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";
import { Pool, WeightedPool, WeightedPoolRaw } from "@osmosis-labs/pools";
import { action, computed, makeObservable, observable } from "mobx";
import { computedFn } from "mobx-utils";
import { IPriceStore } from "src/price";

export class ObservableQueryPool extends ObservableChainQuery<{
  pool: WeightedPoolRaw;
}> {
  @observable.ref
  protected raw: WeightedPoolRaw;

  /** Constructed with the assumption that initial pool data has already been fetched
   *  using the `/pools` endpoint.
   **/
  // TODO: overload construction with only pool id
  constructor(
    readonly kvStore: KVStore,
    chainId: string,
    readonly chainGetter: ChainGetter,
    raw: WeightedPoolRaw
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/gamm/v1beta1/pools/${raw.id}`
    );

    this.raw = raw;

    makeObservable(this);
  }

  protected setResponse(
    response: Readonly<
      QueryResponse<{
        pool: WeightedPoolRaw;
      }>
    >
  ) {
    super.setResponse(response);

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const denomsInPool: string[] = [];
    // Try to register the Denom of Asset in the Pool in Response.(For IBC tokens)
    for (const asset of response.data.pool.poolAssets) {
      denomsInPool.push(asset.token.denom);
    }

    chainInfo.addUnknownCurrencies(...denomsInPool);
    this.setRaw(response.data.pool);
  }

  @action
  setRaw(raw: WeightedPoolRaw) {
    this.raw = raw;
  }

  @computed
  get pool(): Pool {
    return new WeightedPool(this.raw);
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

  @computed
  get shareDenom(): string {
    return this.pool.shareDenom;
  }

  @computed
  get shareCurrency(): Currency {
    return {
      coinDenom: `GAMM/${this.id}`,
      coinMinimalDenom: this.shareDenom,
      // Share can only have the 18 decimals.
      coinDecimals: 18,
    };
  }

  @computed
  get totalShare(): CoinPretty {
    return new CoinPretty(this.shareCurrency, this.pool.totalShare);
  }

  @computed
  get totalWeight(): IntPretty {
    return new IntPretty(this.pool.totalWeight);
  }

  @computed
  get poolAssets(): {
    amount: CoinPretty;
    weight: IntPretty;
    weightFraction: RatePretty;
  }[] {
    return this.pool.poolAssets.map((asset) => {
      const currency = this.chainGetter
        .getChain(this.chainId)
        .forceFindCurrency(asset.denom);

      return {
        amount: new CoinPretty(currency, asset.amount),
        weight: new IntPretty(asset.weight),
        weightFraction: new RatePretty(
          asset.weight.toDec().quoTruncate(this.pool.totalWeight.toDec())
        ),
      };
    });
  }

  readonly getPoolAsset: (denom: string) => {
    amount: CoinPretty;
    weight: IntPretty;
    weightFraction: RatePretty;
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

  readonly getSpotPriceInOverOut: (
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
        .getSpotPriceInOverOut(tokenInDenom, tokenOutDenom)
        .mulTruncate(multiplication)
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
    slippage: RatePretty;
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
    slippage: RatePretty;
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
        slippage: new RatePretty(result.slippage),
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
    slippage: RatePretty;
  } {
    return this.getTokenInByTokenOutComputedFn(
      tokenOut.denom,
      tokenOut.amount.toString(),
      tokenInDenom
    );
  }

  /*
   Unfortunately, if reference is included in args,
   there is no guarantee that computed will memorize the result well, so to reduce this problem,
   create an internal function that accepts only primitive types as args.
  */
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
    slippage: RatePretty;
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
        slippage: new RatePretty(result.slippage),
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
