import type { Bridge, BridgeChain } from "@osmosis-labs/bridge";
import { MinimalAsset } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import { useMemo } from "react";

import { api } from "~/utils/trpc";

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
    return successfulQueries.flatMap(
      ({ data }) => data?.supportedAssets.assets ?? []
    );
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
