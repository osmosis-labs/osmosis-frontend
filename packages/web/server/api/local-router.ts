import {
  balancesRouter,
  cmsRouter,
  concentratedLiquidityRouter,
  createTRPCRouter,
  oneClickTradingRouter,
  orderbookRouter,
  paramsRouter,
  poolsRouter,
  portfolioRouter,
  swapRouter,
  tokenfactoryRouter,
} from "@osmosis-labs/trpc";

import { localBridgeTransferRouter } from "~/server/api/routers/local-bridge-transfer";
import { swappedRouter } from "~/server/api/routers/swapped";

/**
 * Procedures previously executed in the browser (`local.*`), now served by
 * the API Worker at `/api/edge-trpc-local` so they benefit from edge caching,
 * upstream request coalescing, and server-side RPC keys without shipping
 * `@trpc/server` or `@osmosis-labs/server` in the client bundle.
 */
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
  pools: poolsRouter,
  swapped: swappedRouter,
  tokenfactory: tokenfactoryRouter,
});
