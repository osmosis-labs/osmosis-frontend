import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { OsmosisAverageGasLimit } from "@osmosis-labs/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ChainList } from "~/config/generated/chain-list";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAsset } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { getFeeTokenGasPriceStep } from "~/server/queries/complex/assets/gas";
import {
  getAuthenticators,
  getSessionAuthenticator,
} from "~/server/queries/complex/authenticators";
import { UserOsmoAddressSchema } from "~/server/queries/complex/parameter-types";
import { queryCosmosAccount } from "~/server/queries/cosmos/auth";
import { queryAuthenticatorSpendLimit } from "~/server/queries/osmosis/authenticators";

export const oneClickTradingRouter = createTRPCRouter({
  getParameters: publicProcedure.query(
    async (): Promise<
      Pick<
        OneClickTradingTransactionParams,
        "networkFeeLimit" | "resetPeriod" | "spendLimit" | "sessionPeriod"
      > & {
        spendLimitTokenDecimals: number;
      }
    > => {
      const [networkFeeLimitStep, usdcAsset] = await Promise.all([
        getNetworkFeeLimitStep(),
        getAsset({ anyDenom: "usdc" }),
      ]);

      return {
        spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(5_000)),
        spendLimitTokenDecimals: usdcAsset.coinDecimals,
        networkFeeLimit: networkFeeLimitStep.average,
        resetPeriod: "day" as const,
        sessionPeriod: {
          end: "1hour" as const,
        },
      };
    }
  ),
  getNetworkFeeLimitStep: publicProcedure.query(async () =>
    getNetworkFeeLimitStep()
  ),
  getSessionAuthenticator: publicProcedure
    .input(
      UserOsmoAddressSchema.required().and(z.object({ publicKey: z.string() }))
    )
    .query(async ({ input }) => {
      const sessionAuthenticator = await getSessionAuthenticator({
        userOsmoAddress: input.userOsmoAddress,
        publicKey: input.publicKey,
      });

      if (!sessionAuthenticator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      return sessionAuthenticator;
    }),
  getAccountPubKeyAndAuthenticators: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input }) => {
      const [cosmosAccount, authenticators] = await Promise.all([
        queryCosmosAccount({ address: input.userOsmoAddress }),
        getAuthenticators({ userOsmoAddress: input.userOsmoAddress }),
      ]);

      return {
        accountPubKey: cosmosAccount.account.pub_key.key,
        authenticators,
        shouldAddFirstAuthenticator: authenticators.length === 0,
      };
    }),
  getAmountSpent: publicProcedure
    .input(
      UserOsmoAddressSchema.required().and(
        z.object({ authenticatorId: z.string() })
      )
    )
    .query(async ({ input: { userOsmoAddress, authenticatorId } }) => {
      const [spendLimit, usdcAsset] = await Promise.all([
        queryAuthenticatorSpendLimit({
          address: userOsmoAddress,
          authenticatorId,
        }),
        getAsset({ anyDenom: "usdc" }),
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

async function getNetworkFeeLimitStep() {
  const osmosisChain = ChainList[0];
  const osmoAsset = await getAsset({
    anyDenom: osmosisChain.fees.fee_tokens[0].denom,
  });

  if (!osmoAsset) {
    throw new Error("Osmo asset not found");
  }

  const osmosisGasPriceStep = await getFeeTokenGasPriceStep({
    chainId: osmosisChain.chain_id,
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
