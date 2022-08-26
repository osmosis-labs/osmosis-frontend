import { useEffect } from "react";
import {
  displayToast as do_displayToast,
  ToastType,
} from "../components/alert";
import { Client, GeneralTxEvent } from "./wallets";

/** Displays toasts messages for a non-inter chain client. Presents block explorer urls. */
export function useTxEventToasts(client?: Client) {
  useEffect(() => {
    const displayToast = (status: GeneralTxEvent, txHash?: string) =>
      do_displayToast(
        {
          message:
            status === "pending"
              ? "Transaction Broadcasting"
              : status === "confirmed"
              ? "Transaction Successful"
              : "Transaction Failed",
          caption:
            status === "pending"
              ? "Waiting for transaction to be included in the block"
              : undefined,
          learnMoreUrl:
            (status === "confirmed" || status === "failed") && txHash
              ? client?.makeExplorerUrl?.(txHash)
              : undefined,
        },
        status === "pending"
          ? ToastType.LOADING
          : status === "confirmed"
          ? ToastType.SUCCESS
          : ToastType.ERROR
      );

    const handlePending = (txHash: string | undefined) =>
      displayToast("pending", txHash);
    const handleConfirmed = (txHash: string | undefined) =>
      displayToast("confirmed", txHash);
    const handleFailed = (txHash: string | undefined) =>
      displayToast("failed", txHash);
    client?.txStatusEventEmitter?.on("pending", handlePending);
    client?.txStatusEventEmitter?.on("confirmed", handleConfirmed);
    client?.txStatusEventEmitter?.on("failed", handleFailed);

    return () => {
      client?.txStatusEventEmitter?.removeListener("pending", handlePending);
      client?.txStatusEventEmitter?.removeListener(
        "confirmed",
        handleConfirmed
      );
      client?.txStatusEventEmitter?.removeListener("failed", handleFailed);
    };
  }, [client]);
}
