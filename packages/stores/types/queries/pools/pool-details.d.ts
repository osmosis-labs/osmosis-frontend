import { Duration } from "dayjs/plugin/duration";
import { AppCurrency, FiatCurrency } from "@keplr-wallet/types";
import { PricePretty, RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { UserConfig } from "../../ui-config";
import { ObservableQueryGammPoolShare } from "../pool-share";
import { ObservableQueryIncentivizedPools, ObservableQueryLockableDurations, ObservableQueryPoolsGaugeIds } from "../pool-incentives";
import { ObservableQueryGuage } from "../incentives";
import { ObservableQueryAccountLocked, ObservableQueryAccountLockedCoins, ObservableQueryAccountUnlockingCoins } from "../lockup";
import { ObservableQueryPool } from "./pool";
import { ExternalGauge } from "./types";
/** Convenience store for getting common details of a pool via many other query stores. */
export declare class ObservableQueryPoolDetails extends UserConfig {
    protected readonly fiatCurrency: FiatCurrency;
    protected readonly queryPool: ObservableQueryPool;
    protected readonly queries: {
        queryGammPoolShare: ObservableQueryGammPoolShare;
        queryIncentivizedPools: ObservableQueryIncentivizedPools;
        queryAccountLocked: ObservableQueryAccountLocked;
        queryLockedCoins: ObservableQueryAccountLockedCoins;
        queryUnlockingCoins: ObservableQueryAccountUnlockingCoins;
        queryGauge: ObservableQueryGuage;
        queryLockableDurations: ObservableQueryLockableDurations;
        queryPoolsGaugeIds: ObservableQueryPoolsGaugeIds;
    };
    protected readonly priceStore: IPriceStore;
    constructor(fiatCurrency: FiatCurrency, queryPool: ObservableQueryPool, queries: {
        queryGammPoolShare: ObservableQueryGammPoolShare;
        queryIncentivizedPools: ObservableQueryIncentivizedPools;
        queryAccountLocked: ObservableQueryAccountLocked;
        queryLockedCoins: ObservableQueryAccountLockedCoins;
        queryUnlockingCoins: ObservableQueryAccountUnlockingCoins;
        queryGauge: ObservableQueryGuage;
        queryLockableDurations: ObservableQueryLockableDurations;
        queryPoolsGaugeIds: ObservableQueryPoolsGaugeIds;
    }, priceStore: IPriceStore);
    get pool(): ObservableQueryPool;
    get poolShareCurrency(): import("@keplr-wallet/types").Currency;
    get isIncentivized(): boolean;
    get totalValueLocked(): PricePretty;
    get lockableDurations(): Duration[];
    get longestDuration(): Duration;
    get internalGauges(): {
        id: string;
        duration: Duration;
        apr: RatePretty;
        isLoading: boolean;
    }[];
    get userShareValue(): PricePretty;
    get userBondedValue(): PricePretty;
    get userAvailableValue(): PricePretty;
    get userPoolAssets(): {
        ratio: RatePretty;
        asset: CoinPretty;
    }[];
    get userLockedAssets(): {
        apr: RatePretty | undefined;
        duration: Duration;
        amount: CoinPretty;
        lockIds: string[];
    }[];
    get userUnlockingAssets(): {
        duration: Duration;
        amount: CoinPretty;
        lockIds: string[];
        endTime: Date;
    }[];
    get userCanDepool(): boolean;
    get allExternalGauges(): ExternalGauge[];
    get userStats(): {
        totalShares: CoinPretty;
        totalShareValue: PricePretty;
        bondedValue: PricePretty;
        unbondedValue: PricePretty;
        currentDailyEarnings?: PricePretty;
    } | undefined;
    readonly queryAllowedExternalGauges: (findCurrency: (denom: string) => AppCurrency | undefined, allowedGauges: {
        gaugeId: string;
        denom: string;
    }[]) => ExternalGauge[];
}
