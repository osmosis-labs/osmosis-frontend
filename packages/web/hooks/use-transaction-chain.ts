import { BridgeChain } from "@osmosis-labs/bridge";
import { BitcoinChainInfo, DogecoinChainInfo } from "@osmosis-labs/utils";

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

  const { chainPrettyName, chainLogoUri, chainColor } = (() => {
    if (chain?.chainType === "cosmos") {
      return {
        chainPrettyName: cosmosChain?.prettyName,
        chainLogoUri:
          cosmosChain?.logo_URIs?.png ?? cosmosChain?.logo_URIs?.svg,
        // chainColor: cosmosChain?.logo_URIs?.theme?.primary_color_hex,
      };
    } else if (chain?.chainType === "evm") {
      return {
        chainPrettyName: evmChain?.name,
        chainLogoUri: evmChain?.relativeLogoUrl,
        chainColor: evmChain?.color,
      };
    } else if (chain?.chainType === "bitcoin") {
      return {
        chainPrettyName: BitcoinChainInfo.prettyName,
        chainLogoUri: BitcoinChainInfo.logoUri,
        chainColor: BitcoinChainInfo.color,
      };
    } else if (chain?.chainType === "doge") {
      return {
        chainPrettyName: DogecoinChainInfo.prettyName,
        chainLogoUri: DogecoinChainInfo.logoUri,
        chainColor: DogecoinChainInfo.color,
      };
    }
    return {
      chainPrettyName: undefined,
      chainLogoUri: undefined,
      chainColor: undefined,
    };
  })();

  return { chainPrettyName, chainLogoUri, chainColor, cosmosChain, evmChain };
};
