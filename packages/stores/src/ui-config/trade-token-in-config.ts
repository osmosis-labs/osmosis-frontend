import { AppCurrency } from "@keplr-wallet/types";
import {
  CoinPretty,
  Dec,
  DecUtils,
  IntPretty,
  PricePretty,
  RatePretty,
} from "@keplr-wallet/unit";
import { AmountConfig, IFeeConfig } from "@osmosis-labs/keplr-hooks";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  SplitTokenInQuote,
} from "@osmosis-labs/pools";
import { action, computed, makeObservable, observable, override } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../price";
import { OsmosisQueries } from "../queries";
import { InsufficientBalanceError, NoSendCurrencyError } from "./errors";

type PrettyQuote = {
  amount: CoinPretty;
  beforeSpotPriceWithoutSwapFeeInOverOut?: IntPretty;
  beforeSpotPriceWithoutSwapFeeOutOverIn?: IntPretty;
  beforeSpotPriceInOverOut?: IntPretty;
  beforeSpotPriceOutOverIn?: IntPretty;
  afterSpotPriceInOverOut?: IntPretty;
  afterSpotPriceOutOverIn?: IntPretty;
  effectivePriceInOverOut?: IntPretty;
  effectivePriceOutOverIn?: IntPretty;
  tokenInFeeAmount?: CoinPretty;
  swapFee?: RatePretty;
  priceImpact?: RatePretty;
};

export type QuoteError = NoRouteError | NotEnoughLiquidityError | Error;

export class ObservableTradeTokenInConfig<
  TQuote extends SplitTokenInQuote
