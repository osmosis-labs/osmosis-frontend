import { Dec } from "@keplr-wallet/unit";
/**
 * Can provide a swap fee discount if true. Introduced in Osmosis v13.
 *
 * Osmosis addition: https://github.com/osmosis-labs/osmosis/pull/2454
 * Invariants should match: `isOsmoRoutedMultihop` https://github.com/osmosis-labs/osmosis/blob/main/x/gamm/keeper/multihop.go#L266 */
export declare function isOsmoRoutedMultihop(pools: {
    id: string;
    isIncentivized: boolean;
}[], firstPoolOutDenom: string, stakeCurrencyMinDenom: string): boolean;
/**
 * Get's the special swap fee discount for routing through 2 OSMO pools as defined in `isOsmoRoutedMultihop`.
 *
 * Should match: https://github.com/osmosis-labs/osmosis/blob/d868b873fe55942d50f1e6e74900cf8bf1f90f25/x/gamm/keeper/multihop.go#L288-L305
 */
export declare function getOsmoRoutedMultihopTotalSwapFee(pools: {
    swapFee: Dec;
}[]): {
    swapFeeSum: Dec;
    maxSwapFee: Dec;
};
