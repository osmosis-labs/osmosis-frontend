import type { Asset } from "@osmosis-labs/types";

import type { CompactAssetList } from "./compact-asset-list";
import { decodeAssetList } from "./compact-asset-list";

export interface ResponseAssetList {
  chainName: string;
  assets: Asset[];
}

/** Keep every request at the same revision, including historical fallback. */
export async function loadBuildAssetList({
  chainId,
  commitHash,
  queryFile,
  isNotFound,
}: {
  chainId: string;
  commitHash: string;
  queryFile: (filePath: string, commitHash: string) => Promise<unknown>;
  isNotFound: (error: unknown) => boolean;
}): Promise<ResponseAssetList> {
  const prefix = `${chainId}/generated/frontend`;
  let data: unknown;
  try {
    data = await queryFile(`${prefix}/assetlist.compact.json`, commitHash);
  } catch (error) {
    // Only missing artifacts permit fallback, never rate limits or outages.
    if (!isNotFound(error)) throw error;
    console.warn(
      `Compact list absent at ${commitHash}; using legacy ${chainId} list`
    );
    return (await queryFile(
      `${prefix}/assetlist.json`,
      commitHash
    )) as ResponseAssetList;
  }
  // Decode outside the catch: corrupt formats can never trigger fallback.
  return decodeAssetList(data as CompactAssetList);
}
