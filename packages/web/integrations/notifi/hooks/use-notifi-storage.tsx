import { useEffect } from "react";
import { createContext } from "react";
import { useContext } from "react";
import { FC } from "react";
import { useCallback } from "react";
import { useState } from "react";

import { useStore } from "~/stores";

// LocalStorage Key: notifi_localStorage_{walletAddress}
type NotifiLocalStorageValue = {
  notShowDummyHistory: boolean;
};

type NotifiLocalStorageContext = {
  notifiLocalStorageValue: NotifiLocalStorageValue | undefined;
  updateLocalStorage: (value: NotifiLocalStorageValue) => void;
};

const notifiLocalStorageContext =
  createContext<NotifiLocalStorageContext | null>(null);

export const NotifiLocalStorageProvider: FC = ({ children }) => {
  const {
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
  } = useStore();
  const [notifiLocalStorageValue, setNotifiLocalStorageValue] =
    useState<NotifiLocalStorageValue>();

  const [needUpdate, setNeedUpdate] = useState(true);

  useEffect(() => {
    if (!needUpdate) return;
    const localStorageValue = JSON.parse(
      window.localStorage.getItem(
        `notifi_localStorage_${accountStore.getWallet(chainId)?.address}`
      ) ?? "{}"
    );
    setNotifiLocalStorageValue(localStorageValue);
    setNeedUpdate(false);
  }, [accountStore, chainId, needUpdate]);

  const updateLocalStorage = useCallback(
    async (value: NotifiLocalStorageValue) => {
      window.localStorage.setItem(
        `notifi_localStorage_${accountStore.getWallet(chainId)?.address}`,
        JSON.stringify(value)
      );
      setNeedUpdate(true);
    },
    [accountStore, chainId]
  );
  return (
    <notifiLocalStorageContext.Provider
      value={{ notifiLocalStorageValue, updateLocalStorage }}
    >
      {children}
    </notifiLocalStorageContext.Provider>
  );
};

export const useNotifiLocalStorage = () => {
  const context = useContext(notifiLocalStorageContext);
  if (!context) {
    throw new Error(
      "useNotifiLocalStorage must be used within a NotifiLocalStorageProvider"
    );
  }
  return context;
};
