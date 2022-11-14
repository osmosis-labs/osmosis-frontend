import { Coin, Dec } from "@keplr-wallet/unit";
export declare type StableSwapToken = {
    amount: Dec;
    denom: string;
    scalingFactor: number;
};
export declare function calcOutGivenIn(tokens: StableSwapToken[], tokenIn: Coin, tokenOutDenom: string, swapFee: Dec): Dec;
export declare function calcInGivenOut(): void;
export declare function solveCfmm(xReserve: Dec, yReserve: Dec, remReserves: Dec[], yIn: Dec): Dec;
export declare function binarySearch(makeOutput: (est: Dec) => Dec, lowerBound: Dec, upperBound: Dec, targetOutput: Dec, maxIterations?: number, errorTolerance?: Dec): Dec;
