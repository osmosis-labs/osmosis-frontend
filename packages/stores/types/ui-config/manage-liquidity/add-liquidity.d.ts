import { ObservableQueryBalances, ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { IntPretty, CoinPretty, RatePretty } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { AmountConfig } from "@keplr-wallet/hooks";
import { ObservableQueryPools, ObservableQueryGammPoolShare } from "../../queries";
import { ManageLiquidityConfigBase } from "./base";
/** Use to config user input UI for eventually sending a valid add liquidity msg.
 *  Supports specifying a single asset LP amount, or evenly adding liquidity from an aribtrary number of pool assets.
 */
export declare class ObservableAddLiquidityConfig extends ManageLiquidityConfigBase {
    protected _queryBalances: ObservableQueryBalances;
    protected _queryPools: ObservableQueryPools;
    protected _shareOutAmount: IntPretty | undefined;
    protected _isSingleAmountIn: boolean;
    protected _singleAmountInConfigIndex: number;
    protected _cacheAmountConfigs?: {
        poolId: string;
        sender: string;
        configs: AmountConfig[];
    };
    constructor(chainGetter: ChainGetter, initialChainId: string, poolId: string, sender: string, queriesStore: IQueriesStore, queryPoolShare: ObservableQueryGammPoolShare, queryPools: ObservableQueryPools, queryBalances: ObservableQueryBalances);
    get isSingleAmountIn(): boolean;
    get singleAmountInAsset(): {
        weight: IntPretty;
        weightFraction: RatePretty;
        amount: CoinPretty;
        currency: Currency & {
            originCurrency?: Currency & {
                pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
            };
        };
    } | undefined;
    get singleAmountInConfig(): AmountConfig | undefined;
    setIsSingleAmountIn(value: boolean): void;
    setSingleAmountInConfigIndex(index: number): void;
    setSingleAmountInConfig(coinDenom: string): void;
    get singleAmountInPriceImpact(): RatePretty | undefined;
    get singleAmountInBalance(): CoinPretty | undefined;
    get poolAssetConfigs(): AmountConfig[];
    get poolAssets(): {
        weight: IntPretty;
        weightFraction: RatePretty;
        amount: CoinPretty;
        currency: Currency & {
            originCurrency?: Currency & {
                pegMechanism?: "algorithmic" | "collateralized" | "hybrid";
            };
        };
    }[];
    get totalWeight(): IntPretty;
    get totalShare(): IntPretty;
    get shareOutAmount(): IntPretty | undefined;
    setAmountAt(index: number, amount: string, isMax?: boolean): void;
    getAmountAt(index: number): string;
    getSenderBalanceAt(index: number): CoinPretty;
    setMax(): void;
    get error(): Error | undefined;
}
