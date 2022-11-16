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
    userShareValue: PricePretty;
    userUnlockingShares?: {
        shares: CoinPretty;
        endTime?: Date;
    };
    aggregateApr: RatePretty;
    swapFeeApr: RatePretty;
    swapFeeDailyReward: PricePretty;
    incentivesBreakdown: {
        dailyPoolReward: CoinPretty;
        apr: RatePretty;
        numDaysRemaining?: number;
    }[];
    /** Both `delegated` and `undelegating` will be `undefined` if the user may "Go superfluid". */
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
    /** Calculates the stop in the bonding process the user is in.
     *
     *  1. Liquidity needs to be added
     *  2. Liquidity needs to be bonded
     */
    readonly calculateBondLevel: (bondableDurations: BondableDuration[]) => 1 | 2 | undefined;
    /** Gets all available durations for user to bond in, with a breakdown of the assets incentivizing the duration. Internal OSMO incentives & swap fees included in breakdown. */
    readonly getBondableAllowedDurations: (findCurrency: (denom: string) => AppCurrency | undefined, allowedGauges: {
        gaugeId: string;
        denom: string;
    }[] | undefined) => BondableDuration[];
}
