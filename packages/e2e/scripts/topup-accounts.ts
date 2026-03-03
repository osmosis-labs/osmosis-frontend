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
  type TokenBalance,
  calculateTopup,
  fetchAllKnownBalances,
  printBalanceTable,
  printDistributionPlan,
  printReserves,
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

  const dryTag = isDryRun ? " [DRY RUN]" : "";
  console.log(`\n=== Topup E2E Accounts${dryTag} ===`);
  console.log(`  Target: warnAmount x ${multiplier}`);
  printReserves(reserves);

  const { wallet: topupWallet, address: topupAddress } =
    await deriveAddress(topupPrivateKey);
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
    const { address } = await deriveAddress(key);
    const reqs = ACCOUNT_REQUIREMENTS[acct.label];
    if (!reqs) {
      console.warn(`  ⚠ No requirements for "${acct.label}". Skipping.`);
      continue;
    }

    const currentBalances = await fetchAllKnownBalances(address);

    targets.push({
      label: acct.label,
      address,
      requirements: reqs.map((r) => ({
        token: r.token,
        warnAmount: r.warnAmount,
      })),
      currentBalances,
    });

    console.log(`  ${acct.label}: ${address}`);
    printBalanceTable("  Current balances (target = warnAmount x " + multiplier + ")", currentBalances);

    // Show per-token status
    for (const req of reqs) {
      const current = currentBalances.find((b) => b.symbol === req.token)?.amount ?? 0;
      const target = req.warnAmount * multiplier;
      const deficit = target - current;
      const status =
        deficit <= 0
          ? "✓ ok"
          : `needs +${deficit.toFixed(4)}`;
      console.log(
        `      ${req.token}: ${current.toFixed(4)} / ${target.toFixed(4)}  ${status}`
      );
    }
  }

  // Fetch temp balances
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

  console.log("\n  Topup complete.");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
