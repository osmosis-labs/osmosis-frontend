export declare class NegativeSwapFeeError extends Error {
    constructor(m: string);
}
export declare class HighSwapFeeError extends Error {
    constructor(m: string);
}
export declare class InvalidSwapFeeError extends Error {
    constructor(m: string);
}
export declare class InvalidScalingFactorControllerAddress extends Error {
    constructor(m: string);
}
export declare class MinAssetsCountError extends Error {
    constructor(m: string);
}
export declare class MaxAssetsCountError extends Error {
    constructor(m: string);
}
export declare class NegativePercentageError extends Error {
    constructor(m: string);
}
export declare class PercentageSumError extends Error {
    constructor(m: string);
}
export declare class DepositNoBalanceError extends Error {
    constructor(m: string);
}
export declare class NegativeSlippageError extends Error {
    constructor(m: string);
}
export declare class InvalidSlippageError extends Error {
    constructor(m: string);
}
export declare class NoSendCurrencyError extends Error {
    constructor(m: string);
}
export declare class InsufficientBalanceError extends Error {
    constructor(m: string);
}
export * from "./manage-liquidity/errors";
