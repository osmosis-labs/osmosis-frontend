import { apiClient } from "@osmosis-labs/utils";

export enum Int3faceTransferStatus {
  TRANSFER_STATUS_UNSPECIFIED = "TRANSFER_STATUS_UNSPECIFIED",
  TRANSFER_STATUS_PENDING = "TRANSFER_STATUS_PENDING",
  TRANSFER_STATUS_FAILED = "TRANSFER_STATUS_FAILED",
  TRANSFER_STATUS_FINALIZED = "TRANSFER_STATUS_FINALIZED",
}

interface TransferStatusResponse {
  transfer: {
    amount: string;
    assetId: {
      sourceChain: string;
      denom: string;
    };
    bridgingFee: string;
    creationBlockTime: string;
    destAddr: string;
    destChainId: string;
    srcChainId: string;
    status: Int3faceTransferStatus;
    transferId: string;
  };
}

export async function getTransferStatus(
  sendTxHash: string,
  env: "testnet" | "mainnet",
  transferId: string
): Promise<TransferStatusResponse | null> {
  const origin =
    env === "testnet"
      ? "https://cachehub.testnet.int3face.zone"
      : "https://cachehub.int3face.zone";

  const url = new URL(`/v2/transfers/${transferId}`, origin);

  return apiClient<TransferStatusResponse>(url.toString()).catch(() => {
    console.error("Failed to fetch transfer status for tx hash: ", sendTxHash);
    return null;
  });
}

interface CanTransferResponse {
  can_transfer: boolean;
  reason: string;
}

const denomOfInt3face: Record<string, string> = {
  DOGE: "dogecoin-doge",
  SOL: "solana-sol",
  LTC: "litecoin-ltc",
  BTC: "bitcoin-btc",
  BCH: "bitcoin-cash-bch",
  XRP: "xrpl-xrp",
  TON: "ton-ton",
}

export async function checkCanTransfer(
    srcChainId: string | number,
    destChainId: string | number,
    assetId: string,
    env: "testnet" | "mainnet"
): Promise<CanTransferResponse> {
  let srcChainIdConverted;

  if (typeof srcChainId === "string" && srcChainId.startsWith("osmosis")) {
    srcChainIdConverted = "osmosis";
  } else {
    srcChainIdConverted = srcChainId.toString();
  }

  const origin =
    env === "mainnet"
      ? "https://api.mainnet.int3face.zone/int3face"
      : "https://api.testnet.int3face.zone/int3face";

  const url = new URL(
    `/bridge/v1beta1/can-transfer/${srcChainIdConverted}/${destChainId}/${denomOfInt3face[assetId]}`,
    origin
  );

  return apiClient<CanTransferResponse>(url.toString());
}
