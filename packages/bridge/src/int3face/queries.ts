import { apiClient } from "@osmosis-labs/utils";

export enum Int3faceTransferStatus {
  TRANSACTION_STATUS_UNSPECIFIED = "TRANSACTION_STATUS_UNSPECIFIED",
  TRANSACTION_STATUS_PENDING = "TRANSACTION_STATUS_PENDING",
  TRANSACTION_STATUS_FAILED = "TRANSACTION_STATUS_FAILED",
  TRANSACTION_STATUS_FINALIZED = "TRANSACTION_STATUS_FINALIZED",
}

interface TransferStatusResponse {
  id: string;
  externalId: string;
  externalHeight: string;
  blockTime: string;
  txHash: string;
  sender: string;
  destAddr: string;
  destChainId: string;
  srcChainId: string;
  asset: {
    denom: string;
    sourceChain: string;
  };
  amount: string;
  status: Int3faceTransferStatus;
}

export async function getTransferStatus(
  sendTxHash: string,
  env: "testnet" | "mainnet",
  transferId: string
): Promise<TransferStatusResponse | null> {
  try {
    const origin =
      env === "testnet"
        ? "https://cachehub.testnet.int3face.zone"
        : "https://cachehub.int3face.zone";

    const url = new URL(`/v1/transfers/crosschain/${transferId}`, origin);

    return apiClient<TransferStatusResponse>(url.toString());
  } catch {
    console.error("Failed to fetch transfer status for tx hash: ", sendTxHash);
    return null;
  }
}
