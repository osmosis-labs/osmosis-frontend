import {
  calcOsmoSuperfluidEquivalent,
  getAverageStakingApr,
  getValidatorsWithInfos,
  queryDelegations,
} from "@osmosis-labs/server";
import { BondStatus } from "@osmosis-labs/types";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

export const stakingRouter = createTRPCRouter({
  getApr: publicProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
      })
    )
    .query(async ({ input }) => getAverageStakingApr(input)),
  getValidators: publicProcedure
    .input(
      z.object({
        status: z.enum(["Bonded", "Unbonded", "Unbonding", "Unspecified"]),
      })
    )
    .query(async ({ input, ctx }) =>
      getValidatorsWithInfos({ ...ctx, status: BondStatus[input.status] })
    ),
  getUserDelegations: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) =>
      queryDelegations({
        chainList: ctx.chainList,
        bech32Address: input.userOsmoAddress,
      }).then(({ delegation_responses }) => delegation_responses)
    ),
  getOsmoEquivalent: publicProcedure
    .input(
      z.object({
        denom: z.string(),
        amount: z.string(),
      })
    )
    .query(async ({ input, ctx }) =>
      calcOsmoSuperfluidEquivalent({
        ...ctx,
        ...input,
      })
    ),
});
