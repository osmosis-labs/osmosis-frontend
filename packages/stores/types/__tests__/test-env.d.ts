import { AccountSetBase, AccountStore, QueriesStore, CosmosQueries, CosmwasmQueries, CosmosAccount, CosmwasmAccount, ChainStore } from "@keplr-wallet/stores";
import { ChainInfo } from "@keplr-wallet/types";
import { OsmosisQueries, OsmosisAccount } from "..";
export declare const chainId = "localosmosis";
export declare const TestChainInfos: ChainInfo[];
export declare class RootStore {
    readonly chainStore: ChainStore;
    readonly queriesStore: QueriesStore<[
        CosmosQueries,
        CosmwasmQueries,
        OsmosisQueries
    ]>;
    readonly accountStore: AccountStore<[
        CosmosAccount,
        CosmwasmAccount,
        OsmosisAccount
    ]>;
    constructor(mnemonic?: string);
}
export declare function getEventFromTx(tx: any, type: string): any;
/** Recursive pattern match of raw values between two arbitrary objects.
 *  Throws on mismatch.
 */
export declare function deepContained(obj1: any, obj2: any): void;
export declare function initLocalnet(): Promise<void>;
export declare function removeLocalnet(): Promise<void>;
export declare function waitAccountLoaded(account: AccountSetBase): Promise<void>;
