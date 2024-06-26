import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import {
  calcAssetValue,
  captureErrorAndReturn,
  DEFAULT_VS_CURRENCY,
  getAsset,
  getEvmBalance,
  mapGetAssetsWithUserBalances,
} from "@osmosis-labs/server";
import {
  createTRPCRouter,
  publicProcedure,
  UserCosmosAddressSchema,
  UserEvmAddressSchema,
} from "@osmosis-labs/trpc";
import { getAddress } from "viem";
import { z } from "zod";

export const localBridgeTransferRouter = createTRPCRouter({
  getSupportedAssetsBalances: publicProcedure
    .input(
      z.union([
        z
          .object({
            type: z.literal("evm"),
            assets: z.array(
              z.object({
                chainId: z.number(),
                denom: z.string(),
                address: z.string(),
                decimals: z.number(),
                supportedVariants: z.array(z.string()).min(1),
              })
            ),
          })
          .merge(UserEvmAddressSchema),

        z
          .object({
            type: z.literal("cosmos"),
            assets: z.array(
              z.object({
                chainId: z.string(),
                denom: z.string(),
                address: z.string(),
                decimals: z.number(),
              })
            ),
          })
          .merge(UserCosmosAddressSchema),
      ])
    )
    .query(async ({ input, ctx }) => {
      if (input.type === "evm") {
        input.assets.map(async (asset) => {
          const emptyBalance = {
            coinDenom: asset.denom,
            amount: new CoinPretty(
              {
                coinDecimals: asset.decimals,
                coinDenom: asset.denom,
                coinMinimalDenom: asset.address,
              },
              new Dec(0)
            ),
            usdValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
          };

          if (!input.userEvmAddress) return emptyBalance;

          const balance = await getEvmBalance({
            address: getAddress(asset.address),
            userAddress: input.userEvmAddress,
            chainId: asset.chainId,
          }).catch(() => undefined);

          if (!balance) return emptyBalance;

          const decAmount = new Dec(balance.toString());
          /**
           * Use the supported variant to determine the price of the ETH asset.
           * This is because providers can return variant assets that are missing in
           * our asset list.
           *
           * TODO: Weigh the pros and cons of filtering variant assets not in our asset list.
           */
          const usdValue = await calcAssetValue({
            ...ctx,
            anyDenom: asset.supportedVariants[0],
            amount: decAmount,
          }).catch((e) => captureErrorAndReturn(e, undefined));

          return {
            coinDenom: asset.denom,
            amount: new CoinPretty(
              {
                coinDecimals: asset.decimals,
                coinDenom: asset.denom,
                coinMinimalDenom: asset.address,
              },
              decAmount
            ),
            usdValue:
              usdValue ?? new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
          };
        });
      }

      if (input.type === "cosmos") {
        const assets = input.assets.map((asset) =>
          getAsset({ ...ctx, anyDenom: asset.denom })
        );

        if (!input.userOsmoAddress)
          return assets.map((asset) => ({
            coinDenom: asset.coinDenom,
            amount: new CoinPretty(asset, new Dec(0)),
            usdValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
          }));

        const balances = await mapGetAssetsWithUserBalances({
          ...ctx,
          assets,
          userOsmoAddress: input.userOsmoAddress,
          includePreview: true,
        });

        return balances.map((asset) => ({
          coinDenom: asset.coinDenom,
          amount: asset.amount ?? new CoinPretty(asset, new Dec(0)),
          usdValue:
            asset.usdValue ?? new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
        }));
      }
    }),
});
