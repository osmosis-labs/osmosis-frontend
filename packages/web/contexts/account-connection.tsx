import {
  createContext,
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  KeyAutoConnectingWalletType,
  KeyConnectingWalletType,
  WalletType,
} from "../stores/connect-wallet";
import { useStore } from "../stores";
import { getKeplrFromWindow, WalletStatus } from "@keplr-wallet/stores";
import { observer } from "mobx-react-lite";

export type AccountConnection = {
  isAccountConnected: boolean | WalletType;
  disconnectAccount: () => Promise<void>;
  connectAccount: () => void;
  isMobileWeb: boolean;
};

export const AccountConnectionContext = createContext<AccountConnection | null>(
  null
);

export const AccountConnectionProvider: FunctionComponent = observer(
  ({ children }) => {
    const { chainStore, accountStore, connectWalletStore } = useStore();

    const account = accountStore.getAccount(chainStore.current.chainId);

    const [isMobileWeb, setIsMobileWeb] = useState(false);
    useEffect(() => {
      getKeplrFromWindow().then((keplr) => {
        if (keplr && keplr.mode === "mobile-web") {
          localStorage?.removeItem(KeyConnectingWalletType);
          localStorage?.removeItem(KeyAutoConnectingWalletType);
          setIsMobileWeb(true);
        }
      });
    }, []);

    // Even though the wallet is not loaded, if `shouldAutoConnectAccount` is true, set the `isAccountConnected` as true.
    // Because the initing the wallet is asyncronous, when users enter the site the wallet is seen as not loaded.
    // To reduce this problem, if the wallet is connected when users enter the site, just assume that the wallet is already connected.
    const isAccountConnected =
      account.walletStatus === WalletStatus.Loaded ||
      connectWalletStore.autoConnectingWalletType ||
      isMobileWeb;

    const disconnectAccount = useCallback(async () => {
      connectWalletStore.disableAutoConnect();
      connectWalletStore.disconnect();
    }, [connectWalletStore]);

    const connectAccount = useCallback(() => {
      localStorage?.setItem(KeyAutoConnectingWalletType, "extension");
      accountStore.getAccount(chainStore.current.chainId).init();
    }, [chainStore, accountStore]);

    useEffect(() => {
      if (isMobileWeb) {
        account.init();
      }
    }, [account, isMobileWeb]);

    useEffect(() => {
      // 이전에 로그인한 후에 sign out을 명시적으로 하지 않았으면 자동으로 로그인한다.
      if (
        !!connectWalletStore.autoConnectingWalletType &&
        account.walletStatus === WalletStatus.NotInit
      ) {
        account.init();
      }
    }, [account, connectWalletStore.autoConnectingWalletType]);

    /*
	    Disconnect the accounts if the wallet doesn't exist or the connection rejected.
	    Below looks somewhat strange in React philosophy.
	    But, it is hard to use the `useEffect` hook because the references of the chain store and account store is persistent.
	    Even though belows will be executed on rerendering of this component,
	    it is likely this component will not be rerendered frequently because this component only handle the connection of account.
	    If some account's wallet status changed, the observer makes this component be rerendered.
	 */
    for (const chainInfo of chainStore.chainInfos) {
      const account = accountStore.getAccount(chainInfo.chainId);
      if (
        account.walletStatus === WalletStatus.NotExist ||
        account.walletStatus === WalletStatus.Rejected
      ) {
        if (chainInfo.chainId === chainStore.current.chainId) {
          connectWalletStore.disableAutoConnect();
          connectWalletStore.disconnect();
        } else {
          account.disconnect();
        }
      }
    }

    return (
      <AccountConnectionContext.Provider
        value={useMemo(() => {
          return {
            isAccountConnected,
            disconnectAccount,
            connectAccount,
            isMobileWeb,
          };
        }, [
          connectAccount,
          disconnectAccount,
          isAccountConnected,
          isMobileWeb,
        ])}
      >
        {children}
      </AccountConnectionContext.Provider>
    );
  }
);
