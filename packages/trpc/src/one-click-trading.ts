import {
  DEFAULT_VS_CURRENCY,
  getAsset,
  getAuthenticators,
  getSessionAuthenticator,
  queryAuthenticatorSpendLimit,
  SPEND_LIMIT_CONTRACT_ADDRESS,
} from "@osmosis-labs/server";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
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
          end: "7days" as const,
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
      const [spendLimit, usdcAsset, sessionAuthenticator] = await Promise.all([
        queryAuthenticatorSpendLimit({
          address: userOsmoAddress,
          authenticatorId,
          chainList: ctx.chainList,
        }),
        getAsset({ anyDenom: "usdc", assetLists: ctx.assetLists }),
        getSessionAuthenticator({
          userOsmoAddress,
          authenticatorId,
          chainList: ctx.chainList,
        }),
      ]);

      // Get the limit value from the session authenticator
      let limitValue: PricePretty | undefined;
      if (sessionAuthenticator?.type === "AllOf") {
        const spendLimitAuthenticator =
          sessionAuthenticator.subAuthenticators.find(
            (sub) =>
              sub.type === "CosmwasmAuthenticatorV1" &&
              sub.contract === SPEND_LIMIT_CONTRACT_ADDRESS
          );

        if (
          spendLimitAuthenticator?.type === "CosmwasmAuthenticatorV1" &&
          spendLimitAuthenticator.params.limit
        ) {
          limitValue = new PricePretty(
            DEFAULT_VS_CURRENCY,
            new Dec(spendLimitAuthenticator.params.limit).quo(
              DecUtils.getTenExponentN(usdcAsset.coinDecimals)
            )
          );
        }
      }

      if (!limitValue) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Spend limit not found",
        });
      }

      return {
        totalLimit: limitValue,
        amountSpent: new PricePretty(
          DEFAULT_VS_CURRENCY,
          new Dec(spendLimit.data.spending.value_spent_in_period).quo(
            DecUtils.getTenExponentN(usdcAsset.coinDecimals)
          )
        ),
      };
    }),
});
