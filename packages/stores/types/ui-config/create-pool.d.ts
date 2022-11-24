import { TxChainSetter, IFeeConfig } from "@keplr-wallet/hooks";
import { ObservableQueryBalances, ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { AmountConfig } from "@keplr-wallet/hooks";
import { AppCurrency } from "@keplr-wallet/types";
import { RatePretty } from "@keplr-wallet/unit";
import type { ObservableQueryPool } from "../queries";
export interface CreatePoolConfigOpts {
    minAssetsCount: number;
    maxAssetsCount: number;
}
export declare class ObservableCreatePoolConfig extends TxChainSetter {
    protected _sender: string;
    protected _feeConfig: IFeeConfig | undefined;
    protected _queriesStore: IQueriesStore;
    protected _queryBalances: ObservableQueryBalances;
    protected _assets: {
        percentage?: string;
        scalingFactor?: number;
        amountConfig: AmountConfig;
    }[];
    protected _poolType: ObservableQueryPool["type"] | null;
    protected _swapFee: string;
    protected _scalingFactorControllerAddress: string;
    _acknowledgeFee: boolean;
    protected _opts: CreatePoolConfigOpts;
    constructor(chainGetter: ChainGetter, initialChainId: string, sender: string, queriesStore: IQueriesStore, queryBalances: ObservableQueryBalances, feeConfig?: IFeeConfig, opts?: CreatePoolConfigOpts);
    get feeConfig(): IFeeConfig | undefined;
    get assets(): {
        percentage?: string;
        scalingFactor?: number;
        amountConfig: AmountConfig;
    }[];
    get canAddAsset(): boolean;
    get sender(): string;
    get poolType(): ObservableQueryPool["type"] | null;
    get queryBalances(): ObservableQueryBalances;
    get acknowledgeFee(): boolean;
    set acknowledgeFee(ack: boolean);
    get sendableCurrencies(): AppCurrency[];
    get swapFee(): string;
    get scalingFactorControllerAddress(): string;
    /**
     * sendableCurrencies 중에서 현재 assets에 없는 currency들을 반환한다.
     * Among the SendableCurrencies, return currencies that are not currently in Assets.
     */
    get remainingSelectableCurrencies(): AppCurrency[];
    /** Get the humanized (non-rounded) percentage for creating a balanced pool
     *  from the current number of assets.
     */
    get balancedPercentage(): RatePretty;
    get positiveBalanceError(): Error | undefined;
    get assetCountError(): Error | undefined;
    get percentageError(): Error | undefined;
    get scalingFactorError(): Error | undefined;
    get swapFeeError(): Error | undefined;
    get amountError(): Error | undefined;
    get scalingFactorControllerError(): Error | undefined;
    setFeeConfig(config: IFeeConfig | undefined): void;
    setSender(bech32Address: string): void;
    setPoolType(poolType: ObservableQueryPool["type"] | null): void;
    setScalingFactorControllerAddress(address: string): void;
    setSwapFee(swapFee: string): void;
    addAsset(currency: AppCurrency): void;
    removeAssetAt(index: number): void;
    setAssetPercentageAt(index: number, percentage: string): void;
    setScalingFactorAt(index: number, scalingFactor: string): void;
    /** Set percentages for all assets for an evenly balanced pool. */
    setBalancedPercentages(): void;
}
