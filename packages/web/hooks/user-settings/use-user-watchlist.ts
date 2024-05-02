import { useCallback } from "react";
import { useLocalStorage } from "react-use";

/** List of user's watched tokens, by symbol. */
export function useUserWatchlist() {
  const [watchListSymbols = [], setWatchlistSymbols] = useLocalStorage(
    "favoritesList",
    ["OSMO", "ATOM", "TIA"]
  );

  const onWatchAssetSymbol = useCallback(
    (denom: string) => {
      if (watchListSymbols.includes(denom)) return;
      setWatchlistSymbols([...watchListSymbols, denom]);
    },
    [watchListSymbols, setWatchlistSymbols]
  );

  const onUnwatchAssetSymbol = useCallback(
    (denom: string) => {
      if (!watchListSymbols.includes(denom)) return;
      setWatchlistSymbols(watchListSymbols.filter((d) => d !== denom));
    },
    [watchListSymbols, setWatchlistSymbols]
  );

  const toggleWatchAssetSymbol = useCallback(
    (denom: string) => {
      if (watchListSymbols.includes(denom)) {
        onUnwatchAssetSymbol(denom);
      } else {
        onWatchAssetSymbol(denom);
      }
    },
    [watchListSymbols, onUnwatchAssetSymbol, onWatchAssetSymbol]
  );

  return {
    watchListSymbols,
    onWatchAssetSymbol,
    onUnwatchAssetSymbol,
    toggleWatchAssetSymbol,
    setWatchlistSymbols,
  };
}
