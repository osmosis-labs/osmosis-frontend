import React, { FunctionComponent, useState } from "react";
import { toast } from "react-toastify";

import { displayToast, ToastType } from "~/components/alert";
import { Button } from "~/components/buttons";
import { useTranslation } from "~/hooks";
import { useGlobalIs1CTIntroModalScreen } from "~/modals";
import { RootStore } from "~/stores/root";
import { api } from "~/utils/trpc";

const storeContext = React.createContext<RootStore | null>(null);

/** Once data is invalidated, React Query will automatically refetch data
 *  when the dependent component becomes visible. */
function invalidateQueryData(apiUtils: ReturnType<typeof api.useUtils>) {
  apiUtils.edge.assets.getAsset.invalidate();
  apiUtils.edge.assets.getAssets.invalidate();
  apiUtils.edge.assets.getMarketAsset.invalidate();
  apiUtils.edge.assets.getMarketAssets.invalidate();
  apiUtils.edge.assets.getUserAssetsBreakdown.invalidate();
  apiUtils.edge.concentratedLiquidity.getUserPositions.invalidate();
}

const EXCEEDS_1CT_NETWORK_FEE_LIMIT_TOAST_ID = "exceeds-1ct-network-fee-limit";

export const StoreProvider: FunctionComponent = ({ children }) => {
  const apiUtils = api.useUtils();
  const [_, setOneClickTradingIntroModalScreen] =
    useGlobalIs1CTIntroModalScreen();
  const { t } = useTranslation();
  const [rootStore] = useState(
    () =>
      new RootStore({
        txEvents: {
          onBroadcastFailed: () => invalidateQueryData(apiUtils),
          onFulfill: () => invalidateQueryData(apiUtils),

          /**
           * This event is triggered when the network fee limit is exceeded.
           * In this case we prompt the user to change the network fee limit
           * if he wants to continue with the one-click trading session.
           */
          onExceeds1CTNetworkFeeLimit: ({ finish, continueTx }) => {
            displayToast(
              {
                titleTranslationKey: t(
                  "oneClickTrading.toast.networkFeeTooHigh"
                ),
                captionElement: (
                  <div className="flex flex-col items-start gap-2">
                    <Button
                      mode="text"
                      className="caption px-0"
                      onClick={() => {
                        toast.dismiss(EXCEEDS_1CT_NETWORK_FEE_LIMIT_TOAST_ID);
                        setOneClickTradingIntroModalScreen(
                          "settings-no-back-button"
                        );
                        finish();
                      }}
                    >
                      {t("oneClickTrading.toast.increaseFeeLimit")}
                    </Button>
                    <Button
                      mode="text"
                      className="caption"
                      onClick={() => {
                        toast.dismiss(EXCEEDS_1CT_NETWORK_FEE_LIMIT_TOAST_ID);
                        continueTx();
                      }}
                    >
                      {t("oneClickTrading.toast.continueWithWallet")}
                    </Button>
                  </div>
                ),
              },
              ToastType.ONE_CLICK_TRADING,
              {
                toastId: EXCEEDS_1CT_NETWORK_FEE_LIMIT_TOAST_ID,
                onClose: () => {
                  finish();
                },
              }
            );
          },
        },
      })
  );

  return (
    <storeContext.Provider value={rootStore}>{children}</storeContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider");
  }
  return store;
};
