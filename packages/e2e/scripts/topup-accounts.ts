/**
 * @file topup-accounts.ts
 * @description Tops up E2E test accounts from the topup holding account.
 *
 * For each target account, checks its current on-chain balance and sends
 * enough tokens to bring it up to `warnAmount * TOPUP_MULTIPLIER`. If the
 * account already meets or exceeds the target, nothing is sent for that token.
 *
 * Respects OSMO and USDC reserves in the topup account.
 *
 * **Defaults to dry run.** Set `DRY_RUN=false` to broadcast.
 *
 * @requires E2E_PRIVATE_KEY_TOPUP   - Hex key of the topup account (sender).
 * @requires E2E_PRIVATE_KEY_PREVIEW - Hex key of the new E2E Test Account.
 * @requires TEST_PRIVATE_KEY_SG     - Hex key of new Monitoring SG.
 * @requires TEST_PRIVATE_KEY_EU     - Hex key of new Monitoring EU.
 * @requires TEST_PRIVATE_KEY_US     - Hex key of new Monitoring US.
 * @requires DRY_RUN                 - (optional) Defaults to "true". Set to "false" to send.
 * @requires TOPUP_MULTIPLIER        - (optional) Target = warnAmount × this. Default: 1.5.
 * @requires RESERVE_OSMO            - (optional) OSMO to keep in topup account. Default: 5.
 * @requires RESERVE_USDC            - (optional) USDC to keep in topup account. Default: 500.
 * @requires SLACK_WEBHOOK_URL       - (optional) Slack incoming-webhook URL for topup summary.
 */

import * as dotenv from "dotenv";
import * as path from "path";

import { ACCOUNT_REQUIREMENTS } from "../utils/balance-config";
import type { OfflineDirectSigner } from "@cosmjs/proto-signing";
import type { Coin } from "@cosmjs/stargate";

import {
  OSMOSIS_RPC,
  createSigningClient,
  deriveAddress,
} from "../utils/order-utils";
import {
  type AccountTarget,
  type ReserveConfig,
  type TokenBalance,
  calculateTopup,
  computeSwapGaps,
  fetchAllKnownBalances,
  parseReserves,
  printBalanceTable,
  printDistributionPlan,
  printReserves,
  resolveRequirementsToTokenUnits,
  validatePrivateKey,
} from "../utils/fund-utils";
import { TOKEN_DENOMS } from "../utils/balance-checker";
import BigNumber from "bignumber.js";

const MINTSCAN_TX_URL = "https://www.mintscan.io/osmosis/txs";

interface TransferResult {
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
      return `+${human} ${symbol}`;
    })
    .join("  |  ");
}

