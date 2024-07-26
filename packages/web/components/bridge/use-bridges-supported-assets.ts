import type { Bridge, BridgeChain } from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { api, RouterOutputs } from "~/utils/trpc";

const supportedAssetsBridges: Bridge[] = [
  "Skip",
  "Squid",
  "Axelar",
  "IBC",
  // include nomic and wormhole for suggesting BTC + SOL assets and chains
  // as external URL transfer options, even though they are not supported by the bridge providers natively yet.
  // Once bridging is natively supported, we can add these to the `useBridgeQuotes` provider list.
  "Nomic",
  "Wormhole",
];

export type SupportedAsset = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedAssetsByChainId"][string][number];

export type SupportedChain = ReturnType<
  typeof useBridgesSupportedAssets
>["supportedChains"][number];

export const useBridgesSupportedAssets = ({
  assets,
  chain,
}: {
  assets: MinimalAsset[] | undefined;
  chain: BridgeChain;
}) => {
  const supportedAssetsResults = api.useQueries((t) =>
    supportedAssetsBridges.flatMap((bridge) =>
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
          }
        )
      )
    )
  );

  const successfulQueries = useMemo(
    () =>
      supportedAssetsResults.filter(
        (data): data is NonNullable<Required<typeof data>> =>
          !isNil(data) && data.isSuccess
      ),
    [supportedAssetsResults]
  );

  const isLoading = useMemo(
    () =>
      supportedAssetsResults.some(
        (data): data is NonNullable<Required<typeof data>> =>
          !isNil(data) && data.isLoading
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
   *       "supportedVariants": {
   *         "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4": ["Skip", "Squid", "Axelar"],
   *         "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858": ["Skip", "Squid", "Axelar"],
   *         "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A": ["Skip", "Squid", "Axelar"],
   *         "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C": ["Skip", "Axelar"],
   *         "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E": ["Skip", "Squid", "Axelar"],
   *         "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695": ["Skip", "Squid", "Axelar"],
   *         "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45": ["Skip"]
   *       }
   *     }
   *   ]
   * }
   */
  const supportedAssetsByChainId = useMemo(() => {
    /**
     * Map of supported assets by asset address and variant. This is used to
     * merge the supported variants and providers for each input asset.
     */
    const assetAddress_supportedVariants_bridges: Record<
      string,
      Record<string, Set<Bridge>>
    > = {};

    type AssetsByChainId =
      RouterOutputs["bridgeTransfer"]["getSupportedAssetsByBridge"]["supportedAssets"]["assetsByChainId"];

    /** Assets aggregated by chain across all provider returned chain assets. */
    const allAssetsByChainId = successfulQueries.reduce((acc, { data }) => {
      if (!data) return acc;

      // Merge all assets from providers by chain id
      Object.entries(data.supportedAssets.assetsByChainId).forEach(
        ([chainId, assets]) => {
          assets.forEach((asset) => {
            const { address: rawAddress } = asset;
            // Use toLowerCase since some providers return addresses in different cases. E.g. Skip and Squid
            const address = rawAddress.toLowerCase();

            const inputAssetAddress = data.supportedAssets.inputAssetAddress;

            if (!assetAddress_supportedVariants_bridges[address]) {
              assetAddress_supportedVariants_bridges[address] = {};
            }

            if (
              !assetAddress_supportedVariants_bridges[address][
                inputAssetAddress
              ]
            ) {
              assetAddress_supportedVariants_bridges[address][
                inputAssetAddress
              ] = new Set<Bridge>();
            }

            assetAddress_supportedVariants_bridges[address][
              inputAssetAddress
            ].add(data.supportedAssets.providerName);
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
            supportedVariants: Object.fromEntries(
              Object.entries(
                assetAddress_supportedVariants_bridges[
                  asset.address.toLowerCase()
                ]
              ).map(([variant, bridges]) => [variant, Array.from(bridges)])
            ),
          }))

          .filter(
            (asset, index, originalArray) =>
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
          supportedVariants: Record<string, Bridge[]>;
        },
        "providerName"
      >[]
    >;
  }, [successfulQueries, isLoading]);

  const supportedChains = useMemo(() => {
    return Array.from(
      // Remove duplicate chains
      new Map(
        successfulQueries
          .flatMap(({ data }) => data!.supportedAssets.availableChains)
          .sort((a, b) => {
            // focus on evm chains to be picked first
            if (a.chainType === "evm" && b.chainType !== "evm") return -1;
            return 0;
          })
          .map((chain) => [chain.chainId, chain])
      ).values()
    );
  }, [successfulQueries]);

  return { supportedAssetsByChainId, supportedChains, isLoading };
};
