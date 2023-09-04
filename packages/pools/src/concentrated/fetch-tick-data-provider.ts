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

/** Default tick data provider that fetches ticks for a single CL pool with `fetch` if the environment supports it, if not a fetcher can be supplied.
 *  It is assumed this instance follows the instance of the pool.
 *  Stores some cache data statically, assuming ticks are being fetched from a single query node. */
export class FetchTickDataProvider implements TickDataProvider {
  protected _zeroForOneTicks: LiquidityDepth[] = [];
  protected _oneForZeroTicks: LiquidityDepth[] = [];

  protected _zeroForOneBoundIndex = new Int(0);
  protected _oneForZeroBoundIndex = new Int(0);

  /** Serialized param key-value set of tick depths currently fetching. */
  protected static _inFlightTickRequests = new Map<
    string,
    Promise<TickDepthsResponse>
  >();

  /**
   * Creates a new instance. It is assumed this instance follows the instance of the pool.
   * @param baseNodeUrl Base URL of node to fetch ticks from. Only used in default `tickFetcher`.
   * @param poolId ID of pool ticks being fetched from. Used for validation.
   * @param nextTicksRampMultiplier Multiplier for the next tick bound when fetching more ticks. Defaults to 9. Higher values request more data in rolling requests.
   * @param maxNumRequeriesPerDenom Maximum number of requeries per denom when fetching more ticks. Defaults to 9. Low values may result in quoting not enough liquidity to end user, but save data.
   * @param tickFetcher Basic tick fetcher. Defaults to fetching from the concentrated liquidity module via `fetch` API. Assumes no client-side caching.
   */
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

    // This scope handles getting more ticks from remote in 2 scenarios:
    // * initial fetch of ticks using an estimate bound (a function of the liquidity and amount)
    // * additional ticks, as the caller likely didn't find previous ticks sufficient in liquidity
    {
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

        const depths = await this.fetchTicks(
          tokenInDenom,
          initialEstimatedTick
        );

        setTicks(depths);
        setLatestBoundTickIndex(initialEstimatedTick);
      } else if (getMoreTicks) {
        // have fetched ticks, but requested to get more
        const nextBoundIndex = rampNextQueryTick(
          zeroForOne,
          pool.currentTick,
          prevBoundIndex,
          this.nextTicksRampMultiplier
        );

        const depths = await this.fetchTicks(tokenInDenom, nextBoundIndex);

        setTicks(depths);
        setLatestBoundTickIndex(nextBoundIndex);
      }
    }

    // else have fetched ticks, but not requested to get more. do nothing and return existing ticks
    // this also contains the freshly fetched ticks if the caller requested to get more ticks
    const allTicks = zeroForOne ? this._zeroForOneTicks : this._oneForZeroTicks;

    return {
      allTicks,
      isMaxTicks: false,
    };
  }

  /** Async operation to fetch ticks using the given fetcher.
   *  Will block on the same request if it is already in flight. */
  async fetchTicks(
    tokenInDenom: string,
    boundTick: Int
  ): Promise<LiquidityDepth[]> {
    const requestKey = [this.poolId, tokenInDenom, boundTick]
      .map((p) => p.toString())
      .join("_");

    // check if we have already started to fetch ticks for these parameters
    let request = FetchTickDataProvider._inFlightTickRequests.get(requestKey);
    if (!request) {
      // add to in flight requests
      request = this.tickFetcher(
        this.poolId,
        tokenInDenom,
        boundTick.toString()
      );
      // maintain static reference to this request
      FetchTickDataProvider._inFlightTickRequests.set(requestKey, request);
    }

    const response = await request;

    const depths = serializeTickDepths(response);
    FetchTickDataProvider._inFlightTickRequests.delete(requestKey);
    return depths;
  }
}

function serializeTickDepths(tickDepths: TickDepthsResponse): LiquidityDepth[] {
  return tickDepths.liquidity_depths.map((depth) => ({
    tickIndex: new Int(depth.tick_index),
    netLiquidity: new Dec(depth.liquidity_net),
  }));
}

/**
 * Ramp up to the next tick query.
 *
 * @param zeroForOne Boolean indicating if it's 0 for 1 token being swapped in
 * @param poolCurrentTick Current tick in pool
 * @param prevQueriedTick Prev queried tick
 * @param multiplier Multiplier
 * @returns Next tick bound to query
 */
export function rampNextQueryTick(
  zeroForOne: boolean,
  poolCurrentTick: Int,
  prevQueriedTick: Int,
  multiplier: Int
): Int {
  const tickGapSize = poolCurrentTick.sub(prevQueriedTick).abs();

  const tickRampAmount = tickGapSize.isZero()
    ? // if there's no gap to get ramp going, use 100 as a default for no particular reason
      new Int(100).mul(multiplier)
    : tickGapSize.mul(multiplier);

  if (zeroForOne) {
    // query ticks in negative direction
    const nextQueryTick = prevQueriedTick.sub(tickRampAmount);
    return nextQueryTick.lt(minTick) ? minTick : nextQueryTick;
  }

  // query ticks in positive direction
  const nextQueryTick = prevQueriedTick.add(tickRampAmount);
  return nextQueryTick.gt(maxTick) ? minTick : nextQueryTick;
}
