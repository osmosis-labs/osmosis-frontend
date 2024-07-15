import { Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  DEFAULT_VS_CURRENCY,
  getAsset,
  getAuthenticators,
  getSessionAuthenticator,
  queryAuthenticatorSpendLimit,
} from "@osmosis-labs/server";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { OneClickTradingMaxGasLimit } from "@osmosis-labs/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { UserOsmoAddressSchema } from "./parameter-types";

export const oneClickTradingRouter = createTRPCRouter({
  getParameters: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      Pick<
        OneClickTradingTransactionParams,
        "networkFeeLimit" | "spendLimit" | "sessionPeriod"
      > & {
        spendLimitTokenDecimals: number;
      }
    > => {
      const usdcAsset = await getAsset({ ...ctx, anyDenom: "usdc" });

      return {
        spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(5_000)),
        spendLimitTokenDecimals: usdcAsset.coinDecimals,
        networkFeeLimit: OneClickTradingMaxGasLimit,
        sessionPeriod: {
          end: "1hour" as const,
        },
      };
    }
  ),
  getSessionAuthenticator: publicProcedure
    .input(
      UserOsmoAddressSchema.required().and(z.object({ publicKey: z.string() }))
    )
    .query(async ({ input, ctx }) => {
      const sessionAuthenticator = await getSessionAuthenticator({
        userOsmoAddress: input.userOsmoAddress,
        publicKey: input.publicKey,
        chainList: ctx.chainList,
      });

      if (!sessionAuthenticator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return sessionAuthenticator;
    }),
  getAuthenticators: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const authenticators = await getAuthenticators({
        userOsmoAddress: input.userOsmoAddress,
        chainList: ctx.chainList,
      });

      return {
        authenticators,
      };
    }),
  getAmountSpent: publicProcedure
    .input(
      UserOsmoAddressSchema.required().and(
        z.object({ authenticatorId: z.string() })
      )
    )
    .query(async ({ input: { userOsmoAddress, authenticatorId }, ctx }) => {
      const [spendLimit, usdcAsset] = await Promise.all([
        queryAuthenticatorSpendLimit({
          address: userOsmoAddress,
          authenticatorId,
          chainList: ctx.chainList,
        }),
        getAsset({ anyDenom: "usdc", assetLists: ctx.assetLists }),
      ]);

      return {
        amountSpent: new PricePretty(
          DEFAULT_VS_CURRENCY,
          new Dec(spendLimit.data.spending.value_spent_in_period).quo(
            DecUtils.getTenExponentN(usdcAsset.coinDecimals)
          )
        ),
      };
    }),
});
