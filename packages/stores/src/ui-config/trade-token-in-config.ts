import { AmountConfig, IFeeConfig } from "@keplr-wallet/hooks";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
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
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
  OptimizedRoutesParams,
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";
import { debounce } from "debounce";
import {
  action,
  computed,
  makeObservable,
  observable,
  override,
  reaction,
  runInAction,
} from "mobx";
import {
  computedFn,
  fromPromise,
  FULFILLED,
  IPromiseBasedObservable,
  PENDING,
  REJECTED,
} from "mobx-utils";

import { IPriceStore } from "../price";
import { ObservableQueryPool, OsmosisQueries } from "../queries";
import { InsufficientBalanceError, NoSendCurrencyError } from "./errors";

type PrettyQuote = {
  amount: CoinPretty;
  beforeSpotPriceWithoutSwapFeeInOverOut: IntPretty;
  beforeSpotPriceWithoutSwapFeeOutOverIn: IntPretty;
  beforeSpotPriceInOverOut: IntPretty;
  beforeSpotPriceOutOverIn: IntPretty;
  afterSpotPriceInOverOut: IntPretty;
  afterSpotPriceOutOverIn: IntPretty;
  effectivePriceInOverOut: IntPretty;
  effectivePriceOutOverIn: IntPretty;
  tokenInFeeAmount: CoinPretty;
  swapFee: RatePretty;
  priceImpact: RatePretty;
  isMultihopOsmoFeeDiscount: boolean;
  numTicksCrossed: number | undefined;
};

export class ObservableTradeTokenInConfig extends AmountConfig {
  @observable.ref
  protected _pools: ObservableQueryPool[];
  @observable
  protected _incentivizedPoolIds: string[] = [];

  @observable
  protected _sendCurrencyMinDenom: string | undefined = undefined;
  @observable
  protected _outCurrencyMinDenom: string | undefined = undefined;

  // quotes
  @observable.ref
  protected _latestQuote:
    | IPromiseBasedObservable<SplitTokenInQuote>
    | undefined = undefined;
  // time to fetch the latest quote
  protected _latestQuoteTimeMs: number = 0;
  @observable.ref
  protected _spotPriceQuote:
    | IPromiseBasedObservable<SplitTokenInQuote>
    | undefined = undefined;

