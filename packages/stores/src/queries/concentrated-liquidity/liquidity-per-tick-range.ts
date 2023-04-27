import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import { ActiveLiquidityPerTickRange } from "@osmosis-labs/math";
import { computed, makeObservable, observable } from "mobx";

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

export class ObservableQueryLiquiditiesPerTickRange {
  /** "poolId" => `ObservableQueryLiquidityPerTickRange` */
  @observable
  protected readonly _poolLiquidityPerTickrangeQueries: Map<
    string,
    ObservableQueryLiquidityPerTickRange
  > = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {}

  /**
   * getForPoolId function retrieves or creates an ObservableQueryLiquidityPerTickRange instance for a given pool and token
   * @param poolId - The unique identifier of the pool.
   * @returns An instance of ObservableQueryLiquidityPerTickRange associated with the specified pool id.
   */
  getForPoolId(poolId: string) {
    if (!this._poolLiquidityPerTickrangeQueries.has(poolId)) {
      const newQuery = new ObservableQueryLiquidityPerTickRange(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        { poolId }
      );
      this._poolLiquidityPerTickrangeQueries.set(poolId, newQuery);
      return newQuery;
    }

    return this._poolLiquidityPerTickrangeQueries.get(
      poolId
    ) as ObservableQueryLiquidityPerTickRange;
  }
}
