import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  Authenticator,
  queryAuthenticators,
} from "~/server/queries/authenticators";
import { queryCosmosAccount } from "~/server/queries/cosmos/auth";

interface NestedAuthenticator {
  authenticator_type: Authenticator["type"];
  data: Authenticator["data"];
}

export const AuthenticatorsEdgeRouter = createTRPCRouter({
  getAuthenticators: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const { authenticators } = await queryAuthenticators({
        address: input.address,
      });

      return authenticators.map(({ data, id, type }) => {
        let subAuthenticators: NestedAuthenticator[] | undefined;

        if (type === "AllOfAuthenticator" || type === "AnyOfAuthenticator") {
          const parsedData = Buffer.from(data, "base64").toString("utf-8");
          subAuthenticators = JSON.parse(parsedData);
        }

        return {
          id,
          type,
          data,
          subAuthenticators,
        };
      });
    }),

  getCosmosAccount: publicProcedure
    .input(z.object({ address: z.string() }))
    .query(async ({ input }) => {
      const result = await queryCosmosAccount({ address: input.address });
      return { account: result.account };
    }),
});
