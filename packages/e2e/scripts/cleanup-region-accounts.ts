/**
 * @file cleanup-region-accounts.ts
 * @description Empties the retired Monitoring US, EU and SG wallets into the
 * topup holding account.
 *
 * The production monitoring suites that used these wallets have been removed,
 * so anything left in them would be stranded. One run goes through all three
 * accounts and, for each one:
 *
 *   1. Claims filled limit orders, then cancels every order still open, so the
 *      funds they hold return to the bank balance.
 *   2. Reads every bank balance, including denoms that are not in
 *      `TOKEN_DENOMS`.
 *   3. Sends all of it to the topup account in a single `MsgSend`. The fee is
 *      simulated first and taken out of the OSMO being sent, so nothing is
 *      kept back and the wallet ends at zero.
 *
 * Every transaction carries a memo naming the account and the step (for
 * example "e2e cleanup: Monitoring SG -> topup"), so it can be identified on
 * Mintscan without the CI log. A failure on one account does not stop the
 * others, and the script is safe to re-run: an emptied account has nothing
 * left to cancel or send.
 *
 * Environment variables:
 * - `TEST_PRIVATE_KEY_US`, `TEST_PRIVATE_KEY_EU`, `TEST_PRIVATE_KEY_SG` —
 *   the accounts to empty.
 * - `E2E_PRIVATE_KEY_TOPUP` — the topup account (destination address only).
 * - `DRY_RUN` — anything but "false" lists the orders, balances, planned
 *   transfer, memos and estimated fee without sending anything. A dry run's
 *   transfer estimate does not include funds still locked in open orders.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import BigNumber from "bignumber.js";
import type {
  ExecuteInstruction,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { type Coin, calculateFee } from "@cosmjs/stargate";

import { TOKEN_DENOMS } from "../utils/balance-checker";
import { fetchAllBankBalances, validatePrivateKey } from "../utils/fund-utils";
import {
  CANCEL_BATCH_SIZE,
  CANCEL_GAS_MULTIPLIER,
  GAS_PRICE,
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

const MINTSCAN_TX_URL = "https://www.mintscan.io/osmosis/txs";

const ACCOUNTS = [
  { envVar: "TEST_PRIVATE_KEY_US", label: "Monitoring US" },
  { envVar: "TEST_PRIVATE_KEY_EU", label: "Monitoring EU" },
  { envVar: "TEST_PRIVATE_KEY_SG", label: "Monitoring SG" },
] as const;

/** Headroom over the simulated gas, since the fee is fixed before sending. */
const SEND_GAS_MULTIPLIER = 1.5;

/** SQS and the LCD lag the chain by a few seconds after a transaction. */
const INDEXER_POLL_ATTEMPTS = 6;
const INDEXER_POLL_INTERVAL_MS = 5_000;

const KNOWN_DENOMS = new Map(
  Object.entries(TOKEN_DENOMS).map(([symbol, info]) => [
    info.denom,
    { symbol, decimals: info.decimals },
  ])
);

