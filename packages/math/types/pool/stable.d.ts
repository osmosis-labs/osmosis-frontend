import { Coin, Dec } from "@keplr-wallet/unit";
export declare const StableSwapMath: {
    calcOutGivenIn: typeof calcOutGivenIn;
    calcInGivenOut: typeof calcInGivenOut;
    calcSpotPrice: typeof calcSpotPrice;
    solveCfmm: typeof solveCfmm;
    compare_checkMultErrorTolerance: typeof compare_checkMultErrorTolerance;
};
export declare type StableSwapToken = {
    amount: Dec;
    denom: string;
    scalingFactor: number;
};
export declare function solveCalcOutGivenIn(tokens: StableSwapToken[], tokenIn: Coin, tokenOutDenom: string, swapFee: Dec): Dec;
export declare function calcOutGivenIn(tokens: StableSwapToken[], tokenIn: Coin, tokenOutDenom: string, swapFee: Dec): import("@keplr-wallet/unit").Int;
export declare function calcInGivenOut(tokens: StableSwapToken[], tokenOut: Coin, tokenInDenom: string, swapFee: Dec): import("@keplr-wallet/unit").Int;
export declare function scaleTokens(tokens: StableSwapToken[]): StableSwapToken[];
export declare function calcSpotPrice(tokens: StableSwapToken[], baseDenom: string, quoteDenom: string): Dec;
export declare function solveCfmm(xReserve: Dec, yReserve: Dec, remReserves: Dec[], yIn: Dec): Dec;
export declare function solveCfmmBinarySearchMulti(xReserve: Dec, yReserve: Dec, wSumSquares: Dec, yIn: Dec): Dec;
/**
 multi-asset CFMM is xyv(x^2 + y^2 + w) = k,
 where u is the product of the reserves of assets
 outside of x and y (e.g. u = wz), and v is the sum
 of their squares (e.g. v = w^2 + z^2).
 When u = 1 and v = 0, this is equivalent to solidly's CFMM
 */
export declare function cfmmConstantMultiNoV(xReserve: Dec, yReserve: Dec, wSumSquares: Dec): Dec;
export declare function binarySearch(makeOutput: (est: Dec) => Dec, lowerBound: Dec, upperBound: Dec, targetOutput: Dec, maxIterations?: number, errorTolerance?: Dec): Dec;
export declare function compare_checkMultErrorTolerance(expected: Dec, actual: Dec, tolerance: Dec, roundingMode: string): number;
