import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
} from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  ReactNode,
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

export const WalletSelectProvider: FunctionComponent<{ children?: ReactNode }> =
  observer(({ children }) => {
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

    const setUserAmplitudeProperties = useCallback(() => {
      const wallet = accountStore.getWallet(chainId);
      if (wallet) {
        setUserProperty("isWalletConnected", true);
        setUserProperty(
          "connectedWallet",
          wallet?.walletInfo?.name ?? "unknown"
        );
      }
    }, [setUserProperty, accountStore, chainId]);

    useEffect(() => {
      const installPrevSessionWallet = async () => {
        const accountStr = localStorage.getItem(
          CosmosKitAccountsLocalStorageKey
        );

        // If there is no account, remove wallet and accounts from local storage to avoid unneeded installation
        if (!accountStr || accountStr === "[]") {
          localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
          localStorage.removeItem(CosmosKitWalletLocalStorageKey);
          return;
        }

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
          return accountStore.addWallet(new WalletClass(walletInfo));
        }
      };

      const init = async () => {
        try {
          await installPrevSessionWallet();
          // On mounted handles wallet connection if a session exists
          await accountStore.walletManager.onMounted();
          setUserAmplitudeProperties();
        } catch (error: any) {
          // Change this line
          if (error instanceof Error) {
            console.error("An error occurred:", error.message);
            // You can add more error handling logic here, such as setting an error state or showing an error message to the user
          } else {
            console.error("An unknown error occurred:", error);
          }
        } finally {
          setIsLoading(false);
        }
      };

      init();

      return () => {
        accountStore.walletManager.onUnmounted();
      };
    }, [accountStore, setUserAmplitudeProperties]);

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
  });
