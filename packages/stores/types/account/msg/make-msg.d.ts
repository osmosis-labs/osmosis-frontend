import { MsgOpt } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { Dec, Int } from "@keplr-wallet/unit";
import { Msg } from "@cosmjs/launchpad";
/**
 * Helpers for constructing Amino messages involving min amount estimates for Osmosis.
 * Amino Ref: https://github.com/tendermint/go-amino/
 *
 * Note: not an exhaustive list.
 */
export declare class Amino {
    /** Estimate min amount out givem a pool with asset weights or reserves with scaling factors. (AKA weighted, or stable.) */
    static makeMultihopSwapExactAmountInMsg(msgOpt: Pick<MsgOpt, "type">, sender: string, tokenIn: {
        currency: Currency;
        amount: string;
    }, pools: {
        pool: {
            id: string;
            swapFee: Dec;
            inPoolAsset: {
                coinDecimals: number;
                coinMinimalDenom: string;
                amount: Int;
                weight?: Int;
            };
            outPoolAsset: {
                denom: string;
                amount: Int;
                weight?: Int;
            };
            poolAssets: {
                amount: Int;
                denom: string;
                scalingFactor: number;
            }[];
            isIncentivized: boolean;
        };
        tokenOutCurrency: Currency;
    }[], stakeCurrencyMinDenom: string, maxSlippage?: string): {
        type: string;
        value: {
            sender: string;
            routes: {
                pool_id: string;
                token_out_denom: string;
            }[];
            token_in: {
                denom: string;
                amount: string;
            };
            token_out_min_amount: string;
        };
    };
    /** Estimate min amount out given a pool with asset weights or reserves with scaling factors. (AKA weighted, or stable.) */
    static makeSwapExactAmountInMsg(pool: {
        id: string;
        inPoolAsset: {
            coinDecimals: number;
            coinMinimalDenom: string;
            amount: Int;
            weight?: Int;
        };
        outPoolAsset: {
            denom: string;
            amount: Int;
            weight?: Int;
        };
        poolAssets: {
            amount: Int;
            denom: string;
            scalingFactor: number;
        }[];
        swapFee: Dec;
    }, msgOpt: Pick<MsgOpt, "type">, sender: string, tokenIn: {
        currency: Currency;
        amount: string;
    }, tokenOutCurrency: Currency, maxSlippage?: string): Msg;
    /** Estimate min amount in given a pool with asset weights or reserves with scaling factors. (AKA weighted, or stable.) */
    static makeSwapExactAmountOutMsg(pool: {
        id: string;
        inPoolAsset: {
            coinDecimals: number;
            coinMinimalDenom: string;
            amount: Int;
            weight?: Int;
        };
        outPoolAsset: {
            denom: string;
            amount: Int;
            weight?: Int;
        };
        poolAssets: {
            amount: Int;
            denom: string;
            scalingFactor: number;
        }[];
        swapFee: Dec;
    }, msgOpt: Pick<MsgOpt, "type">, sender: string, tokenInCurrency: Currency, tokenOut: {
        currency: Currency;
        amount: string;
    }, maxSlippage?: string): Msg;
}
