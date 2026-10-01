import {
  assetsRouter,
  chainsRouter,
  createTRPCRouter,
  orderbookRouter,
  poolsRouter,
  stakingRouter,
  transactionsRouter,
} from "@osmosis-labs/trpc";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  assets: assetsRouter,
  pools: poolsRouter,
  staking: stakingRouter,
  transactions: transactionsRouter,
  orderbooks: orderbookRouter,
  chains: chainsRouter,
});
