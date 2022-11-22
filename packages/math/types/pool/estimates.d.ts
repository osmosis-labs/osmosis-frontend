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
    exitFee: Dec;
}, makeCoinPretty: (coin: Coin) => CoinPretty, shareInAmount: string, shareCoinDecimals: number): {
    tokenOuts: CoinPretty[];
};
export declare function estimateSwapExactAmountIn(pool: {
    inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight?: Int;
    };
    outPoolAsset: {
        denom: string;
        amount: Int;
        weight?: Int;
    };
    poolAssets: {
        amount: Int;
        denom: string;
        scalingFactor: number;
    }[];
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
        weight?: Int;
    };
    outPoolAsset: {
        denom: string;
        amount: Int;
        weight?: Int;
    };
    poolAssets: {
        amount: Int;
        denom: string;
        scalingFactor: number;
    }[];
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
}, pools: {
    pool: {
        id: string;
        swapFee: Dec;
        inPoolAsset: {
            coinDecimals: number;
            coinMinimalDenom: string;
            amount: Int;
            weight?: Int;
        };
        outPoolAsset: {
            denom: string;
            amount: Int;
            weight?: Int;
        };
        poolAssets: {
            amount: Int;
            denom: string;
            scalingFactor: number;
        }[];
        isIncentivized: boolean;
    };
    tokenOutCurrency: Currency;
}[], stakeCurrencyMinDenom: string): {
    tokenOut: CoinPretty;
    spotPriceBeforeRaw: Dec;
    spotPriceBefore: IntPretty;
    spotPriceAfter: IntPretty;
    priceImpact: IntPretty;
};
declare function estimateSwapExactAmountIn_Raw(inPoolAsset: {
    denom: string;
    amount: Int;
    weight?: Int;
}, outPoolAsset: {
    denom: string;
    amount: Int;
    weight?: Int;
}, poolAssets: {
    amount: Int;
    denom: string;
    scalingFactor: number;
}[], tokenIn: Coin, swapFee: Dec): {
    tokenOutAmount: Int;
    spotPriceBefore: Dec;
    spotPriceAfter: Dec;
    priceImpact: Dec;
};
declare function estimateSwapExactAmountOut_Raw(inPoolAsset: {
    denom: string;
    amount: Int;
    weight?: Int;
}, outPoolAsset: {
    denom: string;
    amount: Int;
    weight?: Int;
}, poolAssets: {
    amount: Int;
    denom: string;
    scalingFactor: number;
}[], tokenOut: Coin, swapFee: Dec): {
    tokenInAmount: Int;
    spotPriceBefore: Dec;
    spotPriceAfter: Dec;
    priceImpact: Dec;
};
export {};
