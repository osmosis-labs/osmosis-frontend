import { useCallback } from "react";

import { useLocalStorageState } from "../window/use-localstorage-state";

export function useUserFavoriteAssetDenoms() {
  const [favoritesList, onSetFavoritesList] = useLocalStorageState(
    "favoritesList",
    ["OSMO", "ATOM", "TIA"]
  );

  const addFavoriteDenom = useCallback(
    (denom: string) => {
      if (favoritesList.includes(denom)) return;
      onSetFavoritesList([...favoritesList, denom]);
    },
    [favoritesList, onSetFavoritesList]
  );

  const removeFavoriteDenom = useCallback(
    (denom: string) => {
      if (!favoritesList.includes(denom)) return;
      onSetFavoritesList(favoritesList.filter((d) => d !== denom));
    },
    [favoritesList, onSetFavoritesList]
  );

  return {
    favoritesList,
    addFavoriteDenom,
    removeFavoriteDenom,
    onSetFavoritesList,
  };
}
