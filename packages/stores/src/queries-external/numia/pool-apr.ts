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
    super(kvStore, baseURL, "/pools_apr_v2");

    makeObservable(this);
  }

  @computed
  get queryPoolAprs() {
    if (!this.response) return [];

    try {
      return this.response.data.map(
        ({ pool_id, swap_fees, superfluid, osmosis, boost, total_apr }) => ({
          poolId: pool_id,
          swapFees: maybeMakeRatePretty(swap_fees),
          superfluid: maybeMakeRatePretty(superfluid),
          osmosis: maybeMakeRatePretty(osmosis),
          boost: maybeMakeRatePretty(boost),
          totalApr: maybeMakeRatePretty(total_apr),
        })
      );
    } catch {
      return [];
    }
  }

  getForPool = computedFn((poolId: string) =>
    this.queryPoolAprs.find(({ poolId: id }) => id === poolId)
  );
}

function maybeMakeRatePretty(value: number): RatePretty | undefined {
  // numia will return 0 if the APR is not applicable, so return undefined to indicate that
  if (value === 0) {
    return undefined;
  }

  return new RatePretty(new Dec(value).quo(new Dec(100)));
}
