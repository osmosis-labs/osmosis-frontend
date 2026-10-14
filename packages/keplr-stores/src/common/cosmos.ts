// Adapted from @keplr-wallet/cosmos@0.10.24 (Apache-2.0).

export class ChainIdHelper {
  /** Matches chain IDs of the form `{identifier}-{version}`, e.g. `osmosis-1`. */
  static readonly VersionFormatRegExp = /(.+)-([\d]+)/;

  static parse(chainId: string): { identifier: string; version: number } {
    const split = chainId
      .split(ChainIdHelper.VersionFormatRegExp)
      .filter(Boolean);
    if (split.length !== 2) {
      return { identifier: chainId, version: 0 };
    }
    return { identifier: split[0], version: parseInt(split[1]) };
  }

  static hasChainVersion(chainId: string): boolean {
    return ChainIdHelper.parse(chainId).identifier !== chainId;
  }
}

export { BaseAccount } from "@osmosis-labs/utils";
