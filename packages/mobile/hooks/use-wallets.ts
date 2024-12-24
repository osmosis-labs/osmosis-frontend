import { useMemo } from "react";

import { useCurrentWalletStore } from "~/stores/current-wallet";
import { KeyInfo, useKeyringStore } from "~/stores/keyring";

export const useWallets = () => {
  const wallets = useKeyringStore((state) => state.keys);
  const currentWalletIndex = useCurrentWalletStore(
    (state) => state.currentSelectedWalletIndex
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
    if (!currentWalletIndex) return undefined;
    return wallets[currentWalletIndex];
  }, [wallets, currentWalletIndex]);

  return {
    wallets,
    currentWallet,
  };
};
