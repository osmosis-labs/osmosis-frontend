import { Chain } from "@osmosis-labs/types";
import { z } from "zod";

import { search, SearchSchema } from "../../../utils/search";

export const ChainFilterSchema = z.object({
  search: SearchSchema.optional(),
});
/** Params for filtering chains. */
export type ChainFilter = z.input<typeof ChainFilterSchema>;

/** Get an individual chain explicitly by its chain_id.
 *  @throws If chain not found. */
export function getChain({
  chainList,
  chainNameOrId,
}: {
  chainList: Chain[];
  chainNameOrId: string;
}): Chain {
  const chains = getChains({
    chainList,
    findChainNameOrId: chainNameOrId,
  });
  const chain = chains[0];
  if (!chain) throw new Error(chainNameOrId + " not found in chain list");
  return chain;
}

/** Returns minimal chain information for chains in chain list.
 *  Search was added to this function since members of the chain list type are searched before mapped
 *  into minimal chains. See `searchableChainListKeys` for the keys that are searched.
 *
 *  Please avoid changing this function unless absolutely necessary.
 *  Instead, compose this function with other functions to get the data you need.
 *  The goal is to keep this function simple and lightweight. */
export function getChains({
  chainList,
  ...params
}: {
  chainList: Chain[];
  /** Explicitly match the chain_id. */
  findChainNameOrId?: string;
} & ChainFilter): Chain[] {
  return filterChainList({ chainList, ...params });
}

/** Transform given chain list into an array of minimal chain types for user in frontend and apply given filters. */
function filterChainList({
  chainList,
  findChainNameOrId,
  search: searchParam,
}: {
  chainList: Chain[];
  findChainNameOrId?: string;
} & ChainFilter): Chain[] {
  // Create new array with just chains
  const chainIdSet = new Set<string>();

  let chainListChains = chainList.filter((chain) => {
    if (findChainNameOrId) {
      return (
        findChainNameOrId.toUpperCase() === chain.chain_id.toUpperCase() ||
        findChainNameOrId.toUpperCase() === chain.chain_name.toUpperCase()
      );
    }

    // Ensure chain_ids are unique
    if (chainIdSet.has(chain.chain_id)) {
      return false;
    } else {
      chainIdSet.add(chain.chain_id);
      return true;
    }
  });

  // Search raw chain list before reducing type to minimal Chain type
  if (searchParam && !findChainNameOrId) {
    // search for exact match for chain_id first
    const chainIdMatches = search(
      chainListChains,
      ["chain_id"] as (keyof Chain)[],
      searchParam,
      0.0 // Exact match
    );

    // if not exact match for chain_id, search by chain_name or pretty_name
    if (chainIdMatches.length > 0) {
      chainListChains = chainIdMatches;
    } else {
      const nameMatches = search(
        chainListChains,
        /** Search is performed on the raw chain list data, instead of `Chain` type. */
        ["chain_name", "pretty_name"] as (keyof Chain)[],
        searchParam
      );
      chainListChains = nameMatches;
    }
  }

  return chainListChains;
}
