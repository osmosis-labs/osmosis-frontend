import { useCallback } from "react";

import { useLocalStorageState } from "../window/use-localstorage-state";

export function useUserFavoriteAssetDenoms() {
  const [favoritesList, setFavoritesList] = useLocalStorageState(
    "favoritesList",
    ["OSMO", "ATOM", "TIA"]
  );

  const onAddFavoriteDenom = useCallback(
    (denom: string) => {
      if (favoritesList.includes(denom)) return;
      setFavoritesList([...favoritesList, denom]);
    },
    [favoritesList, setFavoritesList]
  );

  const onRemoveFavoriteDenom = useCallback(
    (denom: string) => {
      if (!favoritesList.includes(denom)) return;
      setFavoritesList(favoritesList.filter((d) => d !== denom));
    },
    [favoritesList, setFavoritesList]
  );

  const toggleFavoriteDenom = useCallback(
    (denom: string) => {
      if (favoritesList.includes(denom)) {
        onRemoveFavoriteDenom(denom);
      } else {
        onAddFavoriteDenom(denom);
      }
    },
    [favoritesList, onRemoveFavoriteDenom, onAddFavoriteDenom]
  );

  return {
    favoritesList,
    onAddFavoriteDenom,
    onRemoveFavoriteDenom,
    toggleFavoriteDenom,
    setFavoritesList,
  };
}
