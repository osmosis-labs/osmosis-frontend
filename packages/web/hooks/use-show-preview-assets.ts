import { useMount } from "react-use";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { displayToast } from "~/components/alert/toast";
import { ToastType } from "~/components/alert/types";

const ShowPreviewAssetsKey = "show_preview_assets";

interface PreviewAssetsState {
  initialized: boolean;
  showPreviewAssets: boolean;
  setShowPreviewAssets: (value: boolean) => void;
}

const usePreviewAssetsStore = create<PreviewAssetsState>()(
  persist(
    (set) => ({
      initialized: false,
      showPreviewAssets: false,
      setShowPreviewAssets: (value: boolean) => {
        if (value === true) {
          displayToast(
            {
              titleTranslationKey: "previewAssetsEnabled",
              captionTranslationKey: "previewAssetsEnabledForSession",
            },
            ToastType.SUCCESS
          );
        } else {
          displayToast(
            {
              titleTranslationKey: "previewAssetsDisabled",
            },
            ToastType.SUCCESS
          );
        }

        set({ initialized: true, showPreviewAssets: value });
      },
    }),
    {
      name: ShowPreviewAssetsKey,
      partialize: (state) => ({
        showPreviewAssets: state.showPreviewAssets,
      }),
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export const useShowPreviewAssets = () => {
  const { showPreviewAssets, setShowPreviewAssets } = usePreviewAssetsStore(
    (state) => ({
      showPreviewAssets: state.showPreviewAssets,
      setShowPreviewAssets: state.setShowPreviewAssets,
    })
  );

  useMount(() => {
    if (usePreviewAssetsStore.getState().initialized) return;

    const urlParams = new URLSearchParams(window.location.search);

    if (
      urlParams.get(ShowPreviewAssetsKey) === "true" &&
      showPreviewAssets !== true
    ) {
      return setShowPreviewAssets(true);
    }

    if (
      urlParams.get(ShowPreviewAssetsKey) === "false" &&
      showPreviewAssets === true
    ) {
      return setShowPreviewAssets(false);
    }
  });

  return {
    showPreviewAssets,
  };
};
