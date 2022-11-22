import { Dec, Int } from "@keplr-wallet/unit";
import { Pool } from "./interface";
export interface RoutePath {
    pools: Pool[];
    tokenOutDenoms: string[];
    tokenInDenom: string;
}
export interface RoutePathWithAmount extends RoutePath {
    amount: Int;
}
export declare class OptimizedRoutes {
    protected readonly stakeCurrencyMinDenom: string;
    protected _pools: ReadonlyArray<Pool>;
    protected _incentivizedPoolIds: string[];
    protected candidatePathsCache: Map<string, RoutePath[]>;
    constructor(pools: ReadonlyArray<Pool>, incventivizedPoolIds: string[], stakeCurrencyMinDenom: string);
    get pools(): ReadonlyArray<Pool>;
    protected clearCache(): void;
    protected getCandidatePaths(tokenInDenom: string, tokenOutDenom: string, permitIntermediate: boolean): RoutePath[];
    getOptimizedRoutesByTokenIn(tokenIn: {
        denom: string;
        amount: Int;
    }, tokenOutDenom: string, maxPools: number): RoutePathWithAmount[];
    calculateTokenOutByTokenIn(routes: RoutePathWithAmount[]): {
        amount: Int;
        beforeSpotPriceInOverOut: Dec;
        beforeSpotPriceOutOverIn: Dec;
        afterSpotPriceInOverOut: Dec;
        afterSpotPriceOutOverIn: Dec;
        effectivePriceInOverOut: Dec;
        effectivePriceOutOverIn: Dec;
        tokenInFeeAmount: Int;
        swapFee: Dec;
        multiHopOsmoDiscount: boolean;
        priceImpact: Dec;
    };
}
