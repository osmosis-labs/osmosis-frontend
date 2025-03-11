import { CoinPretty } from "@osmosis-labs/unit";
import { create } from "zustand";
import { combine } from "zustand/middleware";

import { RouterOutputs } from "~/utils/trpc";

export const useSwapStore = create(
  combine(
    {
      // Input
      inAmount: "",
      outAmount: "",
      isMaxAmount: false,
      quoteType: "out-given-in" as "out-given-in" | "in-given-out",
      gasAmount: undefined as CoinPretty | undefined,

      // Assets
      fromAsset: undefined as
        | RouterOutputs["local"]["assets"]["getUserAsset"]
        | undefined,
      toAsset: undefined as
        | RouterOutputs["local"]["assets"]["getUserAsset"]
        | undefined,

      fromAssetDenom: undefined as string | undefined,
      toAssetDenom: undefined as string | undefined,

      initialFromDenom: undefined as string | undefined,
      initialToDenom: undefined as string | undefined,

      assetSearchInput: "",
    },
    (set) => ({
      setFromAssetDenom: (denom: string | undefined) =>
        set({ fromAssetDenom: denom }),
      setToAssetDenom: (denom: string | undefined) =>
        set({ toAssetDenom: denom }),
      switchAssets: () =>
        set((state) => ({
          fromAssetDenom: state.toAssetDenom,
          toAssetDenom: state.fromAssetDenom,
        })),
      setAssetSearchInput: (input: string) => set({ assetSearchInput: input }),
    })
  )
);
