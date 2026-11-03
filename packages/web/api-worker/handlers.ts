import { activeGaugesHandler } from "~/server/api-handlers/active-gauges";
import { broadcastTransactionHandler } from "~/server/api-handlers/broadcast-transaction";
import { edgeTrpcAssetsHandler } from "~/server/api-handlers/edge-trpc-assets";
import { edgeTrpcMainHandler } from "~/server/api-handlers/edge-trpc-main";
import { edgeTrpcPoolsHandler } from "~/server/api-handlers/edge-trpc-pools";
import { estimateGasFeeHandler } from "~/server/api-handlers/estimate-gas-fee";
import { evmRpcHandler } from "~/server/api-handlers/evm-rpc";
import { poolHandler } from "~/server/api-handlers/pool";
import { poolsHandler } from "~/server/api-handlers/pools";
import { simulatePositionMigrationHandler } from "~/server/api-handlers/simulate-position-migration";
import {
  skipTrackTxHandler,
  skipTxStatusHandler,
} from "~/server/api-handlers/skip-tx";
import { solanaRpcHandler } from "~/server/api-handlers/solana-rpc";
import { swappedSignatureHandler } from "~/server/api-handlers/swapped-signature";
import { trpcHandler } from "~/server/api-handlers/trpc";

import type { ApiHandler, ApiHandlerId } from "./routes";

/** Handler id → Fetch handler. Ids are checked against `API_HANDLER_IDS` by the route tests. */
export const apiHandlers: Record<ApiHandlerId, ApiHandler> = {
  trpc: trpcHandler,
  edgeTrpcMain: edgeTrpcMainHandler,
  edgeTrpcPools: edgeTrpcPoolsHandler,
  edgeTrpcAssets: edgeTrpcAssetsHandler,
  pools: poolsHandler,
  pool: poolHandler,
  activeGauges: activeGaugesHandler,
  broadcastTransaction: broadcastTransactionHandler,
  estimateGasFee: estimateGasFeeHandler,
  evmRpc: evmRpcHandler,
  simulatePositionMigration: simulatePositionMigrationHandler,
  solanaRpc: solanaRpcHandler,
  swappedSignature: swappedSignatureHandler,
  skipTrackTx: skipTrackTxHandler,
  skipTxStatus: skipTxStatusHandler,
};
