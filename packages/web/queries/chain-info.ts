import { ChainInfos } from "~/config";

export function getChain({
  chainId,
  destinationAddress,
}: {
  chainId?: string;
  destinationAddress?: string;
}) {
  if (!chainId && !destinationAddress) {
    throw new Error("Missing chainId or destinationAddress");
  }

  return ChainInfos.find((chain) => {
    return (
      destinationAddress?.startsWith(chain.bech32Config.bech32PrefixAccAddr) ||
      chain.chainId === chainId
    );
  });
}
