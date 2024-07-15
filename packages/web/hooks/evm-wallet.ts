import {
  useAccount,
  useConnect,
  useDisconnect,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";

export const useConnectEvmWallet = useConnect;
export const useEvmWalletAccount = useAccount;
export const useSwitchEvmChain = useSwitchChain;
export const useDisconnectEvmWallet = useDisconnect;
export const useSendEvmTransaction = useSendTransaction;

export type ConnectEvmWalletReturn = ReturnType<typeof useConnectEvmWallet>;
