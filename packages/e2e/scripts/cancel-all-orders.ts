/**
 * @file cancel-all-orders.ts
 * @description CLI script that cancels all active limit orders for a test account on Osmosis mainnet.
 *
 * Derives the wallet address from the provided private key, fetches all open/partially-filled
 * limit orders via the SQS API, and broadcasts batch cancel transactions on-chain.
 *
 * Two-phase approach per round:
 *   Phase 1 — Claim: batch-claim partially filled orders so their filled portion is returned.
 *             Fully-filled orders are removed from the contract after claiming.
 *   Phase 2 — Cancel: re-fetch remaining orders and batch-cancel them.
 *             After claiming, all remaining orders are "open" and safe to cancel.
 *
 * Claims and cancels are kept in SEPARATE transactions because the on-chain contract
 * removes fully-filled orders after claiming, which would cause a cancel_limit in the
 * same atomic tx to fail with "Order not found" and revert the entire batch.
 *
 * Retries up to 3 rounds to handle cases where transactions partially fail.
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
import type { ExecuteInstruction } from "@cosmjs/cosmwasm-stargate";
import type { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import {
  CANCEL_BATCH_SIZE,
  CANCEL_GAS_MULTIPLIER,
  OSMOSIS_RPC,
  SQS_BASE_URL,
  buildCancelMessages,
  buildClaimMessages,
  chunk,
  createSigningClient,
  deriveAddress,
  fetchActiveOrders,
} from "../utils/order-utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MAX_ROUNDS = 3;

/**
 * Broadcast batches of messages, logging progress. Returns the number of
 * messages successfully broadcast.
 */
async function executeBatches(
  client: SigningCosmWasmClient,
  address: string,
  batches: ExecuteInstruction[][],
  label: string
): Promise<number> {
  let completed = 0;
  const totalMsgs = batches.reduce((n, b) => n + b.length, 0);

  for (const [i, batch] of batches.entries()) {
    const batchStart = i * CANCEL_BATCH_SIZE + 1;
    const batchEnd = Math.min(batchStart + CANCEL_BATCH_SIZE - 1, totalMsgs);

    try {
      const result = await client.executeMultiple(
        address,
        batch,
        CANCEL_GAS_MULTIPLIER
      );
      completed += batch.length;
      console.log(
        `  ✅ ${label} ${completed}/${totalMsgs} done. TXID: ${result.transactionHash}`
      );
    } catch (err) {
      console.error(
        `  ❌ ${label} batch ${i + 1} failed (orders ${batchStart}-${batchEnd}):`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return completed;
}

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

  const client = isDryRun ? null : await createSigningClient(wallet);

  let totalFoundOnFirstRound = 0;

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    console.log(`Round ${round}/${MAX_ROUNDS}:`);
    console.log(`  Finding open orders for account ${address}...`);

    let orders = await fetchActiveOrders(address);

    if (orders.length === 0) {
      console.log(
        round === 1
          ? "  No active orders found. Nothing to cancel."
          : `  All orders successfully closed.`
      );
      return;
    }

    if (round === 1) totalFoundOnFirstRound = orders.length;

    console.log(
      `  ${orders.length} order${orders.length === 1 ? "" : "s"} found.`
    );

    if (isDryRun) {
      orders.forEach((order) => {
        console.log(
          `    - order_id=${order.order_id}, tick_id=${order.tick_id}, ` +
            `status=${order.status}, orderbook=${order.orderbookAddress}`
        );
      });
      console.log("  Skipping actual transactions (dry run).");
      console.log(
        "\n  Remove DRY_RUN=true (or set it to false) to send real transactions."
      );
      return;
    }

    // --- Phase 1: Claim partially/fully filled orders ---
    const claimMsgs = buildClaimMessages(orders);
    if (claimMsgs.length > 0) {
      console.log(
        `  Phase 1: Claiming ${claimMsgs.length} filled order${claimMsgs.length === 1 ? "" : "s"}...`
      );
      const claimBatches = chunk(claimMsgs, CANCEL_BATCH_SIZE);
      await executeBatches(client!, address, claimBatches, "Claim");

      // Re-fetch: fully-filled orders are gone after claiming, rest are now open
      orders = await fetchActiveOrders(address);
      if (orders.length === 0) {
        console.log("  All orders were fully filled and claimed. Done.");
        return;
      }
      console.log(
        `  ${orders.length} order${orders.length === 1 ? "" : "s"} remaining after claims.`
      );
    }

    // --- Phase 2: Cancel remaining orders ---
    const cancelMsgs = buildCancelMessages(orders);
    console.log(
      `  Phase 2: Cancelling ${cancelMsgs.length} order${cancelMsgs.length === 1 ? "" : "s"}...`
    );
    const cancelBatches = chunk(cancelMsgs, CANCEL_BATCH_SIZE);
    await executeBatches(client!, address, cancelBatches, "Cancel");

    // Check what's left
    const remaining = await fetchActiveOrders(address);

    if (remaining.length === 0) {
      console.log("  All orders successfully closed.");
      return;
    }

    if (round < MAX_ROUNDS) {
      console.log(
        `  ${remaining.length} order${remaining.length === 1 ? "" : "s"} still open. Retrying...\n`
      );
    } else {
      console.error(
        `\n❌ ${remaining.length} of ${totalFoundOnFirstRound} order${remaining.length === 1 ? "" : "s"} could not be closed after ${MAX_ROUNDS} rounds.`
      );
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
