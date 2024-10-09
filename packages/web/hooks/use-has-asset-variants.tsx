"use client";

import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import { create } from "zustand";

const useHasAssetVariantsStore = create<{
  hasSeenToastThisSession: boolean;
  setHasSeenToast: (value: boolean) => void;
}>((set) => ({
  hasSeenToastThisSession: false,
  setHasSeenToast: (value: boolean) => set({ hasSeenToastThisSession: value }),
}));

import {
  AlloyedAssetsToastDoNotShowKey,
  displayToast,
} from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";
import { useFeatureFlags, useWalletSelect, useWindowSize } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useHasAssetVariants = () => {
  const { accountStore } = useStore();
  const wallet = accountStore.getWallet(accountStore.osmosisChainId);
  const { isLoading: isWalletLoading } = useWalletSelect();

  // Check for component mounted
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { isMobile } = useWindowSize();
  const { alloyedAssets } = useFeatureFlags();

  const [doNotShowAgain] = useLocalStorage(AlloyedAssetsToastDoNotShowKey);

  const enabled =
    isMounted &&
    alloyedAssets &&
    !isWalletLoading &&
    Boolean(wallet?.isWalletConnected) &&
    Boolean(wallet?.address);

  const { hasSeenToastThisSession, setHasSeenToast } =
    useHasAssetVariantsStore();

  api.local.portfolio.getAllocation.useQuery(
    {
      address: wallet?.address ?? "",
    },
    {
      enabled,
      onSuccess: (data) => {
        // note - there is some local storage order issues when navigating between pages, so hasSeenToastThisSession is a failsafe
        if (doNotShowAgain === true || hasSeenToastThisSession) return;

        const hasAssetsToConvert = data?.hasVariants ?? false;

        const shouldDisplayToast = hasAssetsToConvert && !isMobile;

        if (shouldDisplayToast) {
          displayToast(
            {
              titleTranslationKey: "alloyedAssets.title",
              captionTranslationKey: "alloyedAssets.caption",
            },
            ToastType.ALLOYED_ASSETS,
            {
              position: "bottom-right",
            }
          );

          setHasSeenToast(true);
        }
      },
      onError: (error) => {
        console.error(error);
      },
      refetchOnWindowFocus: false,
    }
  );
};
