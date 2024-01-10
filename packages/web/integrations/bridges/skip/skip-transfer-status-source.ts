import { ITxStatusReceiver, ITxStatusSource } from "@osmosis-labs/stores";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { IS_TESTNET } from "~/config";
import { BridgeTransferStatusError } from "~/integrations/bridges/errors";
import { SkipBridgeProvider } from "~/integrations/bridges/skip/skip-bridge-provider";
import {
  BridgeTransferStatus,
  GetTransferStatusParams,
} from "~/integrations/bridges/types";
import { poll } from "~/utils/promise";

/** Tracks (polls skip endpoint) and reports status updates on Skip bridge transfers. */
export class SkipTransferStatusSource implements ITxStatusSource {
  readonly keyPrefix = SkipBridgeProvider.providerName.toLowerCase();

  sourceDisplayName = "Skip Bridge";

  statusReceiverDelegate?: ITxStatusReceiver | undefined;

  private skipProvider: SkipBridgeProvider;
  private axelarScanBaseUrl:
    | "https://axelarscan.io"
    | "https://testnet.axelarscan.io";

  constructor() {
    this.skipProvider = new SkipBridgeProvider({
      env: IS_TESTNET ? "testnet" : "mainnet",
      cache: new LRUCache<string, CacheEntry>({ max: 10 }),
    });

    this.axelarScanBaseUrl = IS_TESTNET
      ? "https://testnet.axelarscan.io"
      : "https://axelarscan.io";
  }

  trackTxStatus(serializedParams: string): void {
    const { sendTxHash, fromChainId, toChainId } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;

    const snapshotKey = `${this.keyPrefix}${serializedParams}`;

    poll({
      fn: async () => {
        try {
          return this.skipProvider.getTransferStatus({
            sendTxHash,
            fromChainId,
            toChainId,
          });
        } catch (e) {
          if (e instanceof BridgeTransferStatusError) {
            throw new Error(e.errors.map((err) => err.message).join(", "));
          }
        }
      },
      validate: (incomingStatus) => {
        if (!incomingStatus) {
          return false;
        }

        return incomingStatus.status !== "pending";
      },
      interval: 30_000,
      maxAttempts: undefined, // unlimited attempts while tab is open or until success/fail
    })
      .then((s) => this.receiveConclusiveStatus(snapshotKey, s))
      .catch((e) => console.error(`Polling Skip has failed`, e));
  }

  makeExplorerUrl(serializedParams: string): string {
    const { sendTxHash } = JSON.parse(
      serializedParams
    ) as GetTransferStatusParams;

    return `${this.axelarScanBaseUrl}/gmp/${sendTxHash}`;
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
        "Skip transfer finished poll but neither succeeded or failed"
      );
    }
  }
}
