/**
 * @file cancel-all-orders.ts
 * @description CLI script that cancels all active limit orders for a test account on Osmosis mainnet.
 *
 * Derives the wallet address from the provided private key, fetches all open/partially-filled
 * limit orders via the SQS API, and broadcasts batch cancel transactions on-chain.
 * Retries up to 3 rounds to handle cases where transactions partially fail or new orders appear.
 *
 * Supports a DRY_RUN mode that prints what would be cancelled without sending any transactions.
 * Use this locally to verify behaviour before triggering the real workflow on GitHub Actions.
 *
 * @requires PRIVATE_KEY   - Hex-encoded secp256k1 private key (with or without 0x prefix).
 * @requires ACCOUNT_LABEL - (optional) Human-readable label for log output (e.g. "Monitoring EU").
 * @requires DRY_RUN       - (optional) Set to "true" to skip sending transactions.
 *
 * Usage (from packages/e2e/):
 *   npx tsx scripts/cancel-all-orders.ts
 *
 * Dry run (no transactions sent):
 *   On Mac/Linux: DRY_RUN=true npx tsx scripts/cancel-all-orders.ts
 *   On PowerShell: $env:DRY_RUN="true"; npx tsx scripts/cancel-all-orders.ts
 *
 * With a .env file:
 *   Add PRIVATE_KEY=<hex> and optionally DRY_RUN=true to packages/e2e/.env
 */

import * as dotenv from "dotenv";
import * as path from "path";
import {
  CANCEL_BATCH_SIZE,
  OSMOSIS_RPC,
  SQS_BASE_URL,
  buildCancelMessages,
  chunk,
  createSigningClient,
  deriveAddress,
  fetchActiveOrders,
} from "../utils/order-utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MAX_ROUNDS = 3;

/**
 * Main entrypoint. Runs up to MAX_ROUNDS of fetch-and-cancel until no open orders remain.
 * Exits with code 1 if orders remain after all rounds, or if a fatal error occurs.
 */
async function main(): Promise<void> {
  const privateKey = process.env.PRIVATE_KEY;
  const label = process.env.ACCOUNT_LABEL;
  const isDryRun = process.env.DRY_RUN === "true";

  if (!privateKey || privateKey === "private_key") {
    console.error("❌ PRIVATE_KEY environment variable is not set.");
    console.error("   Add it to packages/e2e/.env or set it in your shell.");
    process.exit(1);
  }

  const dryRunSuffix = isDryRun ? " [DRY RUN]" : "";
  const header = label
    ? `Cancel Open Limit Orders: ${label}${dryRunSuffix}`
    : `Cancel Open Limit Orders${dryRunSuffix}`;
  console.log(`\n=== ${header} ===`);

  const { wallet, address } = await deriveAddress(privateKey);
  console.log(`Derived address: ${address}`);
  console.log(`SQS endpoint: ${SQS_BASE_URL}`);
  console.log(`RPC endpoint: ${OSMOSIS_RPC}\n`);

  // Only create signing client when not in dry-run mode
  const client = isDryRun ? null : await createSigningClient(wallet);

  let totalCancelledAcrossRounds = 0;
  let totalFoundAcrossRounds = 0;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    console.log(`Round ${round}/${MAX_ROUNDS}:`);
    console.log(`  Finding open orders for account ${address}...`);

    const orders = await fetchActiveOrders(address);

    if (orders.length === 0) {
      if (round === 1) {
        console.log("  No active orders found. Nothing to cancel.");
      } else {
        console.log(
          `  No open orders. ${totalCancelledAcrossRounds} of ${totalFoundAcrossRounds} successfully cancelled.`
        );
      }
      return;
    }

    totalFoundAcrossRounds += orders.length;

    console.log(
      `  ${orders.length} order${orders.length === 1 ? "" : "s"} found.`
    );

    const batches = chunk(buildCancelMessages(orders), CANCEL_BATCH_SIZE);

    if (isDryRun) {
      console.log(
        `  [DRY RUN] Would cancel ${orders.length} order${orders.length === 1 ? "" : "s"} in ${batches.length} batch${batches.length === 1 ? "" : "es"}:`
      );
      orders.forEach((order) => {
        console.log(
          `    - order_id=${order.order_id}, tick_id=${order.tick_id}, orderbook=${order.orderbookAddress}`
        );
      });
      console.log("  Skipping actual cancellation (dry run).");
      console.log(
        "\n  Remove DRY_RUN=true (or set it to false) to send real transactions."
      );
      return;
    }

    console.log(
      `  Attempting to cancel orders 1-${orders.length} in ${batches.length} batch${batches.length === 1 ? "" : "es"}...`
    );

    let cancelledThisRound = 0;

    for (const [batchIndex, batch] of batches.entries()) {
      const batchStart = batchIndex * CANCEL_BATCH_SIZE + 1;
      const batchEnd = batchStart + batch.length - 1;

      try {
        const result = await client!.executeMultiple(address, batch, "auto");
        cancelledThisRound += batch.length;
        totalCancelledAcrossRounds += batch.length;
        console.log(
          `  ✅ ${cancelledThisRound} of ${orders.length} cancelled. TXID: ${result.transactionHash}`
        );
      } catch (err) {
        console.error(
          `  ❌ Failed to cancel batch ${batchIndex + 1} (orders ${batchStart}-${batchEnd}):`,
          err instanceof Error ? err.message : err
        );
      }
    }

    console.log("  Checking again...");

    const remaining = await fetchActiveOrders(address);

    if (remaining.length === 0) {
      console.log(
        `  No open orders. ${totalCancelledAcrossRounds} of ${totalFoundAcrossRounds} successfully cancelled.`
      );
      return;
    }

    if (round < MAX_ROUNDS) {
      console.log(
        `  ${remaining.length} order${remaining.length === 1 ? "" : "s"} still open. Retrying...\n`
      );
    } else {
      console.error(
        `\n❌ ${remaining.length} order${remaining.length === 1 ? "" : "s"} could not be cancelled after ${MAX_ROUNDS} rounds.`
      );
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
