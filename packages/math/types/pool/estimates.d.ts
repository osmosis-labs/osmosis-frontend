import { Dec, Int, IntPretty, Coin, CoinPretty } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
export declare function estimateJoinSwapExternAmountIn(poolAsset: {
    amount: Int;
    weight: Int;
}, pool: {
    totalShare: Int;
    totalWeight: Int;
    swapFee: Dec;
}, tokenIn: {
    currency: {
        coinDecimals: number;
        coinMinimalDenom: string;
    };
    amount: string;
}, shareCoinDecimals: number): {
    shareOutAmount: IntPretty;
    shareOutAmountRaw: Int;
};
export declare function estimateJoinSwap(pool: {
    totalShare: Int;
}, poolAssets: {
    denom: string;
    amount: Int;
}[], makeCoinPretty: (coin: Coin) => CoinPretty, shareOutAmount: string, shareCoinDecimals: number): {
    tokenIns: CoinPretty[];
};
export declare function estimateExitSwap(pool: {
    totalShare: Int;
    poolAssets: {
        denom: string;
        amount: Int;
    }[];
}, makeCoinPretty: (coin: Coin) => CoinPretty, shareInAmount: string, shareCoinDecimals: number): {
    tokenOuts: CoinPretty[];
};
export declare function estimateSwapExactAmountIn(pool: {
    inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight: Int;
    };
    outPoolAsset: {
        amount: Int;
        weight: Int;
    };
    swapFee: Dec;
}, tokenIn: Coin, tokenOutCurrency: Currency): {
    tokenOut: CoinPretty;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    priceImpact: IntPretty;
    raw: ReturnType<typeof estimateSwapExactAmountIn_Raw>;
};
export declare function estimateSwapExactAmountOut(pool: {
    inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight: Int;
    };
    outPoolAsset: {
        amount: Int;
        weight: Int;
    };
    swapFee: Dec;
}, tokenOut: Coin, tokenInCurrency: Currency): {
    tokenIn: CoinPretty;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    priceImpact: IntPretty;
    raw: ReturnType<typeof estimateSwapExactAmountOut_Raw>;
};
export declare function estimateMultihopSwapExactAmountIn(tokenIn: {
    currency: Currency;
    amount: string;
}, routes: {
    pool: {
        inPoolAsset: {
            coinDecimals: number;
            coinMinimalDenom: string;
            amount: Int;
            weight: Int;
        };
        outPoolAsset: {
            amount: Int;
            weight: Int;
        };
        swapFee: Dec;
    };
    tokenOutCurrency: Currency;
}[]): {
    tokenOut: CoinPretty;
    spotPriceBeforeRaw: Dec;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    priceImpact: IntPretty;
};
declare function estimateSwapExactAmountIn_Raw(inPoolAsset: {
    amount: Int;
    weight: Int;
}, outPoolAsset: {
    amount: Int;
    weight: Int;
}, tokenIn: Coin, swapFee: Dec): {
    tokenOutAmount: Int;
    spotPriceBefore: Dec;
    spotPriceAfter: Dec;
    priceImpact: Dec;
};
declare function estimateSwapExactAmountOut_Raw(inPoolAsset: {
    amount: Int;
    weight: Int;
}, outPoolAsset: {
    amount: Int;
    weight: Int;
}, tokenOut: Coin, swapFee: Dec): {
    tokenInAmount: Int;
    spotPriceBefore: Dec;
    spotPriceAfter: Dec;
    priceImpact: Dec;
};
export {};
