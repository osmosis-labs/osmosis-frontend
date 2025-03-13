import { useEffect, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { useWallets } from "~/hooks/use-wallets";
import { useSwapStore } from "~/stores/swap";
import { api, RouterOutputs } from "~/utils/trpc";

/** Will query for an individual asset of any type of denom (symbol, min denom)
 *  if it's not already in the list of existing assets. */
export function useSwapAsset<
  TAsset extends RouterOutputs["local"]["assets"]["getUserAsset"]
>({
  minDenomOrSymbol,
  existingAssets = [],
  direction,
}: {
  minDenomOrSymbol?: string;
  existingAssets?: TAsset[] | undefined;
  direction: "in" | "out";
}) {
  const { currentWallet } = useWallets();
  const { setFromAsset, setToAsset } = useSwapStore(
    useShallow((state) => ({
      setFromAsset: state.setFromAsset,
      setToAsset: state.setToAsset,
    }))
  );
  const {
    data: asset,
    isLoading,
    error,
  } = api.local.assets.getUserAsset.useQuery(
    {
      findMinDenomOrSymbol: minDenomOrSymbol!,
      userOsmoAddress: currentWallet?.address,
    },
    {
      enabled: !!minDenomOrSymbol,
    }
  );

  /** If `coinDenom` or `coinMinimalDenom` don't yield a result, we
   *  can fall back to the getAssets query which will perform
   *  a more comprehensive search. */
  const existingAsset = useMemo(
    () =>
      existingAssets.find(
        (asset) =>
          asset.coinDenom === minDenomOrSymbol ||
          asset.coinMinimalDenom === minDenomOrSymbol
      ),
    [existingAssets, minDenomOrSymbol]
  );

  const currentAsset = useMemo(
    () => (asset as TAsset | undefined) ?? existingAsset,
    [existingAsset, asset]
  );

  // Update the store when assets change
  useEffect(() => {
    // Get these values here to avoid unnecessary re-renders
    const { fromAsset, toAsset } = useSwapStore.getState();

    const previousAsset = direction === "in" ? fromAsset : toAsset;

    // If the asset is the same as the previous asset, don't update the store
    if (
      previousAsset?.coinMinimalDenom === asset?.coinMinimalDenom ||
      isLoading
    ) {
      return;
    }

    if (direction === "in") {
      setFromAsset(currentAsset);
    } else {
      setToAsset(currentAsset);
    }
  }, [asset, direction, setFromAsset, setToAsset, isLoading, currentAsset]);

  return {
    asset: currentAsset,
    error,
  };
}
