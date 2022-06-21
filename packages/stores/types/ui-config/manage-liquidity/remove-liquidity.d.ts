import { CoinPretty } from "@keplr-wallet/unit";
import { ChainGetter, IQueriesStore } from "@keplr-wallet/stores";
import { ObservableQueryGammPoolShare, ObservableQueryPools } from "../../queries";
import { ManageLiquidityConfigBase } from "./base";
/** Use to config user input UI for eventually sending a valid exit pool msg.
 *  Included convenience functions for deriving pool asset amounts vs current input %.
 */
export declare class ObservableRemoveLiquidityConfig extends ManageLiquidityConfigBase {
    protected _percentage: string;
    protected _queryPools: ObservableQueryPools;
    constructor(chainGetter: ChainGetter, initialChainId: string, poolId: string, sender: string, queriesStore: IQueriesStore, queryPoolShare: ObservableQueryGammPoolShare, queryPools: ObservableQueryPools, initialPercentage: string);
    /** If invalid, returns `NaN`. */
    get percentage(): number;
    setPercentage(percentage: string): void;
    /** Sender's unbonded GAMM shares equivalent to specified percentage. */
    get poolShareWithPercentage(): CoinPretty;
    /** Pool asset amounts equivalent to senders's unbonded gamm share vs percentage. */
    get poolShareAssetsWithPercentage(): CoinPretty[];
    get error(): Error | undefined;
}
