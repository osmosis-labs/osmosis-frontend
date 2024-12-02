import type { Bridge } from "@osmosis-labs/bridge";
import {
  bridgeChainSchema,
  BridgeSupportedAsset,
  bridgeSupportedAssetSchema,
} from "@osmosis-labs/bridge/build/interface";
import {
  calcAssetValue,
  captureErrorAndReturn,
  DEFAULT_VS_CURRENCY,
  getAsset,
  getEvmBalance,
  queryBalances,
  queryCosmWasmContractBalance,
} from "@osmosis-labs/server";
import {
  createTRPCRouter,
  publicProcedure,
  UserCosmosAddressSchema,
  UserEvmAddressSchema,
} from "@osmosis-labs/trpc";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import { getAddress } from "viem";
import { z } from "zod";

const createAssetObject = <T extends string, U extends z.ZodObject<any>>(
  type: T,
  schema: U
) => {
  return z
    .object({
      type: z.literal(type),
      assets: z.array(
        bridgeChainSchema.and(bridgeSupportedAssetSchema).and(
          z.object({
            supportedVariants: z.record(
              z.string(),
              z.record(
                z.string().transform((v) => v as Bridge),
                z.array(
                  z
                    .string()
                    .transform(
                      (v) => v as BridgeSupportedAsset["transferTypes"][number]
                    )
                )
              )
            ),
          })
        )
      ),
    })
    .merge(schema);
};

export const localBridgeTransferRouter = createTRPCRouter({
  getSupportedAssetsBalances: publicProcedure
    .input(
      z.object({
        source: z.discriminatedUnion("type", [
          createAssetObject("evm", UserEvmAddressSchema),
          createAssetObject("cosmos", UserCosmosAddressSchema),
          createAssetObject("bitcoin", z.object({})),
          createAssetObject("solana", z.object({})),
          createAssetObject("tron", z.object({})),
          createAssetObject("penumbra", z.object({})),
        ]),
      })
    )
    .query(async ({ input, ctx }) => {
      if (input.source.type === "evm") {
        const evmAddress = input.source.userEvmAddress;
        return Promise.all(
          input.source.assets
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
                  0
                ),
                usdValue: new PricePretty(DEFAULT_VS_CURRENCY, 0),
              };

              if (!evmAddress) return emptyBalance;

              const balance = await getEvmBalance({
                address: getAddress(asset.address),
                userAddress: evmAddress,
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
      } else if (input.source.type === "cosmos") {
        const cosmosAddress = input.source.userCosmosAddress;
        if (!cosmosAddress) {
          return input.source.assets.map((asset) => ({
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
          }));
        }

        const assetsWithBalance = await Promise.all(
          input.source.assets
            .filter(
              (
                asset
              ): asset is Extract<typeof asset, { chainType: "cosmos" }> =>
                asset.chainType !== "evm"
            )
            .map(async (asset) => {
              let balance:
                | {
                    denom: string;
                    amount: string;
                  }
                | undefined = undefined;

              const isCW20Asset = asset.address.startsWith("cw20:");

              if (isCW20Asset) {
                const {
                  data: { balance: balanceString },
                } = await queryCosmWasmContractBalance({
                  ...ctx,
                  contractAddress: asset.address.split(":")[1],
                  userBech32Address: cosmosAddress,
                  chainId: asset.chainId,
                });

                balance = {
                  denom: asset.address,
                  amount: balanceString,
                };
              } else {
                const { balances } = await queryBalances({
                  ...ctx,
                  chainId: asset.chainId,
                  bech32Address: cosmosAddress,
                });

                balance = balances.find((a) => a.denom === asset.address);
              }

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
                amount: new CoinPretty(
                  {
                    coinDecimals: asset.decimals,
                    coinDenom: asset.denom,
                    coinMinimalDenom: asset.address,
                  },
                  balance.amount
                ),
                usdValue: new PricePretty(DEFAULT_VS_CURRENCY, usdValue ?? 0),
              };
            })
        );

        return assetsWithBalance;
      } else {
        // For Bitcoin, Tron, Penumbra or Solana, return 0 assets as it's not supported for now
        // TODO: add 2 more else statements and send balance queries to Bitcoin, Tron or Solana as needed

        return input.source.assets.map((asset) => ({
          ...asset,
          amount: new CoinPretty(
            {
              coinDecimals: asset.decimals,
              coinDenom: asset.denom,
              coinMinimalDenom: asset.address,
            },
            0
          ),
          usdValue: new PricePretty(DEFAULT_VS_CURRENCY, 0),
        }));
      }
    }),
});
