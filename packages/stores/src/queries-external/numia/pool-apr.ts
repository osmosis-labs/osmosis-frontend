import { KVStore } from "@keplr-wallet/common";
import { Dec, RatePretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { ObservableQueryExternalBase } from "../base";

type PoolData = {
  pool_id: string;
  swap_fees: number;
  superfluid: number;
  osmosis: number;
  boost: number;
  total_apr: number;
};

/** Queries Imperator to get the market cap of the tokens. */
export class ObservableQueryPoolAprs extends ObservableQueryExternalBase<
  PoolData[]
> {
  constructor(kvStore: KVStore, baseURL: string) {
    super(kvStore, baseURL, "/pools_apr");

    makeObservable(this);
  }

  @computed
  get poolAprs() {
    if (!this.response) return [];

    try {
      return this.response.data.map(
        ({ pool_id, swap_fees, superfluid, osmosis, boost, total_apr }) => ({
          poolId: pool_id,
          swapFees:
            swap_fees === 0
              ? undefined
              : new RatePretty(new Dec(swap_fees).quo(new Dec(100))),
          superfluid:
            superfluid === 0
              ? undefined
              : new RatePretty(new Dec(superfluid).quo(new Dec(100))),
          osmosis:
            osmosis === 0
              ? undefined
              : new RatePretty(new Dec(osmosis).quo(new Dec(100))),
          boost:
            boost === 0
              ? undefined
              : new RatePretty(new Dec(boost).quo(new Dec(100))),
          totalApr: new RatePretty(new Dec(total_apr).quo(new Dec(100))),
        })
      );
    } catch {
      return [];
    }
  }

  getForPool = computedFn((poolId: string) =>
    this.poolAprs.find(({ poolId: id }) => id === poolId)
  );
}
