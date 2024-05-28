import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";

export const useConnectEvmWallet = useConnect;
export const useEvmWalletAccount = useAccount;
export const useSwitchEvmChain = useSwitchChain;
export const useDisconnectEvmWallet = useDisconnect;
