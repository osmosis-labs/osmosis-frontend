import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { RatePretty } from "@keplr-wallet/unit";
import { maxTick, minTick } from "@osmosis-labs/math";
import { computed, makeObservable } from "mobx";

import { IMPERATOR_INDEXER_DEFAULT_BASEURL } from "..";
import { ObservableQueryExternalBase } from "../base";

/** Queries Imperator for extrapolated APR of a given position's tick range. */
export class ObservableQueryPositionRangeApr extends ObservableQueryExternalBase<{
  spreadFactorApr: string;
  incentivesApr: string;
}> {
  constructor(
    kvStore: KVStore,
    baseURL: string,
    protected readonly poolId: string,
    protected readonly lowerTickIndex: number,
    protected readonly upperTickIndex: number
  ) {
    // TODO: add endpoint
    super(kvStore, baseURL, `/lp/v1/rewards/estimation/`);

    makeObservable(this);
  }

  @computed
  get apr(): RatePretty | undefined {
    if (!this.response) return;

    return new RatePretty(this.response.data.spreadFactorApr).add(
      new RatePretty(this.response.data.incentivesApr)
    );
  }
}

export class ObservableQueryPositionsRangeApr extends HasMapStore<ObservableQueryPositionRangeApr> {
  constructor(
    kvStore: KVStore,
    poolRewardsBaseUrl = IMPERATOR_INDEXER_DEFAULT_BASEURL
  ) {
    super((key) => {
      const { poolId, lowerTickIndex, upperTickIndex } = parseKey(key);
      return new ObservableQueryPositionRangeApr(
        kvStore,
        poolRewardsBaseUrl,
        poolId,
        lowerTickIndex,
        upperTickIndex
      );
    });
  }

  get(poolId: string, lowerTickIndex?: number, upperTickIndex?: number) {
    const key = makeKey(
      poolId,
      lowerTickIndex ?? Number(minTick.toString()),
      upperTickIndex ?? Number(maxTick.toString())
    );
    return super.get(key) as ObservableQueryPositionRangeApr;
  }
}

function makeKey(
  poolId: string,
  lowerTickIndex: number,
  upperTickIndex: number
) {
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
