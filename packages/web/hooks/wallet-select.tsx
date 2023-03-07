import { SimpleAccount } from "@cosmos-kit/core";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";
import { createContext } from "~/utils/react-context";

import { useAmplitudeAnalytics } from "./use-amplitude-analytics";

const [WalletSelectInnerProvider, useWalletSelect] = createContext<{
  onOpenWalletSelect: (chainName: string) => void;
}>({
  strict: true,
  name: "WalletSelectContext",
});

export { useWalletSelect };

export const WalletSelectProvider: FunctionComponent = observer(
  ({ children }) => {
    const {
      accountStore,
      chainStore: {
        osmosis: { chainId },
      },
    } = useStore();

    const [chainName, setChainName] = useState<string | null>(null);
    const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);

    const { setUserProperty } = useAmplitudeAnalytics();

    useEffect(() => {
      // Try to reconnect to wallet if user has changed account for current wallet
      const tryReconnectToWallet = () => {
        const accountsStr = window.localStorage.getItem(
          "cosmos-kit@1:core//accounts"
        );

        if (accountsStr) {
          const accounts: SimpleAccount[] = JSON.parse(accountsStr);
          try {
            accountStore.getWalletRepo(accounts[0].chainId).connect();
          } catch (e) {}
        }
      };

      accountStore.walletManager.on("refresh_connection", tryReconnectToWallet);
      return () => {
        accountStore.walletManager.off(
          "refresh_connection",
          tryReconnectToWallet
        );
      };
    }, []);

    const setUserAmplitudeProperties = useCallback(() => {
      const wallet = accountStore.getWallet(chainId);
      setUserProperty("isWalletConnected", true);
      setUserProperty("connectedWallet", wallet?.walletInfo?.mode ?? "unknown");
    }, [setUserProperty, accountStore, chainId]);

    useEffect(() => {
      accountStore.walletManager.onMounted().then(() => {
        setUserAmplitudeProperties();
      });
      return () => {
        accountStore.walletManager.onUnmounted();
      };
    }, []);

    const onOpenWalletSelect = useCallback((chainName: string) => {
      setIsWalletSelectOpen(true);
      setChainName(chainName);
    }, []);

    const context = useMemo(
      () => ({ onOpenWalletSelect }),
      [onOpenWalletSelect]
    );

    return (
      <WalletSelectInnerProvider value={context}>
        {Boolean(chainName) && (
          <WalletSelectModal
            walletRepo={accountStore.getWalletRepo(chainName!)}
            onConnect={() => {
              setUserAmplitudeProperties();
            }}
            isOpen={isWalletSelectOpen}
            onRequestClose={() => {
              setIsWalletSelectOpen(false);
              setChainName(null);
            }}
          />
        )}
        {children}
      </WalletSelectInnerProvider>
    );
  }
);
