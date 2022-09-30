import { FiatCurrency } from "@keplr-wallet/types";
import { ObservableQueryValidators, ObservableQueryInflation } from "@keplr-wallet/stores";
import { RatePretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { ObservableQueryPoolDetails } from "../pools";
import { ObservableQueryGammPoolShare } from "../pool-share";
import { ObservableQueryLockableDurations, ObservableQueryIncentivizedPools } from "../pool-incentives";
import { ObservableQueryAccountLocked } from "../lockup";
import { ObservableQuerySuperfluidPools, ObservableQuerySuperfluidDelegations, ObservableQuerySuperfluidUndelegations, ObservableQuerySuperfluidOsmoEquivalent } from "../superfluid-pools";
/** Convenience store getting common superfluid data for a pool via superfluid stores. */
export declare class ObservableQuerySuperfluidPool {
    protected readonly bech32Address: string;
    protected readonly fiatCurrency: FiatCurrency;
    protected readonly queryPoolDetails: ObservableQueryPoolDetails;
    protected readonly queryValidators: ObservableQueryValidators;
    protected readonly queryInflation: ObservableQueryInflation;
    protected readonly queries: {
        queryGammPoolShare: ObservableQueryGammPoolShare;
        queryLockableDurations: ObservableQueryLockableDurations;
        queryIncentivizedPools: ObservableQueryIncentivizedPools;
        querySuperfluidPools: ObservableQuerySuperfluidPools;
        queryAccountLocked: ObservableQueryAccountLocked;
        querySuperfluidDelegations: ObservableQuerySuperfluidDelegations;
        querySuperfluidUndelegations: ObservableQuerySuperfluidUndelegations;
        querySuperfluidOsmoEquivalent: ObservableQuerySuperfluidOsmoEquivalent;
    };
    protected readonly priceStore: IPriceStore;
    constructor(bech32Address: string, fiatCurrency: FiatCurrency, queryPoolDetails: ObservableQueryPoolDetails, queryValidators: ObservableQueryValidators, queryInflation: ObservableQueryInflation, queries: {
        queryGammPoolShare: ObservableQueryGammPoolShare;
        queryLockableDurations: ObservableQueryLockableDurations;
        queryIncentivizedPools: ObservableQueryIncentivizedPools;
        querySuperfluidPools: ObservableQuerySuperfluidPools;
        queryAccountLocked: ObservableQueryAccountLocked;
        querySuperfluidDelegations: ObservableQuerySuperfluidDelegations;
        querySuperfluidUndelegations: ObservableQuerySuperfluidUndelegations;
        querySuperfluidOsmoEquivalent: ObservableQuerySuperfluidOsmoEquivalent;
    }, priceStore: IPriceStore);
    get isSuperfluid(): boolean;
    /** Wraps `gauges` member of pool detail store with potential superfluid APR info. */
    get gaugesWithSuperfluidApr(): {
        superfluidApr: RatePretty | undefined;
        id: string;
        duration: import("dayjs/plugin/duration").Duration;
        apr: RatePretty;
        isLoading: boolean;
    }[];
    get superfluidApr(): RatePretty;
    get upgradeableLpLockIds(): {
        amount: import("@keplr-wallet/unit").CoinPretty;
        lockIds: string[];
    } | undefined;
    get superfluid(): {
        upgradeableLpLockIds: {
            amount: import("@keplr-wallet/unit").CoinPretty;
            lockIds: string[];
        } | undefined;
        delegations?: undefined;
        undelegations?: undefined;
        superfluidLpShares?: undefined;
    } | {
        delegations: {
            validatorName: string | undefined;
            validatorCommission: RatePretty | undefined;
            validatorImgSrc: string | undefined;
            inactive: string | undefined;
            apr: RatePretty;
            amount: import("@keplr-wallet/unit").CoinPretty;
        }[] | undefined;
        undelegations: {
            validatorName: string | undefined;
            inactive: string | undefined;
            amount: import("@keplr-wallet/unit").CoinPretty;
            endTime: Date;
        }[] | undefined;
        superfluidLpShares: {
            amount: import("@keplr-wallet/unit").CoinPretty;
            lockIds: string[];
        };
        upgradeableLpLockIds?: undefined;
    } | undefined;
}
