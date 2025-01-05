import { isNil } from "@osmosis-labs/utils";
import { useEffect, useLayoutEffect, useMemo } from "react";
import { Alert } from "react-native";

import { useCurrentWalletStore } from "~/stores/current-wallet";
import { KeyInfo, useKeyringStore } from "~/stores/keyring";
import { api } from "~/utils/trpc";

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

  const enabled = wallets.length > 0 && currentWallet?.type === "smart-account";

  const { data: sessionAuthenticator, isError: isSessionAuthenticatorError } =
    api.local.oneClickTrading.getSessionAuthenticator.useQuery(
      {
        publicKey:
          currentWallet?.type === "smart-account"
            ? currentWallet!.publicKey
            : "",
        userOsmoAddress: currentWallet?.address ?? "",
      },
      {
        enabled,
      }
    );

  useLayoutEffect(() => {
    if (wallets.length > 0 && !currentWalletIndex) {
      setCurrentWalletIndex(0);
    }
  }, [wallets, currentWalletIndex, setCurrentWalletIndex]);

  useEffect(() => {
    if (
      isSessionAuthenticatorError &&
      !sessionAuthenticator &&
      !isNil(currentWalletIndex)
    ) {
      Alert.alert(
        "Session Deleted",
        "Your wallet session was removed. Please reconnect your wallet or connect a new one.",
        [{ text: "OK" }]
      );
      useKeyringStore.getState().deleteKey(currentWalletIndex);
    }
  }, [isSessionAuthenticatorError, sessionAuthenticator, currentWalletIndex]);

  return {
    wallets,
    currentWallet,
  };
};
