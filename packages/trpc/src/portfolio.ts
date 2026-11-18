import {
  getAlloyStatuses,
  getForcedMigrationHoldings,
  getPortfolioAssets,
  getPortfolioOverTime,
} from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const portfolioRouter = createTRPCRouter({
  getPortfolioOverTime: publicProcedure
    .input(
      z.object({
        address: z.string().startsWith("osmo"),
        range: z.enum(["1d", "7d", "1mo", "1y", "all"]),
      })
    )
    .query(({ input: { address, range } }) =>
      getPortfolioOverTime({
        address,
        range,
      })
    ),
  getPortfolioAssets: publicProcedure
    .input(
      z.object({
        address: z.string().startsWith("osmo"),
      })
    )
    .query(({ input: { address }, ctx: { assetLists } }) =>
      getPortfolioAssets({
        address,
        assetLists,
      })
    ),
  /** Transmuter status per alloy contract, for deciding which variants
   *  convert. Separate from the portfolio so contract queries never hold it
   *  up. */
  getAlloyStatuses: publicProcedure
    .input(
      z.object({
        // Contract addresses (osmo1 + 58 chars). The cap leaves room for a
        // wallet holding variants of every alloy; the server only queries
        // known alloy contracts, so a larger list can't widen the fan-out.
        contractAddresses: z
          .array(z.string().regex(/^osmo1[a-z0-9]{58}$/))
          .max(50),
      })
    )
    .query(({ input: { contractAddresses }, ctx: { assetLists, chainList } }) =>
      getAlloyStatuses({ contractAddresses, assetLists, chainList })
    ),
  getForcedMigrationHoldings: publicProcedure
    .input(
      z.object({
        address: z.string().startsWith("osmo"),
        denoms: z.array(z.string().min(1)).max(20),
      })
    )
    .query(({ input: { address, denoms }, ctx: { assetLists, chainList } }) =>
      getForcedMigrationHoldings({
        assetLists,
        chainList,
        bech32Address: address,
        denoms,
      })
    ),
});
