import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { Dec, PricePretty } from "@keplr-wallet/unit";
import { makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { IPriceStore } from "../../price";
import { IMPERATOR_TX_REWARD_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";
import { PoolRewards, PoolsRewards } from "./types";

/** Queries Imperator pool fee history data. */
export class ObservableQueryAccountPoolRewards extends ObservableQueryExternalBase<PoolsRewards> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly priceStore: IPriceStore,
    protected readonly bech32Address: string
  ) {
    super(kvStore, baseURL, `/lp/v1/rewards/estimation/${bech32Address}`);

    makeObservable(this);
  }

  protected canFetch(): boolean {
    return this.bech32Address !== "";
  }

  readonly getUsdRewardsForPool = computedFn(
    (poolId: string): PoolRewards | undefined => {
      const fiat = this.priceStore.getFiatCurrency("usd");

      if (!this.response || !fiat) return undefined;

      const poolIds =
        this.response.data.pools !== undefined &&
        this.response.data.pools !== null &&
        typeof this.response.data.pools === "object"
          ? Object.keys(this.response.data.pools)
          : [];

      if (!poolIds.includes(poolId)) return undefined;

      const poolRewards = this.response.data.pools[poolId] as
        | PoolsRewards["pools"][0]
        | undefined;

      if (!poolRewards) return undefined;

      return {
        day: new PricePretty(fiat, new Dec(poolRewards.day_usd)),
        month: new PricePretty(fiat, new Dec(poolRewards.month_usd)),
        year: new PricePretty(fiat, new Dec(poolRewards.year_usd)),
      };
    }
  );
}

export class ObservableQueryAccountsPoolRewards extends HasMapStore<ObservableQueryAccountPoolRewards> {
  constructor(
    kvStore: KVStore,
    priceStore: IPriceStore,
    poolRewardsBaseUrl = IMPERATOR_TX_REWARD_BASEURL
  ) {
    super(
      (bech32Address) =>
        new ObservableQueryAccountPoolRewards(
          kvStore,
          poolRewardsBaseUrl,
          priceStore,
          bech32Address
        )
    );
  }

  get(bech32Address: string) {
    return super.get(bech32Address) as ObservableQueryAccountPoolRewards;
  }
}

export * from "./types";
