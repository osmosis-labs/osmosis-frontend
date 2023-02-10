import { useCallback, useEffect, useMemo } from "react";

import { displayToast as _displayToast, ToastType } from "../components/alert";
import { GeneralTxEvent, Wallet } from "./wallets";

/** Displays toasts messages for a non-inter chain client. Presents block explorer urls.
 *  @param client Memoized ref to client.
 */
export function useTxEventToasts(
  client?: Pick<Wallet, "txStatusEventEmitter" | "makeExplorerUrl">
) {
  const displayToast = useCallback(
    (status: GeneralTxEvent, txHash?: string) =>
      _displayToast(
        {
          message:
            status === "pending"
              ? "transactionBroadcasting"
              : status === "confirmed"
              ? "transactionSuccessful"
              : "transactionFailed",
          caption: status === "pending" ? "waitingForTransaction" : undefined,
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
      ),
    [client?.makeExplorerUrl]
  );

  const { handlePending, handleConfirmed, handleFailed } = useMemo(
    () => ({
      handlePending: (txHash: string | undefined) =>
        displayToast("pending", txHash),
      handleConfirmed: (txHash: string | undefined) =>
        displayToast("confirmed", txHash),
      handleFailed: (txHash: string | undefined) =>
        displayToast("failed", txHash),
    }),
    [displayToast]
  );

  // add event listeners
  useEffect(() => {
    if (
      client?.txStatusEventEmitter?.listeners("pending").length === 0 &&
      client?.txStatusEventEmitter?.listeners("confirmed").length === 0 &&
      client?.txStatusEventEmitter?.listeners("failed").length === 0
    ) {
      client?.txStatusEventEmitter?.on("pending", handlePending);
      client?.txStatusEventEmitter?.on("confirmed", handleConfirmed);
      client?.txStatusEventEmitter?.on("failed", handleFailed);
    }
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
