import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
} from "@osmosis-labs/stores";
import { isNil } from "@osmosis-labs/utils";
import { observer } from "mobx-react-lite";
import {
  FunctionComponent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { EthereumChainIds } from "~/config/wagmi";
import { CosmosWalletRegistry } from "~/config/wallet-registry";
import { useAmplitudeAnalytics } from "~/hooks/use-amplitude-analytics";
import { WalletSelectModal } from "~/modals";
import { useStore } from "~/stores";
import { createContext } from "~/utils/react-context";

const [WalletSelectInnerProvider, useWalletSelect] = createContext<{
  onOpenWalletSelect: (params: WalletSelectParams) => void;
  isOpen: boolean;
  isLoading: boolean;
}>({
  strict: true,
  name: "WalletSelectContext",
});

export { useWalletSelect };

export type WalletSelectOption =
  | { walletType: "cosmos"; chainId: string }
  | { walletType: "evm"; chainId?: EthereumChainIds };

export interface WalletSelectParams {
  walletOptions: WalletSelectOption[];
  /**
   * @default "full"
   */
  layout?: "list" | "full";
  onConnect?: () => void;
}

export const WalletSelectProvider: FunctionComponent<{ children: ReactNode }> =
  observer(({ children }) => {
    const {
      accountStore,
      chainStore: {
        osmosis: { chainId },
      },
    } = useStore();

    const [walletSelectParams, setWalletSelectParams] =
      useState<WalletSelectParams | null>(null);
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

          const walletInfo = CosmosWalletRegistry.find(
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
        } finally {
          setIsLoading(false);
        }
      };

      init();

      return () => {
        accountStore.walletManager.onUnmounted();
      };
    }, [accountStore, setUserAmplitudeProperties]);

    const onOpenWalletSelect = useCallback((params: WalletSelectParams) => {
      setIsWalletSelectOpen(true);
      setWalletSelectParams(params);
    }, []);

    const context = useMemo(
      () => ({ onOpenWalletSelect, isLoading, isOpen: isWalletSelectOpen }),
      [isLoading, isWalletSelectOpen, onOpenWalletSelect]
    );

    return (
      <WalletSelectInnerProvider value={context}>
        {!isNil(walletSelectParams) &&
          walletSelectParams.walletOptions.length > 0 && (
            <WalletSelectModal
              walletOptions={walletSelectParams.walletOptions}
              onConnect={() => {
                setUserAmplitudeProperties();
                walletSelectParams.onConnect?.();
              }}
              isOpen={isWalletSelectOpen}
              onRequestClose={() => {
                setIsWalletSelectOpen(false);
                setWalletSelectParams(null);
              }}
              layout={walletSelectParams?.layout}
            />
          )}
        {children}
      </WalletSelectInnerProvider>
    );
  });
