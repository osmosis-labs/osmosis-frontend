import { MinimalAsset } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import { createContext, useContext } from "react";
import { create, useStore } from "zustand";
import { combine } from "zustand/middleware";

import { useAmountInput } from "~/hooks/use-amount-input";
import { RouterOutputs } from "~/utils/trpc";

export const SwapStoreContext = createContext<ReturnType<
  typeof createSwapStore
> | null>(null);

export const createSwapStore = () =>
  create(
    combine(
      {
        // Input
        inAmountInput: undefined as
          | ReturnType<typeof useAmountInput>
          | undefined,
        outAmountInput: undefined as
          | ReturnType<typeof useAmountInput>
          | undefined,
        isSwapToolLoading: false,

        quoteType: "out-given-in" as "out-given-in" | "in-given-out",

        // Assets
        fromAsset: undefined as MinimalAsset | undefined,
        toAsset: undefined as MinimalAsset | undefined,
        fromAssetDenom: undefined as string | undefined,
        toAssetDenom: undefined as string | undefined,

        assetSearchInput: "",
        maxSlippage: new Dec(0.05),

        error: undefined as Error | undefined,
      },
      (set) => ({
        switchAssets: () =>
          set((state) => ({
            fromAsset: state.toAsset,
            toAsset: state.fromAsset,
            fromAssetDenom: state.toAssetDenom,
            toAssetDenom: state.fromAssetDenom,
          })),
        setAssetSearchInput: (input: string) =>
          set({ assetSearchInput: input }),
        setFromAsset: (
          asset: RouterOutputs["local"]["assets"]["getUserAsset"] | undefined
        ) =>
          set({
            fromAsset: asset,
          }),
        setToAsset: (
          asset: RouterOutputs["local"]["assets"]["getUserAsset"] | undefined
        ) =>
          set({
            toAsset: asset,
          }),
        selectAsset: (
          direction: "in" | "out",
          asset: RouterOutputs["local"]["assets"]["getUserAsset"] | undefined
        ) =>
          set({
            [direction === "in" ? "fromAssetDenom" : "toAssetDenom"]:
              asset?.coinMinimalDenom,
            [direction === "in" ? "fromAsset" : "toAsset"]: asset,
          }),
        updateAssetDenoms: (fromAssetDenom: string, toAssetDenom: string) =>
          set({
            fromAssetDenom,
            toAssetDenom,
            fromAsset: undefined,
            toAsset: undefined,
          }),
        setError: (error: Error | undefined) => set({ error }),
        setIsSwapToolLoading: (isSwapToolLoading: boolean) =>
          set({ isSwapToolLoading }),
      })
    )
  );

type ExtractState<S> = S extends {
  getState: () => infer T;
}
  ? T
  : never;

export const useSwapStore = <U>(
  selector: (state: ExtractState<ReturnType<typeof createSwapStore>>) => U
) => {
  const store = useContext(SwapStoreContext);
  if (!store) {
    throw new Error("Missing StoreProvider");
  }
  return useStore(store, selector);
};

export const useSwapStoreApi = () => {
  const store = useContext(SwapStoreContext);
  if (!store) {
    throw new Error("Missing StoreProvider");
  }
  return store;
};
