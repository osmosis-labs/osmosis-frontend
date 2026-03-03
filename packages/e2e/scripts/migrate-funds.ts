/**
 * @file migrate-funds.ts
 * @description One-time fund migration for E2E wallet rotation.
 *
 * Two phases (set via PHASE env var):
 *
 *   extract    — Drain all known tokens from an old account to the topup account.
 *                Runs once per old account (workflow uses 4 parallel matrix jobs).
 *
 *   distribute — Split all topup account funds across new accounts proportionally
 *                by their warnAmount ratios. Reserves OSMO and USDC in the topup account.
 *
 * **Defaults to dry run.** Set `DRY_RUN=false` to broadcast.
 *
 * @requires PHASE              - "extract" or "distribute"
 * @requires PRIVATE_KEY        - (extract) Hex key of the old account to drain.
 * @requires E2E_PRIVATE_KEY_TOPUP   - Hex key of the topup holding account.
 * @requires E2E_PRIVATE_KEY_PREVIEW - (distribute) Hex key of the new E2E Test Account.
 * @requires TEST_PRIVATE_KEY_SG     - (distribute) Hex key of new Monitoring SG.
 * @requires TEST_PRIVATE_KEY_EU     - (distribute) Hex key of new Monitoring EU.
 * @requires TEST_PRIVATE_KEY_US     - (distribute) Hex key of new Monitoring US.
 * @requires ACCOUNT_LABEL      - (extract, optional) Label for logging.
 * @requires DRY_RUN            - (optional) Defaults to "true". Set to "false" to send.
 * @requires RESERVE_OSMO       - (optional) OSMO to keep in source/temp. Default: 5.
 * @requires RESERVE_USDC       - (optional) USDC to keep in source/temp. Default: 500.
 */

import * as dotenv from "dotenv";
import * as path from "path";

import { ACCOUNT_REQUIREMENTS } from "../utils/balance-config";
import {
  OSMOSIS_RPC,
  createSigningClient,
  deriveAddress,
} from "../utils/order-utils";
import {
  type AccountTarget,
  type ReserveConfig,
  buildSendCoins,
  calculateDistribution,
  computeSwapGaps,
  fetchAllKnownBalances,
  printBalanceTable,
  printDistributionPlan,
  printReserves,
  printSwapReport,
} from "../utils/fund-utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

function parseReserves(): ReserveConfig {
  const osmo = parseFloat(process.env.RESERVE_OSMO ?? "5");
  const usdc = parseFloat(process.env.RESERVE_USDC ?? "500");
  return {
    osmo: Math.max(0, Number.isFinite(osmo) ? osmo : 5),
    usdc: Math.max(0, Number.isFinite(usdc) ? usdc : 500),
  };
}

const NEW_ACCOUNTS = [
  { envVar: "E2E_PRIVATE_KEY_PREVIEW", label: "E2E Test Account" },
  { envVar: "TEST_PRIVATE_KEY_SG", label: "Monitoring SG" },
  { envVar: "TEST_PRIVATE_KEY_EU", label: "Monitoring EU" },
  { envVar: "TEST_PRIVATE_KEY_US", label: "Monitoring US" },
] as const;

// ---------------------------------------------------------------------------
// Extract phase
// ---------------------------------------------------------------------------

async function runExtract(
  isDryRun: boolean,
  reserves: ReserveConfig
): Promise<void> {
  const privateKey = process.env.PRIVATE_KEY;
  const topupPrivateKey = process.env.E2E_PRIVATE_KEY_TOPUP;
  const label = process.env.ACCOUNT_LABEL;

  if (!privateKey || privateKey === "private_key") {
    console.error("❌ PRIVATE_KEY is not set.");
    process.exit(1);
  }
  if (!topupPrivateKey) {
    console.error("❌ E2E_PRIVATE_KEY_TOPUP is not set.");
    process.exit(1);
  }

  const dryTag = isDryRun ? " [DRY RUN]" : "";
  const header = label
    ? `Extract Funds: ${label}${dryTag}`
    : `Extract Funds${dryTag}`;
  console.log(`\n=== ${header} ===`);
  printReserves(reserves);

  const { wallet: sourceWallet, address: sourceAddress } =
    await deriveAddress(privateKey);
  const { address: topupAddress } = await deriveAddress(topupPrivateKey);

  console.log(`\n  Source:  ${sourceAddress}`);
  console.log(`  Topup:    ${topupAddress}`);
  console.log(`  RPC:     ${OSMOSIS_RPC}`);

  const balances = await fetchAllKnownBalances(sourceAddress);
  printBalanceTable("Source account balances", balances);

  if (balances.length === 0) {
    console.log("\n  No known token balances. Nothing to extract.");
    return;
  }

  const coins = buildSendCoins(balances, reserves);

  if (coins.length === 0) {
    console.log("\n  All balances within reserve thresholds. Nothing to send.");
    return;
  }

  console.log("\n  Coins to send:");
  for (const c of coins) {
    console.log(`    ${c.denom}: ${c.amount}`);
  }

  if (isDryRun) {
    console.log(
      "\n  Dry run complete. Set DRY_RUN=false to broadcast."
    );
    return;
  }

  console.log("\n  Broadcasting...");
  const client = await createSigningClient(sourceWallet);
  const result = await client.sendTokens(
    sourceAddress,
    topupAddress,
    coins,
    "auto"
  );
  console.log(`  ✅ TX: ${result.transactionHash}`);

  const remaining = await fetchAllKnownBalances(sourceAddress);
  printBalanceTable("Remaining source balances", remaining);
}

