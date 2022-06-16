import { Dec, RatePretty } from "@keplr-wallet/unit";
export declare class ObservableSlippageConfig {
    static readonly defaultSelectableSlippages: ReadonlyArray<Dec>;
    protected _selectableSlippages: ReadonlyArray<Dec>;
    protected _selectedIndex: number;
    protected _isManualSlippage: boolean;
    protected _manualSlippage: string;
    constructor();
    setSelectableSlippages(slippages: ReadonlyArray<Dec>): void;
    select(index: number): void;
    get isManualSlippage(): boolean;
    setIsManualSlippage(value: boolean): void;
    setManualSlippage(str: string): void;
    get manualSlippageStr(): string;
    get manualSlippage(): RatePretty;
    get slippage(): RatePretty;
    get selectableSlippages(): {
        slippage: RatePretty;
        index: number;
        selected: boolean;
    }[];
    getManualSlippageError: () => Error | undefined;
}
