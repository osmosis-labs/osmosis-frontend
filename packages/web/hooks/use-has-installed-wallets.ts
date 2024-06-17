import { useMemo } from "react";

import { CosmosWalletRegistry } from "~/config/wallet-registry";

export const useHasInstalledCosmosWallets = () => {
  return useMemo(() => {
    const wallets = CosmosWalletRegistry.filter(
      (wallet) =>
        wallet.windowPropertyName && wallet.windowPropertyName in window
    );

    return wallets.length > 0;
  }, []);
};