// ---------------------------------------------------------------------------
// Distribute phase
// ---------------------------------------------------------------------------

async function runDistribute(
  isDryRun: boolean,
  reserves: ReserveConfig
): Promise<void> {
  const topupPrivateKey = process.env.E2E_PRIVATE_KEY_TOPUP;

  if (!topupPrivateKey) {
    console.error("❌ E2E_PRIVATE_KEY_TOPUP is not set.");
    process.exit(1);
  }

  const dryTag = isDryRun ? " [DRY RUN]" : "";
  console.log(`\n=== Distribute Funds${dryTag} ===`);
  printReserves(reserves);

  const { wallet: topupWallet, address: topupAddress } =
    await deriveAddress(topupPrivateKey);
  console.log(`\n  Topup: ${topupAddress}`);
  console.log(`  RPC:  ${OSMOSIS_RPC}`);

  // Resolve new accounts
  const targets: AccountTarget[] = [];

  for (const acct of NEW_ACCOUNTS) {
    const key = process.env[acct.envVar];
    if (!key) {
      console.error(`❌ ${acct.envVar} is not set.`);
      process.exit(1);
    }
    const { address } = await deriveAddress(key);
    const reqs = ACCOUNT_REQUIREMENTS[acct.label];
    if (!reqs) {
      console.warn(`  ⚠ No requirements for "${acct.label}". Skipping.`);
      continue;
    }
    targets.push({
      label: acct.label,
      address,
      requirements: reqs.map((r) => ({
        token: r.token,
        warnAmount: r.warnAmount,
      })),
    });
    console.log(`  ${acct.label}: ${address}`);
  }

  const topupBalances = await fetchAllKnownBalances(topupAddress);
  printBalanceTable("Topup account balances", topupBalances);

  if (topupBalances.length === 0) {
    console.log("\n  Topup account is empty. Nothing to distribute.");
    return;
  }

  // Swap gap report
  const gaps = computeSwapGaps(topupBalances, targets, reserves);
  printSwapReport(gaps);

  const swapsNeeded = gaps.filter((g) => g.gap < -0.0001);
  if (swapsNeeded.length > 0) {
    console.log(
      `\n  ⚠ ${swapsNeeded.length} token(s) need manual swaps before distribution.`
    );
  }

  // Calculate initial proportional distribution (used for dry-run preview)
  const distribution = calculateDistribution(topupBalances, targets, reserves);
  printDistributionPlan(distribution);

  if (isDryRun) {
    console.log(
      "\n  Dry run complete. Set DRY_RUN=false to broadcast."
    );
    return;
  }

  // Live run: re-calculate before each send for idempotency.
  // If a prior run partially completed, accounts that already received funds
  // are detected (non-zero balance) and their allocation is reduced.
  // The topup balance is also re-fetched between sends to stay accurate.
  const client = await createSigningClient(topupWallet);

  let hasFailures = false;
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    // Re-fetch topup balance before each send
    const freshTopup = await fetchAllKnownBalances(topupAddress);
    // Re-fetch target account balance to detect prior partial runs
    const targetBalances = await fetchAllKnownBalances(target.address);

    const remainingTargets = targets.slice(i);
    const freshDistribution = calculateDistribution(
      freshTopup,
      remainingTargets,
      reserves
    );
    const entry = freshDistribution.find((d) => d.address === target.address);

    if (!entry || entry.coins.length === 0) {
      console.log(`\n  ${target.label}: nothing to send, skipping.`);
      continue;
    }

    // Reduce allocation by what the target already holds (from a prior run)
    const adjustedCoins = entry.coins
      .map((coin) => {
        const existing = targetBalances.find((b) => b.denom === coin.denom);
        if (!existing) return coin;
        const existingRaw = parseInt(existing.rawAmount, 10);
        const planned = parseInt(coin.amount, 10);
        const adjusted = planned - existingRaw;
        if (adjusted <= 0) return null;
        return { denom: coin.denom, amount: adjusted.toString() };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null);

    if (adjustedCoins.length === 0) {
      console.log(
        `\n  ${target.label}: already funded (prior run detected), skipping.`
      );
      continue;
    }

    console.log(`\n  Sending to ${target.label} (${target.address})...`);
    for (const c of adjustedCoins) {
      console.log(`    ${c.denom}: ${c.amount}`);
    }

    try {
      const result = await client.sendTokens(
        topupAddress,
        target.address,
        adjustedCoins,
        "auto"
      );
      console.log(`  ✅ TX: ${result.transactionHash}`);
    } catch (err) {
      hasFailures = true;
      console.error(
        `  ❌ Failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  const remaining = await fetchAllKnownBalances(topupAddress);
  printBalanceTable("Remaining topup account balances", remaining);

  if (hasFailures) {
    console.error("\n  ❌ One or more transfers failed.");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const phase = process.env.PHASE;
  const isDryRun = process.env.DRY_RUN !== "false";
  const reserves = parseReserves();

  if (phase === "extract") {
    await runExtract(isDryRun, reserves);
  } else if (phase === "distribute") {
    await runDistribute(isDryRun, reserves);
  } else {
    const got = phase ?? "(not set)";
    console.error(
      '❌ PHASE must be "extract" or "distribute". Got: "' + got + '"'
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
