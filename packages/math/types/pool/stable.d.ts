import { Coin, Dec } from '@keplr-wallet/unit';
export declare type StableSwapToken = {
    amount: Dec;
    denom: string;
    scalingFactor: number;
};
export declare function solveCalcOutGivenIn(tokens: StableSwapToken[], tokenIn: Coin, tokenOutDenom: string, swapFee: Dec): Dec;
export declare function calcOutGivenIn(tokens: StableSwapToken[], tokenIn: Coin, tokenOutDenom: string, swapFee: Dec): import("@keplr-wallet/unit").Int;
export declare function calcInGivenOut(tokens: StableSwapToken[], tokenOut: Coin, tokenInDenom: string, swapFee: Dec): import("@keplr-wallet/unit").Int;
export declare function calcSpotPrice(tokens: StableSwapToken[], baseDenom: string, quoteDenom: string): Dec;
export declare function solveCfmm(xReserve: Dec, yReserve: Dec, remReserves: Dec[], yIn: Dec): Dec;
export declare function binarySearch(makeOutput: (est: Dec) => Dec, lowerBound: Dec, upperBound: Dec, targetOutput: Dec, maxIterations?: number, errorTolerance?: Dec): Dec;
