import {
  DEFAULT_VS_CURRENCY,
  getAsset,
  getAssetPrice,
} from "@osmosis-labs/server";
import { CoinPretty, Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

const EncodeObjectSchema = z.object({
  typeUrl: z.string(),
  value: z.string(),
});

export const gasRouter = createTRPCRouter({
  estimateTxFees: publicProcedure
    .input(
      z.object({
        chainId: z.string(),
        messages: z.array(EncodeObjectSchema),
        nonCriticalExtensionOptions: z.array(EncodeObjectSchema).optional(),
        bech32Address: z.string(),
        onlyDefaultFeeDenom: z.boolean().optional(),
        gasMultiplier: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.messages.length) throw new Error("No messages");
      if (!input.bech32Address) throw new Error("No address");

      const { chainList } = ctx;

      const { estimateGasFee, decodeAnyBase64 } = await import(
        "@osmosis-labs/tx"
      );

      const { amount, gas } = await estimateGasFee({
        chainId: input.chainId,
        chainList,
        bech32Address: input.bech32Address,
        body: {
          messages: input.messages.map(decodeAnyBase64),
          nonCriticalExtensionOptions: input.nonCriticalExtensionOptions
            ? input.nonCriticalExtensionOptions.map(decodeAnyBase64)
            : undefined,
        },
        gasMultiplier: 1.5,
      });

      const fee = amount[0];
      const asset = getAsset({ ...ctx, anyDenom: fee.denom });
      const price = await getAssetPrice({
        ...ctx,
        asset,
      });

      if (!fee || !price) {
        throw new Error("Failed to estimate fees");
      }

      const coinAmountDec = new Dec(fee.amount);
      const usdValue = coinAmountDec
        .quo(DecUtils.getTenExponentN(asset.coinDecimals))
        .mul(price);
      const gasUsdValueToPay = new PricePretty(DEFAULT_VS_CURRENCY, usdValue);

      return {
        gasUsdValueToPay,
        gasAmount: new CoinPretty(asset, coinAmountDec),
        gasLimit: gas,
        amount,
      };
    }),
});
