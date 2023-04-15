import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import {
  computeMinMaxTicksFromExponentAtPriceOne,
  LiquidityDepth,
} from "@osmosis-labs/math";
import { computed, makeObservable, observable } from "mobx";

import { LiquidityNetInDirection } from "./types";

type QueryStoreParams = {
  poolId: string;
  tokenInDenom: string;
};

/** Stores tick data for a single pool swapping in a single direction by token in. */
export class ObservableQueryLiquidityNetInDirection extends ObservableChainQuery<LiquidityNetInDirection> {
  /** The limit upper and lower bound tick indexes for this pool and direction. */
  protected readonly _limitTickIndex: Int;

  @computed
  get depthsInDirection(): LiquidityDepth[] {
    return (
      this.response?.data.liquidity_depths.map((depth) => {
        return {
          tickIndex: new Int(depth.tick_index),
          netLiquidity: new Dec(depth.liquidity_net),
        };
      }) ?? []
    );
  }

  @computed
  get currentTick() {
    return new Int(this.response?.data.current_tick ?? 0);
  }

  @computed
  get currentLiquidity() {
    return new Dec(this.response?.data.current_liquidity ?? 0);
  }

  /** Looks at the url to see whether ticks have been requested to the limit bound. */
  @computed
  get hasFetchedAllTicks(): boolean {
    if (!this.response) return false;

    const queryParams = new URLSearchParams(this.url.split("?")[1]);

    const useNoBound = queryParams.get("use_no_bound");
    if (useNoBound === "true") {
      return true;
    }

    const boundTickIndex = queryParams.get("bound_tick");

    if (!boundTickIndex) {
      return false;
    }

    if (new Int(boundTickIndex).gte(this._limitTickIndex.abs())) {
      return true;
    }

    return false;
  }

  @computed
  get currentBoundTick() {
    const queryParams = new URLSearchParams(this.url.split("?")[1]);

    const boundTickIndex = queryParams.get("bound_tick");

    if (!boundTickIndex) {
      throw new Error("Bound tick index not found in query url");
    }

    return new Int(boundTickIndex);
  }

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly params: QueryStoreParams,
    protected readonly boundTickIndex: Int,
    protected readonly initialBoundTickIndex?: Int
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/concentratedliquidity/v1beta1/query_liquidity_net_in_direction?pool_id=${
        params.poolId
      }&token_in=${params.tokenInDenom}&use_cur_tick=true&bound_tick=${(
        initialBoundTickIndex ?? boundTickIndex
      ).toString()}`
    );

    this._limitTickIndex = boundTickIndex;

    makeObservable(this);
  }

  /** Fetches remaining ticks in this direction, which could be expensive, so should be done later. */
  fetchRemaining() {
    const { poolId, tokenInDenom } = this.params;
    this.setUrl(
      `/osmosis/concentratedliquidity/v1beta1/query_liquidity_net_in_direction?pool_id=${poolId}&token_in=${tokenInDenom}&use_cur_tick=true&bound_tick${this._limitTickIndex.toString()}}`
    );
    return this.waitFreshResponse();
  }

  /** Will rerun query up to given index or the max tick index. */
  fetchUpToTickIndex(tickIndex: Int) {
    const { poolId, tokenInDenom } = this.params;

    if (tickIndex.gt(this._limitTickIndex)) {
      tickIndex = this._limitTickIndex;
    }

    this.setUrl(
      `/osmosis/concentratedliquidity/v1beta1/query_liquidity_net_in_direction?pool_id=${poolId}&token_in=${tokenInDenom}&use_cur_tick=true&bound_tick=${tickIndex.toString()}`
    );
    return this.waitFreshResponse();
  }
}

export class ObservableQueryLiquiditiesNetInDirection {
  /** "poolId/tokenIn" => `ObservableQueryLiquidityNetInDirection` */
  @observable
  protected readonly _poolNetInDirQueries: Map<
    string,
    ObservableQueryLiquidityNetInDirection
  > = new Map();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {}

  /**
   * getForPoolTokenIn function retrieves or creates an ObservableQueryLiquidityNetInDirection instance for a given pool and token.
   *
   * @param poolId - The unique identifier of the pool.
   * @param token0Denom - The denomination of the first token in the pool.
   * @param token1Denom - The denomination of the second token in the pool.
   * @param zeroForOne - A boolean flag representing if token0 is used for input (true) or token1 (false).
   * @param exponentAtPriceOne - The exponent value when the price ratio between the two tokens is 1:1.
   * @param initialBoundTick - Optional initial tick bound value. If not provided, the initial tick bound will be calcluated as the max and min tick indices.
   * @returns An instance of ObservableQueryLiquidityNetInDirection associated with the specified pool and token.
   */
  getForPoolTokenIn(
    poolId: string,
    token0Denom: string,
    token1Denom: string,
    zeroForOne: boolean,
    exponentAtPriceOne: number,
    initialBoundTick?: Int
  ) {
    // endpoint is on a per-pool and direction basis, so we need to store a query per pool
    const tokenInDenom = zeroForOne ? token0Denom : token1Denom;
    const codedKey = encodeKey({
      poolId,
      tokenInDenom,
    });

    if (!this._poolNetInDirQueries.has(codedKey)) {
      const { minTick, maxTick } =
        computeMinMaxTicksFromExponentAtPriceOne(exponentAtPriceOne);

      console.log(
        "create first query store",
        token0Denom,
        token1Denom,
        zeroForOne,
        exponentAtPriceOne,
        { minTick: minTick.toString(), maxTick: maxTick.toString() }
      );

      const newQuery = new ObservableQueryLiquidityNetInDirection(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        { poolId, tokenInDenom },
        zeroForOne ? maxTick : minTick,
        initialBoundTick
      );
      this._poolNetInDirQueries.set(codedKey, newQuery);
      return newQuery;
    }

    return this._poolNetInDirQueries.get(
      codedKey
    ) as ObservableQueryLiquidityNetInDirection;
  }
}

function encodeKey({ poolId, tokenInDenom }: QueryStoreParams) {
  return `${poolId}-${tokenInDenom}`;
}
