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
import { CoinPretty, Dec, DecUtils, PricePretty } from "@osmosis-labs/unit";
import { getAddress } from "viem";
import { z } from "zod";

/**
 * Normalizes an amount between different decimal precisions
 * Used primarily for cross-chain asset normalization when comparing or displaying values
 *
 * @param params - Normalization parameters
 * @param params.amount - The amount to normalize as a string
 * @param params.fromDecimals - Source decimal precision (e.g., asset.decimals)
 * @param params.toDecimals - Target decimal precision (e.g., representativeAsset.coinDecimals)
 * @returns Normalized amount as string, with decimal places adjusted and truncated
 *
 * @example
 * // Convert from 18 decimals to 6 decimals (e.g., ETH to USDC scale)
 * normalizeDecimals({
 *   amount: "1000000000000000000",
 *   fromDecimals: 18,
 *   toDecimals: 6
 * }) // Returns "1000000"
 *
 * @example
 * // Convert from 6 decimals to 18 decimals (e.g., USDC to ETH scale)
 * normalizeDecimals({
 *   amount: "1000000",
 *   fromDecimals: 6,
 *   toDecimals: 18
 * }) // Returns "1000000000000000000"
 */
function normalizeDecimals({
  amount,
  fromDecimals,
  toDecimals,
}: {
  amount: string;
  fromDecimals: number;
  toDecimals: number;
}): string {
  if (fromDecimals === toDecimals) {
    return amount;
  }

  const decAmount = new Dec(amount);
  const decimalDifference = fromDecimals - toDecimals;

  if (decimalDifference > 0) {
    // If source has more decimals, divide (multiply by negative exponent)
    return decAmount
      .mul(DecUtils.getTenExponentN(-decimalDifference))
      .truncate()
      .toString();
  } else {
    // If source has fewer decimals, multiply
    return decAmount
      .mul(DecUtils.getTenExponentN(Math.abs(decimalDifference)))
      .truncate()
      .toString();
  }
}

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
          createAssetObject("doge", z.object({})),
          createAssetObject("bitcoin-cash", z.object({})),
          createAssetObject("litecoin", z.object({})),
          createAssetObject("xrpl", z.object({})),
          createAssetObject("ton", z.object({})),
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

              // Normalize the amount if decimals differ between asset and representative asset
              let normalizedAmount = balance.amount;
              if (asset.decimals !== representativeAsset.coinDecimals) {
                normalizedAmount = normalizeDecimals({
                  amount: balance.amount,
                  fromDecimals: asset.decimals,
                  toDecimals: representativeAsset.coinDecimals,
                });
              }

              // is user asset, include user data
              const usdValue = await calcAssetValue({
                ...ctx,
                anyDenom: representativeAsset.coinMinimalDenom,
                amount: normalizedAmount,
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
