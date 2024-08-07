import { createNodeQuery } from "../../create-node-query";

export type LiquidityPerTickRange = {
  liquidity: {
    liquidity_amount: string;
    lower_tick: string;
    upper_tick: string;
  }[];
};

export const queryLiquidityPerTickRange = createNodeQuery<
  LiquidityPerTickRange,
  {
    poolId: string;
  }
>({
  path: ({ poolId }) =>
    `/osmosis/concentratedliquidity/v1beta1/liquidity_per_tick_range?pool_id=${poolId}`,
});
