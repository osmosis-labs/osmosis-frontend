import { PoolsEdgeRouter } from "~/server/api/edge-routers/pools";
import { createTRPCRouter } from "~/server/api/trpc";

export const edgeRouter = createTRPCRouter({ pools: PoolsEdgeRouter });
