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

export function getChainStakeTokenSourceDenom({
  chainId,
  chainList,
}: {
  chainId: string;
  chainList: ChainType[];
}): string | undefined {
  const chain = getChain({ chainId, chainList });

  if (!chain) {
    console.info(`Chain ${chainId} not found`);
    return undefined;
  }

  return chain.staking.staking_tokens[0].denom;
}
