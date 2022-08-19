import { AmountConfig, IFeeConfig } from "@keplr-wallet/hooks";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, IntPretty, RatePretty } from "@keplr-wallet/unit";
import { OptimizedRoutes, Pool, RoutePathWithAmount } from "@osmosis-labs/pools";
export declare class ObservableTradeTokenInConfig extends AmountConfig {
    protected _pools: Pool[];
    protected _inCurrencyMinimalDenom: string | undefined;
    protected _outCurrencyMinimalDenom: string | undefined;
    protected _error: Error | undefined;
    constructor(chainGetter: ChainGetter, queriesStore: IQueriesStore, initialChainId: string, sender: string, feeConfig: IFeeConfig | undefined, pools: Pool[]);
    setPools(pools: Pool[]): void;
    setSendCurrency(currency: AppCurrency | undefined): void;
    setOutCurrency(currency: AppCurrency | undefined): void;
    switchInAndOut(): void;
    get pools(): Pool[];
    protected get currencyMap(): Map<string, AppCurrency>;
    get sendCurrency(): AppCurrency;
    get outCurrency(): AppCurrency;
    get sendableCurrencies(): AppCurrency[];
    protected get optimizedRoutes(): OptimizedRoutes;
    get optimizedRoutePaths(): RoutePathWithAmount[];
    get expectedSwapResult(): {
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
    };
    /** Calculated spot price with amount of 1 token in. */
    get beforeSpotPriceWithoutSwapFeeOutOverIn(): IntPretty;
    get error(): Error | undefined;
    setError(error: Error | undefined): void;
}
