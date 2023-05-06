import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useKeplr } from "../hooks";
import { useVisibilityState } from "../hooks/use-visibility-state";
import { AccountInitManagement } from "./account-init-management";
import { RootStore } from "./root";

const storeContext = React.createContext<RootStore | null>(null);

// When the page is visible, refresh more often.
const refreshIntervalOnVisible = 30 * 1000;
// When the page is hidden, it refreshes less frequently.
// Users may be looking at other tabs for a long time.
// In this case, it is not necessary to refresh frequently, and if refresh frequently, it may burden the node.
const refreshIntervalOnHidden = 5 * 60 * 1000;

export const StoreProvider: FunctionComponent = ({ children }) => {
  const keplr = useKeplr();

  const [rootStore] = useState(() => new RootStore(keplr.getKeplr));

  const visibilityState = useVisibilityState();
  const [refreshInterval, setRefreshInterval] = useState(
    refreshIntervalOnVisible
  );

  const refresh = useCallback(() => {
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
  }, [
    rootStore.chainStore.osmosis.chainId,
    rootStore.priceStore,
    rootStore.queriesStore,
  ]);

  useEffect(() => {
    if (visibilityState === "visible") {
      // Refresh query pools and price whenever page becomes visible

      refresh();

      setRefreshInterval(refreshIntervalOnVisible);
    } else {
      setRefreshInterval(refreshIntervalOnHidden);
    }
  }, [refresh, visibilityState]);

  useEffect(() => {
    const disposer = setInterval(refresh, refreshInterval);

    return () => {
      clearInterval(disposer);
    };
  }, [refresh, refreshInterval]);

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
