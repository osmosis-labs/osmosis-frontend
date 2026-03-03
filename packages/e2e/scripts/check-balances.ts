/**
 * @file check-balances.ts
 * @description Standalone CLI to check e2e test-account balances.
 *
 * Designed for two uses:
 * 1. **Local development** — run manually to inspect balances and USD values.
 * 2. **CI precursor** — run before Playwright tests to fail fast when an
 *    account is under-funded, or send a Slack alert when balances are low.
 *
 * ## Exit codes
 * - `0` — all balances are above `warnAmount` (healthy)
 * - `1` — at least one balance is below `minAmount` (critical, block tests)
 * - `2` — all balances above `minAmount`, but at least one below `warnAmount`
 *          (low balance warning — tests may proceed, Slack alert triggered)
 *
 * ## Environment variables
 * - `PRIVATE_KEY`    — hex-encoded secp256k1 private key (required)
 * - `ACCOUNT_LABEL`  — label matching a key in ACCOUNT_REQUIREMENTS (optional;
 *                       when set, validates against the centralized config)
 * - `DRY_RUN`        — set to `"true"` to skip the actual balance fetch and
 *                       just print the resolved config
 *
 * ## Usage
 * ```bash
 * # Local — show all balances
 * PRIVATE_KEY=abc123... npx tsx packages/e2e/scripts/check-balances.ts
 *
 * # CI precursor — validate against requirements
 * PRIVATE_KEY=abc123... ACCOUNT_LABEL="E2E Test Account" \
 *   npx tsx packages/e2e/scripts/check-balances.ts
 * ```
 */

import "dotenv/config";

import {
  ACCOUNT_REQUIREMENTS,
  type AccountBalanceRequirement,
} from "../utils/balance-config";
import { getAllBalances, TOKEN_DENOMS } from "../utils/balance-checker";
import { fetchTokenPrices } from "../utils/price-utils";
import { deriveAddress } from "../utils/wallet-utils";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ACCOUNT_LABEL = process.env.ACCOUNT_LABEL ?? "";
const DRY_RUN = process.env.DRY_RUN === "true";

/** Returns the display decimal places for a token (matches on-chain precision, capped at 8). */
function decimalsFor(token: string): number {
  const info = TOKEN_DENOMS[token];
  return info ? Math.min(info.decimals, 8) : 6;
}

function fmtBalance(amount: number, token: string): string {
  return amount.toFixed(decimalsFor(token));
}

