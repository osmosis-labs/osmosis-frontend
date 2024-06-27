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

export class ChainIdHelper {
  // VersionFormatRegExp checks if a chainID is in the format required for parsing versions
  // The chainID should be in the form: `{identifier}-{version}`
  static readonly VersionFormatRegExp = /(.+)-([\d]+)/;

  static parse(chainId: string): {
    identifier: string;
    version: number;
  } {
    const split = chainId
      .split(ChainIdHelper.VersionFormatRegExp)
      .filter(Boolean);
    if (split.length !== 2) {
      return {
        identifier: chainId,
        version: 0,
      };
    } else {
      return { identifier: split[0], version: parseInt(split[1]) };
    }
  }

  static hasChainVersion(chainId: string): boolean {
    const version = ChainIdHelper.parse(chainId);
    return version.identifier !== chainId;
  }
}
