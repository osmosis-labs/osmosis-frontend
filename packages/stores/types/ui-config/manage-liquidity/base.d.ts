import { TxChainSetter } from "@keplr-wallet/hooks";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { ObservableQueryGammPoolShare } from "../../queries";
export declare class ManageLiquidityConfigBase extends TxChainSetter {
    protected _poolId: string;
    protected _sender: string;
    protected _queryPoolShare: ObservableQueryGammPoolShare;
    protected _queriesStore: IQueriesStore;
    constructor(chainGetter: ChainGetter, initialChainId: string, poolId: string, sender: string, queriesStore: IQueriesStore, queryPoolShare: ObservableQueryGammPoolShare);
    get poolId(): string;
    setPoolId(poolId: string): void;
    setSender(sender: string): void;
    get sender(): string;
    setQueryPoolShare(queryPoolShare: ObservableQueryGammPoolShare): void;
    get poolShare(): CoinPretty;
}
