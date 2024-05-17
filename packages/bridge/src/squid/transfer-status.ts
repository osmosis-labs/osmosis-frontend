import { StatusResponse } from "@0xsquid/sdk";
import { apiClient, ApiClientError, poll } from "@osmosis-labs/utils";

import { BridgeError, BridgeTransferStatusError } from "../errors";
import type {
  BridgeEnvironment,
  BridgeTransferStatus,
  GetTransferStatusParams,
  TransferStatusProvider,
  TransferStatusReceiver,
} from "../interface";
import { squidProviderId } from ".";

/** Tracks (polls squid endpoint) and reports status updates on Squid bridge transfers. */
export class SquidTransferStatusProvider implements TransferStatusProvider {
  readonly keyPrefix = squidProviderId;
  readonly sourceDisplayName = "Squid Bridge";

  public statusReceiverDelegate?: TransferStatusReceiver;

  readonly apiUrl: string;
  readonly squidScanBaseUrl: string;

  constructor(env: BridgeEnvironment) {
    this.apiUrl =
      env === "mainnet"
        ? "https://api.0xsquid.com"
        : "https://testnet.api.squidrouter.com";
    this.squidScanBaseUrl =
      env === "mainnet"
        ? "https://axelarscan.io"
        : "https://testnet.axelarscan.io";
  }

  /** Request to start polling a new transaction. */
  trackTxStatus(serializedParams: string): void {
    const { sendTxHash, fromChainId, toChainId } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;
    const snapshotKey = `${this.keyPrefix}${serializedParams}`;
    poll({
      fn: async () => {
        try {
          const url = new URL(`${this.apiUrl}/v1/status`);
          url.searchParams.append("transactionId", sendTxHash);
          if (fromChainId) {
            url.searchParams.append("fromChainId", fromChainId.toString());
          }
          if (toChainId) {
            url.searchParams.append("toChainId", toChainId.toString());
          }

          const data = await apiClient<StatusResponse>(url.toString());

          if (!data || !data.id || !data.squidTransactionStatus) {
            return;
          }

          const squidTransactionStatus = data.squidTransactionStatus as
            | "success"
            | "needs_gas"
            | "ongoing"
            | "partial_success"
            | "not_found";

          if (
            squidTransactionStatus === "not_found" ||
            squidTransactionStatus === "ongoing" ||
            squidTransactionStatus === "partial_success"
          ) {
            return;
          }

          return {
            id: sendTxHash,
            status: squidTransactionStatus === "success" ? "success" : "failed",
            reason:
              squidTransactionStatus === "needs_gas"
                ? "insufficientFee"
                : undefined,
          } as BridgeTransferStatus;
        } catch (e) {
          const error = e as ApiClientError<{
            errors: { errorType?: string; message?: string }[];
          }>;

          throw new BridgeTransferStatusError(
            error.data?.errors?.map(
              ({ errorType, message }) =>
                ({
                  errorType: errorType ?? BridgeError.UnexpectedError,
                  message: message ?? "",
                } ?? [
                  {
                    errorType: BridgeError.UnexpectedError,
                    message: "Failed to fetch transfer status",
                  },
                ])
            )
          );
        }
      },
      validate: (incomingStatus) => incomingStatus !== undefined,
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .catch((e) => console.error(`Polling Squid has failed`, e))
      .then((s) => {
        if (s) this.receiveConclusiveStatus(snapshotKey, s);
      });
  }

  receiveConclusiveStatus(
    key: string,
    txStatus: BridgeTransferStatus | undefined
  ): void {
    if (txStatus && txStatus.id) {
      const { status, reason } = txStatus;
      this.statusReceiverDelegate?.receiveNewTxStatus(key, status, reason);
    } else {
      console.error(
        "Squid transfer finished poll but neither succeeded or failed"
      );
    }
  }

  makeExplorerUrl(serializedParams: string): string {
    const { sendTxHash } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;
    return `${this.squidScanBaseUrl}/gmp/${sendTxHash}`;
  }
}
