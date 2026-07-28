/**
 * @file report-fleet-balances.ts
 * @description Posts a periodic Slack report of total assets across all E2E
 * accounts (the four test accounts plus the topup holding account), valued in
 * USD at current SQS prices.
 *
 * Read-only: derives addresses from the key secrets and queries balances —
 * no transactions are ever sent.
 *
 * Trend data: the workflow downloads the prior run's state artifact whose
 * timestamp is closest to the target window (7 days for weekly, 30 for
 * monthly) and passes it via `BASELINE_STATE_PATH`. The burn rate is scaled
 * by the *actual* elapsed days from that baseline's stored timestamp — never
 * by an assumed interval — so extra manual runs can't skew the math. The
 * report always states which baseline was used. This run's numbers are
 * written to `OUTPUT_STATE_PATH` for the workflow to upload (scheduled runs
 * only, unless `save_state` is requested).
 *
 * Environment variables:
 * - `E2E_PRIVATE_KEY_TOPUP`, `E2E_PRIVATE_KEY_PREVIEW`,
 *   `TEST_PRIVATE_KEY_SG/EU/US` — keys (address derivation only).
 * - `MODE`                — "full" (per-token tables) or "compact" (one line
 *                           per account). Default "full".
 * - `REPORT_LABEL`        — Slack header label ("monthly" / "weekly" /
 *                           "manual"); defaults to MODE.
 * - `BASELINE_STATE_PATH` — optional path to a prior run's state JSON.
 * - `OUTPUT_STATE_PATH`   — where to write this run's state JSON
 *                           (default "fleet-state.json").
 * - `SLACK_WEBHOOK_URL`   — optional; same balance-alerts channel as the
 *                           topup/sweep scripts.
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

import { deriveAddress } from "../utils/wallet-utils";
import { fetchTokenPrices } from "../utils/price-utils";
import {
  type TokenBalance,
  fetchAllKnownBalances,
  validatePrivateKey,
} from "../utils/fund-utils";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const ACCOUNTS = [
  { envVar: "TEST_PRIVATE_KEY_US", label: "Monitoring US" },
  { envVar: "TEST_PRIVATE_KEY_EU", label: "Monitoring EU" },
  { envVar: "TEST_PRIVATE_KEY_SG", label: "Monitoring SG" },
  { envVar: "E2E_PRIVATE_KEY_PREVIEW", label: "E2E Test Account" },
  { envVar: "E2E_PRIVATE_KEY_TOPUP", label: "Topup / holding" },
] as const;

interface TokenRow {
  symbol: string;
  amount: number;
  /** USD value, or null when no price was available. */
  usd: number | null;
}

interface AccountReport {
  label: string;
  address: string;
  rows: TokenRow[];
  totalUsd: number;
  usdc: number;
  unpricedSymbols: string[];
}

/** Persisted per-run state used as the baseline for the next report. */
interface FleetState {
  timestamp: string;
  grandTotalUsd: number;
  grandUsdc: number;
  accounts: { label: string; totalUsd: number; usdc: number }[];
}

const fmtUsd = (n: number): string =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDelta = (n: number): string => `${n >= 0 ? "+" : "−"}${fmtUsd(Math.abs(n))}`;

async function buildAccountReport(
  label: string,
  address: string,
  prices: Record<string, number>,
  balances: TokenBalance[]
): Promise<AccountReport> {
  const rows: TokenRow[] = [];
  const unpricedSymbols: string[] = [];
  let totalUsd = 0;
  let usdc = 0;

  for (const bal of balances) {
    const price = prices[bal.denom];
    const usd = price && price > 0 ? bal.amount * price : null;
    if (usd === null) {
      unpricedSymbols.push(bal.symbol);
    } else {
      totalUsd += usd;
    }
    // Sum every USDC variant (USDC, USDC.eth.axl, …) so the stable-balance
    // burn signal isn't under-reported or clobbered by whichever appears last.
    if (bal.symbol.startsWith("USDC")) usdc += bal.amount;
    rows.push({ symbol: bal.symbol, amount: bal.amount, usd });
  }

  rows.sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));
  return { label, address, rows, totalUsd, usdc, unpricedSymbols };
}

