import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { MintParmas } from "./types";
import { KVStore } from "@keplr-wallet/common";
import { Dec } from "@keplr-wallet/unit";
export declare class ObservableQueryMintParmas extends ObservableChainQuery<MintParmas> {
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter);
    get mintDenom(): string | undefined;
    get epochIdentifier(): string | undefined;
    get distributionProportions(): {
        staking: Dec;
        poolIncentives: Dec;
        developerRewards: Dec;
    };
}
