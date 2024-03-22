import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import {
  AssetList,
  Chain,
  OneClickTradingTransactionParams,
} from "@osmosis-labs/types";
import { OsmosisAverageGasLimit } from "@osmosis-labs/utils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { DEFAULT_VS_CURRENCY, getAsset, queryCosmosAccount } from "../queries";
import { getFeeTokenGasPriceStep } from "../queries/complex/assets/gas";
import {
  getAuthenticators,
  getSessionAuthenticator,
} from "../queries/complex/authenticators";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const oneClickTradingRouter = createTRPCRouter({
  getParameters: publicProcedure.query(
    async ({
      ctx,
    }): Promise<
      Pick<
        OneClickTradingTransactionParams,
        "networkFeeLimit" | "resetPeriod" | "spendLimit" | "sessionPeriod"
      > & {
        spendLimitTokenDecimals: number;
      }
    > => {
      const [networkFeeLimitStep, usdcAsset] = await Promise.all([
        getNetworkFeeLimitStep(ctx),
        getAsset({ anyDenom: "usdc", assetLists: ctx.assetLists }),
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
  getNetworkFeeLimitStep: publicProcedure.query(async ({ ctx }) =>
    getNetworkFeeLimitStep(ctx)
  ),
  getSessionAuthenticator: publicProcedure
    .input(z.object({ userOsmoAddress: z.string(), publicKey: z.string() }))
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
  getAccountPubKeyAndAuthenticators: publicProcedure
    .input(z.object({ userOsmoAddress: z.string() }))
    .query(async ({ input, ctx }) => {
      const [cosmosAccount, authenticators] = await Promise.all([
        queryCosmosAccount({ address: input.userOsmoAddress }),
        getAuthenticators({
          userOsmoAddress: input.userOsmoAddress,
          chainList: ctx.chainList,
        }),
      ]);

      return {
        accountPubKey: cosmosAccount.account.pub_key.key,
        authenticators,
        shouldAddFirstAuthenticator: authenticators.length === 0,
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
