import { State, WalletStatus } from "@cosmos-kit/core";
import {
  isAccountNotFoundError,
  isInsufficientFeeError,
} from "@osmosis-labs/tx";

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
  | "initializeOneClickTradingError"
  | "initializeOneClickTradingErrorInsufficientFee";

export function getModalView({
  qrState,
  isInitializingOneClickTrading,
  oneClickTradingError,
  hasBroadcastedTx,
  walletStatus,
}: {
  qrState: State;
  isInitializingOneClickTrading: boolean;
  oneClickTradingError: Error | null;
  hasBroadcastedTx: boolean;
  walletStatus?: WalletStatus;
}): ModalView {
  if (walletStatus === WalletStatus.Connecting) {
    return qrState === State.Init ? "connecting" : "qrCode";
  }

  if (walletStatus === WalletStatus.Connected) {
    if (!!oneClickTradingError) {
      if (
        isAccountNotFoundError(oneClickTradingError.message) ||
        isInsufficientFeeError(oneClickTradingError.message)
      ) {
        return "initializeOneClickTradingErrorInsufficientFee";
      }
      return "initializeOneClickTradingError";
    }
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
