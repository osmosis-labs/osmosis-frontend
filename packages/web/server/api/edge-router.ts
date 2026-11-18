import {
  assetsRouter,
  chainsRouter,
  createTRPCRouter,
  orderbookRouter,
  poolsRouter,
  stakingRouter,
  transactionsRouter,
} from "@osmosis-labs/trpc";

/** Contains tRPC procedures served by the API Worker. */
export const edgeRouter = createTRPCRouter({
  assets: assetsRouter,
  pools: poolsRouter,
  staking: stakingRouter,
  transactions: transactionsRouter,
  orderbooks: orderbookRouter,
  chains: chainsRouter,
});
