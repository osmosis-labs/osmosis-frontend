import { Duration } from "dayjs/plugin/duration";
import { CoinPretty, RatePretty, PricePretty } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";
import { ObservableQueryPoolDetails, ObservableQuerySuperfluidPool, ObservableQueryAccountLocked, ObservableQueryGuage, ObservableQueryIncentivizedPools } from "../../queries";
import { ObservableQueryPoolFeesMetrics } from "../../queries-external";
import { IPriceStore } from "../../price";
import { UserConfig } from "../user-config";
export declare type BondableDuration = {
    duration: Duration;
    userShares: CoinPretty;
    userUnlockingShares: CoinPretty;
    aggregateApr: RatePretty;
    swapFeeApr: RatePretty;
    swapFeeDailyReward: PricePretty;
    incentivesBreakdown: {
        dailyPoolReward: CoinPretty;
        apr: RatePretty;
        numDaysRemaining?: number;
    }[];
    superfluid?: {
        apr: RatePretty;
        commission?: RatePretty;
        validatorMoniker?: string;
        validatorLogoUrl?: string;
        delegated?: CoinPretty;
        undelegating?: CoinPretty;
    };
};
export declare class ObservableBondLiquidityConfig extends UserConfig {
    protected readonly poolDetails: ObservableQueryPoolDetails;
    protected readonly superfluidPool: ObservableQuerySuperfluidPool;
    protected readonly priceStore: IPriceStore;
    protected readonly queryFeeMetrics: ObservableQueryPoolFeesMetrics;
    protected readonly queries: {
        queryAccountLocked: ObservableQueryAccountLocked;
        queryGauge: ObservableQueryGuage;
        queryIncentivizedPools: ObservableQueryIncentivizedPools;
    };
    constructor(poolDetails: ObservableQueryPoolDetails, superfluidPool: ObservableQuerySuperfluidPool, priceStore: IPriceStore, queryFeeMetrics: ObservableQueryPoolFeesMetrics, queries: {
        queryAccountLocked: ObservableQueryAccountLocked;
        queryGauge: ObservableQueryGuage;
        queryIncentivizedPools: ObservableQueryIncentivizedPools;
    });
    /** Gets all available durations for user to bond in, with a breakdown of the assets incentivizing the duration. Internal OSMO incentives included in breakdown. */
    readonly getBondableAllowedDurations: (findCurrency: (denom: string) => AppCurrency | undefined, allowedGauges: {
        gaugeId: string;
        denom: string;
    }[] | undefined) => BondableDuration[];
}
