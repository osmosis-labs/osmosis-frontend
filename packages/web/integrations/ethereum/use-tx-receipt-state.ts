import { useEffect, useState } from "react";

import { EthWallet } from "./types";

export function useTxReceiptState(client: EthWallet): {
  isEthTxPending: boolean;
} {
  const [isEthTxPending, setIsEthTxPending] = useState(false);

  useEffect(() => {
    const handlePending = () => setIsEthTxPending(true);
    const handleResolved = () => setIsEthTxPending(false);
    client.txStatusEventEmitter?.on("pending", handlePending);
    client.txStatusEventEmitter?.on("confirmed", handleResolved);
    client.txStatusEventEmitter?.on("failed", handleResolved);

    return () => {
      client.txStatusEventEmitter?.removeListener("pending", handlePending);
      client.txStatusEventEmitter?.removeListener("confirmed", handleResolved);
      client.txStatusEventEmitter?.removeListener("failed", handleResolved);
    };
  }, [client]);

  return { isEthTxPending };
}
