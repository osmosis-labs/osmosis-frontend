import { Dec, Int } from "@keplr-wallet/unit";
export declare const WeightedPoolMath: {
    calcPriceImpactTokenIn: typeof calcPriceImpactTokenIn;
    calcPriceImpactTokenOut: typeof calcPriceImpactTokenOut;
    calcSpotPrice: typeof calcSpotPrice;
    calcOutGivenIn: typeof calcOutGivenIn;
    calcInGivenOut: typeof calcInGivenOut;
    calcPoolOutGivenSingleIn: typeof calcPoolOutGivenSingleIn;
};
export declare function calcPriceImpactTokenIn(spotPriceBefore: Dec, tokenIn: Int, priceImpact: Dec): Int;
export declare function calcPriceImpactTokenOut(spotPriceBefore: Dec, tokenOut: Int, priceImpact: Dec): Int;
export declare function calcSpotPrice(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, swapFee: Dec): Dec;
export declare function calcOutGivenIn(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, tokenAmountIn: Dec, swapFee: Dec): Dec;
export declare function calcInGivenOut(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, tokenAmountOut: Dec, swapFee: Dec): Dec;
export declare function calcPoolOutGivenSingleIn(tokenBalanceIn: Dec, tokenWeightIn: Dec, poolSupply: Dec, totalWeight: Dec, tokenAmountIn: Dec, swapFee: Dec): Dec;
