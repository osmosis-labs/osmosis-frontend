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
      },
      (set) => ({
        setIncludeCl: (includeCl: boolean) => set({ includeCl }),
      })
    ),
    { name: "orderbook-depth-preferences" }
  )
);
