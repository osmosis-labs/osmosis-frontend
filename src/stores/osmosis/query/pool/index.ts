import { GAMMPoolData } from "../../pool/types";
import { GAMMPool } from "../../pool";
import { ChainGetter, MsgOpt } from "@keplr-wallet/stores";
import {
  CoinPretty,
  DecUtils,
  IntPretty,
  Int,
  Coin,
  Dec
} from "@keplr-wallet/unit";
import { computed, makeObservable, observable } from "mobx";
import { Currency } from "@keplr-wallet/types";
import { Msg } from "@cosmjs/launchpad";

export class ObservablePool {
  @observable.ref
  protected readonly pool: GAMMPool;

  constructor(
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    data: GAMMPoolData
  ) {
    this.pool = new GAMMPool(data);

    makeObservable(this);
  }

  get id(): string {
    return this.pool.id;
  }

  estimateJoinSwap(
    shareOutAmount: string,
    shareCoinDecimals: number
  ): {
    tokenIns: CoinPretty[];
  } {
    const estimated = this.pool.estimateJoinPool(
      new Dec(shareOutAmount)
        .mul(DecUtils.getPrecisionDec(shareCoinDecimals))
        .truncate()
    );

    const tokenIns = estimated.tokenIns.map(primitive => {
      const currency = this.chainGetter
        .getChain(this.chainId)
        .currencies.find(cur => cur.coinMinimalDenom === primitive.denom);
      if (!currency) {
        throw new Error("Unknown currency");
      }

      return new CoinPretty(currency, primitive.amount);
    });

    return {
      tokenIns
    };
  }

  estimateSwapExactAmountIn(
    tokenIn: { currency: Currency; amount: string },
    tokenOutCurrency: Currency
  ): {
    tokenOut: CoinPretty;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    slippage: IntPretty;
    raw: ReturnType<GAMMPool["estimateSwapExactAmountIn"]>;
  } {
    const amount = new Dec(tokenIn.amount)
      .mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
      .truncate();
    const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

    const estimated = this.pool.estimateSwapExactAmountIn(
      coin,
      tokenOutCurrency.coinMinimalDenom
    );

    const tokenOut = new CoinPretty(tokenOutCurrency, estimated.tokenOutAmount);
    const spotPriceBefore = new IntPretty(estimated.spotPriceBefore)
      .maxDecimals(4)
      .trim(true);
    const spotPriceAfter = new IntPretty(estimated.spotPriceAfter)
      .maxDecimals(4)
      .trim(true);

    // XXX: IntPretty에서 0.5같이 정수부가 0인 Dec이 들어가면 precision이 제대로 설정되지않는 버그가 있기 때문에
    // 임시로 18를 곱하고 precision을 16으로 올려서 10^2가 곱해진 효과를 낸다.
    const slippage = new IntPretty(
      estimated.slippage.mul(DecUtils.getPrecisionDec(18))
    )
      .precision(16)
      .maxDecimals(4)
      .trim(true);

    return {
      tokenOut,
      spotPriceBefore,
      spotPriceAfter,
      slippage,
      raw: estimated
    };
  }

  estimateSwapExactAmountOut(
    tokenInCurrency: Currency,
    tokenOut: { currency: Currency; amount: string }
  ): {
    tokenIn: CoinPretty;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    slippage: IntPretty;
    raw: ReturnType<GAMMPool["estimateSwapExactAmountOut"]>;
  } {
    const amount = new Dec(tokenOut.amount)
      .mul(DecUtils.getPrecisionDec(tokenOut.currency.coinDecimals))
      .truncate();
    const coin = new Coin(tokenOut.currency.coinMinimalDenom, amount);

    const estimated = this.pool.estimateSwapExactAmountOut(
      tokenInCurrency.coinMinimalDenom,
      coin
    );

    const tokenIn = new CoinPretty(tokenInCurrency, estimated.tokenInAmount);
    const spotPriceBefore = new IntPretty(estimated.spotPriceBefore)
      .maxDecimals(4)
      .trim(true);
    const spotPriceAfter = new IntPretty(estimated.spotPriceAfter)
      .maxDecimals(4)
      .trim(true);

    // XXX: IntPretty에서 0.5같이 정수부가 0인 Dec이 들어가면 precision이 제대로 설정되지않는 버그가 있기 때문에
    // 임시로 18를 곱하고 precision을 16으로 올려서 10^2가 곱해진 효과를 낸다.
    const slippage = new IntPretty(
      estimated.slippage.mul(DecUtils.getPrecisionDec(18))
    )
      .precision(16)
      .maxDecimals(4)
      .trim(true);

    return {
      tokenIn,
      spotPriceBefore,
      spotPriceAfter,
      slippage,
      raw: estimated
    };
  }

