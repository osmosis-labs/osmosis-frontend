import { MinimalAsset } from "@osmosis-labs/types";
import { useMemo } from "react";

import { useWallets } from "~/hooks/use-wallets";
import { api } from "~/utils/trpc";

/** Will query for an individual asset of any type of denom (symbol, min denom)
 *  if it's not already in the list of existing assets. */
export function useSwapAsset<TAsset extends MinimalAsset>({
  minDenomOrSymbol,
  existingAssets = [],
}: {
  minDenomOrSymbol?: string;
  existingAssets: TAsset[] | undefined;
}) {
  const { currentWallet } = useWallets();
  const { data: asset } = api.local.assets.getUserAsset.useQuery(
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

  const result = useMemo(
    () => ({
      asset: existingAsset ?? (asset as TAsset | undefined),
    }),
    [existingAsset, asset]
  );

  return result;
}
