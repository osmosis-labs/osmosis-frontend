import { Coin, Dec } from "@keplr-wallet/unit";
import { BigDec } from "../big-dec";
export declare const StableSwapMath: {
    calcOutGivenIn: typeof calcOutGivenIn;
    calcInGivenOut: typeof calcInGivenOut;
    calcSpotPrice: typeof calcSpotPrice;
};
export declare type StableSwapToken = {
    amount: Dec;
    denom: string;
    scalingFactor: number;
};
declare type BigDecStableSwapToken = {
    amount: BigDec;
    denom: string;
    scalingFactor: number;
};
export declare function solveCalcOutGivenIn(tokens: StableSwapToken[], tokenIn: Coin, tokenOutDenom: string, swapFee: Dec): BigDec;
export declare function calcOutGivenIn(tokens: StableSwapToken[], tokenIn: Coin, tokenOutDenom: string, swapFee: Dec): import("@keplr-wallet/unit").Int;
export declare function calcInGivenOut(tokens: StableSwapToken[], tokenOut: Coin, tokenInDenom: string, swapFee: Dec): import("@keplr-wallet/unit").Int;
export declare function scaleTokens(tokens: StableSwapToken[]): BigDecStableSwapToken[];
export declare function calcSpotPrice(tokens: StableSwapToken[], baseDenom: string, quoteDenom: string): Dec;
export declare function solveCfmm(xReserve: BigDec, yReserve: BigDec, remReserves: BigDec[], yIn: BigDec): BigDec;
export declare function solveCfmmBinarySearchMulti(xReserve: BigDec, yReserve: BigDec, wSumSquares: BigDec, yIn: BigDec): BigDec;
export declare function targetKCalculator(x0: BigDec, y0: BigDec, w: BigDec, yf: BigDec): BigDec;
export declare function iterKCalculator(xf: BigDec, x0: BigDec, w: BigDec, yf: BigDec): BigDec;
/**
 multi-asset CFMM is xyv(x^2 + y^2 + w) = k,
 where u is the product of the reserves of assets
 outside of x and y (e.g. u = wz), and v is the sum
 of their squares (e.g. v = w^2 + z^2).
 When u = 1 and v = 0, this is equivalent to solidly's CFMM
 */
export declare function cfmmConstantMultiNoV(xReserve: BigDec, yReserve: BigDec, wSumSquares: BigDec): BigDec;
export declare function binarySearch(makeOutput: (est: BigDec) => BigDec, lowerBound: BigDec, upperBound: BigDec, targetOutput: BigDec, maxIterations?: number, errorTolerance?: BigDec): BigDec;
export declare function compareBigDec_checkMultErrorTolerance(expected: BigDec, actual: BigDec, tolerance: BigDec, roundingMode: string): number;
export declare function compareDec_checkMultErrorTolerance(expected: Dec, actual: Dec, tolerance: Dec, roundingMode: string): number;
export declare function calcWSumSquares(remReserves: BigDec[]): BigDec;
export {};
