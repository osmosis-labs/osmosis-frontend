import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  QueryResponse,
} from "@keplr-wallet/stores";
import { Dec } from "@keplr-wallet/unit";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";
import { autorun, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { IPriceStore } from "../../price";
import { ObservableQueryNumPools } from "./num-pools";
import { ObservableQueryPool } from "./pool";
import { Pools } from "./types";
import { GET_POOLS_PAGINATION_LIMIT } from ".";

export class ObservableQueryPools extends ObservableChainQuery<Pools> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    queryNumPools: ObservableQueryNumPools,
    limit = GET_POOLS_PAGINATION_LIMIT
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/gamm/v1beta1/pools?pagination.limit=${limit}`
    );

    makeObservable(this);

    autorun(() => {
      const numPools = queryNumPools.numPools;
      if (numPools > limit) {
        limit = numPools;
        this.setUrl(`/osmosis/gamm/v1beta1/pools?pagination.limit=${limit}`);
      }
    });
  }

  protected setResponse(response: Readonly<QueryResponse<Pools>>) {
    super.setResponse(response);

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const denomsInPools: string[] = [];
    // Register the denoms in the response.
    for (const pool of response.data.pools) {
      for (const asset of pool.poolAssets) {
        denomsInPools.push(asset.token.denom);
      }
    }

    chainInfo.addUnknownCurrencies(...denomsInPools);
  }

  /** Returns `undefined` if the pool does not exist or the data has not loaded. */
  readonly getPool: (id: string) => ObservableQueryPool | undefined =
    computedFn((id: string) => {
      if (!this.response) {
        // TODO: consider constructing individual `ObservableQueryPool` and fetching, adding to array, and returning
        return undefined;
      }

      const raw = this.response.data.pools.find((raw) => raw.id === id);
      if (!raw) {
        return undefined;
      }

      return new ObservableQueryPool(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        raw
      );
    });

  /** Returns `undefined` if pool data has not loaded, and `true`/`false` for if the pool exists. */
  readonly poolExists: (id: string) => boolean | undefined = computedFn(
    (id: string) => {
      // TODO: address pagination limit
      const r = this.response;
      if (r && !this.isFetching) {
        return r.data.pools.some((raw) => raw.id === id);
      }
    },
    true
  );

  readonly computeAllTotalValueLocked = computedFn(
    (priceStore: IPriceStore): PricePretty => {
      const fiatCurrency = priceStore.getFiatCurrency(
        priceStore.defaultVsCurrency
      )!;
      let price = new PricePretty(fiatCurrency, new Dec(0));
      if (!this.response) {
        return price;
      }

      this.response.data.pools.forEach((raw) => {
        const pool = this.getPool(raw.id);

        if (pool) {
          price = price.add(pool.computeTotalValueLocked(priceStore));
        }
      });

      return price;
    }
  );

  readonly getAllPools = computedFn((): ObservableQueryPool[] => {
    if (!this.response) {
      return [];
    }

    return this.response.data.pools.map((raw) => {
      return this.getPool(raw.id)!;
    });
  });
}
