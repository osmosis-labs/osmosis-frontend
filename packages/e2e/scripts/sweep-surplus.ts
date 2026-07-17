/**
 * @file sweep-surplus.ts
 * @description Sweeps surplus tokens from the E2E test accounts back to the
 * topup holding account.
 *
 * The monitoring tests slowly convert USDC into other tokens (buy/sell
 * asymmetry, failed sell legs), so wallets accumulate balances far above what
 * the tests need. This script is the inverse of topup-accounts.ts: for each
 * account/token requirement, when the balance exceeds
 * `warnAmount × SWEEP_MULTIPLIER` it sends the excess above the auto-topup
 * refill target (`warnAmount × 3`) back to the topup account, where surplus
 * can be swapped back to USDC manually (hot wallet).
 *
 * Sweeping down to the topup target (never below) means a sweep can never
 * drop a wallet low enough to trigger an auto-topup — no ping-pong between
 * the two workflows.
 *
 * Environment variables:
 * - `E2E_PRIVATE_KEY_TOPUP`   — topup account key (destination address).
 * - `E2E_PRIVATE_KEY_PREVIEW`, `TEST_PRIVATE_KEY_SG/EU/US` — source signers.
 * - `SWEEP_MULTIPLIER`        — sweep when balance > warnAmount × this
 *                               (default 4, floored at 3.5 to stay above the
 *                               topup target of 3).
 * - `DRY_RUN`                 — anything but "false" reports without sending.
 * - `SLACK_WEBHOOK_URL`       — optional summary webhook (same channel as the
 *                               topup script). Dry runs always post the plan;
 *                               live runs post only when something was swept
 *                               or failed, with the topup account's resulting
 *                               balances for planning the manual swap-back.
 */

import * as dotenv from "dotenv";
import * as path from "path";
import type { Coin } from "@cosmjs/stargate";
import BigNumber from "bignumber.js";

import { ACCOUNT_REQUIREMENTS } from "../utils/balance-config";
import { TOKEN_DENOMS } from "../utils/balance-checker";
import { deriveAddress, createSigningClient, OSMOSIS_RPC } from "../utils/order-utils";
import {
  type TokenBalance,
  fetchAllKnownBalances,
  printBalanceTable,
  resolveRequirementsToTokenUnits,
  validatePrivateKey,
} from "../utils/fund-utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const MINTSCAN_TX_URL = "https://www.mintscan.io/osmosis/txs";

/** Matches the auto-topup refill target (topup_multiplier 3.0 dispatched by
 * the monitoring workflow's topup-dispatch job). */
const TOPUP_TARGET_MULTIPLIER = 3.0;
const MIN_SWEEP_MULTIPLIER = 3.5;

const SOURCE_ACCOUNTS = [
  { envVar: "E2E_PRIVATE_KEY_PREVIEW", label: "E2E Test Account" },
  { envVar: "TEST_PRIVATE_KEY_SG", label: "Monitoring SG" },
  { envVar: "TEST_PRIVATE_KEY_EU", label: "Monitoring EU" },
  { envVar: "TEST_PRIVATE_KEY_US", label: "Monitoring US" },
] as const;

interface SweepResult {
  label: string;
  address: string;
  coins: Coin[];
  txHash?: string;
  error?: string;
}

function coinSummary(coins: Coin[]): string {
  return coins
    .map((c) => {
      const entry = Object.entries(TOKEN_DENOMS).find(
        ([, info]) => info.denom === c.denom
      );
      if (!entry) return `${c.amount} ${c.denom}`;
      const [symbol, info] = entry;
      const human = new BigNumber(c.amount)
        .div(new BigNumber(10).pow(info.decimals))
        .toFixed(Math.min(info.decimals, 4));
      return `${human} ${symbol}`;
    })
    .join("  |  ");
}

