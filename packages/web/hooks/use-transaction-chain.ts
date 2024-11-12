import { BridgeChain } from "@osmosis-labs/bridge";

import { api } from "~/utils/trpc";

export const useTransactionChain = ({ chain }: { chain: BridgeChain }) => {
  const { data: cosmosChain } = api.edge.chains.getCosmosChain.useQuery(
    {
      findChainNameOrId: chain!.chainId.toString(),
    },
    {
      enabled: chain?.chainType === "cosmos",
      useErrorBoundary: false,
    }
  );
  const { data: evmChain } = api.edge.chains.getEvmChain.useQuery(
    {
      chainId: Number(chain!.chainId),
    },
    {
      enabled: chain?.chainType === "evm",
      useErrorBoundary: false,
    }
  );

  const chainPrettyName =
    chain?.chainType === "cosmos" ? cosmosChain?.pretty_name : evmChain?.name;
  const chainLogoUri =
    chain?.chainType === "cosmos"
      ? cosmosChain?.logoURIs?.png ?? cosmosChain?.logoURIs?.svg
      : evmChain?.relativeLogoUrl;
  const chainColor =
    chain?.chainType === "cosmos"
      ? cosmosChain?.logoURIs?.theme?.primary_color_hex
      : evmChain?.color;

  return { chainPrettyName, chainLogoUri, chainColor, cosmosChain, evmChain };
};
