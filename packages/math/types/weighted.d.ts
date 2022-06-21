import { Dec, Int, IntPretty, Coin, CoinPretty } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
export declare class WeightedPoolMath {
    protected static oneDec: Dec;
    protected static twoDec: Dec;
    protected static zeroInt: Int;
    protected static twoInt: Int;
    protected static powPrecision: Dec;
    static calcSlippageTokenIn(spotPriceBefore: Dec, tokenIn: Int, slippage: Dec): Int;
    static calcSlippageTokenOut(spotPriceBefore: Dec, tokenOut: Int, slippage: Dec): Int;
    static calcSlippageSlope(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenWeightOut: Dec, swapFee: Dec): Dec;
    static calcSpotPrice(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, swapFee: Dec): Dec;
    static calcOutGivenIn(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, tokenAmountIn: Dec, swapFee: Dec): Dec;
    static calcInGivenOut(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, tokenAmountOut: Dec, swapFee: Dec): Dec;
    static calcPoolOutGivenSingleIn(tokenBalanceIn: Dec, tokenWeightIn: Dec, poolSupply: Dec, totalWeight: Dec, tokenAmountIn: Dec, swapFee: Dec): Dec;
    static calcSingleInGivenPoolOut(tokenBalanceIn: Dec, tokenWeightIn: Dec, poolSupply: Dec, totalWeight: Dec, poolAmountOut: Dec, swapFee: Dec): Dec;
    static calcSingleOutGivenPoolIn(tokenBalanceOut: Dec, tokenWeightOut: Dec, poolSupply: Dec, totalWeight: Dec, poolAmountIn: Dec, swapFee: Dec): Dec;
    static calcPoolInGivenSingleOut(tokenBalanceOut: Dec, tokenWeightOut: Dec, poolSupply: Dec, totalWeight: Dec, tokenAmountOut: Dec, swapFee: Dec): Dec;
    static pow(base: Dec, exp: Dec): Dec;
    protected static powInt(base: Dec, power: Int): Dec;
    protected static absDifferenceWithSign(a: Dec, b: Dec): [Dec, boolean];
    protected static powApprox(base: Dec, exp: Dec, precision: Dec): Dec;
}
export declare class WeightedPoolEstimates {
    static estimateJoinSwapExternAmountIn(poolAsset: {
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
    static estimateJoinSwap(pool: {
        totalShare: Int;
    }, poolAssets: {
        denom: string;
        amount: Int;
    }[], makeCoinPretty: (coin: Coin) => CoinPretty, shareOutAmount: string, shareCoinDecimals: number): {
        tokenIns: CoinPretty[];
    };
    static estimateExitSwap(pool: {
        totalShare: Int;
        poolAssets: {
            denom: string;
            amount: Int;
        }[];
    }, makeCoinPretty: (coin: Coin) => CoinPretty, shareInAmount: string, shareCoinDecimals: number): {
        tokenOuts: CoinPretty[];
    };
    static estimateSwapExactAmountIn(pool: {
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
        slippage: IntPretty;
        raw: ReturnType<typeof WeightedPoolEstimates_Raw.estimateSwapExactAmountIn>;
    };
    static estimateSwapExactAmountOut(pool: {
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
        slippage: IntPretty;
        raw: ReturnType<typeof WeightedPoolEstimates_Raw.estimateSwapExactAmountOut>;
    };
    static estimateMultihopSwapExactAmountIn(tokenIn: {
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
        slippage: IntPretty;
    };
}
declare class WeightedPoolEstimates_Raw {
    static estimateSwapExactAmountIn(inPoolAsset: {
        amount: Int;
        weight: Int;
    }, outPoolAsset: {
        amount: Int;
        weight: Int;
    }, tokenIn: Coin, swapFee: Dec): {
        tokenOutAmount: Int;
        spotPriceBefore: Dec;
        spotPriceAfter: Dec;
        slippage: Dec;
    };
    static estimateSwapExactAmountOut(inPoolAsset: {
        amount: Int;
        weight: Int;
    }, outPoolAsset: {
        amount: Int;
        weight: Int;
    }, tokenOut: Coin, swapFee: Dec): {
        tokenInAmount: Int;
        spotPriceBefore: Dec;
        spotPriceAfter: Dec;
        slippage: Dec;
    };
    static estimateJoinPool(totalShare: Int, poolAssets: {
        denom: string;
        amount: Int;
    }[], shareOutAmount: Int): {
        tokenIns: Coin[];
    };
    static estimateExitPool(totalShare: Int, poolAssets: {
        denom: string;
        amount: Int;
    }[], shareInAmount: Int): {
        tokenOuts: Coin[];
    };
    static estimateJoinSwapExternAmountIn(poolAsset: {
        amount: Int;
        weight: Int;
    }, totalShare: Int, totalWeight: Int, tokenIn: Coin, swapFee: Dec): {
        shareOutAmount: Int;
    };
    static calculateMinTokenOutByTokenInWithSlippage(beforeSpotPriceInOverOut: Dec, tokenInAmount: Int, slippage: Dec): Int;
    static calculateMaxTokenInByTokenOutWithSlippage(beforeSpotPriceInOverOut: Dec, tokenOutAmount: Int, slippage: Dec): Int;
}
export {};
