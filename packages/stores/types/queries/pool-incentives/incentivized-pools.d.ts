import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { RatePretty } from "@keplr-wallet/unit";
import { Duration } from "dayjs/plugin/duration";
import { ObservableQueryEpochs } from "../epochs";
import { ObservableQueryEpochProvisions, ObservableQueryMintParmas } from "../mint";
import { ObservableQueryPools } from "../pools";
import { IPriceStore } from "../../price";
import { ObservableQueryDistrInfo } from "./distr-info";
import { ObservableQueryLockableDurations } from "./lockable-durations";
import { IncentivizedPools } from "./types";
export declare class ObservableQueryIncentivizedPools extends ObservableChainQuery<IncentivizedPools> {
    protected readonly queryLockableDurations: ObservableQueryLockableDurations;
    protected readonly queryDistrInfo: ObservableQueryDistrInfo;
    protected readonly queryPools: ObservableQueryPools;
    protected readonly queryMintParmas: ObservableQueryMintParmas;
    protected readonly queryEpochProvision: ObservableQueryEpochProvisions;
    protected readonly queryEpochs: ObservableQueryEpochs;
    constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter, queryLockableDurations: ObservableQueryLockableDurations, queryDistrInfo: ObservableQueryDistrInfo, queryPools: ObservableQueryPools, queryMintParmas: ObservableQueryMintParmas, queryEpochProvision: ObservableQueryEpochProvisions, queryEpochs: ObservableQueryEpochs);
    /** Internally incentivized pools. */
    get incentivizedPools(): string[];
    /** Is incentivized internally. */
    readonly isIncentivized: (poolId: string) => boolean;
    /** Internal incentives (OSMO). */
    readonly getIncentivizedGaugeId: (poolId: string, duration: Duration) => string | undefined;
    /**
     * 가장 긴 lockable duration의 apy를 반환한다.
     */
    readonly computeMostAPY: (poolId: string, priceStore: IPriceStore) => RatePretty;
    /**
     * 리워드를 받을 수 있는 풀의 연당 이익률을 반환한다.
     * 리워드를 받을 수 없는 풀일 경우 0를 리턴한다.
     */
    readonly computeAPY: (poolId: string, duration: Duration, priceStore: IPriceStore, fiatCurrency: FiatCurrency) => RatePretty;
    protected computeAPYForSpecificDuration(poolId: string, duration: Duration, priceStore: IPriceStore, fiatCurrency: FiatCurrency): RatePretty;
    get isAprFetching(): boolean;
}
