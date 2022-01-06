import React, { createContext, FunctionComponent, useState } from "react";
import { Keplr } from "@keplr-wallet/types";
import { getKeplrFromWindow } from "@keplr-wallet/stores";

export const GetKeplrContext = createContext<{
  getKeplr(): Promise<Keplr | undefined>;
} | null>(null);

export const GetKeplrProvider: FunctionComponent = ({ children }) => {
  const [getKeplr] = useState(() => async (): Promise<Keplr | undefined> => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return getKeplrFromWindow();
  });

  return (
    <GetKeplrContext.Provider value={{ getKeplr }}>
      {children}
    </GetKeplrContext.Provider>
  );
};
