import React, { PropsWithChildren, useState } from "react";
import { toast } from "react-toastify";

import { displayToast, ToastType } from "~/components/alert";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { RootStore } from "~/stores/root";
import { api } from "~/utils/trpc";

export const storeContext = React.createContext<RootStore | null>(null);

/** Once data is invalidated, React Query will automatically refetch data
 *  when the dependent component becomes visible. */
export function refetchUserQueries(apiUtils: ReturnType<typeof api.useUtils>) {
  apiUtils.edge.assets.getUserAsset.invalidate();
  apiUtils.edge.assets.getUserAssets.invalidate();
  apiUtils.edge.assets.getUserMarketAsset.invalidate();
  apiUtils.edge.assets.getUserAssetsTotal.invalidate();
  apiUtils.edge.assets.getUserBridgeAsset.invalidate();
  apiUtils.edge.assets.getUserBridgeAssets.invalidate();
  apiUtils.edge.staking.getUserDelegations.invalidate();
  apiUtils.local.concentratedLiquidity.getUserPositions.invalidate();
  apiUtils.local.concentratedLiquidity.getPositionDetails.invalidate();
  apiUtils.edge.pools.getSharePool.invalidate();
  apiUtils.edge.pools.getPool.invalidate();
  apiUtils.edge.pools.getUserSharePool.invalidate();
  apiUtils.edge.pools.getSharePoolBondDurations.invalidate();
  apiUtils.local.balances.getUserBalances.invalidate();
  apiUtils.local.bridgeTransfer.getSupportedAssetsBalances.invalidate();
  apiUtils.edge.assets.getImmersiveBridgeAssets.invalidate();
  apiUtils.edge.orderbooks.getAllOrders.invalidate();
  apiUtils.edge.orderbooks.getClaimableOrders.invalidate();
}

const EXCEEDS_1CT_NETWORK_FEE_LIMIT_TOAST_ID = "exceeds-1ct-network-fee-limit";

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const apiUtils = api.useUtils();
  const { t } = useTranslation();
  const [rootStore] = useState(
    () =>
      new RootStore({
        txEvents: {
          onFulfill: () => refetchUserQueries(apiUtils),

          /**
           * This event is triggered when the network fee limit is exceeded.
           * In this case we prompt the user to change the network fee limit
           * if he wants to continue with the one-click trading session.
           */
          onExceeds1CTNetworkFeeLimit: ({ finish, continueTx }) => {
            displayToast(
              {
                titleTranslationKey: "oneClickTrading.toast.networkFeeTooHigh",
                captionElement: (
                  <div className="flex flex-col items-start">
                    <Button
                      variant="link"
                      className="!h-auto self-start !px-0 !py-0  text-wosmongton-300"
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
                autoClose: 20_000,
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
