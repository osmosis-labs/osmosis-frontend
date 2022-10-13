import { DeepPartial } from "utility-types";
import { ChainGetter, IQueriesStore, AccountSetBaseSuper, CosmosAccount, CosmosQueries } from "@keplr-wallet/stores";
import { Coin, CoinPretty } from "@keplr-wallet/unit";
import { Currency, KeplrSignOptions } from "@keplr-wallet/types";
import { OsmosisQueries } from "../queries";
import { OsmosisMsgOpts } from "./types";
import { StdFee } from "@cosmjs/launchpad";
export interface OsmosisAccount {
    osmosis: OsmosisAccountImpl;
}
export declare const OsmosisAccount: {
    use(options: {
        msgOptsCreator?: ((chainId: string) => DeepPartial<OsmosisMsgOpts> | undefined) | undefined;
        queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
    }): (base: AccountSetBaseSuper & CosmosAccount, chainGetter: ChainGetter, chainId: string) => OsmosisAccount;
};
export declare class OsmosisAccountImpl {
    protected readonly base: AccountSetBaseSuper & CosmosAccount;
    protected readonly chainGetter: ChainGetter;
    protected readonly chainId: string;
    protected readonly queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
    protected readonly _msgOpts: OsmosisMsgOpts;
    constructor(base: AccountSetBaseSuper & CosmosAccount, chainGetter: ChainGetter, chainId: string, queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>, _msgOpts: OsmosisMsgOpts);
    /**
     * https://docs.osmosis.zone/developing/modules/spec-gamm.html#create-pool
     * @param swapFee The swap fee of the pool. Should set as the percentage. (Ex. 10% -> 10)
     * @param assets Assets that will be provided to the pool initially. Token can be parsed as to primitive by convenience. `amount`s are not in micro.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fulfillment.
     */
    sendCreatePoolMsg(swapFee: string, assets: {
        weight: string;
        token: {
            currency: Currency;
            amount: string;
        };
    }[], memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * https://docs.osmosis.zone/developing/modules/spec-gamm.html#join-pool
     * @param poolId Id of pool.
     * @param shareOutAmount LP share amount.
     * @param maxSlippage Max tolerated slippage. Default: 2.5.
     * @param memo Memo attachment.
     * @param onFulfill Callback to handle tx fulfillment.
     */
    sendJoinPoolMsg(poolId: string, shareOutAmount: string, maxSlippage?: string, memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * Join pool with only one asset.
     *
     * https://docs.osmosis.zone/developing/modules/spec-gamm.html#join-swap-extern-amount-in
     * @param poolId Id of pool to swap within.
     * @param tokenIn Token being swapped in. `tokenIn.amount` is NOT in micro amount.
     * @param maxSlippage Max tolerated slippage. Default: 2.5.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendJoinSwapExternAmountInMsg(poolId: string, tokenIn: {
        currency: Currency;
        amount: string;
    }, maxSlippage?: string, memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * Perform multiple swaps that are routed through multiple pools, with a desired input token.
     *
     * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-in
     * @param routes Desired pools to swap through.
     * @param tokenIn Token being swapped.
     * @param maxSlippage Max tolerated slippage.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendMultihopSwapExactAmountInMsg(routes: {
        poolId: string;
        tokenOutCurrency: Currency;
    }[], tokenIn: {
        currency: Currency;
        amount: string;
    }, maxSlippage?: string, memo?: string, stdFee?: Partial<StdFee>, signOptions?: KeplrSignOptions, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-in
     * @param poolId Id of pool to swap within.
     * @param tokenIn Token being swapped in. `tokenIn.amount` is NOT in micro.
     * @param tokenOutCurrency Currency of outgoing token.
     * @param maxSlippage Max tolerated slippage.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendSwapExactAmountInMsg(poolId: string, tokenIn: {
        currency: Currency;
        amount: string;
    }, tokenOutCurrency: Currency, maxSlippage?: string, memo?: string, stdFee?: Partial<StdFee>, signOptions?: KeplrSignOptions, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-out
     * @param poolId Id of pool to swap within.
     * @param tokenInCurrency Currency of incoming token.
     * @param tokenOut Token being swapped. `tokenIn.amount` is NOT in micro.
     * @param maxSlippage Max amount of tolerated slippage.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendSwapExactAmountOutMsg(poolId: string, tokenInCurrency: Currency, tokenOut: {
        currency: Currency;
        amount: string;
    }, maxSlippage?: string, memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * https://docs.osmosis.zone/developing/modules/spec-gamm.html#exit-pool
     * @param poolId Id of pool to exit.
     * @param shareInAmount LP shares to redeem.
     * @param maxSlippage Max tolerated slippage. Default: 2.5.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendExitPoolMsg(poolId: string, shareInAmount: string, maxSlippage?: string, memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * https://docs.osmosis.zone/developing/modules/spec-lockup.html#lock-tokens
     * @param duration Duration, in seconds, to lock up the tokens.
     * @param tokens Tokens to lock. `amount`s are not in micro.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendLockTokensMsg(duration: number, tokens: {
        currency: Currency;
        amount: string;
    }[], memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /** https://docs.osmosis.zone/overview/osmo.html#superfluid-staking
     * @param lockIds Ids of LP bonded locks.
     * @param validatorAddress Bech32 address of validator to delegate to.
     * @param memo Tx memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendSuperfluidDelegateMsg(lockIds: string[], validatorAddress: string, memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /** https://docs.osmosis.zone/overview/osmo.html#superfluid-staking
     * @param tokens LP tokens to delegate and lock. `amount`s are not in micro.
     * @param validatorAddress Validator address to delegate to.
     * @param memo Tx memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendLockAndSuperfluidDelegateMsg(tokens: {
        currency: Currency;
        amount: string;
    }[], validatorAddress: string, memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * https://docs.osmosis.zone/developing/modules/spec-lockup.html#begin-unlock-by-id
     * @param lockIds Ids of locks to unlock.
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendBeginUnlockingMsg(lockIds: string[], memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    /**
     * https://docs.osmosis.zone/developing/osmosis-core/modules/spec-superfluid.html#superfluid-unbond-lock
     * @param locks IDs and whether the lock is synthetic
     * @param memo Transaction memo.
     * @param onFulfill Callback to handle tx fullfillment.
     */
    sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(locks: {
        lockId: string;
        isSyntheticLock: boolean;
    }[], memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    sendUnPoolWhitelistedPoolMsg(poolId: string, memo?: string, onFulfill?: (tx: any) => void): Promise<void>;
    protected changeDecStringToProtoBz(decStr: string): string;
    protected get queries(): import("utility-types/dist/mapped-types")._DeepReadonlyObject<{
        queryGammPools: import("../queries").ObservableQueryPools;
        queryGammNumPools: import("../queries").ObservableQueryNumPools;
        queryGammPoolShare: import("../queries").ObservableQueryGammPoolShare;
        queryLockedCoins: import("../queries").ObservableQueryAccountLockedCoins;
        querySyntheticLockupsByLockId: import("../queries").ObservableSyntheticLockupsByLockId;
        queryUnlockingCoins: import("../queries").ObservableQueryAccountUnlockingCoins;
        queryAccountLocked: import("../queries").ObservableQueryAccountLocked;
        queryMintParams: import("../queries").ObservableQueryMintParmas;
        queryEpochProvisions: import("../queries").ObservableQueryEpochProvisions;
        queryEpochs: import("../queries").ObservableQueryEpochs;
        queryLockableDurations: import("../queries").ObservableQueryLockableDurations;
        queryDistrInfo: import("../queries/pool-incentives/distr-info").ObservableQueryDistrInfo;
        queryIncentivizedPools: import("../queries").ObservableQueryIncentivizedPools;
        queryGauge: import("../queries").ObservableQueryGuage;
        queryPoolsGaugeIds: import("../queries").ObservableQueryPoolsGaugeIds;
        queryPoolCreationFee: import("../queries").ObservableQueryPoolCreationFee;
        querySuperfluidPools: import("../queries").ObservableQuerySuperfluidPools;
        querySuperfluidDelegations: import("../queries").ObservableQuerySuperfluidDelegations;
        querySuperfluidUndelegations: import("../queries").ObservableQuerySuperfluidUndelegations;
        querySuperfluidParams: import("../queries").ObservableQuerySuperfluidParams;
        querySuperfluidAssetMultiplier: import("../queries").ObservableQuerySuperfluidAssetMultiplier;
        querySuperfluidOsmoEquivalent: import("../queries").ObservableQuerySuperfluidOsmoEquivalent;
    }>;
    protected makeCoinPretty: (coin: Coin) => CoinPretty;
}
export * from "./types";
