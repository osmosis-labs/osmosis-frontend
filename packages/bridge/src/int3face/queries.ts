
export enum Int3faceTransferStatus {
  TRANSACTION_STATUS_UNSPECIFIED = 'TRANSACTION_STATUS_UNSPECIFIED',
  TRANSACTION_STATUS_PENDING = 'TRANSACTION_STATUS_PENDING',
  TRANSACTION_STATUS_FAILED = 'TRANSACTION_STATUS_FAILED',
  TRANSACTION_STATUS_FINALIZED = 'TRANSACTION_STATUS_FINALIZED',
}

interface TransferStatusResponse {
  "id": string,
  "externalId": string,
  "externalHeight": string,
  "blockTime": string,
  "txHash": string,
  "sender": string,
  "destAddr": string,
  "destChainId": string,
  "srcChainId": string,
  "assetId": string,
  "amount": string,
  "status": Int3faceTransferStatus,
  "crosschain": {
    "indexedAt": string
  }
}

export async function getTransferStatus(
  sendTxHash: string,
  env: "testnet" | "mainnet",
): Promise<TransferStatusResponse | null> {
  try {
    // Todo: check origin
    const origin = env === 'testnet' ? 'https://api.testnet.int3face.zone/int3face/bridge' : 'https://api.mainnet.int3face.zone/int3face/bridge'

    // Todo: update url when BE is ready
    const url = new URL("/be-in-progress", origin);
    url.searchParams.set("external_id", sendTxHash);

    // return apiClient<TransferStatusResponse>(url.toString());

    return null
  } catch {
    console.error("Failed to fetch transfer status for tx hash: ", sendTxHash);
    return null;
  }
}