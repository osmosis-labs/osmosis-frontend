import { useMemo } from "react";

import { api } from "~/utils/trpc";

/** Gets display data for multiple types of chains */
export function useChainDisplayInfo(chainId: string | number | undefined) {
  const cosmosChainEnabled = typeof chainId === "string";
  const { data: cosmosChain, isLoading: isLoadingCosmosChain_ } =
    api.edge.chains.getChain.useQuery(
      {
        findChainNameOrId: chainId?.toString() ?? "",
      },
      {
        enabled: cosmosChainEnabled,
      }
    );
  const isLoadingCosmosChain = isLoadingCosmosChain_ && cosmosChainEnabled;

  const evmChainEnabled = typeof chainId === "number";
  const { data: evmChain, isLoading: isLoadingEvmChain_ } =
    api.edge.chains.getEvmChain.useQuery(
      {
        chainId: Number(chainId),
      },
      {
        enabled: evmChainEnabled,
      }
    );
  const isLoadingEvmChain = isLoadingEvmChain_ && evmChainEnabled;

  return useMemo(
    () => ({
      prettyName: cosmosChain?.pretty_name ?? evmChain?.name,
      isLoading: isLoadingCosmosChain || isLoadingEvmChain,
    }),
    [cosmosChain, evmChain, isLoadingCosmosChain, isLoadingEvmChain]
  );
}
