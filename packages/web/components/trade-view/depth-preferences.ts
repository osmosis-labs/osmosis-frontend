import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

/**
 * Order book display preferences, persisted to localStorage and shared by
 * every mounted order book (the asset page mounts one per responsive
 * layout), so a change in one applies to all of them at once.
 */
export const useOrderbookDepthPreferences = create(
  persist(
    combine(
      {
        /** Include concentrated-liquidity pool depth for the pair. */
        includeCl: true,
        /** Fold what is past the rows shown into one "<" and ">" row. */
        showEdges: true,
      },
      (set) => ({
        setIncludeCl: (includeCl: boolean) => set({ includeCl }),
        setShowEdges: (showEdges: boolean) => set({ showEdges }),
      })
    ),
    { name: "orderbook-depth-preferences" }
  )
);
