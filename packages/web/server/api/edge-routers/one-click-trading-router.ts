import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { OsmosisAverageGasLimit } from "@osmosis-labs/utils";
import { z } from "zod";

import { ChainList } from "~/config/generated/chain-list";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getAsset, getAssetPrice } from "~/server/queries/complex/assets";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";
import { getFeeTokenGasPriceStep } from "~/server/queries/complex/assets/gas";
import { queryCosmosAccount } from "~/server/queries/cosmos/auth";
import {
  Authenticator,
  queryAuthenticators,
} from "~/server/queries/osmosis/authenticators";

interface NestedAuthenticator {
  authenticator_type: Authenticator["type"];
  data: Authenticator["data"];
}

export const oneClickTradingRouter = createTRPCRouter({
  getDefaultParameters: publicProcedure.query(
    async (): Promise<
      Pick<
        OneClickTradingTransactionParams,
        "networkFeeLimit" | "sessionPeriod" | "spendLimit"
      >
    > => {
      const osmosisChain = ChainList[0];
      const osmoAsset = await getAsset({
        anyDenom: osmosisChain.fees.fee_tokens[0].denom,
      });

      if (!osmoAsset) {
        throw new Error("Osmo asset not found");
      }

      const [osmoPrice, osmosisGasPriceStep] = await Promise.all([
        getAssetPrice({
          asset: osmoAsset,
        }),
        getFeeTokenGasPriceStep({
          chainId: osmosisChain.chain_id,
        }),
      ]);

      if (!osmoPrice || !osmosisGasPriceStep) {
        throw new Error("Error fetching osmo price");
      }

      const osmosisGasPrice = new Dec(osmosisGasPriceStep.average);
      // new CoinPretty(
      //   osmoAsset,
      //   new Dec("5000")
      //     .quoRoundUp(osmoPrice)
      //     .mul(DecUtils.getTenExponentN(osmoAsset.coinDecimals))
      // )
      return {
        spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(5_000)),
        networkFeeLimit: new CoinPretty(
          osmoAsset,
          osmosisGasPrice.mul(new Dec(OsmosisAverageGasLimit))
        ),
        sessionPeriod: "day" as const,
      };
    }
  ),
  getAuthenticators: publicProcedure
    .input(z.object({ userOsmoAddress: z.string() }))
    .query(async ({ input }) => {
      const { authenticators } = await queryAuthenticators({
        address: input.userOsmoAddress,
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
