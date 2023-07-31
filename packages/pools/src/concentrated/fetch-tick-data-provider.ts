import { Dec, Int } from "@keplr-wallet/unit";
import {
  estimateInitialTickBound,
  LiquidityDepth,
  maxTick,
  minTick,
} from "@osmosis-labs/math";

import {
  ConcentratedLiquidityPool,
  TickDataProvider,
  TickDepths,
} from "./pool";

type TickDepthsResponse = {
  liquidity_depths: {
    liquidity_net: string;
    tick_index: string;
  }[];
};

/** Default tick data provider that fetches ticks for a single CL pool with `fetch` if the environment supports it, if not a fetcher can be supplied. */
export class FetchTickDataProvider implements TickDataProvider {
  protected _zeroForOneTicks: LiquidityDepth[] = [];
  protected _oneForZeroTicks: LiquidityDepth[] = [];

  protected _zeroForOneBoundIndex = new Int(0);
  protected _oneForZeroBoundIndex = new Int(0);

  constructor(
    protected readonly baseNodeUrl: string,
    protected readonly poolId: string,
    protected readonly nextTicksRampMultiplier = new Int(9),
    protected readonly maxNumRequeriesPerDenom = 9,
    protected readonly tickFetcher: (
      poolId: string,
      tokenInDenom: string,
      boundTickIndex: string
    ) => Promise<TickDepthsResponse> = async (
      poolId,
      tokenInDenom,
      boundTickIndex
    ) => {
      if (fetch === undefined)
        throw new Error("Fetch method must be available in the environment");

      const baseUrl = `${this.baseNodeUrl}osmosis/concentratedliquidity/v1beta1/liquidity_net_in_direction`;

      const url = new URL(baseUrl);

      url.searchParams.append("pool_id", poolId);
      url.searchParams.append("token_in", tokenInDenom);
      url.searchParams.append("use_cur_tick", "true");
      url.searchParams.append("bound_tick", boundTickIndex);

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to fetch liquidity net in direction");
      }
      return (await res.json()) as TickDepthsResponse;
    }
  ) {}

  getTickDepthsTokenOutGivenIn(
    pool: ConcentratedLiquidityPool,
    token: { denom: string; amount: Int },
    getMoreTicks = false
  ): Promise<TickDepths> {
    return this.requestInDirectionWithInitialTickBound(
      pool,
      pool.token0 === token.denom,
      token.amount,
      getMoreTicks
    );
  }

  getTickDepthsTokenInGivenOut(
    pool: ConcentratedLiquidityPool,
    token: { denom: string; amount: Int },
    getMoreTicks = false
  ): Promise<TickDepths> {
    return this.requestInDirectionWithInitialTickBound(
      pool,
      pool.token0 !== token.denom,
      token.amount,
      getMoreTicks
    );
  }

  /** Fetch and return **additional** ticks in the desired direction. Maintains state to determine which ticks have already been fetched. */
  protected async requestInDirectionWithInitialTickBound(
    pool: ConcentratedLiquidityPool,
    zeroForOne: boolean,
    amount: Int,
    getMoreTicks: boolean
  ): Promise<TickDepths> {
    if (pool.id !== this.poolId) throw new Error("Invalid pool");

    // get the previous bound index used to fetch ticks
    const prevBoundIndex = zeroForOne
      ? this._zeroForOneBoundIndex
      : this._oneForZeroBoundIndex;

    const isMaxTicks = zeroForOne
      ? prevBoundIndex.lte(minTick)
      : prevBoundIndex.gte(maxTick);

    const prevTicks = zeroForOne
      ? this._zeroForOneTicks
      : this._oneForZeroTicks;

    // check if has fetched all ticks, if so return existing ticks
    if (isMaxTicks) {
      return {
        allTicks: prevTicks,
        isMaxTicks: true,
      };
    }

    const tokenInDenom = zeroForOne ? pool.token0 : pool.token1;

    const setLatestBoundTickIndex = (index: Int) => {
      if (zeroForOne) {
        this._zeroForOneBoundIndex = index;
      } else {
        this._oneForZeroBoundIndex = index;
      }
    };
    const setTicks = (ticks: LiquidityDepth[]) => {
      if (zeroForOne) {
        this._zeroForOneTicks = ticks;
      } else {
        this._oneForZeroTicks = ticks;
      }
    };

    // haven't fetched ticks yet
    if (prevBoundIndex.isZero()) {
      const initialEstimatedTick = estimateInitialTickBound({
        specifiedToken: {
          amount,
          denom: tokenInDenom,
        },
        isOutGivenIn: true,
        token0Denom: pool.token0,
        token1Denom: pool.token1,
        currentSqrtPrice: pool.currentSqrtPrice,
        currentTickLiquidity: pool.currentTickLiquidity,
      }).boundTickIndex;
      const depths = await this.fetchTicks(tokenInDenom, initialEstimatedTick);
      setTicks(depths);
      setLatestBoundTickIndex(initialEstimatedTick);
    } else if (getMoreTicks) {
      // have fetched ticks, but requested to get more
      let nextBoundIndex = prevBoundIndex.mul(this.nextTicksRampMultiplier);
      if (zeroForOne && nextBoundIndex.lt(minTick)) {
        nextBoundIndex = minTick;
      } else if (!zeroForOne && nextBoundIndex.gt(maxTick)) {
        nextBoundIndex = maxTick;
      }
      const depths = await this.fetchTicks(tokenInDenom, nextBoundIndex);
      setTicks(depths);
      setLatestBoundTickIndex(nextBoundIndex);
    } // else have fetched ticks, but not requested to get more. do nothing and return existing ticks

    const allTicks = zeroForOne ? this._zeroForOneTicks : this._oneForZeroTicks;

    return {
      allTicks,
      isMaxTicks: false,
    };
  }

  async fetchTicks(
    tokenInDenom: string,
    boundTick: Int
  ): Promise<LiquidityDepth[]> {
    const rawDepths = await this.tickFetcher(
      this.poolId,
      tokenInDenom,
      boundTick.toString()
    );
    return serializeTickDepths(rawDepths);
  }
}

function serializeTickDepths(tickDepths: TickDepthsResponse): LiquidityDepth[] {
  return tickDepths.liquidity_depths.map((depth) => ({
    tickIndex: new Int(depth.tick_index),
    netLiquidity: new Dec(depth.liquidity_net),
  }));
}
