import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, HasMapStore, QueryResponse } from "@keplr-wallet/stores";
import { CoinPretty, PricePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";

import { IMPERATOR_INDEXER_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { PositionPerformance } from "./types";

/** Queries performance metrics for a given position. */
export class ObservableQueryPositionPerformanceMetrics extends ObservableQueryExternalBase<PositionPerformance> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly positionId: string
  ) {
    super(kvStore, baseURL, `/cl/v1/position/id/${positionId}`);

    makeObservable(this);
  }

  protected get chain() {
    return this.chainGetter.getChain(this.chainId);
  }

  @computed
  get feesEarned(): CoinPretty[] {
    if (!this.response?.data.total_spread_rewards) return [];
    return this.response.data.total_spread_rewards.map(({ denom, amount }) => {
      const currency = this.chain.forceFindCurrency(denom);
      return new CoinPretty(currency, amount);
    });
  }

  @computed
  get incentivesEarned(): CoinPretty[] {
    if (!this.response?.data.total_incentives_rewards) return [];
    return this.response.data.total_incentives_rewards.map(
      ({ denom, amount }) => {
        const currency = this.chain.forceFindCurrency(denom);
        return new CoinPretty(currency, amount);
      }
    );
  }

  @computed
  get totalEarned(): CoinPretty[] {
    return [...(this.feesEarned ?? []), ...(this.incentivesEarned ?? [])];
  }

  @computed
  get principal(): { coin: CoinPretty; value: PricePretty }[] {
    if (!this.response?.data.principal.assets) return [];
    return this.response.data.principal.assets.map(
      ({ denom, amount, value }) => {
        const currency = this.chain.forceFindCurrency(denom);
        // TODO: If we add add fiat user setting, will need to import from price store and possibly convert
        return {
          coin: new CoinPretty(currency, amount),
          value: new PricePretty(
            { currency: "usd", symbol: "$", maxDecimals: 2, locale: "en-US" },
            value
          ),
        };
      }
    );
  }

  protected setResponse(
    response: Readonly<QueryResponse<PositionPerformance>>
  ): void {
    super.setResponse(response);
    // register any unencountered currencies
    this.chain.addUnknownCurrencies(
      ...response.data.principal.assets.map(({ denom }) => denom),
      ...response.data.total_spread_rewards.map(({ denom }) => denom),
      ...response.data.total_incentives_rewards.map(({ denom }) => denom)
    );
  }
}

/** Query position metrics by position identifier. */
export class ObservableQueryPositionsPerformanceMetrics extends HasMapStore<ObservableQueryPositionPerformanceMetrics> {
  constructor(
    kvStore: KVStore,
    chainGetter: ChainGetter,
    chainId: string,
    poolRewardsBaseUrl = IMPERATOR_INDEXER_DEFAULT_BASEURL
  ) {
    super(
      (bech32Address) =>
        new ObservableQueryPositionPerformanceMetrics(
          kvStore,
          poolRewardsBaseUrl,
          chainGetter,
          chainId,
          bech32Address
        )
    );
  }

  get(positionId: string) {
    return super.get(positionId) as ObservableQueryPositionPerformanceMetrics;
  }
}

export * from "./types";
