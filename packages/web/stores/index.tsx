<<<<<<< HEAD
import React, { FunctionComponent, useState } from "react";
=======
import React, {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
>>>>>>> 20682dbd (WIP working through type errors in update)

import { RootStore } from "./root";

const storeContext = React.createContext<RootStore | null>(null);

<<<<<<< HEAD
export const StoreProvider: FunctionComponent = ({ children }) => {
=======
// When the page is visible, refresh more often.
const refreshIntervalOnVisible = 30 * 1000;
// When the page is hidden, it refreshes less frequently.
// Users may be looking at other tabs for a long time.
// In this case, it is not necessary to refresh frequently, and if refresh frequently, it may burden the node.
const refreshIntervalOnHidden = 5 * 60 * 1000;

export const StoreProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
>>>>>>> 20682dbd (WIP working through type errors in update)
  const [rootStore] = useState(() => new RootStore());

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
