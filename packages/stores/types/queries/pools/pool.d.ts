import { ChainGetter, ObservableChainQuery, QueryResponse } from "@keplr-wallet/stores";
import { KVStore } from "@keplr-wallet/common";
import { Currency, AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, PricePretty, Dec, Int, IntPretty, RatePretty } from "@keplr-wallet/unit";
import { Pool, WeightedPoolRaw, StablePoolRaw } from "@osmosis-labs/pools";
import { IPriceStore } from "src/price";
import { Duration } from "dayjs/plugin/duration";
declare type PoolRaw = WeightedPoolRaw | StablePoolRaw;
export declare class ObservableQueryPool extends ObservableChainQuery<{
    pool: PoolRaw;
}> {
    readonly kvStore: KVStore;
    readonly chainGetter: ChainGetter;
    /** Observe any new references resulting from pool or pools query. */
    protected raw: PoolRaw;
    /** Constructed with the assumption that initial pool data has already been fetched
     *  using the `/pools` endpoint.
     **/
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, raw: PoolRaw);
    protected setResponse(response: Readonly<QueryResponse<{
        pool: PoolRaw;
    }>>): void;
    setRaw(raw: PoolRaw): void;
    get pool(): Pool;
    /** Info specific to and relevant if is stableswap pool. */
    get stableSwapInfo(): {
        assets: {
            amountScaled: Dec;
            denom: string;
            amount: Int;
            scalingFactor: number;
        }[];
    } | undefined;
    /** Info specific to and relevant if is weighted/balancer pool. */
    get weightedPoolInfo(): {
        assets: {
            denom: string;
            amount: Int;
            weight: IntPretty;
            weightFraction: RatePretty;
        }[];
        totalWeight: IntPretty;
        smoothWeightChange: import("@osmosis-labs/pools").SmoothWeightChangeParams | undefined;
    } | undefined;
    get type(): "weighted" | "stable";
    get id(): string;
    get swapFee(): RatePretty;
    get exitFee(): RatePretty;
    get shareDenom(): string;
    get shareCurrency(): Currency;
    get totalShare(): CoinPretty;
    get smoothWeightChange(): {
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
    } | undefined;
    get poolAssets(): {
        amount: CoinPretty;
    }[];
    readonly getPoolAsset: (denom: string) => {
        amount: CoinPretty;
    };
    readonly getSpotPriceInOverOut: (tokenInDenom: string, tokenOutDenom: string) => IntPretty;
    readonly getSpotPriceOutOverIn: (tokenInDenom: string, tokenOutDenom: string) => IntPretty;
    readonly getSpotPriceInOverOutWithoutSwapFee: (tokenInDenom: string, tokenOutDenom: string) => IntPretty;
    getSpotPriceOutOverInWithoutSwapFee: (tokenInDenom: string, tokenOutDenom: string) => IntPretty;
    getTokenOutByTokenIn(tokenIn: {
        denom: string;
        amount: Int;
    }, tokenOutDenom: string): {
        amount: CoinPretty;
        afterSpotPriceInOverOut: IntPretty;
        afterSpotPriceOutOverIn: IntPretty;
        effectivePriceInOverOut: IntPretty;
        effectivePriceOutOverIn: IntPretty;
        priceImpact: RatePretty;
    };
    protected readonly getTokenOutByTokenInComputedFn: (tokenInDenom: string, tokenInAmount: string, tokenOutDenom: string) => {
        amount: CoinPretty;
        afterSpotPriceInOverOut: IntPretty;
        afterSpotPriceOutOverIn: IntPretty;
        effectivePriceInOverOut: IntPretty;
        effectivePriceOutOverIn: IntPretty;
        priceImpact: RatePretty;
    };
    getTokenInByTokenOut(tokenOut: {
        denom: string;
        amount: Int;
    }, tokenInDenom: string): {
        amount: CoinPretty;
        afterSpotPriceInOverOut: IntPretty;
        afterSpotPriceOutOverIn: IntPretty;
        effectivePriceInOverOut: IntPretty;
        effectivePriceOutOverIn: IntPretty;
        priceImpact: RatePretty;
    };
    protected readonly getTokenInByTokenOutComputedFn: (tokenOutDenom: string, tokenOutAmount: string, tokenInDenom: string) => {
        amount: CoinPretty;
        afterSpotPriceInOverOut: IntPretty;
        afterSpotPriceOutOverIn: IntPretty;
        effectivePriceInOverOut: IntPretty;
        effectivePriceOutOverIn: IntPretty;
        priceImpact: RatePretty;
    };
    readonly computeTotalValueLocked: (priceStore: IPriceStore) => PricePretty;
}
export {};
