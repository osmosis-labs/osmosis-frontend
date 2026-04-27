/**
 * @file get-active-orders.ts
 * @description Read-only CLI script that lists all active limit orders for a test account.
 *
 * Derives the wallet address from the provided private key and prints a human-readable
 * summary of all open/partially-filled limit orders to stdout. No transactions are sent.
 * Safe to run at any time without any risk of modifying on-chain state.
 *
 * @requires PRIVATE_KEY - Hex-encoded secp256k1 private key (with or without 0x prefix).
 * @requires ACCOUNT_LABEL - (optional) Human-readable label for log output (e.g. "Monitoring EU").
 *
 * Usage (from packages/e2e/):
 *   npx tsx scripts/get-active-orders.ts
 *
 * With a .env file:
 *   Add PRIVATE_KEY=<hex> to packages/e2e/.env, then run the command above.
 *
 * On PowerShell (override without .env):
 *   $env:PRIVATE_KEY="<hex>"; npx tsx scripts/get-active-orders.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { SQS_BASE_URL, deriveAddress, fetchActiveOrders } from "../utils/order-utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * Main entrypoint. Derives the account address, fetches active orders, and prints them.
 * Exits with code 1 if the PRIVATE_KEY env var is missing.
 */
async function main(): Promise<void> {
  const privateKey = process.env.PRIVATE_KEY;
  const label = process.env.ACCOUNT_LABEL;

  if (!privateKey || privateKey === "private_key") {
    console.error("❌ PRIVATE_KEY environment variable is not set.");
    console.error("   Add it to packages/e2e/.env or set it in your shell.");
    process.exit(1);
  }

  const header = label ? `Active Orders: ${label}` : "Active Orders";
  console.log(`\n=== ${header} ===`);

  const { address } = await deriveAddress(privateKey);
  console.log(`Derived address: ${address}`);
  console.log(`SQS endpoint: ${SQS_BASE_URL}\n`);

  console.log(`Fetching active orders for ${address}...`);
  const orders = await fetchActiveOrders(address);

  if (orders.length === 0) {
    console.log("No active orders found.");
    return;
  }

  console.log(`${orders.length} active order${orders.length === 1 ? "" : "s"} found:\n`);

  orders.forEach((order, i) => {
    const pairLabel =
      order.base_asset?.symbol && order.quote_asset?.symbol
        ? `${order.base_asset.symbol}/${order.quote_asset.symbol}`
        : "unknown pair";

    console.log(
      `  #${i + 1}  order_id=${order.order_id}  tick_id=${order.tick_id}  direction=${order.order_direction}  status=${order.status}`
    );
    console.log(`      pair: ${pairLabel}  price: $${order.price}`);
    console.log(
      `      quantity: ${order.quantity}  placed: ${order.placed_quantity}  filled: ${order.percentFilled}%`
    );
    console.log(`      orderbook: ${order.orderbookAddress}`);
    console.log();
  });
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
