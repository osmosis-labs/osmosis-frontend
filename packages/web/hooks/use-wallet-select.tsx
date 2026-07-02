import type { MainWalletBase } from "@cosmos-kit/core";
import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
  type CosmosRegistryWallet,
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

interface InstallPrevSessionWalletDeps {
  walletRegistry: CosmosRegistryWallet[];
  mainWallets: MainWalletBase[];
  addWallet: (wallet: MainWalletBase) => any;
}

/**
 * Attempts to restore a previously connected cosmos wallet from localStorage.
 * If the persisted wallet name is no longer in the registry (e.g. after a wallet
 * provider is sunset), the stale session is cleared so the user starts fresh.
 */
export async function installPrevSessionWallet({
  walletRegistry,
  mainWallets,
  addWallet,
}: InstallPrevSessionWalletDeps) {
  const accountStr = localStorage.getItem(CosmosKitAccountsLocalStorageKey);

  if (!accountStr || accountStr === "[]") {
    localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
    localStorage.removeItem(CosmosKitWalletLocalStorageKey);
    return;
  }

  const currentWallet = localStorage.getItem(CosmosKitWalletLocalStorageKey);

  if (currentWallet) {
    if (mainWallets.some((w) => w.walletInfo.name === currentWallet)) {
      return;
    }

    const walletInfo = walletRegistry.find(
      ({ name }) => name === currentWallet
    );

    if (!walletInfo) {
      localStorage.removeItem(CosmosKitWalletLocalStorageKey);
      localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
      return;
    }

    const WalletClass = await walletInfo.lazyInstall();
    return addWallet(new WalletClass(walletInfo));
  }
}

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
    const { accountStore } = useStore();

    const [walletSelectParams, setWalletSelectParams] =
      useState<WalletSelectParams | null>(null);
    const [isWalletSelectOpen, setIsWalletSelectOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { setUserProperty } = useAmplitudeAnalytics();

    const setUserAmplitudeProperties = useCallback(() => {
      const wallet = accountStore.getWallet(accountStore.osmosisChainId);
      if (wallet) {
        setUserProperty("isWalletConnected", true);
        setUserProperty(
          "connectedWallet",
          wallet?.walletInfo?.name ?? "unknown"
        );
      }
    }, [accountStore, setUserProperty]);

    useEffect(() => {
      const init = async () => {
        try {
          await installPrevSessionWallet({
            walletRegistry: CosmosWalletRegistry,
            mainWallets: accountStore.walletManager.mainWallets,
            addWallet: (w) => accountStore.addWallet(w),
          });
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
