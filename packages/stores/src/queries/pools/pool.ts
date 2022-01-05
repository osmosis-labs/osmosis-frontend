import { Pool, WeightedPool, WeightedPoolRaw } from "@osmosis-labs/pools";
import { action, computed, makeObservable, observable } from "mobx";
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  IntPretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { Currency, FiatCurrency } from "@keplr-wallet/types";
import { ChainGetter } from "@keplr-wallet/stores";
import { computedFn } from "mobx-utils";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";

export class ObservablePool {
  @observable.ref
  protected raw: WeightedPoolRaw;

  constructor(
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    raw: WeightedPoolRaw
  ) {
    this.raw = raw;

    makeObservable(this);
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

  getMinTokenOutByTokenInWithSlippage(
    tokenIn: {
      denom: string;
      amount: Int;
    },
    tokenOutDenom: string,
    slippage: Dec
  ): {
    beforeSpotPriceInOverOut: IntPretty;
    beforeSpotPriceOutOverIn: IntPretty;
    minOutAmount: CoinPretty;
  } {
    return this.getMinTokenOutByTokenInWithSlippageComputedFn(
      tokenIn.denom,
      tokenIn.amount.toString(),
      tokenOutDenom,
      slippage.toString()
    );
  }

  /*
   Unfortunately, if reference is included in args,
   there is no guarantee that computed will memorize the result well, so to reduce this problem,
   create an internal function that accepts only primitive types as args.
   */
  protected readonly getMinTokenOutByTokenInWithSlippageComputedFn: (
    tokenInDenom: string,
    tokenInAmount: string,
    tokenOutDenom: string,
    slippage: string
  ) => {
    beforeSpotPriceInOverOut: IntPretty;
    beforeSpotPriceOutOverIn: IntPretty;
    minOutAmount: CoinPretty;
  } = computedFn(
    (
      tokenInDenom: string,
      tokenInAmount: string,
      tokenOutDenom: string,
      slippage: string
    ) => {
      const result = this.pool.getMinTokenOutByTokenInWithSlippage(
        {
          denom: tokenInDenom,
          amount: new Int(tokenInAmount),
        },
        tokenOutDenom,
        new Dec(slippage)
      );

      const chainInfo = this.chainGetter.getChain(this.chainId);
      const outCurrency = chainInfo.forceFindCurrency(tokenOutDenom);

      const spotPriceInOverOutMul = DecUtils.getTenExponentN(
        outCurrency.coinDecimals -
          chainInfo.forceFindCurrency(tokenInDenom).coinDecimals
      );

      return {
        beforeSpotPriceInOverOut: new IntPretty(
          result.beforeSpotPriceInOverOut.mulTruncate(spotPriceInOverOutMul)
        ),
        beforeSpotPriceOutOverIn: new IntPretty(
          result.beforeSpotPriceOutOverIn.quoTruncate(spotPriceInOverOutMul)
        ),
        minOutAmount: new CoinPretty(outCurrency, result.minOutAmount),
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

  getMaxTokenInByTokenOutWithSlippage(
    tokenOut: {
      denom: string;
      amount: Int;
    },
    tokenInDenom: string,
    slippage: Dec
  ): {
    beforeSpotPriceInOverOut: IntPretty;
    beforeSpotPriceOutOverIn: IntPretty;
    maxInAmount: CoinPretty;
  } {
    return this.getMaxTokenInByTokenOutWithSlippageComputedFn(
      tokenOut.denom,
      tokenOut.amount.toString(),
      tokenInDenom,
      slippage.toString()
    );
  }

  /*
   Unfortunately, if reference is included in args,
   there is no guarantee that computed will memorize the result well, so to reduce this problem,
   create an internal function that accepts only primitive types as args.
  */
  protected readonly getMaxTokenInByTokenOutWithSlippageComputedFn: (
    tokenOutDenom: string,
    tokenOutAmount: string,
    tokenInDenom: string,
    slippage: string
  ) => {
    beforeSpotPriceInOverOut: IntPretty;
    beforeSpotPriceOutOverIn: IntPretty;
    maxInAmount: CoinPretty;
  } = computedFn(
    (
      tokenOutDenom: string,
      tokenOutAmount: string,
      tokenInDenom: string,
      slippage: string
    ) => {
      const result = this.pool.getMaxTokenInByTokenOutWithSlippage(
        {
          denom: tokenOutDenom,
          amount: new Int(tokenOutAmount),
        },
        tokenInDenom,
        new Dec(slippage)
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
        beforeSpotPriceInOverOut: new IntPretty(
          result.beforeSpotPriceInOverOut.mulTruncate(spotPriceInOverOutMul)
        ),
        beforeSpotPriceOutOverIn: new IntPretty(
          result.beforeSpotPriceOutOverIn.quoTruncate(spotPriceInOverOutMul)
        ),
        maxInAmount: new CoinPretty(inCurrency, result.maxInAmount),
      };
    }
  );

  readonly computeTotalValueLocked = computedFn(
    (
      priceStore: {
        calculatePrice(
          coin: CoinPretty,
          vsCurrrency?: string
        ): PricePretty | undefined;
      },
      fiatCurrency: FiatCurrency
    ) => {
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
    }
  );
}