> extends AmountConfig {
  // currencies selected for swapping
  @observable
  protected _sendCurrencyMinDenom: string | undefined = undefined;
  @observable
  protected _outCurrencyMinDenom: string | undefined = undefined;
  // currencies available for selection
  @observable.ref
  protected _sendableDenoms: string[] = [];

  // quotes
  @observable.ref
  protected _latestQuote: TQuote | null = null;
  @observable
  protected _isQuoteLoading = false;
  @observable.ref
  protected _spotPriceQuote: TQuote | null = null;
  @observable
  protected _quoteError: QuoteError | null = null;

  @override
  get sendCurrency(): AppCurrency {
    // Return the initial send currency when pools are not fetched yet.
    if (this.sendableCurrencies.length === 0) {
      return this.initialSelectCurrencies.send;
    }

    if (this._sendCurrencyMinDenom) {
      const currency = this.currencyMap.get(this._sendCurrencyMinDenom);
      if (currency) {
        return currency;
      }
    }

    const initialSendCurrency = this.sendableCurrencies.find(
      (c) => c.coinDenom === this.initialSelectCurrencies.send.coinDenom
    );
    const initialCurrency =
      initialSendCurrency &&
      this.sendableCurrencies.find(
        (c) => c.coinDenom === this.initialSelectCurrencies.out.coinDenom
      )
        ? initialSendCurrency
        : undefined;

    return (
      initialCurrency ??
      this.sendableCurrencies[0] ??
      this.initialSelectCurrencies.send
    );
  }

  @computed
  get sendValue(): PricePretty {
    return (
      this.priceStore.calculatePrice(
        new CoinPretty(
          this.sendCurrency,
          this.isEmptyInput
            ? "0"
            : new Dec(this.amount).mul(
                DecUtils.getTenExponentN(this.sendCurrency.coinDecimals)
              )
        )
      ) ??
      new PricePretty(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)!,
        0
      )
    );
  }

  @computed
  get outCurrency(): AppCurrency {
    // Return the initial send currency when pools are not fetched yet.
    if (this.sendableCurrencies.length === 0) {
      return this.initialSelectCurrencies.out;
    }

    if (this._outCurrencyMinDenom) {
      const currency = this.currencyMap.get(this._outCurrencyMinDenom);
      if (currency) {
        return currency;
      }
    }

    const initialOutCurrency = this.sendableCurrencies.find(
      (c) => c.coinDenom === this.initialSelectCurrencies.out.coinDenom
    );
    const initialCurrency =
      initialOutCurrency &&
      this.sendableCurrencies.find(
        (c) => c.coinDenom === this.initialSelectCurrencies.send.coinDenom
      )
        ? initialOutCurrency
        : undefined;

    return (
      initialCurrency ??
      this.sendableCurrencies[1] ??
      this.initialSelectCurrencies.out
    );
  }

  @computed
  get outValue(): PricePretty {
    return (
      this.priceStore.calculatePrice(this.expectedSwapResult.amount) ??
      new PricePretty(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)!,
        0
      )
    );
  }

  /** A map of the valid tradable currencies found on Osmosis chain store. */
  @computed
  get sendableCurrencies(): AppCurrency[] {
    // Get all unique coin denom in the pools.
    const coinDenomSet = new Set<string>(this._sendableDenoms);
    const coinDenoms = Array.from(coinDenomSet);

    // Get all currencies from the chain info.
    const chainInfo = this.chainInfo;
    const currencyMap = chainInfo.currencies.reduce<Map<string, AppCurrency>>(
      (previous, current) => {
        previous.set(current.coinMinimalDenom, current);
        return previous;
      },
      new Map()
    );

    return coinDenoms
      .map((denom) => currencyMap.get(denom))
      .filter((c): c is AppCurrency => !!c);
  }

  /** Prettify swap result for display. */
  @computed
  get expectedSwapResult(): PrettyQuote {
    if (this._isQuoteLoading || !this._latestQuote) return this.zeroSwapResult;
    return this.makePrettyQuote(this._latestQuote);
  }

  get latestQuote() {
    return this._latestQuote;
  }

  /** Routes for current quote */
  @computed
  get optimizedRoutes(): SplitTokenInQuote["split"] {
    if (this._isQuoteLoading || !this._latestQuote) return [];
    return this._latestQuote.split;
  }

  /** Quote is loading for user amount and token select inputs. */
  @computed
  get isQuoteLoading(): boolean {
    return this._isQuoteLoading;
  }

  /** Calculated spot price with amount of 1 token in for currently selected tokens. */
  @computed
  get expectedSpotPrice(): IntPretty {
    if (!this._spotPriceQuote) return new IntPretty(0).ready(false);
    return new IntPretty(this._spotPriceQuote.amount?.toString());
  }

  /** Any error derived from state. */
  @override
  get error(): Error | undefined {
    // If things are loading or there's no input
    if (this.isQuoteLoading || this.isEmptyInput) {
      return;
    }

    const sendCurrency = this.sendCurrency;
    if (!sendCurrency) {
      return new NoSendCurrencyError("Currency to send not set");
    }

    // If there's an error from the latest swap quote, return it
    if (this._quoteError) {
      return this._quoteError;
    }

    // If the user doesn't have enough balance, return an error
    if (!this.isEmptyInput) {
      const dec = new Dec(this.amount);
      const balance = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.sender)
        .getBalanceFromCurrency(this.sendCurrency);
      const balanceDec = balance.toDec();
      if (dec.gt(balanceDec)) {
        return new InsufficientBalanceError("Insufficient balance");
      }
    }

    // There's an error with the input
    return super.error;
  }

  get isEmptyInput() {
    return new Dec(this.getAmountPrimitive().amount).isZero();
  }

  @computed
  protected get currencyMap(): Map<string, AppCurrency> {
    return this.sendableCurrencies.reduce<Map<string, AppCurrency>>(
      (previous, current) => previous.set(current.coinMinimalDenom, current),
      new Map()
    );
  }

  @computed
  protected get zeroSwapResult(): PrettyQuote {
    return {
      amount: new CoinPretty(this.outCurrency, new Dec(0)).ready(false),
      beforeSpotPriceWithoutSwapFeeInOverOut: new IntPretty(0).ready(false),
      beforeSpotPriceWithoutSwapFeeOutOverIn: new IntPretty(0).ready(false),
      beforeSpotPriceInOverOut: new IntPretty(0).ready(false),
      beforeSpotPriceOutOverIn: new IntPretty(0).ready(false),
      afterSpotPriceInOverOut: new IntPretty(0).ready(false),
      afterSpotPriceOutOverIn: new IntPretty(0).ready(false),
      effectivePriceInOverOut: new IntPretty(0).ready(false),
      effectivePriceOutOverIn: new IntPretty(0).ready(false),
      tokenInFeeAmount: new CoinPretty(this.sendCurrency, new Dec(0)).ready(
        false
      ),
      swapFee: new RatePretty(0).ready(false),
      priceImpact: new RatePretty(0).ready(false),
    };
  }

  constructor(
    readonly chainGetter: ChainGetter,
    protected readonly queriesStore: IQueriesStore<
      OsmosisQueries & CosmosQueries
    >,
    protected readonly priceStore: IPriceStore,
    protected readonly initialChainId: string,
    sender: string,
    readonly feeConfig: IFeeConfig | undefined,
    protected readonly initialSelectCurrencies: {
      send: AppCurrency;
      out: AppCurrency;
    }
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, feeConfig);

    makeObservable(this);
  }

  @override
  setSendCurrency(currency: AppCurrency | undefined) {
    if (currency) {
      this._sendCurrencyMinDenom = currency.coinMinimalDenom;
    } else {
      this._sendCurrencyMinDenom = undefined;
    }
  }

  @action
  setOutCurrency(currency: AppCurrency | undefined) {
    if (currency) {
      this._outCurrencyMinDenom = currency.coinMinimalDenom;
    } else {
      this._outCurrencyMinDenom = undefined;
    }
  }

  @action
  setQuoteIsLoading(isLoading: boolean) {
    this._isQuoteLoading = isLoading;
  }

  @action
  setQuote(quote: TQuote | null) {
    this._isQuoteLoading = false;
    this._quoteError = null;
    this._latestQuote = quote;
  }

  @action
  setSpotPriceQuote(quote: TQuote | null) {
    this._quoteError = null;
    this._spotPriceQuote = quote;
  }

  @action
  setQuoteError(error: QuoteError) {
    this._quoteError = error;
  }

  setCurrencies(send: AppCurrency | undefined, out: AppCurrency | undefined) {
    this.setSendCurrency(send);
    this.setOutCurrency(out);
  }

  @action
  setSendableDenoms(denoms: string[]) {
    this._sendableDenoms = denoms;
  }

  @action
  switchInAndOut() {
    const outAmount = this.expectedSwapResult?.amount;
    if (outAmount && outAmount.toDec().isZero()) {
      this.setAmount("");
    } else if (outAmount) {
      this.setAmount(
        outAmount
          .shrink(true)
          .maxDecimals(6)
          .trim(true)
          .hideDenom(true)
          .toString()
      );
    }

    // Since changing in and out affects each other, it is important to use the stored value.
    const prevInCurrency = this.sendCurrency.coinMinimalDenom;
    const prevOutCurrency = this.outCurrency.coinMinimalDenom;

    this._sendCurrencyMinDenom = prevOutCurrency;
    this._outCurrencyMinDenom = prevInCurrency;

    // clear all results of prev input
    this._latestQuote = null;
    this._spotPriceQuote = null;
  }

  /** Reset user input. */
  @action
  reset() {
    this.setAmount("");
    this.setFraction(undefined);
    this._latestQuote = null;
    this._spotPriceQuote = null;
  }

  /** Calculate the out amount less a given slippage tolerance. */
  readonly outAmountLessSlippage = computedFn((slippage: Dec) => {
    return new CoinPretty(
      this.outCurrency,
      this.expectedSwapResult.amount
        .toDec()
        .mul(new Dec(1).sub(slippage))
        .mulTruncate(
          DecUtils.getTenExponentNInPrecisionRange(
            this.outCurrency.coinDecimals
          )
        )
    );
  });

  /** Convert raw router type into a prettified form ready for display. */
  protected makePrettyQuote(result: SplitTokenInQuote): PrettyQuote {
    const multiplicationInOverOut = DecUtils.getTenExponentN(
      this.outCurrency.coinDecimals - this.sendCurrency.coinDecimals
    );
    const beforeSpotPriceWithoutSwapFeeInOverOutDec =
      result.beforeSpotPriceInOverOut && result.swapFee
        ? result.beforeSpotPriceInOverOut.mulTruncate(
            new Dec(1).sub(result.swapFee)
          )
        : result.beforeSpotPriceInOverOut;

    return {
      amount: new CoinPretty(this.outCurrency, result.amount).locale(false), // locale - remove commas
      beforeSpotPriceWithoutSwapFeeInOverOut:
        beforeSpotPriceWithoutSwapFeeInOverOutDec
          ? new IntPretty(
              beforeSpotPriceWithoutSwapFeeInOverOutDec.mulTruncate(
                multiplicationInOverOut
              )
            )
          : undefined,
      beforeSpotPriceWithoutSwapFeeOutOverIn:
        beforeSpotPriceWithoutSwapFeeInOverOutDec?.gt(new Dec(0)) &&
        multiplicationInOverOut.gt(new Dec(0))
          ? new IntPretty(
              new Dec(1)
                .quoTruncate(beforeSpotPriceWithoutSwapFeeInOverOutDec)
                .quoTruncate(multiplicationInOverOut)
            )
          : undefined,
      beforeSpotPriceInOverOut: result.beforeSpotPriceInOverOut
        ? new IntPretty(
            result.beforeSpotPriceInOverOut.mulTruncate(multiplicationInOverOut)
          )
        : undefined,
      beforeSpotPriceOutOverIn:
        result.beforeSpotPriceOutOverIn &&
        multiplicationInOverOut.gt(new Dec(0))
          ? new IntPretty(
              result.beforeSpotPriceOutOverIn.quoTruncate(
                multiplicationInOverOut
              )
            )
          : undefined,
      afterSpotPriceInOverOut: result.afterSpotPriceInOverOut
        ? new IntPretty(
            result.afterSpotPriceInOverOut.mulTruncate(multiplicationInOverOut)
          )
        : undefined,
      afterSpotPriceOutOverIn:
        result.afterSpotPriceOutOverIn && multiplicationInOverOut.gt(new Dec(0))
          ? new IntPretty(
              result.afterSpotPriceOutOverIn.quoTruncate(
                multiplicationInOverOut
              )
            )
          : undefined,
      effectivePriceInOverOut: result.effectivePriceInOverOut
        ? new IntPretty(
            result.effectivePriceInOverOut.mulTruncate(multiplicationInOverOut)
          )
        : undefined,
      effectivePriceOutOverIn:
        result.effectivePriceOutOverIn && multiplicationInOverOut.gt(new Dec(0))
          ? new IntPretty(
              result.effectivePriceOutOverIn.quoTruncate(
                multiplicationInOverOut
              )
            )
          : undefined,
      tokenInFeeAmount: result.tokenInFeeAmount
        ? new CoinPretty(this.sendCurrency, result.tokenInFeeAmount).locale(
            false
          )
        : undefined,
      swapFee: result.swapFee ? new RatePretty(result.swapFee) : undefined,
      priceImpact: result.priceImpactTokenOut
        ? new RatePretty(result.priceImpactTokenOut.neg()).inequalitySymbol(
            false
          )
        : undefined,
    };
  }
}