async function sendSlackSummary(
  results: TransferResult[],
  skippedLabels: string[],
  remaining: TokenBalance[],
  targets: AccountTarget[],
  reserves: ReserveConfig,
  multiplier: number,
  hasFailures: boolean
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const headerText = hasFailures
    ? "⚠️ E2E Topup Complete (Partial Failure)"
    : "✅ E2E Topup Complete";

  const lines: string[] = [`*Multiplier:* ${multiplier}x warnAmount\n`];

  for (const r of results) {
    lines.push(`*${r.label}* (\`${r.address}\`):`);
    lines.push(`  ${coinSummary(r.coins)}`);
    if (r.txHash) {
      lines.push(`  <${MINTSCAN_TX_URL}/${r.txHash}|View TX on Mintscan>`);
    } else if (r.error) {
      lines.push(`  :x: Failed: ${r.error}`);
    }
    lines.push("");
  }

  for (const label of skippedLabels) {
    lines.push(`*${label}:* Already funded — skipped\n`);
  }

  // Remaining topup balances with swap-needed flags.
  // Scale warnAmount by multiplier so gap detection matches the actual topup target.
  const scaledTargets = targets.map((t) => ({
    ...t,
    requirements: t.requirements.map((r) => ({
      ...r,
      warnAmount: r.warnAmount * multiplier,
    })),
  }));
  const gaps = computeSwapGaps(remaining, scaledTargets, reserves);
  const gapBySymbol = new Map(gaps.map((g) => [g.symbol, g]));

  const allSymbols = [
    ...remaining.map((b) => b.symbol),
    ...gaps
      .filter((g) => g.needed > 0 && !remaining.find((b) => b.symbol === g.symbol))
      .map((g) => g.symbol),
  ];
  const maxSym = Math.max(...allSymbols.map((s) => s.length), 6);

  lines.push("*Remaining topup account balances:*");
  lines.push("```");
  lines.push(
    `${"Token".padEnd(maxSym)}  ${"Amount".padStart(16)}  Status`
  );
  lines.push(`${"─".repeat(maxSym)}  ${"─".repeat(16)}  ${"─".repeat(14)}`);

  let anyGap = false;
  for (const b of remaining) {
    const d = Math.min(b.decimals, 8);
    const gap = gapBySymbol.get(b.symbol);
    let status = "";
    if (gap && gap.gap < -0.0001) {
      anyGap = true;
      status = `⚠ post-reserve < target (short ${Math.abs(gap.gap).toFixed(d)})`;
    }
    lines.push(
      `${b.symbol.padEnd(maxSym)}  ${b.amount.toFixed(d).padStart(16)}  ${status}`
    );
  }

  for (const g of gaps) {
    if (g.needed > 0 && !remaining.find((b) => b.symbol === g.symbol)) {
      anyGap = true;
      lines.push(
        `${g.symbol.padEnd(maxSym)}  ${"0".padStart(16)}  ⚠ post-reserve < target (short ${Math.abs(g.gap).toFixed(4)})`
      );
    }
  }

  lines.push("```");

  if (anyGap) {
    lines.push(
      "_Note: `post-reserve = balance − reserve_<token>`. The topup account itself may still hold plenty; the warning means the configured reserve leaves the distributable buffer below the sum of all accounts' warnAmount × multiplier targets. Lower `RESERVE_USDC` / `RESERVE_OSMO` (workflow inputs) if you want more distributable headroom._"
    );
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

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const TARGET_ACCOUNTS = [
  { envVar: "E2E_PRIVATE_KEY_PREVIEW", label: "E2E Test Account" },
  { envVar: "TEST_PRIVATE_KEY_SG", label: "Monitoring SG" },
  { envVar: "TEST_PRIVATE_KEY_EU", label: "Monitoring EU" },
  { envVar: "TEST_PRIVATE_KEY_US", label: "Monitoring US" },
] as const;

async function main(): Promise<void> {
  const topupPrivateKey = process.env.E2E_PRIVATE_KEY_TOPUP;
  const isDryRun = process.env.DRY_RUN !== "false";
  const reserves = parseReserves();
  const rawMult = parseFloat(process.env.TOPUP_MULTIPLIER ?? "1.5");
  const multiplier = Number.isFinite(rawMult) && rawMult > 0 ? rawMult : 1.5;

  if (!topupPrivateKey) {
    console.error("❌ E2E_PRIVATE_KEY_TOPUP is not set.");
    process.exit(1);
  }
  validatePrivateKey(topupPrivateKey, "E2E_PRIVATE_KEY_TOPUP");

  const dryTag = isDryRun ? " [DRY RUN]" : "";
  console.log(`\n=== Topup E2E Accounts${dryTag} ===`);
  console.log(`  Target: warnAmount x ${multiplier}`);
  printReserves(reserves);

  let topupWallet: OfflineDirectSigner;
  let topupAddress: string;
  try {
    ({ wallet: topupWallet, address: topupAddress } =
      await deriveAddress(topupPrivateKey));
  } catch (err) {
    console.error(
      `❌ E2E_PRIVATE_KEY_TOPUP: failed to derive address — ${err instanceof Error ? err.message : err}`
    );
    process.exit(1);
  }
  console.log(`\n  Topup: ${topupAddress}`);
  console.log(`  RPC:  ${OSMOSIS_RPC}`);

  // Resolve all target accounts and fetch their current balances
  const targets: (AccountTarget & { currentBalances: TokenBalance[] })[] = [];

  for (const acct of TARGET_ACCOUNTS) {
    const key = process.env[acct.envVar];
    if (!key) {
      console.error(`❌ ${acct.envVar} is not set.`);
      process.exit(1);
    }
    validatePrivateKey(key, acct.envVar, acct.label);

    let address: string;
    try {
      ({ address } = await deriveAddress(key));
    } catch (err) {
      console.error(
        `❌ ${acct.envVar} (${acct.label}): failed to derive address — ${err instanceof Error ? err.message : err}`
      );
      process.exit(1);
    }
    const reqs = ACCOUNT_REQUIREMENTS[acct.label];
    if (!reqs) {
      console.warn(`  ⚠ No requirements for "${acct.label}". Skipping.`);
      continue;
    }

    const currentBalances = await fetchAllKnownBalances(address);
    const resolvedReqs = await resolveRequirementsToTokenUnits(reqs);

    targets.push({
      label: acct.label,
      address,
      requirements: resolvedReqs,
      currentBalances,
    });

    console.log(`  ${acct.label}: ${address}`);
    printBalanceTable("  Current balances (target = warnAmount x " + multiplier + ")", currentBalances);

    for (const req of resolvedReqs) {
      const current = currentBalances.find((b) => b.symbol === req.token)?.amount ?? 0;
      const warn = req.warnAmount;
      const target = req.warnAmount * multiplier;
      const deficit = target - current;
      // Hysteresis: only top up when below warnAmount. See calculateTopup() in
      // fund-utils.ts for rationale.
      let status: string;
      if (current >= target) {
        status = "✓ ok";
      } else if (current >= warn) {
        status = `✓ ok (above warn ${warn.toFixed(4)}, below target — no topup)`;
      } else {
        status = `needs +${deficit.toFixed(4)} (below warn ${warn.toFixed(4)})`;
      }
      console.log(
        `      ${req.token}: ${current.toFixed(4)} / ${target.toFixed(4)}  ${status}`
      );
    }
  }

  // Fetch topup account balances
  const topupBalances = await fetchAllKnownBalances(topupAddress);
  printBalanceTable("Topup account balances", topupBalances);

  if (topupBalances.length === 0) {
    console.log("\n  Topup account is empty. Nothing to send.");
    return;
  }

  // Calculate topup amounts
  const distribution = calculateTopup(topupBalances, targets, reserves, multiplier);
  printDistributionPlan(distribution);

  const hasAnythingToSend = distribution.some((d) => d.coins.length > 0);
  if (!hasAnythingToSend) {
    console.log("\n  All accounts are sufficiently funded. Nothing to do.");
    return;
  }

  if (isDryRun) {
    console.log(
      "\n  Dry run complete. Set DRY_RUN=false to broadcast."
    );
    return;
  }

  // Live run: re-calculate before each send for idempotency.
  // Re-fetches both topup and target balances between sends so that
  // a partial prior run is detected and already-funded accounts are skipped.
  const client = await createSigningClient(topupWallet);
  let hasFailures = false;
  const transferResults: TransferResult[] = [];
  const skippedLabels: string[] = [];

  for (const target of targets) {
    const freshTopup = await fetchAllKnownBalances(topupAddress);
    const freshTargetBalances = await fetchAllKnownBalances(target.address);
    const freshTarget = {
      ...target,
      currentBalances: freshTargetBalances,
    };

    const freshDistribution = calculateTopup(
      freshTopup,
      [freshTarget],
      reserves,
      multiplier
    );
    const entry = freshDistribution[0];

    if (!entry || entry.coins.length === 0) {
      console.log(`\n  ${target.label}: fully funded, skipping.`);
      skippedLabels.push(target.label);
      continue;
    }

    console.log(`\n  Topping up ${target.label} (${target.address})...`);
    for (const c of entry.coins) {
      console.log(`    ${c.denom}: ${c.amount}`);
    }

    try {
      const result = await client.sendTokens(
        topupAddress,
        target.address,
        entry.coins,
        "auto"
      );
      console.log(`  ✅ TX: ${result.transactionHash}`);
      transferResults.push({
        label: target.label,
        address: target.address,
        coins: entry.coins,
        txHash: result.transactionHash,
      });
    } catch (err) {
      hasFailures = true;
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Failed:`, errorMsg);
      transferResults.push({
        label: target.label,
        address: target.address,
        coins: entry.coins,
        error: errorMsg,
      });
    }
  }

  const remaining = await fetchAllKnownBalances(topupAddress);
  printBalanceTable("Remaining topup account balances", remaining);

  if (transferResults.length > 0) {
    await sendSlackSummary(
      transferResults,
      skippedLabels,
      remaining,
      targets,
      reserves,
      multiplier,
      hasFailures
    );
  }

  if (hasFailures) {
    console.error("\n  ❌ One or more transfers failed.");
    process.exit(1);
  }

  console.log("\n  Topup complete.");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
