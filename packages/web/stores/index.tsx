import React, { FunctionComponent, useState } from "react";

import { useKeplr } from "../hooks";
import { AccountInitManagement } from "./account-init-management";
import { RootStore } from "./root";

const storeContext = React.createContext<RootStore | null>(null);

export const StoreProvider: FunctionComponent = ({ children }) => {
  const keplr = useKeplr();

  const [rootStore] = useState(() => new RootStore(keplr.getKeplr));

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
