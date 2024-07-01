import type { Bridge, BridgeChain } from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { api, RouterOutputs } from "~/utils/trpc";

const bridgeKeys: Bridge[] = ["Skip", "Squid", "Axelar", "IBC"];

export const useBridgesSupportedAssets = ({
  assets,
  chain,
}: {
  assets: MinimalAsset[] | undefined;
  chain: BridgeChain;
}) => {
  const supportedAssetsResults = api.useQueries((t) =>
    bridgeKeys.flatMap((bridge) =>
      (assets ?? []).map((asset) =>
        t.bridgeTransfer.getSupportedAssetsByBridge(
          {
            bridge,
            asset: {
              address: asset.coinMinimalDenom,
              decimals: asset.coinDecimals,
              denom: asset.coinDenom,
            },
            chain,
          },
          {
            enabled: !isNil(assets),
            staleTime: 30_000,
            cacheTime: 30_000,
            // Disable retries, as useQueries
            // will block successful queries from being returned
            // if failed queries are being returned
            // until retry starts returning false.
            // This causes slow UX even though there's a
            // query that the user can use.
            retry: false,

            // prevent batching so that fast routers can
            // return requests faster than the slowest router
            trpc: {
              context: {
                skipBatch: true,
              },
            },
          }
        )
      )
    )
  );

  const successfulQueries = useMemo(
    () =>
      supportedAssetsResults.filter(
        (data): data is NonNullable<Required<typeof data>> =>
          !isNil(data) && data?.isSuccess
      ),
    [supportedAssetsResults]
  );

  /**
   * Aggregate supported assets from all successful queries.
   * This would be an object with chain id as key and an array of supported assets as value.
   *
   * Example:
   * {
   *   1: [
   *     {
   *       "chainId": 1,
   *       "chainType": "evm",
   *       "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
   *       "denom": "USDC",
   *       "decimals": 6,
   *       "sourceDenom": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
   *       "supportedVariants": [
   *         "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
   *         "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
   *         "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
   *         "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
   *         "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
   *         "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
   *         "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45"
   *       ],
   *       "supportedProviders": [
   *         "Skip",
   *         "Squid",
   *         "Axelar"
   *       ]
   *     }
   *   ]
   * }
   */
  const supportedAssetsByChainId = useMemo(() => {
    /**
     * Map of supported assets by asset address. This is used to
     * merge the supported variants for each input asset.
     */
    const assetAddress_supportedVariants: Record<string, Set<string>> = {};

    /**
     * Map of supported assets by asset address. This is used to
     * merge the supported providers for each input asset.
     */
    const assetAddress_supportedProviders: Record<string, Set<Bridge>> = {};

    type AssetsByChainId =
      RouterOutputs["bridgeTransfer"]["getSupportedAssetsByBridge"]["supportedAssets"]["assetsByChainId"];

    const allAssetsByChainId = successfulQueries.reduce((acc, { data }) => {
      if (!data) return acc;

      // Merge all assets from providers by chain id
      Object.entries(data.supportedAssets.assetsByChainId).forEach(
        ([chainId, assets]) => {
          assets.forEach((asset) => {
            const { address: rawAddress } = asset;
            // Use toLowerCase since some providers return addresses in different cases. E.g. Skip and Squid
            const address = rawAddress.toLowerCase();

            if (!assetAddress_supportedVariants[address]) {
              assetAddress_supportedVariants[address] = new Set();
            }
            if (!assetAddress_supportedProviders[address]) {
              assetAddress_supportedProviders[address] = new Set<Bridge>();
            }
            assetAddress_supportedVariants[address].add(
              data.supportedAssets.inputAssetAddress
            );
            assetAddress_supportedProviders[address].add(
              data.supportedAssets.providerName
            );
          });

          acc[chainId] = acc[chainId] ? [...acc[chainId], ...assets] : assets;
        }
      );

      return acc;
    }, {} as AssetsByChainId);

    const assetEntriesByChainId = Object.entries(allAssetsByChainId).map(
      ([chainId, assets]) => [
        chainId,
        assets
          .map(({ providerName, ...asset }) => ({
            ...asset,
            supportedVariants: Array.from(
              assetAddress_supportedVariants[asset.address.toLowerCase()]
            ),
            supportedProviders: Array.from(
              assetAddress_supportedProviders[asset.address.toLowerCase()]
            ),
          }))

          .filter(
            (asset, index, originalArray) =>
              // Make sure the asset has at least one supported variant
              asset.supportedVariants.length > 0 &&
              // Make sure the asset has at least one supported provider
              asset.supportedProviders.length > 0 &&
              // Remove Duplicates
              index ===
                // Use toLowerCase since some providers return addresses in different cases. E.g. Skip and Squid
                originalArray.findIndex(
                  (t) => t.address.toLowerCase() === asset.address.toLowerCase()
                )
          ),
      ]
    );

    return Object.fromEntries(assetEntriesByChainId) as Record<
      keyof AssetsByChainId,
      Omit<
        AssetsByChainId[string][number] & {
          supportedVariants: string[];
          supportedProviders: Bridge[];
        },
        "providerName"
      >[]
    >;
  }, [successfulQueries]);

  const supportedChains = useMemo(() => {
    return Array.from(
      // Remove duplicate chains
      new Map(
        successfulQueries
          .flatMap(({ data }) => data!.supportedAssets.availableChains)
          .map(({ chainId, chainType, prettyName }) => [
            chainId,
            { chainId, chainType, prettyName },
          ])
      ).values()
    );
  }, [successfulQueries]);

  return { supportedAssetsByChainId, supportedChains };
};
