import { useSessionStorage } from "react-use";

export const UnlistedAssetsKey = "show_unlisted_assets";

export const useShowUnlistedAssets = () => {
  const [showUnlistedAssets] = useSessionStorage<boolean>(
    UnlistedAssetsKey,
    false
  );

  return {
    showUnlistedAssets,
  };
};
