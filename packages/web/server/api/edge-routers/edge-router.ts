import { RouteTokenOutGivenInRouter } from "~/server/api/edge-routers/route-token-out-given-in";

import { createTRPCRouter } from "../trpc";
import { AssetsEdgeRouter } from "./assets";
import { PoolsEdgeRouter } from "./pools";

export const edgeRouter = createTRPCRouter({
  pools: PoolsEdgeRouter,
  assets: AssetsEdgeRouter,
  routeTokenOutGivenIn: RouteTokenOutGivenInRouter,
});
