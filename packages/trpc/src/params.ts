import { getEpochs } from "@osmosis-labs/server";

import { createTRPCRouter, publicProcedure } from "./api";

/** Contains Osmosis param data, or miscellaneous Osmosis queries that don't fit into
 *  other router categories.
 */
export const paramsRouter = createTRPCRouter({
  /** Get Cosmos chain. */
  getEpochs: publicProcedure.query(({ ctx }) =>
    getEpochs({ chainList: ctx.chainList })
  ),
});