function loadBaseline(): FleetState | null {
  const p = process.env.BASELINE_STATE_PATH;
  if (!p || !fs.existsSync(p)) return null;
  try {
    const raw = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
    const state = JSON.parse(raw) as FleetState;
    // Validate every field the trend/delta math relies on: an unparsable
    // timestamp, missing grandUsdc, or non-array accounts would otherwise
    // surface as NaN totals or throw when building baselineByLabel.
    if (
      typeof state.timestamp !== "string" ||
      Number.isNaN(new Date(state.timestamp).getTime()) ||
      typeof state.grandTotalUsd !== "number" ||
      typeof state.grandUsdc !== "number" ||
      !Array.isArray(state.accounts)
    ) {
      console.warn("  ⚠ Baseline state file is malformed — ignoring.");
      return null;
    }
    return state;
  } catch (err) {
    console.warn(
      "  ⚠ Could not read baseline state:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

function trendLines(
  baseline: FleetState | null,
  grandTotalUsd: number,
  grandUsdc: number
): string[] {
  if (!baseline) {
    return ["_No prior report data — snapshot only (trend starts next run)._"];
  }

  const elapsedMs = Date.now() - new Date(baseline.timestamp).getTime();
  const elapsedDays = elapsedMs / 86_400_000;
  if (elapsedDays < 0.04) {
    return [
      `_Baseline (${baseline.timestamp.slice(0, 10)}) is less than an hour old — trend skipped._`,
    ];
  }

  const deltaUsd = grandTotalUsd - baseline.grandTotalUsd;
  const deltaUsdc = grandUsdc - baseline.grandUsdc;
  const lines = [
    `*Trend* (vs report from ${baseline.timestamp.slice(0, 10)}, ${elapsedDays.toFixed(1)} days ago):`,
    `  Total: ${fmtDelta(deltaUsd)}  |  USDC only: ${fmtDelta(deltaUsdc)} _(stable — cleanest burn signal; total Δ includes price moves)_`,
  ];

  const burnUsdc30 = (-deltaUsdc / elapsedDays) * 30;
  if (burnUsdc30 > 0.01) {
    const runwayMonths = grandUsdc / burnUsdc30;
    lines.push(
      `  USDC burn: ~${fmtUsd(burnUsdc30)}/30d → USDC runway ~${runwayMonths.toFixed(1)} months`
    );
  } else {
    lines.push(
      `  USDC burn: none over this window (net ${fmtDelta(deltaUsdc)} — inflow or flat)`
    );
  }
  return lines;
}

async function postSlack(
  sections: string[],
  headerText: string
): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("  SLACK_WEBHOOK_URL not set — skipping Slack post.");
    return;
  }
  // Slack caps section text at 3000 chars, so the full report (5 accounts x
  // token tables) must be split into one section block per account rather
  // than a single body. Truncate defensively in case a single section ever
  // outgrows the cap.
  const payload = {
    text: headerText,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: headerText, emoji: true },
      },
      ...sections
        .filter((s) => s.trim().length > 0)
        .map((s) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: s.length > 2900 ? `${s.slice(0, 2900)}\n_…truncated_` : s,
          },
        })),
    ],
  };
  const resp = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  if (!resp.ok) {
    throw new Error(`Slack webhook responded ${resp.status}: ${await resp.text()}`);
  }
  console.log("  Slack report sent.");
}

