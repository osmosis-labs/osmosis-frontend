import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";

import { getDisplayableEvmConnector } from "~/modals/wallet-select/use-selectable-wallets";

export const useConnectEvmWallet = useConnect;
export const useEvmWalletAccount = () => {
  const account = useAccount();
  return {
    ...account,
    connector: account.connector
      ? getDisplayableEvmConnector(account.connector)
      : undefined,
  };
};
export const useSwitchEvmChain = useSwitchChain;
export const useDisconnectEvmWallet = useDisconnect;
export const useSendEvmTransaction = useSendTransaction;

export type ConnectEvmWalletReturn = ReturnType<typeof useConnectEvmWallet>;