async function sendSlackSummary(
  results: SweepResult[],
  skippedLabels: string[],
  topupAddress: string,
  topupBalances: TokenBalance[],
  multiplier: number,
  hasFailures: boolean,
  isDryRun: boolean
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const headerText = isDryRun
    ? "🧪 E2E Surplus Sweep — Dry Run (no transactions sent)"
    : hasFailures
      ? "⚠️ E2E Surplus Sweep Complete (Partial Failure)"
      : "🧹 E2E Surplus Sweep Complete";

  const lines: string[] = [
    `*Sweep threshold:* warnAmount x ${multiplier}; swept down to warnAmount x ${TOPUP_TARGET_MULTIPLIER}`,
    `*Destination:* \`${topupAddress}\` — swap surplus back to USDC manually there.\n`,
  ];

  const sweepVerb = isDryRun ? "Would sweep" : "Swept";
  for (const r of results) {
    lines.push(`*${r.label}* (\`${r.address}\`):`);
    lines.push(`  ${sweepVerb}: ${coinSummary(r.coins)}`);
    if (r.txHash) {
      lines.push(`  <${MINTSCAN_TX_URL}/${r.txHash}|View TX on Mintscan>`);
    } else if (r.error) {
      lines.push(`  :x: Failed: ${r.error}`);
    }
    lines.push("");
  }

  if (results.length === 0) {
    lines.push("_No surplus found on any account._\n");
  }

  for (const label of skippedLabels) {
    lines.push(`*${label}:* No surplus — skipped\n`);
  }

  // Topup account balances so the manual swap-back can be planned at a glance.
  if (topupBalances.length > 0) {
    const maxSym = Math.max(...topupBalances.map((b) => b.symbol.length), 6);
    lines.push(
      `*Topup account balances (${isDryRun ? "current" : "post-sweep"}):*`
    );
    lines.push("```");
    lines.push(`${"Token".padEnd(maxSym)}  ${"Amount".padStart(16)}`);
    lines.push(`${"─".repeat(maxSym)}  ${"─".repeat(16)}`);
    for (const b of topupBalances) {
      const d = Math.min(b.decimals, 8);
      lines.push(
        `${b.symbol.padEnd(maxSym)}  ${b.amount.toFixed(d).padStart(16)}`
      );
    }
    lines.push("```");
  }

  const serverUrl = process.env.GITHUB_SERVER_URL;
  const repo = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;
  if (serverUrl && repo && runId) {
    lines.push(
      `*Details:* <${serverUrl}/${repo}/actions/runs/${runId}|View run logs>`
    );
  }

  const payload = {
    text: headerText,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: headerText, emoji: true },
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: lines.join("\n") },
      },
    ],
  };

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) {
      console.error(
        `  ⚠ Slack webhook responded ${resp.status}: ${await resp.text()}`
      );
    } else {
      console.log("  Slack summary sent.");
    }
  } catch (err) {
    console.error(
      "  ⚠ Failed to send Slack summary:",
      err instanceof Error ? err.message : err
    );
  }
}

