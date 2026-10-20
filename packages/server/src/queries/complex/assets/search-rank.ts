import type { MinimalAsset } from "@osmosis-labs/types";
import { compareCommon } from "@osmosis-labs/utils";

import { captureErrorAndReturn } from "../../../utils/error";
import type { Search } from "../../../utils/search";
import { getAssetMarketActivity } from "./market";

/** Shortest query that promotes an exact symbol match above prefix matches.
 *  Below this, one-letter symbols (e.g. "A", "W") would take the top slot of
 *  every single-character search regardless of activity. */
const MIN_EXACT_MATCH_QUERY_LENGTH = 2;

/** Orders asset search results so every asset search box ranks the same way:
 *  1. Exact symbol match (case-insensitive), for queries of 2+ characters.
 *  2. Symbol starts with the query.
 *  3. Everything else the fuzzy search matched.
 *  Within each tier, watchlisted assets come first, then 24h volume descending.
 *
 *  The sort is stable, so ties keep the incoming fuzzy-match order. Volume is
 *  read from the cached market activity map, so this adds no new requests.
 *  Watchlist entries are symbols (`coinDenom`), matching how the client stores them. */
export async function sortAssetSearchResults<TAsset extends MinimalAsset>(
  assets: TAsset[],
  {
    search,
    watchListDenoms = [],
  }: {
    search: Search;
    watchListDenoms?: string[];
  }
): Promise<TAsset[]> {
  const query = search.query.trim().toUpperCase();

  const getMatchTier = (symbol: string) => {
    if (query.length >= MIN_EXACT_MATCH_QUERY_LENGTH && symbol === query)
      return 0;
    if (symbol.startsWith(query)) return 1;
    return 2;
  };

  const ranked = await Promise.all(
    assets.map(async (asset) => ({
      asset,
      matchTier: getMatchTier(asset.coinDenom.toUpperCase()),
      isWatched: watchListDenoms.includes(asset.coinDenom),
      volume24h: (
        await getAssetMarketActivity(asset).catch((e) =>
          captureErrorAndReturn(e, undefined)
        )
      )?.volume24h,
    }))
  );

  return ranked
    .sort((a, b) => {
      if (a.matchTier !== b.matchTier) return a.matchTier - b.matchTier;
      if (a.isWatched !== b.isWatched) return a.isWatched ? -1 : 1;
      return compareCommon(a.volume24h, b.volume24h);
    })
    .map(({ asset }) => asset);
}
