import { ChainWalletBase, State, WalletStatus } from "@cosmos-kit/core";
import { CosmosRegistryWallet } from "@osmosis-labs/stores";
import { Connector } from "wagmi";

import { EthereumChainIds } from "~/config/wagmi";

export type ModalView =
  | "list"
  | "qrCode"
  | "connecting"
  | "connected"
  | "error"
  | "doesNotExist"
  | "rejected"
  | "initializingOneClickTrading"
  | "broadcastedOneClickTrading"
  | "initializeOneClickTradingError";

export function getModalView({
  qrState,
  isInitializingOneClickTrading,
  hasOneClickTradingError,
  hasBroadcastedTx,
  walletStatus,
}: {
  qrState: State;
  isInitializingOneClickTrading: boolean;
  hasOneClickTradingError: boolean;
  hasBroadcastedTx: boolean;
  walletStatus?: WalletStatus;
}): ModalView {
  if (walletStatus === WalletStatus.Connecting) {
    return qrState === State.Init ? "connecting" : "qrCode";
  }

  if (walletStatus === WalletStatus.Connected) {
    if (hasOneClickTradingError) return "initializeOneClickTradingError";
    if (isInitializingOneClickTrading) {
      return hasBroadcastedTx
        ? "broadcastedOneClickTrading"
        : "initializingOneClickTrading";
    }
    return "connected";
  }

  if (walletStatus === WalletStatus.Error) {
    return qrState === State.Init ? "error" : "qrCode";
  }

  if (walletStatus === WalletStatus.Rejected) {
    return "rejected";
  }

  if (walletStatus === WalletStatus.NotExist) {
    return "doesNotExist";
  }

  return "list";
}

export type OnConnectWallet = (
  params:
    | {
        walletType: "cosmos";
        wallet: CosmosRegistryWallet | ChainWalletBase | undefined;
      }
    | {
        walletType: "evm";
        wallet: Connector;
        chainId?: EthereumChainIds;
      }
) => void;
