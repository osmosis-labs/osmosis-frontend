import { Pool } from "./interface";
import { Dec, Int } from "@keplr-wallet/unit";
import { StableSwapToken } from "@osmosis-labs/math";
/** Raw query response representation of pool. */
export interface StablePoolRaw {
    "@type": string;
    id: string;
    pool_params: {
        lock: boolean;
        swap_fee: string;
        exit_fee: string;
    };
    total_shares: {
        denom: string;
        amount: string;
    };
    pool_liquidity: {
        denom: string;
        amount: string;
    }[];
    scaling_factors: string[];
    scaling_factor_controller: string;
}
/** Implementation of stableswap Pool interface w/ related stableswap calculations & metadata. */
export declare class StablePool implements Pool {
    readonly raw: StablePoolRaw;
    constructor(raw: StablePoolRaw);
    get type(): "stable";
    get id(): string;
    get poolAssets(): {
        denom: string;
        amount: Int;
        scalingFactor: number;
    }[];
    get poolAssetDenoms(): string[];
    get totalShare(): Int;
    get shareDenom(): string;
    get swapFee(): Dec;
    get exitFee(): Dec;
    protected get stableSwapTokens(): StableSwapToken[];
    getPoolAsset(denom: string): {
        denom: string;
        amount: Int;
        scalingFactor: number;
    };
    hasPoolAsset(denom: string): boolean;
    getSpotPriceInOverOut(tokenInDenom: string, tokenOutDenom: string): Dec;
    getSpotPriceInOverOutWithoutSwapFee(tokenInDenom: string, tokenOutDenom: string): Dec;
    getSpotPriceOutOverIn(tokenInDenom: string, tokenOutDenom: string): Dec;
    getSpotPriceOutOverInWithoutSwapFee(tokenInDenom: string, tokenOutDenom: string): Dec;
    getTokenInByTokenOut(tokenOut: {
        denom: string;
        amount: Int;
    }, tokenInDenom: string, swapFee?: Dec): {
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
    }, tokenOutDenom: string, swapFee?: Dec): {
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
