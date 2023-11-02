import { ChainList } from "~/config";

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

  return ChainList.find((chain) => {
    return (
      destinationAddress?.startsWith(chain.bech32_config.bech32PrefixAccAddr) ||
      chain.chain_id === chainId
    );
  });
}