  @override
  get sendCurrency(): AppCurrency {
    if (this.sendableCurrencies.length === 0) {
      // For the case before pools are initially fetched,

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
    if (this.sendableCurrencies.length === 0) {
      // For the case before pools are initially fetched,
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
    if (this._pools.length === 0) {
      return [];
    }

    const chainInfo = this.chainInfo;

    // Get all coin denom in the pools.
    const coinDenomSet = new Set<string>(
      this._pools.flatMap((pool) => pool.poolAssetDenoms)
    );

    const coinDenoms = Array.from(coinDenomSet);

    const currencyMap = chainInfo.currencies.reduce<Map<string, AppCurrency>>(
      (previous, current) => {
        previous.set(current.coinMinimalDenom, current);
        return previous;
      },
      new Map()
    );

    return coinDenoms
      .filter((coinDenom) => {
        return currencyMap.has(coinDenom);
      })
      .map((coinDenom) => {
        // eslint-disable-next-line
        return currencyMap.get(coinDenom)!;
      });
  }

  /** Prettify swap result for display. */
  @computed
  get expectedSwapResult(): PrettyQuote {
    return (
      this._latestQuote?.case({
        fulfilled: (quote) => this.makePrettyQuote(quote),
        rejected: (e) => {
          // these are expected
          if (e instanceof NoRouteError) return undefined;
          if (e instanceof NotEnoughLiquidityError) return undefined;
          if (e instanceof NotEnoughQuotedError) return undefined;

          console.error("Swap result rejected", e);
          return undefined;
        },
      }) ?? this.zeroSwapResult
    );
  }

  /** Time in milliseconds it took to generate latest quote. */
  get latestQuoteTimeMs(): number {
    return this._latestQuoteTimeMs;
  }

  /** Routes for current quote */
  @computed
  get optimizedRoutes(): SplitTokenInQuote["split"] {
    return (
      this._latestQuote?.case({
        fulfilled: ({ split }) => split,
        rejected: (e) => {
          // these are expected
          if (e instanceof NoRouteError) return [];
          if (e instanceof NotEnoughLiquidityError) return [];
          if (e instanceof NotEnoughQuotedError) return [];

          console.error("Optimized routes rejected", e);
          return [];
        },
      }) ?? []
    );
  }

  /** Quote is loading for user amount and token select inputs. */
  @computed
  get isQuoteLoading(): boolean {
    return this._latestQuote?.state === PENDING;
  }

  /** Calculated spot price with amount of 1 token in for currently selected tokens. */
  @computed
  get expectedSpotPrice(): IntPretty {
    // Use the spot price from the same quote based on the input amount
    // as the spot price may change based on the input amount and it's routes
    const quoteFromInputAmount = this._latestQuote;
    const quoteFromSpotPrice = this._spotPriceQuote;
    const quote = quoteFromInputAmount ?? quoteFromSpotPrice;

    return (
      quote?.case({
        fulfilled: (quote) =>
          this.makePrettyQuote(quote).beforeSpotPriceWithoutSwapFeeOutOverIn,
        rejected: (e) => {
          // these are expected
          if (e instanceof NoRouteError) return undefined;
          if (e instanceof NotEnoughLiquidityError) return undefined;

          console.error("Spot price rejected", e);
          return undefined;
        },
      }) ?? new IntPretty(0)
    );
  }

  /** Spot price for currently selected tokens is loading. */
  @computed
  get isSpotPriceLoading(): boolean {
    return this._spotPriceQuote?.state === PENDING;
  }

  /** Any error derived from state. */
  @override
  get error(): Error | undefined {
    // If things are loading or there's no input
    if (this.isSpotPriceLoading || this.isQuoteLoading || this.isEmptyInput) {
      // if there's no user input, check if the spot price has an error if loaded
      const spotPriceError = this._spotPriceQuote?.value;
      if (!this.isSpotPriceLoading && spotPriceError instanceof Error) {
        return spotPriceError;
      }

      return;
    }

    const sendCurrency = this.sendCurrency;
    if (!sendCurrency) {
      return new NoSendCurrencyError("Currency to send not set");
    }

    // If there's an error from the latest swap quote, return it
    if (
      this._latestQuote?.state === REJECTED &&
      this._latestQuote.value instanceof Error
    ) {
      return this._latestQuote.value;
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
      isMultihopOsmoFeeDiscount: false,
      numTicksCrossed: undefined,
    };
  }

  /** Valid router instance that updates any time pools, incentivzed pool IDs, etc. changes. */
  @computed
  protected get router(): TokenOutGivenInRouter | undefined {
    if (this._pools.length === 0) return;

    // cache lives for the lifetime of the router instance
    // any time pools are updated (or any observed value), a new router instance is created (with new cache)
    const stakeCurrencyMinDenom: string | undefined = this.chainGetter.getChain(
      this.initialChainId
    ).stakeCurrency.coinMinimalDenom;
    if (!stakeCurrencyMinDenom) return;

    const getPoolTotalValueLocked = (poolId: string) => {
      const queryPool = this._pools.find((pool) => pool.id === poolId);
      if (queryPool) {
        return queryPool.computeTotalValueLocked(this.priceStore).toDec();
      } else {
        console.warn("Returning 0 TVL for poolId: " + poolId);
        return new Dec(0);
      }
    };

    // Multi route message is only available in v16+
    const nodeVersion = Number(
      this.queriesStore.get(this.initialChainId).cosmos.queryRPCStatus.response
        ?.data?.result?.node_info?.protocol_version?.app
    );
    const isV16Plus = !isNaN(nodeVersion) && nodeVersion >= 16;
    const maxSplit = isV16Plus ? 2 : 1;

    return new this.Router({
      pools: this._pools.map((pool) => pool.pool),
      preferredPoolIds: this._pools.reduce((preferredIds, pool) => {
        // prefer concentrated & stable pools with some min amount of liquidity
        if (
          (pool.type === "concentrated" &&
            pool
              .computeTotalValueLocked(this.priceStore)
              .toDec()
              .gt(new Dec(4_000))) ||
          (pool.type === "stable" &&
            pool
              .computeTotalValueLocked(this.priceStore)
              .toDec()
              .gt(new Dec(4_000_000)))
        ) {
          preferredIds.push(pool.id);
        }
        return preferredIds;
      }, [] as string[]),
      incentivizedPoolIds: this._incentivizedPoolIds,
      stakeCurrencyMinDenom,
      getPoolTotalValueLocked,
      maxSplit,
      maxSplitIterations: 25,
    });
  }

  /** Any teardown operation to prevent memory leaks. */
  protected _disposers: (() => void)[] = [];

  constructor(
    readonly chainGetter: ChainGetter,
    protected readonly queriesStore: IQueriesStore<
      OsmosisQueries & CosmosQueries
    >,
    protected readonly priceStore: IPriceStore,
    protected readonly initialChainId: string,
    sender: string,
    readonly feeConfig: IFeeConfig | undefined,
    readonly pools: ObservableQueryPool[],
    protected readonly initialSelectCurrencies: {
      send: AppCurrency;
      out: AppCurrency;
    },
    protected readonly Router: new (
      params: OptimizedRoutesParams
    ) => TokenOutGivenInRouter
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, feeConfig);

    this._pools = pools;

    ////////
    // QUOTE
    // Clear quote output if the input is cleared
    // React to user input and request a swap result. This is debounced to prevent spamming the server
    const debounceGetQuote = debounce(
      (
        router: TokenOutGivenInRouter,
        tokenIn: Token,
        tokenOutDenom: string
      ) => {
        const futureQuote = router.routeByTokenIn(tokenIn, tokenOutDenom);
        runInAction(() => {
          const t0 = performance.now();
          this._latestQuote = fromPromise(
            futureQuote.then((quote) => {
              // hook into the promise chain to record the time it took to get the quote
              const elapsedMs = performance.now() - t0;
              this._latestQuoteTimeMs = elapsedMs;
              // forward the quote along the chain
              return quote;
            }),
            this._latestQuote
          );
        });
      },
      150, // depends on how fast users can type
      true //we should trigger on end of typing so we don't display quotes for initial input
      // also, if ticks are being fetched, we don't want to display NotEnoughLiquidity error while they're being fetched
    );
    this._disposers.push(
      reaction(
        () => ({
          latestQuote: this._latestQuote,
          isEmptyInput: this.isEmptyInput,
          getQuote: debounceGetQuote,
        }),
        ({ latestQuote, isEmptyInput, getQuote }) => {
          // this also handles race conditions because if the user clears the input, then an prev request result arrives, the old result will be cleared
          if (latestQuote?.state === FULFILLED && isEmptyInput) {
            getQuote.clear();
            runInAction(() => {
              this._latestQuote = undefined;
            });
          }
        }
      )
    );
    this._disposers.push(
      reaction(
        () => ({
          ...this.getAmountPrimitive(),
          outCurrencyMinDenom: this.outCurrency.coinMinimalDenom,
          router: this.router,
          isEmptyInput: this.isEmptyInput,
          getQuote: debounceGetQuote,
        }),
        ({
          denom,
          amount,
          outCurrencyMinDenom,
          router,
          isEmptyInput,
          getQuote,
        }) => {
          if (isEmptyInput) return;
          if (!router) return;

          getQuote.clear();
          getQuote(
            router,
            {
              denom,
              amount: new Int(amount),
            },
            outCurrencyMinDenom
          );
        }
      )
    );

    ////////
    // SPOT PRICE
    const debounceGetSpotPrice = debounce(
      (
        router: TokenOutGivenInRouter,
        tokenIn: Token,
        tokenOutDenom: string
      ) => {
        const futureQuote = router.routeByTokenIn(tokenIn, tokenOutDenom);
        runInAction(() => {
          this._spotPriceQuote = fromPromise(futureQuote, this._spotPriceQuote);
        });
      },
      350,
      true
    );
    // React to changes in send/out currencies, then generate a spot price by directly calculating from the pools
    this._disposers.push(
      reaction(
        () => ({
          sendCurrency: this.sendCurrency,
          outCurrency: this.outCurrency,
          router: this.router,
          isQuoteLoading: this.isQuoteLoading,
          expectedSwapResult: this.expectedSwapResult,
          getSpotPrice: debounceGetSpotPrice,
        }),
        ({
          sendCurrency,
          outCurrency,
          router,
          isQuoteLoading,
          expectedSwapResult,
          getSpotPrice,
        }) => {
          /** Use 1_000_000 uosmo (6 decimals) vs 1 uosmo */
          const oneWithDecimals = new Int(
            DecUtils.getTenExponentNInPrecisionRange(sendCurrency.coinDecimals)
              .truncate()
              .toString()
          );

          const sendCurrencyMinDenom = sendCurrency.coinMinimalDenom;
          const outCurrencyMinDenom = outCurrency.coinMinimalDenom;

          // don't request a spot price if there's already a quote given an amount
          const isQuoteFromAmount =
            isQuoteLoading ||
            (expectedSwapResult && !expectedSwapResult.amount.toDec().isZero());

          if (isQuoteFromAmount || !router) return;

          getSpotPrice(
            router,
            {
              denom: sendCurrencyMinDenom,
              amount: oneWithDecimals,
            },
            outCurrencyMinDenom
          );
        }
      )
    );

    const clearInFlightQuotes = () => {
      debounceGetSpotPrice.clear();
      debounceGetQuote.clear();
    };

    this._disposers.push(clearInFlightQuotes);

    makeObservable(this);
  }

  dispose() {
    this._disposers.forEach((dispose) => dispose());
  }

  @action
  setPools(pools: ObservableQueryPool[]) {
    this._pools = pools;
  }

  @action
  setIncentivizedPoolIds(poolIds: string[]) {
    this._incentivizedPoolIds = poolIds;
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
    this._latestQuote = undefined;
    this._spotPriceQuote = undefined;
  }

  /** Reset user input. */
  reset() {
    this.setAmount("");
    this.setFraction(undefined);
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
      result.beforeSpotPriceInOverOut.mulTruncate(
        new Dec(1).sub(result.swapFee)
      );

    return {
      amount: new CoinPretty(this.outCurrency, result.amount).locale(false), // locale - remove commas
      beforeSpotPriceWithoutSwapFeeInOverOut: new IntPretty(
        beforeSpotPriceWithoutSwapFeeInOverOutDec.mulTruncate(
          multiplicationInOverOut
        )
      ),
      beforeSpotPriceWithoutSwapFeeOutOverIn:
        beforeSpotPriceWithoutSwapFeeInOverOutDec.gt(new Dec(0)) &&
        multiplicationInOverOut.gt(new Dec(0))
          ? new IntPretty(
              new Dec(1)
                .quoTruncate(beforeSpotPriceWithoutSwapFeeInOverOutDec)
                .quoTruncate(multiplicationInOverOut)
            )
          : new IntPretty(0),
      beforeSpotPriceInOverOut: new IntPretty(
        result.beforeSpotPriceInOverOut.mulTruncate(multiplicationInOverOut)
      ),
      beforeSpotPriceOutOverIn: multiplicationInOverOut.gt(new Dec(0))
        ? new IntPretty(
            result.beforeSpotPriceOutOverIn.quoTruncate(multiplicationInOverOut)
          )
        : new IntPretty(0),
      afterSpotPriceInOverOut: new IntPretty(
        result.afterSpotPriceInOverOut.mulTruncate(multiplicationInOverOut)
      ),
      afterSpotPriceOutOverIn: multiplicationInOverOut.gt(new Dec(0))
        ? new IntPretty(
            result.afterSpotPriceOutOverIn.quoTruncate(multiplicationInOverOut)
          )
        : new IntPretty(0),
      effectivePriceInOverOut: new IntPretty(
        result.effectivePriceInOverOut.mulTruncate(multiplicationInOverOut)
      ),
      effectivePriceOutOverIn: multiplicationInOverOut.gt(new Dec(0))
        ? new IntPretty(
            result.effectivePriceOutOverIn.quoTruncate(multiplicationInOverOut)
          )
        : new IntPretty(0),
      tokenInFeeAmount: new CoinPretty(
        this.sendCurrency,
        result.tokenInFeeAmount
      ).locale(false), // locale - remove commas
      swapFee: new RatePretty(result.swapFee),
      priceImpact: new RatePretty(
        result.priceImpactTokenOut.neg()
      ).inequalitySymbol(false),
      isMultihopOsmoFeeDiscount: result.split.some(
        ({ multiHopOsmoDiscount }) => multiHopOsmoDiscount
      ),
      numTicksCrossed: result.numTicksCrossed,
    };
  }
}
