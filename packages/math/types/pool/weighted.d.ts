import { Dec } from "@keplr-wallet/unit";
export declare const WeightedPoolMath: {
    calcSpotPrice: typeof calcSpotPrice;
    calcOutGivenIn: typeof calcOutGivenIn;
    calcInGivenOut: typeof calcInGivenOut;
    calcPoolOutGivenSingleIn: typeof calcPoolOutGivenSingleIn;
};
export declare function calcSpotPrice(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, swapFee: Dec): Dec;
export declare function calcOutGivenIn(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, tokenAmountIn: Dec, swapFee: Dec): Dec;
export declare function calcInGivenOut(tokenBalanceIn: Dec, tokenWeightIn: Dec, tokenBalanceOut: Dec, tokenWeightOut: Dec, tokenAmountOut: Dec, swapFee: Dec): Dec;
export declare function calcPoolOutGivenSingleIn(tokenBalanceIn: Dec, tokenWeightIn: Dec, poolSupply: Dec, totalWeight: Dec, tokenAmountIn: Dec, swapFee: Dec): Dec;
