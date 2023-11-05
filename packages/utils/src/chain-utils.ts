import type { Chain as ChainType } from "@osmosis-labs/types";

export function getChain<Chain extends ChainType>({
  chainId,
  destinationAddress,
  chainList,
}: {
  chainId?: string;
  destinationAddress?: string;
  chainList: Chain[];
}): Chain | undefined {
  if (!chainId && !destinationAddress) {
    throw new Error("Missing chainId or destinationAddress");
  }

  return chainList.find((chain) => {
    return (
      destinationAddress?.startsWith(chain.bech32_config.bech32PrefixAccAddr) ||
      chain.chain_id === chainId
    );
  });
}