async function main(): Promise<void> {
  const mode = process.env.MODE === "compact" ? "compact" : "full";
  const outputStatePath = process.env.OUTPUT_STATE_PATH ?? "fleet-state.json";

  console.log(`\n=== E2E Fleet Balance Report (${mode}) ===`);

  // Resolve all accounts and fetch balances first, then price every denom in
  // one SQS call.
  const resolved: { label: string; address: string; balances: TokenBalance[] }[] = [];
  for (const acct of ACCOUNTS) {
    const key = process.env[acct.envVar];
    if (!key) {
      console.error(`❌ ${acct.envVar} is not set.`);
      process.exit(1);
    }
    validatePrivateKey(key, acct.envVar, acct.label);
    const { address } = await deriveAddress(key);
    const balances = await fetchAllKnownBalances(address);
    resolved.push({ label: acct.label, address, balances });
  }

  const denoms = [
    ...new Set(resolved.flatMap((r) => r.balances.map((b) => b.denom))),
  ];
  let prices: Record<string, number> = {};
  try {
    prices = await fetchTokenPrices(denoms);
  } catch (err) {
    console.warn(
      "  ⚠ Price fetch failed — USD totals will be incomplete:",
      err instanceof Error ? err.message : err
    );
  }

  const reports: AccountReport[] = [];
  for (const r of resolved) {
    reports.push(await buildAccountReport(r.label, r.address, prices, r.balances));
  }

  const grandTotalUsd = reports.reduce((s, r) => s + r.totalUsd, 0);
  const grandUsdc = reports.reduce((s, r) => s + r.usdc, 0);
  const allUnpriced = [...new Set(reports.flatMap((r) => r.unpricedSymbols))];
  const baseline = loadBaseline();
  const baselineByLabel = new Map(
    (baseline?.accounts ?? []).map((a) => [a.label, a])
  );

  // Console + Slack body. One section per account — Slack caps each section
  // block at 3000 chars, and the 5 token tables together exceed that.
  const sections: string[] = [];
  sections.push(
    `*Grand total: ${fmtUsd(grandTotalUsd)}*  (USDC across all accounts: ${grandUsdc.toFixed(2)})`
  );

  for (const r of reports) {
    const acctLines: string[] = [];
    const base = baselineByLabel.get(r.label);
    const delta = base ? `  (Δ ${fmtDelta(r.totalUsd - base.totalUsd)})` : "";
    acctLines.push(`*${r.label}*: ${fmtUsd(r.totalUsd)}${delta} — \`${r.address}\``);
    if (mode === "full" && r.rows.length > 0) {
      const maxSym = Math.max(...r.rows.map((t) => t.symbol.length), 6);
      acctLines.push("```");
      acctLines.push(`${"Token".padEnd(maxSym)}  ${"Amount".padStart(16)}  ${"USD".padStart(12)}`);
      acctLines.push(`${"─".repeat(maxSym)}  ${"─".repeat(16)}  ${"─".repeat(12)}`);
      for (const t of r.rows) {
        const d = t.amount >= 1000 ? 2 : 4;
        acctLines.push(
          `${t.symbol.padEnd(maxSym)}  ${t.amount.toFixed(d).padStart(16)}  ${(t.usd === null ? "n/a" : fmtUsd(t.usd)).padStart(12)}`
        );
      }
      acctLines.push("```");
    }
    sections.push(acctLines.join("\n"));
  }

  const tailLines: string[] = [];
  tailLines.push(...trendLines(baseline, grandTotalUsd, grandUsdc));
  if (allUnpriced.length > 0) {
    tailLines.push(
      `_No price for: ${allUnpriced.join(", ")} — excluded from USD totals._`
    );
  }

  const serverUrl = process.env.GITHUB_SERVER_URL;
  const repo = process.env.GITHUB_REPOSITORY;
  const runId = process.env.GITHUB_RUN_ID;
  if (serverUrl && repo && runId) {
    tailLines.push(`*Details:* <${serverUrl}/${repo}/actions/runs/${runId}|View run logs>`);
  }
  sections.push(tailLines.join("\n"));

  const body = sections.join("\n\n");
  console.log("\n" + body.replace(/[*_`]/g, "") + "\n");

  // Persist this run's state for future baselines (workflow decides whether
  // to upload it as an artifact).
  const state: FleetState = {
    timestamp: new Date().toISOString(),
    grandTotalUsd,
    grandUsdc,
    accounts: reports.map((r) => ({
      label: r.label,
      totalUsd: r.totalUsd,
      usdc: r.usdc,
    })),
  };
  fs.writeFileSync(outputStatePath, JSON.stringify(state, null, 2));
  console.log(`  State written to ${outputStatePath}`);

  const label = process.env.REPORT_LABEL || mode;
  await postSlack(sections, `📊 E2E Fleet Balance Report (${label})`);
}

main().catch((err) => {
  console.error("❌ Report failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
