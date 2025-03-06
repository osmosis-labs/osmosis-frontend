import {
  assetsRouter,
  chainsRouter,
  createTRPCRouter,
  earnRouter,
  mobileSessionRouter,
  orderbookRouter,
  poolsRouter,
  stakingRouter,
  transactionsRouter,
  webRTCRouter,
} from "@osmosis-labs/trpc";

/** Contains tRPC functions running on Vercel's edge network. */
export const edgeRouter = createTRPCRouter({
  assets: assetsRouter,
  pools: poolsRouter,
  staking: stakingRouter,
  earn: earnRouter,
  transactions: transactionsRouter,
  orderbooks: orderbookRouter,
  chains: chainsRouter,
  webRTC: webRTCRouter,
  mobileSession: mobileSessionRouter,
});
