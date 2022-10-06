import { Pool, SmoothWeightChangeParams } from "./interface";
import { Dec, Int } from "@keplr-wallet/unit";
/** Raw query response representation of pool. */
export interface WeightedPoolRaw {
    id: string;
    pool_params: {
        lock: boolean;
        swap_fee: string;
        exit_fee: string;
        smooth_weight_change_params: {
            start_time: string;
            duration: string;
            initial_pool_weights: {
                token: {
                    denom: string;
                    amount: string;
                };
                weight: string;
            }[];
            target_pool_weights: {
                token: {
                    denom: string;
                    amount: string;
                };
                weight: string;
            }[];
        } | null;
    };
    total_weight: string;
    total_shares: {
        denom: string;
        amount: string;
    };
    pool_assets: [
        {
            weight: string;
            token: {
                denom: string;
                amount: string;
            };
        }
    ];
}
/** Implementation of Pool interface w/ related calculations. */
export declare class WeightedPool implements Pool {
    readonly raw: WeightedPoolRaw;
    constructor(raw: WeightedPoolRaw);
    get exitFee(): Dec;
    get id(): string;
    get poolAssets(): {
        denom: string;
        amount: Int;
        weight: Int;
    }[];
    get poolAssetDenoms(): string[];
    get shareDenom(): string;
    get swapFee(): Dec;
    get totalShare(): Int;
    get smoothWeightChange(): SmoothWeightChangeParams | undefined;
    getPoolAsset(denom: string): {
        denom: string;
        amount: Int;
        weight: Int;
    };
    hasPoolAsset(denom: string): boolean;
    get totalWeight(): Int;
    getSpotPriceInOverOut(tokenInDenom: string, tokenOutDenom: string): Dec;
    getSpotPriceInOverOutWithoutSwapFee(tokenInDenom: string, tokenOutDenom: string): Dec;
    getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec;
    getSpotPriceOutOverInWithoutSwapFee(tokenInDenom: string, tokenOutDenom: string): Dec;
    getTokenInByTokenOut(tokenOut: {
        denom: string;
        amount: Int;
    }, tokenInDenom: string): {
        amount: Int;
        beforeSpotPriceInOverOut: Dec;
        beforeSpotPriceOutOverIn: Dec;
        afterSpotPriceInOverOut: Dec;
        afterSpotPriceOutOverIn: Dec;
        effectivePriceInOverOut: Dec;
        effectivePriceOutOverIn: Dec;
        priceImpact: Dec;
    };
    getTokenOutByTokenIn(tokenIn: {
        denom: string;
        amount: Int;
    }, tokenOutDenom: string): {
        amount: Int;
        beforeSpotPriceInOverOut: Dec;
        beforeSpotPriceOutOverIn: Dec;
        afterSpotPriceInOverOut: Dec;
        afterSpotPriceOutOverIn: Dec;
        effectivePriceInOverOut: Dec;
        effectivePriceOutOverIn: Dec;
        priceImpact: Dec;
    };
    getNormalizedLiquidity(tokenInDenom: string, tokenOutDenom: string): Dec;
    getLimitAmountByTokenIn(denom: string): Int;
}
