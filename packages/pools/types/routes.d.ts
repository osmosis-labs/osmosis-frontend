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
    /**
     * Can provide a swap fee discount if true. Introduced in Osmosis v13.
     *
     * Osmosis addition: https://github.com/osmosis-labs/osmosis/pull/2454
     * Invariants should match: `isOsmoRoutedMultihop` https://github.com/osmosis-labs/osmosis/blob/main/x/gamm/keeper/multihop.go#L266 */
    protected isOsmoRoutedMultihop({ pools, tokenOutDenoms, }: RoutePath): boolean;
    /**
     * Get's the special swap fee discount for routing through 2 OSMO pools as defined in `isOsmoRoutedMultihop`.
     *
     * Should match: https://github.com/osmosis-labs/osmosis/blob/d868b873fe55942d50f1e6e74900cf8bf1f90f25/x/gamm/keeper/multihop.go#L288-L305
     */
    protected getOsmoRoutedMultihopTotalSwapFee({ pools }: RoutePath): {
        swapFeeSum: Dec;
        maxSwapFee: Dec;
    };
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
