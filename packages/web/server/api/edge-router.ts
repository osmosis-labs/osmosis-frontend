import {
  assetsRouter,
  chainsRouter,
  createTRPCRouter,
  earnRouter,
  paramsRouter,
  poolsRouter,
  stakingRouter,
  transactionsRouter,
} from "@osmosis-labs/trpc";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  assets: assetsRouter,
  pools: poolsRouter,
  staking: stakingRouter,
  earn: earnRouter,
  transactions: transactionsRouter,
  chains: chainsRouter,
  params: paramsRouter,
});
