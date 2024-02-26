import { StatusResponse } from "@0xsquid/sdk";
import { ITxStatusReceiver, ITxStatusSource } from "@osmosis-labs/stores";
import { apiClient, ApiClientError } from "@osmosis-labs/utils";

import { BridgeTransferStatusError } from "~/integrations/bridges/errors";
import type {
  BridgeProviderContext,
  BridgeTransferStatus,
  GetTransferStatusParams,
} from "~/integrations/bridges/types";
import { ErrorTypes } from "~/utils/error-types";
import { poll } from "~/utils/promise";

// TODO: move to types file
const providerName = "Squid" as const;

/** Tracks (polls squid endpoint) and reports status updates on Squid bridge transfers. */
export class SquidTransferStatusSource implements ITxStatusSource {
  readonly keyPrefix = providerName;
  readonly sourceDisplayName = "Squid Bridge";
  public statusReceiverDelegate?: ITxStatusReceiver;
  readonly apiURL:
    | "https://api.0xsquid.com"
    | "https://testnet.api.squidrouter.com";
  readonly squidScanBaseUrl:
    | "https://axelarscan.io"
    | "https://testnet.axelarscan.io";

  constructor(env: BridgeProviderContext["env"]) {
    this.apiURL =
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
          const url = new URL(`${this.apiURL}/v1/status`);
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
                  errorType: errorType ?? ErrorTypes.UnexpectedError,
                  message: message ?? "",
                } ?? [
                  {
                    errorType: ErrorTypes.UnexpectedError,
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
