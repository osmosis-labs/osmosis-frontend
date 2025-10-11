import type {
  Bridge,
  BridgeChain,
  BridgeSupportedAsset,
} from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { api, RouterOutputs } from "~/utils/trpc";

const supportedAssetsBridges: Bridge[] = [
  "Skip",
  "Squid",
  "Axelar",
  "IBC",
  "Int3face",
  // include nomic, nitro, wormhole, and penumbra for suggesting BTC + SOL + TRX assets and chains
  // as external URL transfer options, even though they are not supported by the bridge providers natively yet.
  // Once bridging is natively supported, we can add these to the `useBridgeQuotes` provider list.
  "Nomic",
  "Wormhole",
  "Nitro",
  "Penumbra",
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
  direction,
}: {
  assets: MinimalAsset[] | undefined;
  chain: BridgeChain;
  direction: "deposit" | "withdraw";
}) => {
  const supportedAssetsResults = api.useQueries((t) =>
    supportedAssetsBridges
      /**
       * Disable Int3face for deposits
       * since we should not be using Int3face for deposits
       * as of https://osmosis-network.slack.com/archives/C0963S0DB4Z/p1758138969630079
       */
      .filter((bridge) => {
        if (direction === "withdraw") return true;

        return bridge !== "Int3face";
      })
      .flatMap((bridge) =>
        (assets ?? []).map((asset) =>
          t.bridgeTransfer.getSupportedAssetsByBridge(
            {
              bridge,
              asset: {
                address: asset.coinMinimalDenom,
                decimals: asset.coinDecimals,
                denom: asset.coinDenom,
              },
              direction,
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
    () => supportedAssetsResults.some((data) => isNil(data) || data.isLoading),
    [supportedAssetsResults]
  );

  /**
   * Aggregate supported assets from all successful queries.
   * This would be an object with chain id as key and an array of supported Osmosis variants as value.
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
   *         "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"], IBC: ["quote"] },
   *         "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C": { Skip: ["quote"], Axelar: ["quote"] },
   *         "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695": { Skip: ["quote"], Squid: ["quote"], Axelar: ["quote", "deposit-address"] },
   *         "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45": { Skip: ["quote"] }
   *       }
   *     }
   *   ]
   * }
   */
  const supportedAssetsByChainId = useMemo(() => {
    /**
     * Map of supported assets by asset address, chain, and variant. This is used to
     * merge the supported variants and providers for each input asset.
     */
    type Address = string;
    type ChainId = string;
    const assetAddress_chainId_supportedVariants_bridges: Record<
      Address,
      Record<
        ChainId,
        Record<
          Address,
          Partial<
            Record<Bridge, Set<BridgeSupportedAsset["transferTypes"][number]>>
          >
        >
      >
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

            if (!assetAddress_chainId_supportedVariants_bridges[address]) {
              assetAddress_chainId_supportedVariants_bridges[address] = {};
            }
            if (
              !assetAddress_chainId_supportedVariants_bridges[address][chainId]
            ) {
              assetAddress_chainId_supportedVariants_bridges[address][chainId] =
                {};
            }

            if (
              !assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ]
            ) {
              assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ] = {};
            }

            if (
              !assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ][data.supportedAssets.providerName]
            ) {
              assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ][data.supportedAssets.providerName] = new Set();
            }

            asset.transferTypes.forEach((type) => {
              assetAddress_chainId_supportedVariants_bridges[address][chainId][
                inputAssetAddress
              ][data.supportedAssets.providerName]!.add(type);
            });
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
          .filter(
            // Remove Duplicates
            (asset, index, originalArray) =>
              index ===
              originalArray.findIndex(
                // Use toLowerCase since some providers return addresses in different cases. E.g. Skip and Squid
                (t) => t.address.toLowerCase() === asset.address.toLowerCase()
              )
          )
          .map(({ providerName, ...asset }) => ({
            ...asset,
            supportedVariants: Object.fromEntries(
              Object.entries(
                assetAddress_chainId_supportedVariants_bridges[
                  asset.address.toLowerCase()
                ][chainId]
              ).map(([variant, bridgesByTransferType]) => {
                const formattedBridgesByTransferType = Object.fromEntries(
                  Object.entries(bridgesByTransferType).map(
                    ([bridge, transferTypes]) => [
                      bridge,
                      Array.from(transferTypes),
                    ]
                  )
                );

                return [variant, formattedBridgesByTransferType];
              })
            ),
          })),
      ]
    );

    return Object.fromEntries(assetEntriesByChainId) as Record<
      keyof AssetsByChainId,
      Omit<
        AssetsByChainId[string][number] & {
          supportedVariants: Record<
            string,
            Partial<Record<Bridge, BridgeSupportedAsset["transferTypes"]>>
          >;
        },
        "providerName"
      >[]
    >;
  }, [successfulQueries]);

  const supportedChains = useMemo(() => {
    // Check if this is a USDC withdrawal to prioritize Noble
    const isUsdcWithdrawal =
      direction === "withdraw" &&
      assets?.some(
        (asset) =>
          asset.coinDenom?.toUpperCase().includes("USDC") ||
          asset.coinGeckoId === "usd-coin"
      );

    // Check if this is a USDC deposit to prioritize Noble
    const isUsdcDeposit =
      direction === "deposit" &&
      assets?.some(
        (asset) =>
          asset.coinDenom?.toUpperCase().includes("USDC") ||
          asset.coinGeckoId === "usd-coin"
      );

    // Check if this is a XRP withdrawal to prioritize XRPL EVM
    const isXrpWithdrawal =
      direction === "withdraw" &&
      assets?.some(
        (asset) =>
          asset.coinDenom?.toUpperCase().includes("XRP") ||
          asset.coinGeckoId === "ripple"
      );

    // Check if this is a XRP deposit to prioritize XRPL EVM
    const isXrpDeposit =
      direction === "deposit" &&
      assets?.some(
        (asset) =>
          asset.coinDenom?.toUpperCase().includes("XRP") ||
          asset.coinGeckoId === "ripple"
      );

    // Check if this is an ATOM withdrawal to prioritize Cosmos Hub
    const isAtomWithdrawal =
      direction === "withdraw" &&
      assets?.some(
        (asset) =>
          asset.coinDenom?.toUpperCase().includes("ATOM") ||
          asset.coinGeckoId === "cosmos"
      );

    return Array.from(
      // Remove duplicate chains
      new Map(
        successfulQueries
          .flatMap(({ data }) => data!.supportedAssets.availableChains)
          .sort((a, b) => {
            // For USDC withdrawals, prioritize Noble first
            if (isUsdcWithdrawal) {
              if (a.chainId === "noble-1" && b.chainId !== "noble-1") return -1;
              if (a.chainId !== "noble-1" && b.chainId === "noble-1") return 1;
            }

            // For USDC deposits, prioritize Noble first
            if (isUsdcDeposit) {
              if (a.chainId === "noble-1" && b.chainId !== "noble-1") return -1;
              if (a.chainId !== "noble-1" && b.chainId === "noble-1") return 1;
            }

            // For XRP withdrawals, prioritize XPRL EVM first
            if (isXrpWithdrawal) {
              if (
                a.chainId === "xrplevm_1440000-1" &&
                b.chainId !== "xrplevm_1440000-1"
              )
                return -1;
              if (
                a.chainId !== "xrplevm_1440000-1" &&
                b.chainId === "xrplevm_1440000-1"
              )
                return 1;
            }

            // For XRP deposits, prioritize XPRL EVM first
            if (isXrpDeposit) {
              if (
                a.chainId === "xrplevm_1440000-1" &&
                b.chainId !== "xrplevm_1440000-1"
              )
                return -1;
              if (
                a.chainId !== "xrplevm_1440000-1" &&
                b.chainId === "xrplevm_1440000-1"
              )
                return 1;
            }

            // For ATOM withdrawals, prioritize Cosmos Hub first
            if (isAtomWithdrawal) {
              if (a.chainId === "cosmoshub-4" && b.chainId !== "cosmoshub-4")
                return -1;
              if (a.chainId !== "cosmoshub-4" && b.chainId === "cosmoshub-4")
                return 1;
            }

            // prioritize bitcoin and doge chains first, then evm
            if (a.chainType === "bitcoin" && b.chainType !== "bitcoin")
              return -1;
            if (a.chainType === "doge" && b.chainType !== "doge") return -1;
            if (
              a.chainType === "evm" &&
              b.chainType !== "evm" &&
              b.chainType !== "bitcoin"
            )
              return -1;
            if (
              a.chainType === "solana" &&
              b.chainType !== "solana" &&
              b.chainType !== "evm" &&
              b.chainType !== "bitcoin"
            )
              return -1;
            return 0;
          })
          .map((chain) => [chain.chainId, chain])
      ).values()
    );
  }, [successfulQueries, direction, assets]);

  return { supportedAssetsByChainId, supportedChains, isLoading };
};
