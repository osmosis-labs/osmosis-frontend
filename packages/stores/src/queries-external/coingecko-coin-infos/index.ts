import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { COINGECKO_API_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

type Response = {
  market_data: {
    market_cap_rank: number;
    total_value_locked: {
      usd: number;
    };
  };
};

/** Queries CoinGecko API to obtain the market cap rank and TVL of a token, filtering by its "coingeckoid". */
export class ObservableQueryCoingeckoCoinInfos extends ObservableQueryExternalBase<Response> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly coingeckoName: string
  ) {
    super(kvStore, baseURL, `/v3/coins/${coingeckoName}`);

    makeObservable(this);
  }

  /**
   * Returns the asset's rank on coingecko, based on market cap.
   *
   * @returns If the asset exists, and so does this information, it returns a number.
   */
  @computed
  get marketCapRank(): number | undefined {
    try {
      if (
        !this.response ||
        typeof this.response.data?.market_data.market_cap_rank !== "number"
      )
        return;

      const marketCapRank = this.response.data.market_data.market_cap_rank;
      if (isNaN(marketCapRank)) return;
      return marketCapRank;
    } catch {
      return undefined;
    }
  }

  /**
   * It return the Total Value Locked (TVL) that represents the number of assets that are
   * currently staked in a protocol or the total quantity of underlying amount
   * of fundsthat a DeFi protocol has secured.
   *
   * @returns If the asset exists, and so does this information, it returns its TVL in dollars.
   */
  @computed
  get totalValueLocked(): number | undefined {
    try {
      if (
        !this.response ||
        typeof this.response.data?.market_data.total_value_locked.usd !==
          "number"
      )
        return;

      const totalValueLocked =
        this.response.data.market_data.total_value_locked.usd;
      if (isNaN(totalValueLocked)) return;
      return totalValueLocked;
    } catch {
      return undefined;
    }
  }
}

export class ObservableQueryCoingeckoCoinsInfos extends HasMapStore<ObservableQueryCoingeckoCoinInfos> {
  constructor(
    kvStore: KVStore,
    indexerBaseUrl = COINGECKO_API_DEFAULT_BASEURL
  ) {
    super((coingeckoName) => {
      return new ObservableQueryCoingeckoCoinInfos(
        kvStore,
        indexerBaseUrl,
        coingeckoName
      );
    });
  }

  get(coingeckoName: string) {
    return super.get(coingeckoName) as ObservableQueryCoingeckoCoinInfos;
  }
}
