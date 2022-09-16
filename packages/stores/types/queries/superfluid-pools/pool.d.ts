import { FiatCurrency } from "@keplr-wallet/types";
import { ObservableQueryValidators, ObservableQueryInflation } from "@keplr-wallet/stores";
import { RatePretty } from "@keplr-wallet/unit";
import { IPriceStore } from "../../price";
import { ObservableQueryPool } from "../pools";
import { ObservableQueryGammPoolShare } from "../pool-share";
import { ObservableQueryLockableDurations, ObservableQueryIncentivizedPools } from "../pool-incentives";
import { ObservableQueryAccountLocked } from "../lockup";
import { ObservableQuerySuperfluidPools, ObservableQuerySuperfluidDelegations, ObservableQuerySuperfluidUndelegations, ObservableQuerySuperfluidOsmoEquivalent } from "../superfluid-pools";
/** Convenience store getting common superfluid data for a pool via superfluid stores. */
export declare class ObservableQuerySuperfluidPool {
    protected readonly bech32Address: string;
    protected readonly fiatCurrency: FiatCurrency;
    protected readonly queryPool: ObservableQueryPool;
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
    constructor(bech32Address: string, fiatCurrency: FiatCurrency, queryPool: ObservableQueryPool, queryValidators: ObservableQueryValidators, queryInflation: ObservableQueryInflation, queries: {
        queryGammPoolShare: ObservableQueryGammPoolShare;
        queryLockableDurations: ObservableQueryLockableDurations;
        queryIncentivizedPools: ObservableQueryIncentivizedPools;
        querySuperfluidPools: ObservableQuerySuperfluidPools;
        queryAccountLocked: ObservableQueryAccountLocked;
        querySuperfluidDelegations: ObservableQuerySuperfluidDelegations;
        querySuperfluidUndelegations: ObservableQuerySuperfluidUndelegations;
        querySuperfluidOsmoEquivalent: ObservableQuerySuperfluidOsmoEquivalent;
    }, priceStore: IPriceStore);
    get poolShareCurrency(): import("@keplr-wallet/types").Currency;
    get isSuperfluid(): boolean;
    get lockableDurations(): import("dayjs/plugin/duration").Duration[];
    get lockupGauges(): {
        id: string;
        apr: RatePretty;
        duration: import("dayjs/plugin/duration").Duration;
        superfluidApr: RatePretty | undefined;
    }[];
    get superfluidApr(): RatePretty;
    get upgradeableLpLockIds(): {
        amount: import("@keplr-wallet/unit").CoinPretty;
        lockIds: string[];
    } | undefined;
    get notDelegatedLockedSfsLpShares(): boolean | undefined;
    get superfluid(): {
        upgradeableLpLockIds: {
            amount: import("@keplr-wallet/unit").CoinPretty;
            lockIds: string[];
        } | undefined;
        delegations?: undefined;
        undelegations?: undefined;
        superfluidLPShares?: undefined;
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
        superfluidLPShares: {
            amount: import("@keplr-wallet/unit").CoinPretty;
            lockIds: string[];
        };
        upgradeableLpLockIds?: undefined;
    } | undefined;
}
