import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import { ActiveLiquidityPerTickRange } from "@osmosis-labs/math";
import { computed, makeObservable } from "mobx";

import { LiquidityPerTickRange } from "./types";

type QueryStoreParams = {
  poolId: string;
};

const URL_BASE =
  "/osmosis/concentratedliquidity/v1beta1/liquidity_per_tick_range";

/** Stores liquidity data for a single pool. */
export class ObservableQueryLiquidityPerTickRange extends ObservableChainQuery<LiquidityPerTickRange> {
  @computed
  get activeLiquidity(): ActiveLiquidityPerTickRange[] {
    return (
      this.response?.data.liquidity.map(
        ({ upper_tick, liquidity_amount, lower_tick }) => {
          return {
            lowerTick: new Int(lower_tick),
            upperTick: new Int(upper_tick),
            liquidityAmount: new Dec(liquidity_amount),
          };
        }
      ) ?? []
    );
  }

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly params: QueryStoreParams
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `${URL_BASE}?pool_id=${params.poolId}`
    );

    makeObservable(this);
  }
}

export class ObservableQueryLiquiditiesPerTickRange extends ObservableChainQueryMap<LiquidityPerTickRange> {
  // /** "poolId" => `ObservableQueryLiquidityPerTickRange` */
  // @observable
  // protected readonly _poolLiquidityPerTickrangeQueries: Map<
  //   string,
  //   ObservableQueryLiquidityPerTickRange
  // > = new Map();

  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (poolId: string) => {
      return new ObservableQueryLiquidityPerTickRange(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        { poolId }
      );
    });
  }

  /**
   * getForPoolId function retrieves or creates an ObservableQueryLiquidityPerTickRange instance for a given pool and token
   * @param poolId - The unique identifier of the pool.
   * @returns An instance of ObservableQueryLiquidityPerTickRange associated with the specified pool id.
   */
  getForPoolId(poolId: string) {
    return super.get(poolId) as ObservableQueryLiquidityPerTickRange;
  }
}