/** "12.5 OSMO" for known tokens, raw amount and full denom otherwise. */
function formatCoin(coin: Coin): string {
  const known = KNOWN_DENOMS.get(coin.denom);
  if (!known) return `${coin.amount} ${coin.denom}`;
  const amount = new BigNumber(coin.amount).shiftedBy(-known.decimals);
  return `${amount.toFixed()} ${known.symbol}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface CleanupResult {
  label: string;
  address: string;
  ordersClosed: number;
  sent: Coin[];
  txHash?: string;
  error?: string;
}

/** Broadcasts instructions in batches, throwing on the first failed batch. */
async function executeBatches(
  client: SigningCosmWasmClient,
  address: string,
  instructions: ExecuteInstruction[],
  memo: string
): Promise<void> {
  for (const batch of chunk(instructions, CANCEL_BATCH_SIZE)) {
    const result = await client.executeMultiple(
      address,
      batch,
      CANCEL_GAS_MULTIPLIER,
      memo
    );
    console.log(
      `    ✅ "${memo}" (${batch.length}): ${result.transactionHash}`
    );
  }
}

/**
 * Claims filled orders, then cancels the rest. Claims go in their own
 * transaction first: a fully filled order is removed by its claim, and a
 * cancel for it in the same transaction would revert the whole batch.
 *
 * @returns The number of open orders found.
 * @throws If any order is still open afterwards.
 */
async function closeOpenOrders(
  client: SigningCosmWasmClient,
  address: string,
  label: string,
  isDryRun: boolean
): Promise<number> {
  let orders = await fetchActiveOrders(address);
  if (orders.length === 0) {
    console.log("    No open limit orders.");
    return 0;
  }

  const found = orders.length;
  console.log(`    ${found} open limit order${found === 1 ? "" : "s"}:`);
  for (const o of orders) {
    console.log(
      `      - ${o.order_direction} ${o.base_asset.symbol}/${o.quote_asset.symbol}, ` +
        `order_id=${o.order_id}, tick_id=${o.tick_id}, status=${o.status}, ` +
        // SQS reports percentFilled as a fraction (1 = fully filled).
        `filled=${(parseFloat(o.percentFilled) * 100).toFixed(0)}%, orderbook=${
          o.orderbookAddress
        }`
    );
  }

  const claimMemo = `e2e cleanup: ${label} claim orders`;
  const cancelMemo = `e2e cleanup: ${label} cancel orders`;
  const claimMsgs = buildClaimMessages(orders);

  if (isDryRun) {
    if (claimMsgs.length > 0) {
      console.log(
        `    Would claim ${claimMsgs.length} filled order${
          claimMsgs.length === 1 ? "" : "s"
        } (memo "${claimMemo}").`
      );
    }
    console.log(
      `    Would cancel the orders still open after claiming, up to ${found} (memo "${cancelMemo}").`
    );
    return found;
  }

  if (claimMsgs.length > 0) {
    await executeBatches(client, address, claimMsgs, claimMemo);
    await sleep(INDEXER_POLL_INTERVAL_MS);
    orders = await fetchActiveOrders(address);
  }
  if (orders.length > 0) {
    await executeBatches(
      client,
      address,
      buildCancelMessages(orders),
      cancelMemo
    );
  }

  for (let attempt = 1; attempt <= INDEXER_POLL_ATTEMPTS; attempt++) {
    await sleep(INDEXER_POLL_INTERVAL_MS);
    const remaining = await fetchActiveOrders(address);
    if (remaining.length === 0) {
      console.log("    All open orders closed.");
      return found;
    }
    if (attempt === INDEXER_POLL_ATTEMPTS) {
      throw new Error(
        `${remaining.length} order${
          remaining.length === 1 ? "" : "s"
        } still open after claim and cancel`
      );
    }
  }
  return found;
}

/**
 * Sends every bank balance to the topup account, paying the fee out of the
 * OSMO being sent so the account ends empty.
 */
async function sendEverything(
  client: SigningCosmWasmClient,
  address: string,
  topupAddress: string,
  label: string,
  isDryRun: boolean
): Promise<{ sent: Coin[]; txHash?: string }> {
  const balances = await fetchAllBankBalances(address);
  if (balances.length === 0) {
    console.log("    Bank balance is empty. Nothing to send.");
    return { sent: [] };
  }
  console.log(`    Bank balances (${balances.length}):`);
  for (const coin of balances) console.log(`      ${formatCoin(coin)}`);

  const osmo = balances.find((c) => c.denom === "uosmo");
  if (!osmo) throw new Error("no OSMO to pay the transfer fee");

  const memo = `e2e cleanup: ${label} -> topup`;
  const msgSend = (amount: Coin[]) => ({
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: { fromAddress: address, toAddress: topupAddress, amount },
  });

  // MsgSend requires coins sorted by denom. Simulating with the full OSMO
  // balance is fine: simulation does not charge the fee.
  const coins = [...balances].sort((a, b) => a.denom.localeCompare(b.denom));
  const simulatedGas = await client.simulate(address, [msgSend(coins)], memo);
  const fee = calculateFee(
    Math.ceil(simulatedGas * SEND_GAS_MULTIPLIER),
    GAS_PRICE
  );
  const feeOsmo = new BigNumber(fee.amount[0].amount);
  const osmoToSend = new BigNumber(osmo.amount).minus(feeOsmo);
  if (osmoToSend.lt(0)) {
    throw new Error(
      `OSMO balance ${
        osmo.amount
      } uosmo cannot cover the ${feeOsmo.toFixed()} uosmo fee`
    );
  }

  const sendCoins = coins
    .map((c) =>
      c.denom === "uosmo"
        ? { denom: c.denom, amount: osmoToSend.toFixed(0) }
        : c
    )
    .filter((c) => c.amount !== "0");

  console.log(
    `    Fee: ${formatCoin({ denom: "uosmo", amount: feeOsmo.toFixed() })} ` +
      `(gas ${fee.gas}), paid from the OSMO balance.`
  );
  console.log(`    Memo: "${memo}"`);

  if (isDryRun) {
    console.log(
      `    Would send ${sendCoins.length} denom${
        sendCoins.length === 1 ? "" : "s"
      } to ${topupAddress}, leaving the account empty.`
    );
    return { sent: sendCoins };
  }

  const result = await client.signAndBroadcast(
    address,
    [msgSend(sendCoins)],
    fee,
    memo
  );
  // signAndBroadcast resolves even when the tx is included with a non-zero
  // code, so only code 0 means the transfer happened.
  if (result.code !== 0) {
    throw new Error(
      `tx ${result.transactionHash} failed with code ${result.code}: ${result.rawLog}`
    );
  }
  console.log(
    `    ✅ Sent ${sendCoins.length} denoms: ${result.transactionHash}`
  );
  console.log(`    ${MINTSCAN_TX_URL}/${result.transactionHash}`);

  let leftover: Coin[] = [];
  for (let attempt = 1; attempt <= INDEXER_POLL_ATTEMPTS; attempt++) {
    leftover = await fetchAllBankBalances(address);
    if (leftover.length === 0) break;
    await sleep(INDEXER_POLL_INTERVAL_MS);
  }
  if (leftover.length > 0) {
    throw new Error(
      `account not empty after the transfer (${leftover
        .map(formatCoin)
        .join(", ")}); re-run to send the rest`
    );
  }
  console.log("    Account is empty.");
  return { sent: sendCoins, txHash: result.transactionHash };
}

async function main(): Promise<void> {
  const isDryRun = process.env.DRY_RUN !== "false";
  const topupKey = process.env.E2E_PRIVATE_KEY_TOPUP;

  // Check every secret before sending anything.
  if (!topupKey) {
    console.error("❌ E2E_PRIVATE_KEY_TOPUP is not set.");
    process.exit(1);
  }
  validatePrivateKey(topupKey, "E2E_PRIVATE_KEY_TOPUP");
  for (const acct of ACCOUNTS) {
    const key = process.env[acct.envVar];
    if (!key) {
      console.error(`❌ ${acct.envVar} (${acct.label}) is not set.`);
      process.exit(1);
    }
    validatePrivateKey(key, acct.envVar, acct.label);
  }

  const { address: topupAddress } = await deriveAddress(topupKey);
  const accounts = await Promise.all(
    ACCOUNTS.map(async (acct) => ({
      ...acct,
      ...(await deriveAddress(process.env[acct.envVar]!)),
    }))
  );

  console.log(
    `\n=== Clean Up Region Monitoring Accounts${
      isDryRun ? " [DRY RUN]" : ""
    } ===`
  );
  console.log("  Cancel open limit orders, then send every balance to topup.");
  for (const acct of accounts) {
    console.log(`  ${acct.label}: ${acct.address}`);
  }
  console.log(`  Topup: ${topupAddress}`);
  console.log(`  RPC: ${OSMOSIS_RPC}`);
  console.log(`  SQS: ${SQS_BASE_URL}`);

  const results: CleanupResult[] = [];
  for (const acct of accounts) {
    console.log(`\n  ${acct.label} (${acct.address})`);
    const result: CleanupResult = {
      label: acct.label,
      address: acct.address,
      ordersClosed: 0,
      sent: [],
    };
    try {
      const client = await createSigningClient(acct.wallet);
      result.ordersClosed = await closeOpenOrders(
        client,
        acct.address,
        acct.label,
        isDryRun
      );
      Object.assign(
        result,
        await sendEverything(
          client,
          acct.address,
          topupAddress,
          acct.label,
          isDryRun
        )
      );
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
      console.error(`    ❌ ${acct.label} cleanup failed: ${result.error}`);
    }
    results.push(result);
  }

  console.log(`\n=== Summary${isDryRun ? " [DRY RUN]: nothing sent" : ""} ===`);
  for (const r of results) {
    const orders = `${r.ordersClosed} order${r.ordersClosed === 1 ? "" : "s"}`;
    const transfer = r.txHash
      ? `${r.sent.length} denoms sent in ${r.txHash}`
      : `${r.sent.length} denoms${isDryRun ? " to send" : " sent"}`;
    const status = r.error
      ? `❌ ${r.error}`
      : isDryRun
      ? "(dry run)"
      : "✅ empty";
    console.log(`  ${r.label}: ${orders}, ${transfer} ${status}`);
  }

  if (results.some((r) => r.error)) process.exit(1);
  if (isDryRun) {
    console.log("\n  Dry run complete. Set DRY_RUN=false to broadcast.");
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
