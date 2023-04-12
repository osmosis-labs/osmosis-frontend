import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import { LiquidityDepth } from "@osmosis-labs/math";
import {
  ConcentratedLiquidityPool,
  TickDataProvider,
} from "@osmosis-labs/pools";
import { computed, makeObservable } from "mobx";

import { LiquidityNetInDirection } from "./types";

const BOUND_TICK = 3420;

type QueryStoreParams = {
  poolId: string;
  tokenInDenom: string;
};

/** Stores tick data for a single pool swapping in a single direction by token in. */
export class ObservableQueryLiquidityNetInDirection extends ObservableChainQuery<LiquidityNetInDirection> {
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

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly params: QueryStoreParams,
    protected readonly defaultBoundTick = new Int(BOUND_TICK)
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/concentratedliquidity/v1beta1/query_liquidity_net_in_direction?pool_id=${
        params.poolId
      }&token_in=${
        params.tokenInDenom
      }&use_cur_tick=true&bound_tick=${defaultBoundTick.toString()}`
    );

    makeObservable(this);
  }

  /** Fetches remaining ticks in this direction, which could be expensive, so should be done later. */
  fetchRemaining() {
    const { poolId, tokenInDenom } = this.params;
    this.setUrl(
      `/osmosis/concentratedliquidity/v1beta1/query_liquidity_net_in_direction?pool_id=${poolId}&token_in=${tokenInDenom}&use_cur_tick=true&use_no_bound=true`
    );
    return this.waitFreshResponse();
  }
}

export class ObservableQueryLiquiditiesNetInDirection
  extends ObservableChainQueryMap<LiquidityNetInDirection>
  implements TickDataProvider
{
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter,
    protected readonly defaultBoundTick = new Int(BOUND_TICK)
  ) {
    // callback to create a new ObservableQueryLiquidityNetInDirection object for a requested direction
    super(kvStore, chainId, chainGetter, (codedKey: string) => {
      const paramsObj = decodeKey(codedKey);
      return new ObservableQueryLiquidityNetInDirection(
        kvStore,
        chainId,
        chainGetter,
        paramsObj,
        defaultBoundTick
      );
    });
  }

  getForPoolTokenIn(poolId: string, tokenInDenom: string) {
    const codedKey = encodeKey({ poolId, tokenInDenom });
    return super.get(codedKey) as ObservableQueryLiquidityNetInDirection;
  }

  async getTickDepths(
    pool: ConcentratedLiquidityPool,
    tokenInDenom: string
  ): Promise<LiquidityDepth[]> {
    const key = encodeKey({ poolId: pool.id, tokenInDenom });
    // initial ticks have already been requested
    let queryDepths;
    if (this.has(key)) {
      queryDepths = super.get(key) as ObservableQueryLiquidityNetInDirection;
    } else {
      queryDepths = this.getForPoolTokenIn(pool.id, tokenInDenom);
    }
    await queryDepths.waitResponse();
    return queryDepths.depthsInDirection;
  }
}

const delimiter = "-";

function encodeKey({ poolId, tokenInDenom }: QueryStoreParams) {
  return `${poolId}${delimiter}${tokenInDenom}`;
}

function decodeKey(key: string): QueryStoreParams {
  const [poolId, tokenInDenom] = key.split(delimiter);
  return { poolId, tokenInDenom };
}
