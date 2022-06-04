import React, { FunctionComponent, useEffect, useState } from "react";
import { RootStore } from "./root";
import { useKeplr } from "../hooks";
import { AccountInitManagement } from "./account-init-management";
import { useVisibilityState } from "../hooks/use-visibility-state";

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent = ({ children }) => {
  const keplr = useKeplr();

  const [rootStore] = useState(() => new RootStore(keplr.getKeplr));

  const visibilityState = useVisibilityState();

  useEffect(() => {
    if (visibilityState === "visible") {
      const queryPools = rootStore.queriesStore.get(
        rootStore.chainStore.osmosis.chainId
      ).osmosis!.queryGammPools;

      if (!queryPools.isFetching) {
        queryPools.fetch();
      }

      const priceStore = rootStore.priceStore;

      if (!priceStore.isFetching) {
        priceStore.fetch();
      }
    }
  }, [
    rootStore.chainStore.osmosis.chainId,
    rootStore.priceStore,
    rootStore.queriesStore,
    visibilityState,
  ]);

  return (
    <storeContext.Provider value={rootStore}>
      <AccountInitManagement />
      {children}
    </storeContext.Provider>
  );
};

export const useStore = () => {
  const store = React.useContext(storeContext);
  if (!store) {
    throw new Error("You have forgot to use StoreProvider");
  }
  return store;
};
