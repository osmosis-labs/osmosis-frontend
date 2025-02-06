import { queryRPCStatus, QueryStatusResponse } from "@osmosis-labs/server";

export type StatusHandler = (
  status: QueryStatusResponse,
  avgBlockTimeMs: number
) => void;

/** Polls a `/status` endpoint publishes to an arbitrary set of subscribers. */
export class PollingStatusSubscription {
  protected _subscriptionCount: number = 0;

  protected _handlers: StatusHandler[] = [];

  constructor(
    protected readonly rpc: string,
    protected readonly defaultBlockTimeMs = 7500
  ) {}

  get subscriptionCount(): number {
    return this._subscriptionCount;
  }

  /**
   * @param handler
   * @return unsubscriber
   */
  subscribe(handler: StatusHandler): () => void {
    this._handlers.push(handler);

    this.increaseSubscriptionCount();

    return () => {
      this._handlers = this._handlers.filter((h) => h !== handler);
      this.decreaseSubscriptionCount();
    };
  }

  protected async startSubscription() {
    let timeoutId: NodeJS.Timeout | undefined;
    while (this._subscriptionCount > 0) {
      try {
        const status = await queryRPCStatus({ restUrl: this.rpc });
        const blockTime = calcAverageBlockTimeMs(
          status,
          this.defaultBlockTimeMs
        );
        this._handlers.forEach((handler) => handler(status, blockTime));
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, blockTime);
        });
      } catch (e: any) {
        console.error(`Failed to fetch /status: ${e}`);
      }
    }
    if (timeoutId) clearTimeout(timeoutId);
  }

  protected increaseSubscriptionCount() {
    this._subscriptionCount++;

    if (this._subscriptionCount === 1) {
      // No need to await
      this.startSubscription();
    }
  }

  protected decreaseSubscriptionCount() {
    this._subscriptionCount--;
  }
}

/**
 * Estimate block height by the average UTC time difference of the latest blocks in sync info.
 * The estimate is a rough estimate from the latest and earliest block times in sync info, so it may
 * not be fully up to date if block time changes.
 *
 * Prefers returning defaults vs throwing errors.
 *
 * Returns the default block time if the calculated block time is unexpected or unreasonable.
 */
export function calcAverageBlockTimeMs(
  status: QueryStatusResponse,
  defaultBlockTimeMs = 7500
) {
  if (status.result.sync_info.catching_up) {
    return defaultBlockTimeMs;
  }

  try {
    const latestBlockHeight = parseInt(
      status.result.sync_info.latest_block_height
    );
    const earliestBlockHeight = parseInt(
      status.result.sync_info.earliest_block_height
    );

    if (isNaN(latestBlockHeight) || isNaN(earliestBlockHeight)) {
      return defaultBlockTimeMs;
    }

    // prevent division by zero
    if (latestBlockHeight <= earliestBlockHeight) {
      return defaultBlockTimeMs;
    }

    const latestBlockTime = new Date(
      status.result.sync_info.latest_block_time
    ).getTime();
    const earliestBlockTime = new Date(
      status.result.sync_info.earliest_block_time
    ).getTime();

    const avg = Math.ceil(
      (latestBlockTime - earliestBlockTime) /
        (latestBlockHeight - earliestBlockHeight)
    );

    // validate block time if for some reason a large or small block time is calculated
    if (avg < 200 || avg > 15_000) {
      return defaultBlockTimeMs;
    }
    return avg;
  } catch {
    return defaultBlockTimeMs;
  }
}
