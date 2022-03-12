import React, { FunctionComponent, useEffect, useState } from "react";

import { RootStore } from "./root";
import { useKeplr } from "../hooks";
import { AccountInitManagement } from "./account-init-management";

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent = ({ children }) => {
  const keplr = useKeplr();

  const [rootStore, setRootStore] = useState<RootStore | null>(null);

  useEffect(() => {
    if (!rootStore) {
      setRootStore(new RootStore(keplr.getKeplr));
    }
  }, [rootStore, setRootStore, keplr]);

  return (
    <storeContext.Provider value={rootStore}>
      <AccountInitManagement />
      {children}
    </storeContext.Provider>
  );
};

export const useStore = () => React.useContext(storeContext);
