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
 * Server-native `local.*` router served by the API Worker at
 * `/api/edge-trpc-local`. Kept separate from `local-router.ts` during PR 1
 * so the browser bundle does not pull in server-only `crypto` via `swapped.ts`.
 */
export const edgeLocalRouter = createTRPCRouter({
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
