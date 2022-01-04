import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  QueryResponse,
} from "@keplr-wallet/stores";
import { FiatCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";
import { autorun, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { Pools } from "./types";
import { ObservableQueryNumPools } from "./num-pools";
import { ObservablePool } from "./pool";

export class ObservableQueryPools extends ObservableChainQuery<Pools> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    queryNumPools: ObservableQueryNumPools
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/gamm/v1beta1/pools?pagination.limit=1000"
    );
    let limit = 1000;

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

  readonly getPool: (id: string) => ObservablePool | undefined = computedFn(
    (id: string) => {
      if (!this.response) {
        return undefined;
      }

      const raw = this.response.data.pools.find((raw) => raw.id === id);
      if (!raw) {
        return undefined;
      }

      return new ObservablePool(this.chainId, this.chainGetter, raw);
    }
  );

  readonly computeAllTotalValueLocked = computedFn(
    (
      priceStore: {
        calculatePrice(
          coin: CoinPretty,
          vsCurrrency?: string
        ): PricePretty | undefined;
      },
      fiatCurrency: FiatCurrency
    ): PricePretty => {
      let price = new PricePretty(fiatCurrency, new Dec(0));
      if (!this.response) {
        return price;
      }

      this.response.data.pools.forEach((raw) => {
        const pool = this.getPool(raw.id);

        if (pool) {
          price = price.add(
            pool.computeTotalValueLocked(priceStore, fiatCurrency)
          );
        }
      });

      return price;
    }
  );

  readonly getAllPools = computedFn((): ObservablePool[] => {
    if (!this.response) {
      return [];
    }

    return this.response.data.pools.map((raw) => {
      return this.getPool(raw.id)!;
    });
  });

  readonly getPools = computedFn(
    (itemsPerPage: number, page: number): ObservablePool[] => {
      if (!this.response) {
        return [];
      }

      const offset = (page - 1) * itemsPerPage;
      return this.response.data.pools
        .slice(offset, offset + itemsPerPage)
        .map((raw) => {
          return this.getPool(raw.id)!;
        });
    }
  );

  readonly getPoolsDescendingOrderTVL = computedFn(
    (
      priceStore: {
        calculatePrice(
          coin: CoinPretty,
          vsCurrrency?: string
        ): PricePretty | undefined;
      },
      fiatCurrency: FiatCurrency,
      itemsPerPage: number,
      page: number
    ): ObservablePool[] => {
      if (!this.response) {
        return [];
      }

      let pools = this.getAllPools();

      pools = pools.sort((poolA: ObservablePool, poolB: ObservablePool) => {
        const poolATvl = poolA
          .computeTotalValueLocked(priceStore, fiatCurrency)
          .toDec();
        const poolBTvl = poolB
          .computeTotalValueLocked(priceStore, fiatCurrency)
          .toDec();
        return poolATvl.gt(poolBTvl) ? -1 : 1;
      });

      const offset = (page - 1) * itemsPerPage;
      return pools.slice(offset, offset + itemsPerPage);
    }
  );
}
