import {
  assetsRouter,
  createTRPCRouter,
  earnRouter,
  poolsRouter,
  stakingRouter,
  transactionsRouter,
} from "@osmosis-labs/server";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  assets: assetsRouter,
  pools: poolsRouter,
  staking: stakingRouter,
  earn: earnRouter,
  transactions: transactionsRouter,
});
