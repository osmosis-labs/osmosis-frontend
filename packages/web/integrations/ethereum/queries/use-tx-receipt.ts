import { useState, useEffect } from "react";
import { poll } from "../../../components/utils";
import { SendFn } from "../types";

type ReceiptStatus = "confirmed" | "pending" | "failed";

export function useTransactionReceipt(
  sendFn: SendFn,
  txHash?: string
): { status: ReceiptStatus | undefined; trackTx: (txHash: string) => void } {
  const [receivedTxHash, setReceivedTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<ReceiptStatus | null>(null);

  useEffect(() => {
    const hash = txHash || receivedTxHash;
    if (hash) {
      poll<unknown>({
        fn: () =>
          sendFn({ method: "eth_getTransactionReceipt", params: [hash] }),
        validate: (data: unknown) => {
          if (status !== "pending") {
            setStatus("pending");
          }
          return data !== null;
        },
        interval: 5_000,
      }).then(() => setStatus("confirmed"));
    }
  }, [sendFn, txHash, status, setStatus, receivedTxHash]);

  return { status: status || undefined, trackTx: setReceivedTxHash };
}
