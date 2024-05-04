import { useCallback } from "react";
import { useLocalStorage } from "react-use";

/** List of user's watched tokens, by symbol. */
export function useUserWatchlist() {
  const [watchListDenoms = [], setWatchlistDenoms] = useLocalStorage(
    "favoritesList",
    ["OSMO", "ATOM", "TIA"]
  );

  const onWatchAssetDenom = useCallback(
    (denom: string) => {
      if (watchListDenoms.includes(denom)) return;
      setWatchlistDenoms([...watchListDenoms, denom]);
    },
    [watchListDenoms, setWatchlistDenoms]
  );

  const onUnwatchAssetDenom = useCallback(
    (denom: string) => {
      if (!watchListDenoms.includes(denom)) return;
      setWatchlistDenoms(watchListDenoms.filter((d) => d !== denom));
    },
    [watchListDenoms, setWatchlistDenoms]
  );

  const toggleWatchAssetDenom = useCallback(
    (denom: string) => {
      if (watchListDenoms.includes(denom)) {
        onUnwatchAssetDenom(denom);
      } else {
        onWatchAssetDenom(denom);
      }
    },
    [watchListDenoms, onUnwatchAssetDenom, onWatchAssetDenom]
  );

  return {
    watchListDenoms,
    onWatchAssetDenom,
    onUnwatchAssetDenom,
    toggleWatchAssetDenom,
    setWatchlistDenoms,
  };
}
