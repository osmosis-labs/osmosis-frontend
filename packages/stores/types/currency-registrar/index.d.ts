import { ChainInfo, AppCurrency } from "@keplr-wallet/types";
import { ChainStore } from "@keplr-wallet/stores";
export declare class LPCurrencyRegistrar<C extends ChainInfo = ChainInfo> {
    protected readonly chainStore: ChainStore<C>;
    constructor(chainStore: ChainStore<C>);
    protected readonly registerLPCurrency: (coinMinimalDenom: string) => AppCurrency | [AppCurrency | undefined, boolean] | undefined;
}
