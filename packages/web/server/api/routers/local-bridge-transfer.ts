import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import {
  Bridge,
  bridgeAssetSchema,
  bridgeChainSchema,
} from "@osmosis-labs/bridge";
import {
  calcAssetValue,
  captureErrorAndReturn,
  DEFAULT_VS_CURRENCY,
  getAsset,
  getEvmBalance,
  queryBalances,
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
      z.discriminatedUnion("type", [
        z
          .object({
            type: z.literal("evm"),
            assets: z.array(
              bridgeChainSchema.and(bridgeAssetSchema).and(
                z.object({
                  supportedVariants: z.record(
                    z.string(),
                    z.array(z.string().transform((v) => v as Bridge))
                  ),
                })
              )
            ),
          })
          .merge(UserEvmAddressSchema),
        z
          .object({
            type: z.literal("cosmos"),
            assets: z.array(
              bridgeChainSchema.and(bridgeAssetSchema).and(
                z.object({
                  supportedVariants: z.record(
                    z.string(),
                    z.array(z.string().transform((v) => v as Bridge))
                  ),
                })
              )
            ),
          })
          .merge(UserCosmosAddressSchema),
      ])
    )
    .query(async ({ input, ctx }) => {
      if (input.type === "evm") {
        return Promise.all(
          input.assets
            .filter(
              (asset): asset is Extract<typeof asset, { chainType: "evm" }> =>
                asset.chainType !== "cosmos"
            )
            .map(async (asset) => {
              const emptyBalance = {
                ...asset,
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
                anyDenom: Object.keys(asset.supportedVariants)[0],
                amount: decAmount,
              }).catch((e) => captureErrorAndReturn(e, undefined));

              return {
                ...asset,
                amount: new CoinPretty(
                  {
                    coinDecimals: asset.decimals,
                    coinDenom: asset.denom,
                    coinMinimalDenom: asset.address,
                  },
                  decAmount
                ),
                usdValue: new PricePretty(
                  DEFAULT_VS_CURRENCY,
                  usdValue ?? new Dec(0)
                ),
              };
            })
        );
      }

      if (input.type === "cosmos") {
        if (!input.userCosmosAddress) {
          return input.assets.map((asset) => ({
            ...asset,
            amount: new CoinPretty(
              {
                coinDecimals: asset.decimals,
                coinDenom: asset.denom,
                coinMinimalDenom: asset.denom,
              },
              new Dec(0)
            ),
            usdValue: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(0)),
          }));
        }

        const assetsWithBalance = await Promise.all(
          input.assets
            .filter(
              (
                asset
              ): asset is Extract<typeof asset, { chainType: "cosmos" }> =>
                asset.chainType !== "evm"
            )
            .map(async (asset) => {
              const { balances } = await queryBalances({
                ...ctx,
                chainId: asset.chainId,
                bech32Address: input.userCosmosAddress!,
              });

              const balance = balances.find((a) => a.denom === asset.address);

              if (!balance) {
                return {
                  ...asset,
                  amount: new CoinPretty(
                    {
                      coinDecimals: asset.decimals,
                      coinDenom: asset.denom,
                      coinMinimalDenom: asset.denom,
                    },
                    0
                  ),
                  usdValue: new PricePretty(DEFAULT_VS_CURRENCY, 0),
                };
              }

              const representativeAssetMinimalDenom = Object.keys(
                asset.supportedVariants
              )[0];
              const representativeAsset = getAsset({
                ...ctx,
                anyDenom: representativeAssetMinimalDenom,
              });

              // is user asset, include user data
              const usdValue = await calcAssetValue({
                ...ctx,
                anyDenom: representativeAsset.coinMinimalDenom,
                amount: balance.amount,
              }).catch((e) => captureErrorAndReturn(e, undefined));

              return {
                ...asset,
                amount:
                  new CoinPretty(
                    {
                      coinDecimals: asset.decimals,
                      coinDenom: asset.denom,
                      coinMinimalDenom: asset.address,
                    },
                    balance.amount
                  ) ??
                  new CoinPretty(
                    {
                      coinDecimals: asset.decimals,
                      coinDenom: asset.denom,
                      coinMinimalDenom: asset.address,
                    },
                    0
                  ),
                usdValue: new PricePretty(DEFAULT_VS_CURRENCY, usdValue ?? 0),
              };
            })
        );

        return assetsWithBalance;
      }
    }),
});