async function main(): Promise<void> {
  console.log("=== E2E Account Balance Check ===\n");

  if (!PRIVATE_KEY || PRIVATE_KEY === "private_key") {
    console.error("PRIVATE_KEY environment variable is not set.");
    process.exit(1);
  }

  // Derive address
  const { address } = await deriveAddress(PRIVATE_KEY);
  const label = ACCOUNT_LABEL || "unlabelled";
  console.log(`Account:  ${label}`);
  console.log(`Address:  ${address}\n`);

  // Look up requirements
  const requirements: AccountBalanceRequirement[] | undefined =
    ACCOUNT_LABEL ? ACCOUNT_REQUIREMENTS[ACCOUNT_LABEL] : undefined;

  if (ACCOUNT_LABEL && !requirements) {
    console.warn(
      `No balance requirements found for label "${ACCOUNT_LABEL}".`
    );
    console.warn(
      `Available labels: ${Object.keys(ACCOUNT_REQUIREMENTS).join(", ")}\n`
    );
  }

  if (DRY_RUN) {
    console.log("[DRY RUN] Would check these requirements:\n");
    if (requirements) {
      for (const r of requirements) {
        console.log(
          `  ${r.token.padEnd(14)} min: ${r.minAmount}  warn: ${r.warnAmount}  (${r.note ?? ""})`
        );
      }
    } else {
      console.log("  (no requirements — would just display balances)");
    }
    console.log("\n[DRY RUN] Exiting without fetching balances.");
    process.exit(0);
  }

  // Fetch all balances
  console.log("Fetching on-chain balances...");
  const allBalances = await getAllBalances(address);

  // Fetch prices for known tokens that have a balance
  const knownDenoms = Object.values(TOKEN_DENOMS).map((t) => t.denom);
  const denomsWithBalance = Object.keys(allBalances).filter((d) =>
    knownDenoms.includes(d)
  );

  let prices: Record<string, number> = {};
  if (denomsWithBalance.length > 0) {
    try {
      prices = await fetchTokenPrices(denomsWithBalance);
    } catch (e) {
      console.warn(
        `Could not fetch prices: ${e instanceof Error ? e.message : e}\n`
      );
    }
  }

  // Display all known-token balances
  console.log("\n--- Token Balances ---\n");
  console.log(
    `${"Token".padEnd(14)} ${"Balance".padStart(18)} ${"USD Value".padStart(14)}`
  );
  console.log("-".repeat(48));

  for (const [symbol, info] of Object.entries(TOKEN_DENOMS)) {
    const balance = allBalances[info.denom];
    if (balance === undefined || balance === 0) continue;
    const price = prices[info.denom];
    const usdStr = price ? `$${(balance * price).toFixed(2)}` : "—";
    console.log(
      `${symbol.padEnd(14)} ${fmtBalance(balance, symbol).padStart(18)} ${usdStr.padStart(14)}`
    );
  }

  // Show unknown denoms with balance
  const unknownDenoms = Object.keys(allBalances).filter(
    (d) => !knownDenoms.includes(d)
  );
  if (unknownDenoms.length > 0) {
    console.log(`\n(${unknownDenoms.length} other denom(s) with balance not shown)`);
  }

  if (!requirements) {
    if (ACCOUNT_LABEL) {
      console.error(
        `\nACCOUNT_LABEL "${ACCOUNT_LABEL}" not found in ACCOUNT_REQUIREMENTS. Exiting.\n`
      );
      process.exit(1);
    }
    console.log("\nNo ACCOUNT_LABEL set — display-only mode. Exiting.\n");
    process.exit(0);
  }

  // Validate against requirements
  console.log("\n--- Requirement Checks ---\n");

  let hasCritical = false;
  let hasWarning = false;
  const reportLines: string[] = [];
  const criticalTokens: string[] = [];
  const lowTokens: string[] = [];

  for (const req of requirements) {
    const tokenInfo = TOKEN_DENOMS[req.token];
    if (!tokenInfo) {
      console.warn(`  Unknown token in requirements: ${req.token}`);
      continue;
    }

    const balance = allBalances[tokenInfo.denom] ?? 0;

    const price = prices[tokenInfo.denom];
    const usdValue = price ? balance * price : undefined;
    const usdStr = usdValue !== undefined ? ` ($${usdValue.toFixed(2)})` : "";

    if (balance < req.minAmount) {
      hasCritical = true;
      const shortfall = req.minAmount - balance;
      const d = decimalsFor(req.token);
      const line =
        `  🚨 ${req.token.padEnd(14)} ` +
        `${balance.toFixed(d)}${usdStr} < min ${req.minAmount} ` +
        `(need ${shortfall.toFixed(d)} more)`;
      console.error(line);
      reportLines.push(line);
      criticalTokens.push(`${req.token} (need ${shortfall.toFixed(d)} more)`);
    } else if (balance < req.warnAmount) {
      hasWarning = true;
      const line =
        `  ⚠️  ${req.token.padEnd(14)} ` +
        `${balance.toFixed(decimalsFor(req.token))}${usdStr} < warn ${req.warnAmount}`;
      console.warn(line);
      reportLines.push(line);
      lowTokens.push(req.token);
    } else {
      console.log(
        `  ✅ ${req.token.padEnd(14)} ` +
          `${balance.toFixed(decimalsFor(req.token))}${usdStr} >= ${req.warnAmount}`
      );
    }
  }

  // Write outcome file for CI step consumption
  const outcome = hasCritical ? "fail" : hasWarning ? "warn" : "pass";
  const fs = await import("fs");
  const reportPath = "balance-report.json";
  const reportJson = JSON.stringify(
    {
      outcome,
      account: ACCOUNT_LABEL,
      address,
      details: reportLines,
      timestamp: new Date().toISOString(),
    },
    null,
    2
  );
  try {
    fs.writeFileSync(reportPath, reportJson);
    console.log(`\nReport written to ${reportPath}`);
  } catch (err) {
    console.error(`\nFailed to write report to ${reportPath}:`, err);
    console.log("\nBalance report JSON (stdout fallback):");
    console.log(reportJson);
  }

  // Exit with appropriate code
  if (hasCritical) {
    console.error(
      `\n🚨 CRITICAL: Account "${label}" is missing required tokens:\n` +
        criticalTokens.map((t) => `   - ${t}`).join("\n") +
        `\n\n   Please top up wallet ${address} before running tests.\n`
    );
    process.exit(1);
  }

  if (hasWarning) {
    console.warn(
      `\n⚠️  WARNING: Account "${label}" has low balances for: ${lowTokens.join(", ")}` +
        `\n   Tests will proceed but please top up ${address} soon.\n`
    );
    process.exit(2);
  }

  console.log(`\n✅ All balance checks passed for "${label}".\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
