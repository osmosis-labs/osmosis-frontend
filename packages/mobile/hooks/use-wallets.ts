import { isNil } from "@osmosis-labs/utils";
import { useLayoutEffect, useMemo } from "react";

import { useCurrentWalletStore } from "~/stores/current-wallet";
import { KeyInfo, useKeyringStore } from "~/stores/keyring";

export const useWallets = () => {
  const wallets = useKeyringStore((state) => state.keys);
  const currentWalletIndex = useCurrentWalletStore(
    (state) => state.currentSelectedWalletIndex
  );
  const setCurrentWalletIndex = useCurrentWalletStore(
    (state) => state.setCurrentSelectedWalletIndex
  );

  const currentWallet = useMemo<KeyInfo | undefined>(() => {
    if (!!process.env.EXPO_PUBLIC_OSMOSIS_ADDRESS) {
      return {
        type: "view-only",
        name: "Wallet 1",
        address: process.env.EXPO_PUBLIC_OSMOSIS_ADDRESS,
        version: 1,
      };
    }
    if (isNil(currentWalletIndex)) return undefined;
    return wallets[currentWalletIndex];
  }, [wallets, currentWalletIndex]);

  useLayoutEffect(() => {
    if (wallets.length > 0 && !currentWalletIndex) {
      setCurrentWalletIndex(0);
    }
  }, [wallets, currentWalletIndex, setCurrentWalletIndex]);

  return {
    wallets: process.env.EXPO_PUBLIC_OSMOSIS_ADDRESS
      ? [currentWallet]
      : wallets,
    currentWallet,
  };
};
