import React, { FunctionComponent, useState } from "react";

import { RootStore } from "~/stores/root";
import { api } from "~/utils/trpc";

const storeContext = React.createContext<RootStore | null>(null);

/** Once data is invalidated, React Query will automatically refetch data
 *  when the dependent component becomes visible. */
function invalidateQueryData(apiUtils: ReturnType<typeof api.useUtils>) {
  apiUtils.edge.assets.getUserAsset.invalidate(); // Invalidate user balance
  apiUtils.edge.assets.getUserAssets.invalidate(); // Invalidate user balance
  apiUtils.edge.assets.getUserMarketAsset.invalidate(); // Invalidate user balance and market data
  apiUtils.edge.assets.getUserMarketAssets.invalidate(); // Invalidate user balance and market data
}

export const StoreProvider: FunctionComponent = ({ children }) => {
  const apiUtils = api.useUtils();
  const [rootStore] = useState(
    () =>
      new RootStore({
        txEvents: {
          onBroadcastFailed: () => invalidateQueryData(apiUtils),
          onFulfill: () => invalidateQueryData(apiUtils),
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
