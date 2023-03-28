import { Coin, Dec, Int } from "@keplr-wallet/unit";

export interface QuoteParams {
  /** Denom of token 0, left of current price. */
  tokenDenom0: string;
  /** Derivative of total tokens in pool. */
  poolLiquidity: Dec;
  /** List of initted ticks, tick index gaps expected. Current tick is always array index 0, and desired liquidity
   *  is always in indices > 0. Even if swapping for token 0, where ticks increment negatively.
   */
  inittedTicks: LiquidityDepth[];
  /** Current tick as price. */
  curSqrtPrice: Dec;
  /** Precision factor of pool. */
  precisionFactorAtPriceOne: number;
  /** Swap fee. i.e. `0.01` */
  swapFee: Dec;
}

export interface QuoteOutGivenInParams extends QuoteParams {
  /** Denom and amount of token supplied into pool by user. */
  tokenIn: Coin;
}

export interface QuoteInGivenOutParams extends QuoteParams {
  /** Denom and amount of user-desired token to receive from pool. */
  tokenOut: Coin;
}

// Chain def: https://github.com/osmosis-labs/osmosis/blob/afbc5b09c63dc6c2d72ad55d78fe7bee605e9b74/x/concentrated-liquidity/types/query/query.pb.go#L408
export type LiquidityDepth = {
  /** Price-correlated tick index. */
  tickIndex: Int;
  /** Net liquidity, for calculating active liquidity. */
  netLiquidity: Dec;
};
