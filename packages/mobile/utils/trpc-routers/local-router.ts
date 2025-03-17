import {
  assetsRouter,
  balancesRouter,
  cmsRouter,
  createTRPCRouter,
  oneClickTradingRouter,
  portfolioRouter,
  swapRouter,
  transactionsRouter,
} from "@osmosis-labs/trpc";
import { gasRouter } from "@osmosis-labs/trpc/build/gas";

/**
 * This section includes tRPC functions that execute on the client-side.
 * Caution: Ensure no sensitive data is exposed through these functions. */
export const localRouter = createTRPCRouter({
  balances: balancesRouter,
  quoteRouter: swapRouter,
  portfolio: portfolioRouter,
  assets: assetsRouter,
  cms: cmsRouter,
  oneClickTrading: oneClickTradingRouter,
  transactions: transactionsRouter,
  gas: gasRouter,
});
