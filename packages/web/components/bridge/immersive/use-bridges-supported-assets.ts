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
              sourceDenom: asset.sourceDenom,
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

  const supportedAssets = useMemo(() => {
    return successfulQueries.reduce((acc, { data }) => {
      if (!data) return acc;

      // Merge all assets from providers by chain id
      Object.entries(data.supportedAssets.assets).forEach(([key, value]) => {
        if (acc[key]) {
          acc[key] = acc[key].concat(value);
        } else {
          acc[key] = value;
        }
      });

      // Remove duplicates
      Object.keys(acc).forEach((key) => {
        if (Array.isArray(acc[key])) {
          acc[key] = acc[key].filter(
            (value, index, self) =>
              index === self.findIndex((t) => t.address === value.address)
          );
        }
      });

      return acc;
    }, {} as RouterOutputs["bridgeTransfer"]["getSupportedAssetsByBridge"]["supportedAssets"]["assets"]);
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

  return { supportedAssets, supportedChains };
};
