import {
  balancesRouter,
  cmsRouter,
  concentratedLiquidityRouter,
  createTRPCRouter,
  oneClickTradingRouter,
  orderbookRouter,
  paramsRouter,
  portfolioRouter,
  swapRouter,
} from "@osmosis-labs/trpc";

import { localBridgeTransferRouter } from "~/server/api/routers/local-bridge-transfer";

/**
 * This section includes tRPC functions that execute on the client-side.
 * Caution: Ensure no sensitive data is exposed through these functions. */
export const localRouter = createTRPCRouter({
  balances: balancesRouter,
  quoteRouter: swapRouter,
  concentratedLiquidity: concentratedLiquidityRouter,
  oneClickTrading: oneClickTradingRouter,
  cms: cmsRouter,
  bridgeTransfer: localBridgeTransferRouter,
  portfolio: portfolioRouter,
  params: paramsRouter,
  orderbooks: orderbookRouter,
});