  makeSwapExactAmountInMsg(
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    tokenIn: { currency: Currency; amount: string },
    tokenOutCurrency: Currency,
    maxSlippage: string = "0"
  ): Msg {
    const estimated = this.estimateSwapExactAmountIn(tokenIn, tokenOutCurrency);

    const maxSlippageDec = new Dec(maxSlippage).quo(
      DecUtils.getPrecisionDec(2)
    );
    // TODO: Compare the computed slippage and wanted max slippage?

    const tokenOutMinAmount = maxSlippageDec.equals(new Dec(0))
      ? new Int(1)
      : GAMMPool.calculateSlippageTokenIn(
          estimated.raw.spotPriceBefore,
          new Dec(tokenIn.amount)
            .mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
            .truncate(),
          maxSlippageDec
        );

    const amount = new Dec(tokenIn.amount)
      .mul(DecUtils.getPrecisionDec(tokenIn.currency.coinDecimals))
      .truncate();
    const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

    return {
      type: msgOpt.type,
      value: {
        sender,
        routes: [
          {
            poolId: this.id,
            tokenOutDenom: tokenOutCurrency.coinMinimalDenom
          }
        ],
        tokenIn: {
          denom: coin.denom,
          amount: coin.amount.toString()
        },
        tokenOutMinAmount: tokenOutMinAmount.toString()
      }
    };
  }

  makeSwapExactAmountOutMsg(
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    tokenInCurrency: Currency,
    tokenOut: { currency: Currency; amount: string },
    maxSlippage: string = "0"
  ): Msg {
    const estimated = this.estimateSwapExactAmountOut(
      tokenInCurrency,
      tokenOut
    );

    const maxSlippageDec = new Dec(maxSlippage).quo(
      DecUtils.getPrecisionDec(2)
    );
    // TODO: Compare the computed slippage and wanted max slippage?

    const tokenInMaxAmount = maxSlippageDec.equals(new Dec(0))
      ? // TODO: Set exact 2^128 - 1
        new Int(1000000000000)
      : GAMMPool.calculateSlippageTokenOut(
          estimated.raw.spotPriceBefore,
          new Dec(tokenOut.amount)
            .mul(DecUtils.getPrecisionDec(tokenOut.currency.coinDecimals))
            .truncate(),
          maxSlippageDec
        );

    const amount = new Dec(tokenOut.amount)
      .mul(DecUtils.getPrecisionDec(tokenOut.currency.coinDecimals))
      .truncate();
    const coin = new Coin(tokenOut.currency.coinMinimalDenom, amount);

    return {
      type: msgOpt.type,
      value: {
        sender,
        routes: [
          {
            poolId: this.id,
            tokenInDenom: tokenInCurrency.coinMinimalDenom
          }
        ],
        tokenOut: {
          denom: coin.denom,
          amount: coin.amount.toString()
        },
        tokenInMaxAmount: tokenInMaxAmount.toString()
      }
    };
  }

  @computed
  get swapFee(): IntPretty {
    let dec = this.pool.swapFee;
    dec = dec.mul(DecUtils.getPrecisionDec(18));

    // XXX: IntPretty에서 0.5같이 정수부가 0인 Dec이 들어가면 precision이 제대로 설정되지않는 버그가 있기 때문에
    // 임시로 18를 곱하고 precision을 16으로 올려서 10^2가 곱해진 효과를 낸다.
    return new IntPretty(dec)
      .precision(16)
      .maxDecimals(4)
      .trim(true);
  }

  @computed
  get poolAssets(): {
    weight: IntPretty;
    amount: CoinPretty;
  }[] {
    const primitives = this.pool.poolAssets;

    return primitives.map(primitive => {
      const coinPrimitive = primitive.token;
      const currency = this.chainGetter
        .getChain(this.chainId)
        .currencies.find(cur => cur.coinMinimalDenom === coinPrimitive.denom);
      if (!currency) {
        throw new Error("Unknown currency");
      }

      return {
        weight: new IntPretty(new Int(primitive.weight)),
        amount: new CoinPretty(currency, new Int(coinPrimitive.amount))
      };
    });
  }
}
