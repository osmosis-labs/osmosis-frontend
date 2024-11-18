import { CoinPretty } from "@keplr-wallet/unit";
import {
  getAssets,
  getLiquidityPerTickRange,
  getPositionHistoricalPerformance,
  mapGetUserPositionDetails,
  mapGetUserPositions,
  queryClParams,
  queryPoolmanagerParams,
  queryPositionById,
} from "@osmosis-labs/server";
import { getAssetFromAssetList, sort } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

const LiquidityPositionSchema = z.object({
  position: z.object({
    position_id: z.string(),
    address: z.string(),
    join_time: z.string(),
    liquidity: z.string(),
    lower_tick: z.string(),
    pool_id: z.string(),
    upper_tick: z.string(),
  }),
  asset0: z.object({
    amount: z.string(),
    denom: z.string(),
  }),
  asset1: z.object({
    amount: z.string(),
    denom: z.string(),
  }),
  claimable_spread_rewards: z.array(
    z.object({
      denom: z.string(),
      amount: z.string(),
    })
  ),
  claimable_incentives: z.array(
    z.object({
      denom: z.string(),
      amount: z.string(),
    })
  ),
  forfeited_incentives: z.array(
    z.object({
      denom: z.string(),
      amount: z.string(),
    })
  ),
});

export const concentratedLiquidityRouter = createTRPCRouter({
  getUserPositions: publicProcedure
    .input(
      z
        .object({
          sortDirection: z.enum(["asc", "desc"]).default("desc"),
          forPoolId: z.string().optional(),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(({ input: { userOsmoAddress, sortDirection, forPoolId }, ctx }) =>
      mapGetUserPositions({
        ...ctx,
        userOsmoAddress,
        forPoolId,
      }).then((positions) => sort(positions, "joinTime", sortDirection))
    ),
  getPositionDetails: publicProcedure
    .input(
      z
        .object({
          position: z.union([z.string(), LiquidityPositionSchema]),
        })
        .merge(UserOsmoAddressSchema.required())
    )
    .query(
      async ({ input: { position: givenPosition, userOsmoAddress }, ctx }) => {
        const { position } =
          typeof givenPosition === "string"
            ? await queryPositionById({ ...ctx, id: givenPosition })
            : { position: givenPosition };

        return (
          await mapGetUserPositionDetails({
            ...ctx,
            positions: [position],
            userOsmoAddress,
          })
        )[0];
      }
    ),
  getPositionHistoricalPerformance: publicProcedure
    .input(
      z.object({
        position: z.union([z.string(), LiquidityPositionSchema]),
      })
    )
    .query(({ input: { position }, ctx }) =>
      getPositionHistoricalPerformance({ ...ctx, position })
    ),
  getLiquidityPerTickRange: publicProcedure
    .input(z.object({ poolId: z.string() }))
    .query(({ ctx, input }) => getLiquidityPerTickRange({ ...ctx, ...input })),
  getBaseTokens: publicProcedure.query(({ ctx }) =>
    getAssets({
      assetLists: ctx.assetLists,
      onlyVerified: true,
    })
      .map((asset) => {
        const assetListAsset = getAssetFromAssetList({
          assetLists: ctx.assetLists,
          coinMinimalDenom: asset.coinMinimalDenom,
        });

        if (!assetListAsset) return;

        return {
          chainName: assetListAsset.rawAsset.chainName,
          token: new CoinPretty(
            {
              coinDenom: asset.coinDenom,
              coinDecimals: asset.coinDecimals,
              coinMinimalDenom: asset.coinMinimalDenom,
              coinImageUrl: asset.coinImageUrl,
            },
            0
          ).currency,
        };
      })
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset))
  ),
  getQuoteTokens: publicProcedure.query(async ({ ctx }) => {
    const {
      params: { authorized_quote_denoms: authorizedQuoteDenoms },
    } = await queryPoolmanagerParams({
      chainList: ctx.chainList,
      chainId: ctx.chainList[0].chain_id,
    });

    return authorizedQuoteDenoms
      .map((quoteMinimalDenom) => {
        const asset = getAssetFromAssetList({
          assetLists: ctx.assetLists,
          coinMinimalDenom: quoteMinimalDenom,
        });

        if (!asset) return;

        const {
          symbol,
          decimals,
          coinMinimalDenom,
          rawAsset: { logoURIs },
        } = asset;
        return {
          token: new CoinPretty(
            {
              coinDenom: symbol,
              coinDecimals: decimals,
              coinMinimalDenom,
              coinImageUrl: logoURIs.svg ?? logoURIs.png ?? "",
            },
            0
          ).currency,
          chainName: asset.rawAsset.chainName,
        };
      })
      .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));
  }),
  getClParams: publicProcedure.query(({ ctx }) =>
    queryClParams({ ...ctx, chainId: ctx.chainList[0].chain_id }).then(
      (clParams) => ({
        authorizedTickSpacing: clParams.params.authorized_tick_spacing,
        authorizedSpreadFactors: clParams.params.authorized_spread_factors,
        balancerSharesRewardDiscount:
          clParams.params.balancer_shares_reward_discount,
        authorizedQuoteDenoms: clParams.params.authorized_quote_denoms,
        authorizedUptimes: clParams.params.authorized_uptimes,
        isPermissionlessPoolCreationEnabled:
          clParams.params.is_permissionless_pool_creation_enabled,
        unrestrictedPoolCreatorWhitelist:
          clParams.params.unrestricted_pool_creator_whitelist,
        hookGasLimit: clParams.params.hook_gas_limit,
      })
    )
  ),
});
