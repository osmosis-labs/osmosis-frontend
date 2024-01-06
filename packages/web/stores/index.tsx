import React, { FunctionComponent, useState } from "react";

import { RootStore } from "~/stores/root";
import { api } from "~/utils/trpc";

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent = ({ children }) => {
  const apiUtils = api.useUtils();
  const [rootStore] = useState(
    () =>
      new RootStore({
        txEvents: {
          onBroadcastFailed: () => {
            apiUtils.edge.assets.getAsset.invalidate(); // Invalidate user balance
          },
          onFulfill: () => {
            apiUtils.edge.assets.getAsset.invalidate(); // Invalidate user balance
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
