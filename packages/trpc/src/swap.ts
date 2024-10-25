import {
  getRouteTokenInGivenOut,
  getRouteTokenInGivenOutParams,
  getRouteTokenOutGivenIn,
  getRouteTokenOutGivenInParams,
} from "@osmosis-labs/server";

import { createTRPCRouter, publicProcedure } from "./api";

export const swapRouter = createTRPCRouter({
  routeTokenOutGivenIn: publicProcedure
    .input(getRouteTokenOutGivenInParams)
    .query(async ({ input, ctx }) => {
      const route = await getRouteTokenOutGivenIn({
        ...ctx,
        ...input,
      });

      return {
        ...route,
        // supplementary data with display types
        name,
      };
    }),
  routeTokenInGivenOut: publicProcedure
    .input(getRouteTokenInGivenOutParams)
    .query(async ({ input, ctx }) => {
      const route = await getRouteTokenInGivenOut({
        ...ctx,
        ...input,
      });

      return {
        ...route,
        // supplementary data with display types
        name,
      };
    }),
});
