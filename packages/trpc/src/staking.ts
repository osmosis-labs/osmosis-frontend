import {
  calcOsmoSuperfluidEquivalent,
  getAverageStakingApr,
  getValidatorsWithInfos,
  queryDelegations,
  queryDelegatorRewards,
  queryDelegatorValidators,
  queryStakingPool,
  queryUndelegations,
  queryUserValidatorPreferences,
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
  getUserUnbondingDelegations: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) =>
      queryUndelegations({
        chainList: ctx.chainList,
        bech32Address: input.userOsmoAddress,
      }).then(({ unbonding_responses }) => unbonding_responses)
    ),
  getUserDelegationRewards: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) =>
      queryDelegatorRewards({
        chainList: ctx.chainList,
        bech32Address: input.userOsmoAddress,
      }).then(({ rewards, total }) => ({ rewards: rewards ?? [], total }))
    ),
  getUserDelegatorValidators: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) =>
      queryDelegatorValidators({
        chainList: ctx.chainList,
        bech32Address: input.userOsmoAddress,
      }).then(({ validators }) => validators)
    ),
  getStakingPool: publicProcedure.query(({ ctx }) =>
    queryStakingPool({ chainList: ctx.chainList }).then(({ pool }) => ({
      bondedTokens: pool.bonded_tokens,
      notBondedTokens: pool.not_bonded_tokens,
    }))
  ),
  getUserValidatorPreferences: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(({ input, ctx }) =>
      queryUserValidatorPreferences({
        chainList: ctx.chainList,
        bech32Address: input.userOsmoAddress,
      })
        .then(({ preferences }) => preferences)
        // The chain errors when the user has not set any preferences, which
        // the UI treats the same as an empty list.
        .catch(() => [])
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
