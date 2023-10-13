import { ITxStatusReceiver, ITxStatusSource } from "@osmosis-labs/stores";
import { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { IS_TESTNET } from "~/config";
import { BridgeTransferStatusError } from "~/integrations/bridges/errors";
import { SquidBridgeProvider } from "~/integrations/bridges/squid/squid-bridge-provider";
import { BridgeTransferStatus } from "~/integrations/bridges/types";
import { poll } from "~/utils/promise";

/** Tracks (polls squid endpoint) and reports status updates on Axelar bridge transfers. */
export class SquidTransferStatusSource implements ITxStatusSource {
  readonly keyPrefix = SquidBridgeProvider.providerName.toLowerCase();
  readonly sourceDisplayName = "Squid Bridge";
  public statusReceiverDelegate?: ITxStatusReceiver;

  private squidProvider: SquidBridgeProvider;

  constructor() {
    this.squidProvider = new SquidBridgeProvider(
      process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID!,
      {
        env: IS_TESTNET ? "testnet" : "mainnet",
        cache: new LRUCache<string, CacheEntry>({ max: 10 }),
      }
    );
  }

  /** Request to start polling a new transaction. */
  trackTxStatus(txHash: string): void {
    poll({
      fn: async () => {
        try {
          return this.squidProvider.getTransferStatus({ sendTxHash: txHash });
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
      .then((s) => this.receiveConclusiveStatus(s))
      .catch((e) => console.error(`Polling Squid has failed`, e));
  }

  receiveConclusiveStatus(txStatus: BridgeTransferStatus | undefined): void {
    if (txStatus && txStatus.id) {
      const { id, status, reason } = txStatus;
      this.statusReceiverDelegate?.receiveNewTxStatus(
        (this.keyPrefix + id).toLowerCase(),
        status,
        reason
      );
    } else {
      console.error(
        "Squid transfer finished poll but neither succeeded or failed"
      );
    }
  }

  makeExplorerUrl(key: string): string {
    return `${this.squidProvider.squidScanBaseUrl}/gmp/${key}`;
  }
}
