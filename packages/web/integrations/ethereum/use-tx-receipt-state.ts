import { useEffect, useState } from "react";

import { EthWallet } from "~/integrations/ethereum/types";

export function useTxReceiptState(client: EthWallet): {
  isEthTxPending: boolean;
  currentTxHash: string | undefined;
} {
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>();
  const [isEthTxPending, setIsEthTxPending] = useState(false);

  useEffect(() => {
    const handlePending = (txHash: string) => {
      setCurrentTxHash(txHash);
      setIsEthTxPending(true);
    };
    const handleResolved = () => {
      setCurrentTxHash(undefined);
      setIsEthTxPending(false);
    };
    client.txStatusEventEmitter?.on("pending", handlePending);
    client.txStatusEventEmitter?.on("confirmed", handleResolved);
    client.txStatusEventEmitter?.on("failed", handleResolved);

    return () => {
      client.txStatusEventEmitter?.removeListener("pending", handlePending);
      client.txStatusEventEmitter?.removeListener("confirmed", handleResolved);
      client.txStatusEventEmitter?.removeListener("failed", handleResolved);
    };
  }, [client]);

  return { isEthTxPending, currentTxHash };
}
