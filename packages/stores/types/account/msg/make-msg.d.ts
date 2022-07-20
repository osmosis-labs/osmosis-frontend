import { MsgOpt } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { Dec, Int } from "@keplr-wallet/unit";
import { Msg } from "@cosmjs/launchpad";
/**
 * Helpers for constructing Amino messages for Osmosis.
 * Amino Ref: https://github.com/tendermint/go-amino/
 *
 * Note: not an exhaustive list.
 */
export declare class Amino {
    static makeMultihopSwapExactAmountInMsg(msgOpt: Pick<MsgOpt, "type">, sender: string, tokenIn: {
        currency: Currency;
        amount: string;
    }, routes: {
        pool: {
            id: string;
            inPoolAsset: {
                coinDecimals: number;
                coinMinimalDenom: string;
                amount: Int;
                weight: Int;
            };
            outPoolAsset: {
                amount: Int;
                weight: Int;
            };
            swapFee: Dec;
        };
        tokenOutCurrency: Currency;
    }[], maxSlippage?: string): {
        type: string;
        value: {
            sender: string;
            routes: {
                poolId: string;
                tokenOutDenom: string;
            }[];
            tokenIn: {
                denom: string;
                amount: string;
            };
            tokenOutMinAmount: string;
        };
    };
    static makeSwapExactAmountInMsg(pool: {
        id: string;
        inPoolAsset: {
            coinDecimals: number;
            coinMinimalDenom: string;
            amount: Int;
            weight: Int;
        };
        outPoolAsset: {
            amount: Int;
            weight: Int;
        };
        swapFee: Dec;
    }, msgOpt: Pick<MsgOpt, "type">, sender: string, tokenIn: {
        currency: Currency;
        amount: string;
    }, tokenOutCurrency: Currency, maxSlippage?: string): Msg;
    static makeSwapExactAmountOutMsg(pool: {
        id: string;
        inPoolAsset: {
            coinDecimals: number;
            coinMinimalDenom: string;
            amount: Int;
            weight: Int;
        };
        outPoolAsset: {
            amount: Int;
            weight: Int;
        };
        swapFee: Dec;
    }, msgOpt: Pick<MsgOpt, "type">, sender: string, tokenInCurrency: Currency, tokenOut: {
        currency: Currency;
        amount: string;
    }, maxSlippage?: string): Msg;
}