async function main(): Promise<void> {
  const topupPrivateKey = process.env.E2E_PRIVATE_KEY_TOPUP;
  const isDryRun = process.env.DRY_RUN !== "false";
  const rawMult = parseFloat(process.env.SWEEP_MULTIPLIER ?? "4");
  let multiplier = Number.isFinite(rawMult) && rawMult > 0 ? rawMult : 4;
  if (multiplier < MIN_SWEEP_MULTIPLIER) {
    console.warn(
      `  ⚠ SWEEP_MULTIPLIER ${multiplier} is below the minimum ${MIN_SWEEP_MULTIPLIER} (must stay above the topup target x${TOPUP_TARGET_MULTIPLIER}); using ${MIN_SWEEP_MULTIPLIER}.`
    );
    multiplier = MIN_SWEEP_MULTIPLIER;
  }

  if (!topupPrivateKey) {
    console.error("❌ E2E_PRIVATE_KEY_TOPUP is not set.");
    process.exit(1);
  }
  validatePrivateKey(topupPrivateKey, "E2E_PRIVATE_KEY_TOPUP");
  const { address: topupAddress } = await deriveAddress(topupPrivateKey);

  const dryTag = isDryRun ? " [DRY RUN]" : "";
  console.log(`\n=== Sweep E2E Account Surplus${dryTag} ===`);
  console.log(`  Sweep when balance > warnAmount x ${multiplier}`);
  console.log(`  Sweep down to warnAmount x ${TOPUP_TARGET_MULTIPLIER}`);
  console.log(`  Destination: ${topupAddress}`);
  console.log(`  RPC: ${OSMOSIS_RPC}`);

  const results: SweepResult[] = [];
  const skippedLabels: string[] = [];
  let hasFailures = false;

  for (const acct of SOURCE_ACCOUNTS) {
    const key = process.env[acct.envVar];
    if (!key) {
      console.error(`❌ ${acct.envVar} is not set.`);
      process.exit(1);
    }
    validatePrivateKey(key, acct.envVar, acct.label);

    const { wallet, address } = await deriveAddress(key);
    const reqs = ACCOUNT_REQUIREMENTS[acct.label];
    if (!reqs) {
      console.warn(`  ⚠ No requirements for "${acct.label}". Skipping.`);
      continue;
    }

    const balances = await fetchAllKnownBalances(address);
    const resolvedReqs = await resolveRequirementsToTokenUnits(reqs);

    console.log(`\n  ${acct.label}: ${address}`);
    printBalanceTable("Current balances", balances);

    const coins: Coin[] = [];
    for (const req of resolvedReqs) {
      const bal = balances.find((b) => b.symbol === req.token);
      const current = bal?.amount ?? 0;
      const threshold = req.warnAmount * multiplier;
      const target = req.warnAmount * TOPUP_TARGET_MULTIPLIER;

      if (!bal || current <= threshold) {
        console.log(
          `      ${req.token}: ${current.toFixed(4)} <= ${threshold.toFixed(4)}  ✓ no surplus`
        );
        continue;
      }

      // Ceil the raw target so rounding can never sweep below it.
      const rawTarget = new BigNumber(target)
        .times(new BigNumber(10).pow(bal.decimals))
        .integerValue(BigNumber.ROUND_CEIL);
      const rawSweep = new BigNumber(bal.rawAmount).minus(rawTarget);
      if (rawSweep.lte(0)) continue;

      console.log(
        `      ${req.token}: ${current.toFixed(4)} > ${threshold.toFixed(4)}  → sweep ${rawSweep
          .div(new BigNumber(10).pow(bal.decimals))
          .toFixed(Math.min(bal.decimals, 4))} (keep ${target.toFixed(4)})`
      );
      coins.push({ denom: bal.denom, amount: rawSweep.toFixed(0) });
    }

    if (coins.length === 0) {
      console.log("    Nothing to sweep.");
      skippedLabels.push(acct.label);
      continue;
    }

    // MsgSend requires coins sorted by denom.
    coins.sort((a, b) => a.denom.localeCompare(b.denom));

    if (isDryRun) {
      console.log(`    Would sweep: ${coinSummary(coins)}`);
      results.push({ label: acct.label, address, coins });
      continue;
    }

    try {
      const client = await createSigningClient(wallet);
      const result = await client.sendTokens(
        address,
        topupAddress,
        coins,
        "auto"
      );
      console.log(`    ✅ Swept: ${coinSummary(coins)}`);
      console.log(`    TX: ${result.transactionHash}`);
      results.push({
        label: acct.label,
        address,
        coins,
        txHash: result.transactionHash,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`    ❌ Sweep failed: ${message}`);
      hasFailures = true;
      results.push({ label: acct.label, address, coins, error: message });
    }
  }

  console.log("\n=== Summary ===");
  if (results.length === 0) {
    console.log("  No surplus anywhere. Nothing to do.");
  } else {
    for (const r of results) {
      const status = r.error ? "❌" : isDryRun ? "(dry run)" : "✅";
      console.log(`  ${r.label}: ${coinSummary(r.coins)} ${status}`);
    }
  }

  // Slack: dry runs always post (they're manual — someone wants the plan);
  // live runs post only when something was swept or failed, so the weekly
  // cron stays silent when there is no surplus.
  if (isDryRun || results.length > 0 || hasFailures) {
    let topupBalances: TokenBalance[] = [];
    try {
      topupBalances = await fetchAllKnownBalances(topupAddress);
    } catch (err) {
      console.warn(
        "  ⚠ Could not fetch topup balances for the summary:",
        err instanceof Error ? err.message : err
      );
    }
    await sendSlackSummary(
      results,
      skippedLabels,
      topupAddress,
      topupBalances,
      multiplier,
      hasFailures,
      isDryRun
    );
  } else {
    console.log("  Nothing swept — skipping Slack summary.");
  }

  if (isDryRun) {
    console.log("\n  Dry run complete. Set DRY_RUN=false to broadcast.");
    return;
  }

  if (hasFailures) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Sweep failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
