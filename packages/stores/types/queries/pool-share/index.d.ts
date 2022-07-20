import { ObservableQueryBalances } from "@keplr-wallet/stores";
import { Currency, FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, PricePretty, RatePretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
import { ObservableQueryAccountLocked, ObservableQueryAccountLockedCoins, ObservableQueryAccountUnlockingCoins } from "../lockup";
import { ObservableQueryPools } from "../pools";
export declare class ObservableQueryGammPoolShare {
    protected readonly queryPools: ObservableQueryPools;
    protected readonly queryBalances: ObservableQueryBalances;
    protected readonly queryAccountLocked: ObservableQueryAccountLocked;
    protected readonly queryLockedCoins: ObservableQueryAccountLockedCoins;
    protected readonly queryUnlockingCoins: ObservableQueryAccountUnlockingCoins;
    static getShareCurrency(poolId: string): Currency;
    constructor(queryPools: ObservableQueryPools, queryBalances: ObservableQueryBalances, queryAccountLocked: ObservableQueryAccountLocked, queryLockedCoins: ObservableQueryAccountLockedCoins, queryUnlockingCoins: ObservableQueryAccountUnlockingCoins);
    /** Returns the pool id arrangement of all shares owned by user.  */
    readonly getOwnPools: (bech32Address: string) => string[];
    readonly getShareCurrency: (poolId: string) => Currency;
    /** Gets coin balance of user's locked gamm shares in pool. */
    readonly getLockedGammShare: (bech32Address: string, poolId: string) => CoinPretty;
    /** Gets percentage of user's locked shares vs pool total share. */
    readonly getLockedGammShareRatio: (bech32Address: string, poolId: string) => RatePretty;
    /** Returns fiat value of locked gamm shares. */
    readonly getLockedGammShareValue: (bech32Address: string, poolId: string, poolLiqudity: PricePretty, fiatCurrency: FiatCurrency) => PricePretty;
    /** Gets coin balance of user's shares currently unlocking in pool. */
    readonly getUnlockingGammShare: (bech32Address: string, poolId: string) => CoinPretty;
    /** Gets coin balance of user's unlocked gamm shares in a pool.  */
    readonly getAvailableGammShare: (bech32Address: string, poolId: string) => CoinPretty;
    /** Gets percentage of user's shares that are unlocked. */
    readonly getAvailableGammShareRatio: (bech32Address: string, poolId: string) => RatePretty;
    /** Gets coin balance of user's locked, unlocked, and unlocking shares in a pool. */
    readonly getAllGammShare: (bech32Address: string, poolId: string) => CoinPretty;
    /** Gets percentage of user's ownership of pool vs all shares in pool. */
    readonly getAllGammShareRatio: (bech32Address: string, poolId: string) => RatePretty;
    /** Gets user's ownership ratio and coin balance of each asset in pool. */
    readonly getShareAssets: (bech32Address: string, poolId: string) => {
        ratio: RatePretty;
        asset: CoinPretty;
    }[];
    /** Gets user's locked assets given a set of durations. */
    readonly getShareLockedAssets: (bech32Address: string, poolId: string, lockableDurations: Duration[]) => {
        duration: Duration;
        amount: CoinPretty;
        lockIds: string[];
    }[];
}
