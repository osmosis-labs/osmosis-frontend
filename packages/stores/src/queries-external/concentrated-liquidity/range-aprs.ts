import { KVStore } from "@keplr-wallet/common";
import { Int, RatePretty } from "@keplr-wallet/unit";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { maxTick, minTick } from "@osmosis-labs/math";
import { computed, makeObservable } from "mobx";

import { IMPERATOR_INDEXER_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

type Response = {
  APR: number;
};

/** Queries Imperator for extrapolated APR of a given position's tick range. */
export class ObservableQueryPriceRangeApr extends ObservableQueryExternalBase<Response> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly poolId: string,
    protected readonly lowerTickIndex: number,
    protected readonly upperTickIndex: number
  ) {
    super(
      kvStore,
      baseURL,
      `/cl/v1/apr/rewards/${poolId}?lower_tick=${lowerTickIndex}&upper_tick=${upperTickIndex}`
    );

    makeObservable(this);
  }

  @computed
  get apr(): RatePretty | undefined {
    if (!this.response || typeof this.response.data?.APR !== "number") return;

    const apr = this.response.data.APR / 100;
    if (isNaN(apr)) return;
    return new RatePretty(apr);
  }
}

export class ObservableQueryPriceRangeAprs extends HasMapStore<ObservableQueryPriceRangeApr> {
  constructor(
    kvStore: KVStore,
    indexerBaseUrl = IMPERATOR_INDEXER_DEFAULT_BASEURL
  ) {
    super((key) => {
      const { poolId, lowerTickIndex, upperTickIndex } = parseKey(key);
      return new ObservableQueryPriceRangeApr(
        kvStore,
        indexerBaseUrl,
        poolId,
        lowerTickIndex,
        upperTickIndex
      );
    });
  }

  /** Defaults to min and max tick if not provided. */
  get(poolId: string, lowerTickIndex = minTick, upperTickIndex = maxTick) {
    const key = makeKey(poolId, lowerTickIndex, upperTickIndex);
    return super.get(key) as ObservableQueryPriceRangeApr;
  }
}

function makeKey(poolId: string, lowerTickIndex: Int, upperTickIndex: Int) {
  return `${poolId}:${lowerTickIndex}:${upperTickIndex}`;
}

function parseKey(key: string) {
  const [poolId, lowerTickIndex, upperTickIndex] = key.split(":");

  const lowerTickIndexNum = parseInt(lowerTickIndex);
  const upperTickIndexNum = parseInt(upperTickIndex);

  if (isNaN(lowerTickIndexNum)) {
    throw new Error(`Invalid lower tick index: ${lowerTickIndex}`);
  }
  if (isNaN(upperTickIndexNum)) {
    throw new Error(`Invalid upper tick index: ${upperTickIndex}`);
  }

  return {
    poolId,
    lowerTickIndex: lowerTickIndexNum,
    upperTickIndex: upperTickIndexNum,
  };
}
