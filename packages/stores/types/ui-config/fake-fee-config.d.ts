import { FeeType, IFeeConfig, TxChainSetter } from "@keplr-wallet/hooks";
import { ChainGetter, CoinPrimitive } from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { StdFee } from "@cosmjs/launchpad";
/**
 * FakeFeeConfig is used to set the fee with the high gas price step.
 * Currently, Keplr wallet doesn't support to set the fee manually in the frontend.
 * Keplr wallet just override the fee always in the wallet side.
 * So, setting the exact max amount is not possible.
 * To mitigate this problem, just set the max amount minus high fee setting.
 */
export declare class FakeFeeConfig extends TxChainSetter implements IFeeConfig {
    protected _gas: number;
    protected _shouldZero: boolean;
    constructor(chainGetter: ChainGetter, initialChainId: string, gas: number);
    get gas(): number;
    get fee(): CoinPretty | undefined;
    get feeCurrencies(): Currency[];
    get feeCurrency(): Currency | undefined;
    feeType: FeeType | undefined;
    get error(): Error | undefined;
    get shouldZero(): boolean;
    setShouldZero(value: boolean): void;
    readonly getFeePrimitive: () => CoinPrimitive | undefined;
    getFeeTypePretty(_feeType: FeeType): CoinPretty;
    setFeeType(_feeType: FeeType | undefined): void;
    toStdFee(): StdFee;
    isManual: boolean;
}
