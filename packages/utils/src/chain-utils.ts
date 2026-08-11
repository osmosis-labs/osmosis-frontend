import type { Chain as ChainType } from "@osmosis-labs/types";

export function getChain<Chain extends ChainType>({
  chainId,
  chainName,
  destinationAddress,
  chainList,
}: {
  chainId?: string;
  chainName?: string;
  /**
   * WARNING: bech32 prefixes are not unique. Two chains can share one (Terra
   * Classic and Terra 2 are both `terra`), so an address alone cannot always
   * identify a chain. Prefer passing `chainId` where the caller knows it.
   */
  destinationAddress?: string;
  chainList: Chain[];
}): Chain | undefined {
  if (!chainId && !destinationAddress && !chainName) {
    throw new Error("Missing chainId, chainName or destinationAddress");
  }

  // An explicit identifier is unambiguous, so it always wins over the
  // address-derived match below.
  const byIdentifier = chainList.find(
    (chain) => chain.chain_id === chainId || chain.chain_name === chainName
  );
  if (byIdentifier) return byIdentifier;

  if (!destinationAddress) return undefined;

  /**
   * Match on the longest prefix rather than the first in list order. Several
   * prefixes are prefixes of another (`n` for Nyx against `nibi`, `neutron`,
   * `noble`, `nolus`; `bb` against `bbn`; `st` against `stride`), so a
   * first-match-wins scan resolves e.g. a `nibi1...` address to Nyx purely
   * because it appears earlier in the list.
   */
  let match: Chain | undefined;
  let matchedPrefixLength = -1;
  for (const chain of chainList) {
    const prefix = chain.bech32Config.bech32PrefixAccAddr;
    if (
      destinationAddress.startsWith(prefix) &&
      prefix.length > matchedPrefixLength
    ) {
      match = chain;
      matchedPrefixLength = prefix.length;
    }
  }

  return match;
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
    return;
  }

  if (!chain.stakeCurrency) {
    console.error("This chain does not have staking info:", chainId);
    return;
  }

  return chain.stakeCurrency.coinMinimalDenom;
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
