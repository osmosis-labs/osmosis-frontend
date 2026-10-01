import { ButtonHTMLAttributes, ReactNode } from "react";
import { create } from "zustand";

export type CallToAction = {
  label: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

interface NavBarState {
  title: ReactNode | undefined;
  callToActionButtons: CallToAction[];
  /** Rendered height of banners visible under the navbar, for pages positioned
   *  outside normal flow that need to offset themselves. */
  visibleBannerHeight: number;
  setTitle: (title: ReactNode | undefined) => void;
  setCallToActionButtons: (buttons: CallToAction[]) => void;
  setVisibleBannerHeight: (height: number) => void;
  reset: () => void;
}

const initialState = {
  title: undefined as ReactNode | undefined,
  callToActionButtons: [] as CallToAction[],
  visibleBannerHeight: 0,
};

/** Ephemeral navbar UI state set by the current page; not persisted. */
export const useNavBarStore = create<NavBarState>()((set) => ({
  ...initialState,
  setTitle: (title) => set({ title }),
  setCallToActionButtons: (buttons) => set({ callToActionButtons: buttons }),
  setVisibleBannerHeight: (height) => set({ visibleBannerHeight: height }),
  // visibleBannerHeight is owned by the always-mounted NavBar and deliberately
  // survives reset(): page-level cleanup must not desync banner offsets.
  reset: () =>
    set((state) => ({
      ...initialState,
      visibleBannerHeight: state.visibleBannerHeight,
    })),
}));
