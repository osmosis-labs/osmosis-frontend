import type { Chain as ChainType } from "@osmosis-labs/types";

export function getChain<Chain extends ChainType>({
  chainId,
  chainName,
  destinationAddress,
  chainList,
}: {
  chainId?: string;
  chainName?: string;
  destinationAddress?: string;
  chainList: Chain[];
}): Chain | undefined {
  if (!chainId && !destinationAddress && !chainName) {
    throw new Error("Missing chainId, chainName or destinationAddress");
  }

  return chainList.find((chain) => {
    return (
      destinationAddress?.startsWith(chain.bech32_config.bech32PrefixAccAddr) ||
      chain.chain_id === chainId ||
      chain.chain_name === chainName
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

export function getChainRestUrl({
  chainId,
  chainList,
}: {
  chainId: string;
  chainList: ChainType[];
}): string {
  const chain = getChain({ chainId, chainList });

  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }

  return chain.apis.rest[0].address;
}
