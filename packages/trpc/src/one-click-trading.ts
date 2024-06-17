import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import {
  DEFAULT_VS_CURRENCY,
  getAsset,
  getAuthenticators,
  getFeeTokenGasPriceStep,
  getSessionAuthenticator,
  queryAuthenticatorSpendLimit,
} from "@osmosis-labs/server";
import {
  AssetList,
  Chain,
  OneClickTradingTransactionParams,
} from "@osmosis-labs/types";
import { OsmosisAverageGasLimit } from "@osmosis-labs/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { OsmoAddressSchema } from "./parameter-types";

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
      const [networkFeeLimitStep, usdcAsset] = await Promise.all([
        getNetworkFeeLimitStep({
          assetLists: ctx.assetLists,
          chainList: ctx.chainList,
        }),
        getAsset({ anyDenom: "usdc", assetLists: ctx.assetLists }),
      ]);

      return {
        spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(5_000)),
        spendLimitTokenDecimals: usdcAsset.coinDecimals,
        networkFeeLimit: networkFeeLimitStep.average,
        sessionPeriod: {
          end: "1hour" as const,
        },
      };
    }
  ),
  getNetworkFeeLimitStep: publicProcedure.query(async ({ ctx }) =>
    getNetworkFeeLimitStep({
      chainList: ctx.chainList,
      assetLists: ctx.assetLists,
    })
  ),
  getSessionAuthenticator: publicProcedure
    .input(
      OsmoAddressSchema.required().and(z.object({ publicKey: z.string() }))
    )
    .query(async ({ input, ctx }) => {
      const sessionAuthenticator = await getSessionAuthenticator({
        userOsmoAddress: input.osmoAddress,
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
    .input(OsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const authenticators = await getAuthenticators({
        userOsmoAddress: input.osmoAddress,
        chainList: ctx.chainList,
      });

      return {
        authenticators,
      };
    }),
  getAmountSpent: publicProcedure
    .input(
      OsmoAddressSchema.required().and(
        z.object({ authenticatorId: z.string() })
      )
    )
    .query(async ({ input: { osmoAddress, authenticatorId }, ctx }) => {
      const [spendLimit, usdcAsset] = await Promise.all([
        queryAuthenticatorSpendLimit({
          address: osmoAddress,
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

async function getNetworkFeeLimitStep({
  chainList,
  assetLists,
}: {
  chainList: Chain[];
  assetLists: AssetList[];
}) {
  const osmosisChain = chainList[0];
  const osmoAsset = await getAsset({
    anyDenom: osmosisChain.fees.fee_tokens[0].denom,
    assetLists,
  });

  if (!osmoAsset) {
    throw new Error("Osmo asset not found");
  }

  const osmosisGasPriceStep = await getFeeTokenGasPriceStep({
    chainId: osmosisChain.chain_id,
    chainList,
  });

  if (!osmosisGasPriceStep) {
    throw new Error("Error fetching osmo price");
  }

  const osmosisAverageGasLimitDec = new Dec(OsmosisAverageGasLimit);

  return {
    low: new CoinPretty(
      osmoAsset,
      new Dec(osmosisGasPriceStep.low).mul(osmosisAverageGasLimitDec)
    ),
    average: new CoinPretty(
      osmoAsset,
      new Dec(osmosisGasPriceStep.average).mul(osmosisAverageGasLimitDec)
    ),
    high: new CoinPretty(
      osmoAsset,
      new Dec(osmosisGasPriceStep.high).mul(osmosisAverageGasLimitDec)
    ),
  };
}
