import { ITxStatusReceiver, ITxStatusSource } from "@osmosis-labs/stores";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { IS_TESTNET } from "~/config";
import { AxelarBridgeProvider } from "~/integrations/bridges/axelar/axelar-bridge-provider";
import { BridgeTransferStatusError } from "~/integrations/bridges/errors";
import {
  BridgeTransferStatus,
  GetTransferStatusParams,
} from "~/integrations/bridges/types";
import { poll } from "~/utils/promise";

/** Tracks (polls Axelar endpoint) and reports status updates on Axelar bridge transfers. */
export class AxelarTransferStatusSource implements ITxStatusSource {
  readonly keyPrefix = AxelarBridgeProvider.providerName.toLowerCase();
  readonly sourceDisplayName = "Axelar Bridge";
  public statusReceiverDelegate?: ITxStatusReceiver;

  private axelarProvider: AxelarBridgeProvider;

  constructor() {
    this.axelarProvider = new AxelarBridgeProvider({
      env: IS_TESTNET ? "testnet" : "mainnet",
      cache: new LRUCache<string, CacheEntry>({ max: 10 }),
    });
  }

  /** Request to start polling a new transaction. */
  trackTxStatus(serializedParamsOrHash: string): void {
    const txHash = serializedParamsOrHash.startsWith("{")
      ? (JSON.parse(serializedParamsOrHash) as GetTransferStatusParams)
          .sendTxHash
      : serializedParamsOrHash;

    const snapshotKey = `${this.keyPrefix}${serializedParamsOrHash}`;

    poll({
      fn: async () => {
        try {
          return this.axelarProvider.getTransferStatus({ sendTxHash: txHash });
        } catch (e) {
          if (e instanceof BridgeTransferStatusError) {
            throw new Error(e.errors.map((err) => err.message).join(", "));
          }
        }
      },
      validate: (incomingStatus) => incomingStatus !== undefined,
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => this.receiveConclusiveStatus(snapshotKey, s))
      .catch((e) => console.error(`Polling Squid has failed`, e));
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

  makeExplorerUrl(serializedParamsOrKey: string): string {
    const txHash = serializedParamsOrKey.startsWith("{")
      ? (JSON.parse(serializedParamsOrKey) as GetTransferStatusParams)
          .sendTxHash
      : serializedParamsOrKey;
    return `${this.axelarProvider.axelarScanBaseUrl}/transfer/${txHash}`;
  }
}
