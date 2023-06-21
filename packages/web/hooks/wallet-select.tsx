import { SimpleAccount } from "@cosmos-kit/core";
import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
} from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { WalletRegistry } from "~/config";
import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";
import { createContext } from "~/utils/react-context";

import { useAmplitudeAnalytics } from "./use-amplitude-analytics";

const [WalletSelectInnerProvider, useWalletSelect] = createContext<{
  onOpenWalletSelect: (chainName: string) => void;
  isOpen: boolean;
  isLoading: boolean;
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
    const [isLoading, setIsLoading] = useState(true);

    const { setUserProperty } = useAmplitudeAnalytics();

    useEffect(() => {
      // Try to reconnect to wallet if user has changed account for current wallet
      const tryReconnectToWallet = () => {
        const accountsStr = window.localStorage.getItem(
          CosmosKitAccountsLocalStorageKey
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
    }, [accountStore]);

    const setUserAmplitudeProperties = useCallback(() => {
      const wallet = accountStore.getWallet(chainId);
      setUserProperty("isWalletConnected", true);
      setUserProperty("connectedWallet", wallet?.walletInfo?.mode ?? "unknown");
    }, [setUserProperty, accountStore, chainId]);

    useEffect(() => {
      const installPrevSessionWallet = async () => {
        const currentWallet = window.localStorage.getItem(
          CosmosKitWalletLocalStorageKey
        );

        if (currentWallet) {
          // If wallet is already installed, do nothing
          if (
            accountStore.walletManager.mainWallets.some(
              (w) => w.walletInfo.name === currentWallet
            )
          ) {
            return;
          }

          const walletInfo = WalletRegistry.find(
            ({ name }) => name === currentWallet
          );
          const WalletClass = await walletInfo?.lazyInstall();
          accountStore.addWallet(new WalletClass(walletInfo));
        }
      };

      const init = async () => {
        try {
          await installPrevSessionWallet();

          // On mounted will try to connect to wallet if user has connected to wallet before
          accountStore.walletManager.onMounted().then(() => {
            setUserAmplitudeProperties();
          });
        } finally {
          setIsLoading(false);
        }
      };

      init();

      return () => {
        accountStore.walletManager.onUnmounted();
      };
    }, [accountStore, accountStore.walletManager, setUserAmplitudeProperties]);

    const onOpenWalletSelect = useCallback((chainName: string) => {
      setIsWalletSelectOpen(true);
      setChainName(chainName);
    }, []);

    const context = useMemo(
      () => ({ onOpenWalletSelect, isLoading, isOpen: isWalletSelectOpen }),
      [isLoading, isWalletSelectOpen, onOpenWalletSelect]
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
