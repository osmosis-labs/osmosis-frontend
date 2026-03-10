/**
 * @file fund-utils.ts
 * @description Shared utilities for E2E fund management (migration and topup).
 *
 * Provides balance fetching with raw + human-readable amounts, coin building
 * for `sendTokens()`, distribution calculation, topup deficit calculation,
 * and formatted console output helpers.
 *
 * Used by `scripts/migrate-funds.ts` and `scripts/topup-accounts.ts`.
 */

import BigNumber from "bignumber.js";
import type { Coin } from "@cosmjs/stargate";

import type { AccountBalanceRequirement } from "./balance-config";
import { TOKEN_DENOMS } from "./balance-checker";
import { REST_ENDPOINT } from "./config";
import { fetchTokenPrices } from "./price-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TokenBalance {
  symbol: string;
  denom: string;
  /** Human-readable balance (e.g. 12.5 OSMO). */
  amount: number;
  /** Raw on-chain balance as a string integer (e.g. "12500000"). */
  rawAmount: string;
  decimals: number;
}

export interface DistributionEntry {
  label: string;
  address: string;
  coins: Coin[];
  summary: { symbol: string; amount: number }[];
}

export interface ReserveConfig {
  osmo: number;
  usdc: number;
}

// ---------------------------------------------------------------------------
// Private key / mnemonic validation
// ---------------------------------------------------------------------------

/**
 * Validates that a secret env var contains a well-formed hex private key
 * (64 hex chars, optionally 0x-prefixed). Also gracefully handles BIP39
 * mnemonic phrases (12 or 24 words) as a fallback format.
 *
 * Logs only the env var name and safe metadata on failure — never the
 * secret itself.
 */
export function validatePrivateKey(
  value: string,
  envVarName: string,
  label?: string
): void {
  const trimmed = value.trim();
  const tag = label ? `${envVarName} (${label})` : envVarName;

  if (trimmed.includes(" ")) {
    const wordCount = trimmed.split(/\s+/).length;
    if (wordCount !== 12 && wordCount !== 24) {
      console.error(
        `❌ ${tag}: mnemonic must be 12 or 24 words, got ${wordCount}.`
      );
      process.exit(1);
    }
    return;
  }

  const normalized = trimmed.replace(/^0x/, "");
  if (!/^[0-9a-fA-F]+$/.test(normalized)) {
    console.error(
      `❌ ${tag}: value is not valid hex and not a mnemonic (length=${trimmed.length}).`
    );
    process.exit(1);
  }
  if (normalized.length !== 64) {
    console.error(
      `❌ ${tag}: hex key must be 64 chars, got ${normalized.length}.`
    );
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// USD → token resolution for requirements
// ---------------------------------------------------------------------------

const _priceCache: Record<string, number> = {};

/**
 * Converts an array of balance requirements (which may use `unit: "usd"`)
 * into token-unit `{ token, warnAmount }` pairs suitable for fund-utils
 * functions.
 *
 * Token-unit requirements pass through unchanged. USD requirements are
 * converted to token amounts using live SQS prices. Prices are cached
 * for the lifetime of the process so repeated calls (one per account)
 * don't make redundant API requests.
 *
 * Throws on price fetch failure or missing prices — fund scripts must
 * not proceed with unconverted USD amounts as that would send wildly
 * wrong quantities.
 */
export async function resolveRequirementsToTokenUnits(
  reqs: AccountBalanceRequirement[]
): Promise<{ token: string; warnAmount: number }[]> {
  const tokenReqs = reqs.filter((r) => r.unit !== "usd");
  const usdReqs = reqs.filter((r) => r.unit === "usd");

  const resolved = tokenReqs.map((r) => ({
    token: r.token,
    warnAmount: r.warnAmount,
  }));

  if (usdReqs.length === 0) return resolved;

  const missingDenoms: string[] = [];
  for (const r of usdReqs) {
    const info = TOKEN_DENOMS[r.token];
    if (!info) throw new Error(`Unknown token in requirements: ${r.token}`);
    if (_priceCache[info.denom] === undefined) missingDenoms.push(info.denom);
  }

  if (missingDenoms.length > 0) {
    const fresh = await fetchTokenPrices(missingDenoms);
    Object.assign(_priceCache, fresh);
  }

  for (const req of usdReqs) {
    const info = TOKEN_DENOMS[req.token]!;
    const price = _priceCache[info.denom];
    if (!price || price <= 0) {
      throw new Error(
        `No price for ${req.token}; cannot convert USD warnAmount ($${req.warnAmount}) to token units.`
      );
    }
    const tokenAmount = req.warnAmount / price;
    const d = Math.min(info.decimals, 8);
    console.log(
      `  ${req.token}: warnAmount $${req.warnAmount} @ $${price.toFixed(4)}/${req.token} → ${tokenAmount.toFixed(d)} ${req.token}`
    );
    resolved.push({ token: req.token, warnAmount: tokenAmount });
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Balance fetching
// ---------------------------------------------------------------------------

interface BalanceResponse {
  balances: Array<{ denom: string; amount: string }>;
}

/**
 * Fetches all on-chain balances for an address, returning only tokens that
 * appear in `TOKEN_DENOMS` (i.e. tokens the E2E tests care about).
 */
export async function fetchAllKnownBalances(
  address: string
): Promise<TokenBalance[]> {
  const url = `${REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch balances: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as BalanceResponse;
  const results: TokenBalance[] = [];

  for (const [symbol, info] of Object.entries(TOKEN_DENOMS)) {
    const entry = data.balances.find((b) => b.denom === info.denom);
    if (!entry || entry.amount === "0") continue;

    results.push({
      symbol,
      denom: info.denom,
      amount: parseFloat(entry.amount) / Math.pow(10, info.decimals),
      rawAmount: entry.amount,
      decimals: info.decimals,
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Coin building (for extract phase)
// ---------------------------------------------------------------------------

/**
 * Builds a `Coin[]` array from token balances for sending.
 *
 * Withholds the specified reserve amounts for OSMO and USDC so the source
 * account retains enough for gas and a USDC war chest.
 */
export function buildSendCoins(
  balances: TokenBalance[],
  reserves: ReserveConfig
): Coin[] {
  const coins: Coin[] = [];

  for (const bal of balances) {
    let raw = new BigNumber(bal.rawAmount);

    if (bal.symbol === "OSMO" && reserves.osmo > 0) {
      const reserveRaw = new BigNumber(reserves.osmo)
        .times(new BigNumber(10).pow(bal.decimals))
        .integerValue(BigNumber.ROUND_UP);
      raw = raw.minus(reserveRaw);
    }

    if (bal.symbol === "USDC" && reserves.usdc > 0) {
      const reserveRaw = new BigNumber(reserves.usdc)
        .times(new BigNumber(10).pow(bal.decimals))
        .integerValue(BigNumber.ROUND_UP);
      raw = raw.minus(reserveRaw);
    }

    if (raw.lte(0)) continue;
    coins.push({ denom: bal.denom, amount: raw.toFixed(0) });
  }

  return coins;
}

// ---------------------------------------------------------------------------
// Distribution calculation (migrate — distribute phase)
// ---------------------------------------------------------------------------

export interface AccountTarget {
  label: string;
  address: string;
  requirements: { token: string; warnAmount: number }[];
}

/**
 * Distributes available funds (after reserves) across target accounts
 * proportionally by their `warnAmount` ratios.
 *
 * Unlike topup, this does NOT cap at warnAmount — every available token is
 * split by ratio so the topup account retains only the configured reserves.
 * Per-target amounts are floored (roundDown) so rounding dust may remain.
 */
export function calculateDistribution(
  available: TokenBalance[],
  targets: AccountTarget[],
  reserves: ReserveConfig
): DistributionEntry[] {
  const distributableRaw: Record<string, BigNumber> = {};
  for (const b of available) {
    let raw = new BigNumber(b.rawAmount);

    if (b.symbol === "OSMO" && reserves.osmo > 0) {
      raw = raw.minus(
        new BigNumber(reserves.osmo).times(new BigNumber(10).pow(b.decimals)).integerValue(BigNumber.ROUND_UP)
      );
    }
    if (b.symbol === "USDC" && reserves.usdc > 0) {
      raw = raw.minus(
        new BigNumber(reserves.usdc).times(new BigNumber(10).pow(b.decimals)).integerValue(BigNumber.ROUND_UP)
      );
    }

    if (raw.gt(0)) {
      distributableRaw[b.denom] = raw;
    }
  }

  const totalNeededByToken: Record<string, number> = {};
  for (const target of targets) {
    for (const req of target.requirements) {
      totalNeededByToken[req.token] =
        (totalNeededByToken[req.token] ?? 0) + req.warnAmount;
    }
  }

  const distribution: DistributionEntry[] = [];

  for (const target of targets) {
    const coins: Coin[] = [];
    const summary: { symbol: string; amount: number }[] = [];

    for (const req of target.requirements) {
      const tokenInfo = TOKEN_DENOMS[req.token];
      if (!tokenInfo) continue;

      const avail = distributableRaw[tokenInfo.denom];
      if (!avail || avail.lte(0)) continue;

      const totalNeeded = totalNeededByToken[req.token] ?? 0;
      if (totalNeeded <= 0) continue;

      const rawToSend = avail
        .times(req.warnAmount)
        .div(totalNeeded)
        .integerValue(BigNumber.ROUND_DOWN);

      if (rawToSend.lte(0)) continue;

      coins.push({ denom: tokenInfo.denom, amount: rawToSend.toFixed(0) });
      summary.push({
        symbol: req.token,
        amount: Number(rawToSend.div(new BigNumber(10).pow(tokenInfo.decimals))),
      });
    }

    distribution.push({
      label: target.label,
      address: target.address,
      coins,
      summary,
    });
  }

  return distribution;
}

// ---------------------------------------------------------------------------
// Topup calculation
// ---------------------------------------------------------------------------

/**
 * Calculates topup amounts for each target account.
 *
 * Target balance = `warnAmount * multiplier`. If the account's current balance
 * is already at or above the target, nothing is sent. Respects reserves in the
 * topup account so it won't overdraw.
 *
 * @param multiplier - Multiplier applied to warnAmount to compute the target (default 1.5).
 */
export function calculateTopup(
  topupBalances: TokenBalance[],
  targets: (AccountTarget & { currentBalances: TokenBalance[] })[],
  reserves: ReserveConfig,
  multiplier: number = 1.5
): DistributionEntry[] {
  const distributableRaw: Record<string, BigNumber> = {};
  for (const b of topupBalances) {
    let raw = new BigNumber(b.rawAmount);

    if (b.symbol === "OSMO" && reserves.osmo > 0) {
      raw = raw.minus(
        new BigNumber(reserves.osmo).times(new BigNumber(10).pow(b.decimals)).integerValue(BigNumber.ROUND_UP)
      );
    }
    if (b.symbol === "USDC" && reserves.usdc > 0) {
      raw = raw.minus(
        new BigNumber(reserves.usdc).times(new BigNumber(10).pow(b.decimals)).integerValue(BigNumber.ROUND_UP)
      );
    }

    if (raw.gt(0)) {
      distributableRaw[b.denom] = raw;
    }
  }

  const distribution: DistributionEntry[] = [];

  for (const target of targets) {
    const coins: Coin[] = [];
    const summary: { symbol: string; amount: number }[] = [];

    for (const req of target.requirements) {
      const tokenInfo = TOKEN_DENOMS[req.token];
      if (!tokenInfo) continue;

      let avail = distributableRaw[tokenInfo.denom];
      if (!avail || avail.lte(0)) continue;

      const scale = new BigNumber(10).pow(tokenInfo.decimals);
      const targetRaw = new BigNumber(req.warnAmount)
        .times(multiplier)
        .times(scale)
        .integerValue(BigNumber.ROUND_DOWN);
      const currentRaw = new BigNumber(
        target.currentBalances.find((b) => b.symbol === req.token)?.rawAmount ?? "0"
      );
      const deficitRaw = targetRaw.minus(currentRaw);

      if (deficitRaw.lte(0)) continue;
      const rawToSend = deficitRaw.lt(avail)
        ? deficitRaw
        : avail;

      if (rawToSend.lte(0)) continue;

      distributableRaw[tokenInfo.denom] = avail.minus(rawToSend);
      coins.push({ denom: tokenInfo.denom, amount: rawToSend.toFixed(0) });
      summary.push({
        symbol: req.token,
        amount: Number(rawToSend.div(new BigNumber(10).pow(tokenInfo.decimals))),
      });
    }

    distribution.push({
      label: target.label,
      address: target.address,
      coins,
      summary,
    });
  }

  return distribution;
}

// ---------------------------------------------------------------------------
// Swap gap report
// ---------------------------------------------------------------------------

interface SwapGap {
  symbol: string;
  available: number;
  needed: number;
  gap: number;
}

/**
 * Computes the gap between what the topup account holds (after reserves) and
 * what all target accounts need (total warnAmount per token).
 */
export function computeSwapGaps(
  available: TokenBalance[],
  targets: AccountTarget[],
  reserves: ReserveConfig
): SwapGap[] {
  const neededByToken = new Map<string, number>();

  for (const target of targets) {
    for (const req of target.requirements) {
      neededByToken.set(
        req.token,
        (neededByToken.get(req.token) ?? 0) + req.warnAmount
      );
    }
  }

  const gaps: SwapGap[] = [];
  const seen: Record<string, boolean> = {};
  const allSymbols: string[] = [];
  for (const b of available) {
    if (!seen[b.symbol]) {
      seen[b.symbol] = true;
      allSymbols.push(b.symbol);
    }
  }
  neededByToken.forEach((_v, k) => {
    if (!seen[k]) {
      seen[k] = true;
      allSymbols.push(k);
    }
  });

  for (const symbol of allSymbols) {
    let avail = available.find((b) => b.symbol === symbol)?.amount ?? 0;

    if (symbol === "OSMO") avail = Math.max(0, avail - reserves.osmo);
    if (symbol === "USDC") avail = Math.max(0, avail - reserves.usdc);

    const needed = neededByToken.get(symbol) ?? 0;
    gaps.push({ symbol, available: avail, needed, gap: avail - needed });
  }

  return gaps.sort((a, b) => a.gap - b.gap);
}

// ---------------------------------------------------------------------------
// Console output helpers
// ---------------------------------------------------------------------------

export function printBalanceTable(
  label: string,
  balances: TokenBalance[]
): void {
  console.log(`\n  ${label}:`);
  if (balances.length === 0) {
    console.log("    (no known token balances)");
    return;
  }

  const maxSym = Math.max(...balances.map((b) => b.symbol.length), 6);
  console.log(`    ${"Token".padEnd(maxSym)}  Amount`);
  console.log(`    ${"─".repeat(maxSym)}  ${"─".repeat(16)}`);
  for (const b of balances) {
    const d = Math.min(b.decimals, 8);
    console.log(`    ${b.symbol.padEnd(maxSym)}  ${b.amount.toFixed(d)}`);
  }
}

export function printSwapReport(gaps: SwapGap[]): void {
  console.log("\n  Swap Gap Report:");
  const maxSym = Math.max(...gaps.map((g) => g.symbol.length), 6);
  console.log(
    `    ${"Token".padEnd(maxSym)}  ${"Available".padStart(12)}  ${"Needed".padStart(12)}  ${"Gap".padStart(12)}  Status`
  );
  console.log(
    `    ${"─".repeat(maxSym)}  ${"─".repeat(12)}  ${"─".repeat(12)}  ${"─".repeat(12)}  ${"─".repeat(14)}`
  );

  for (const g of gaps) {
    const status =
      g.gap < -0.0001
        ? "SWAP NEEDED"
        : g.gap > 0.0001
          ? "surplus"
          : "ok";
    console.log(
      `    ${g.symbol.padEnd(maxSym)}  ${g.available.toFixed(4).padStart(12)}  ${g.needed.toFixed(4).padStart(12)}  ${(g.gap >= 0 ? "+" : "") + g.gap.toFixed(4).padStart(11)}  ${status}`
    );
  }
}

export function printDistributionPlan(entries: DistributionEntry[]): void {
  console.log("\n  Distribution Plan:");
  for (const entry of entries) {
    console.log(`\n    ${entry.label} (${entry.address}):`);
    if (entry.summary.length === 0) {
      console.log("      (nothing to send)");
      continue;
    }
    for (const s of entry.summary) {
      console.log(`      ${s.symbol}: ${s.amount.toFixed(6)}`);
    }
  }
}

export function printReserves(reserves: ReserveConfig): void {
  console.log(`  Reserves: ${reserves.osmo} OSMO, ${reserves.usdc} USDC`);
}

export function parseReserves(): ReserveConfig {
  const osmo = parseFloat(process.env.RESERVE_OSMO ?? "5");
  const usdc = parseFloat(process.env.RESERVE_USDC ?? "500");
  return {
    osmo: Math.max(0, Number.isFinite(osmo) ? osmo : 5),
    usdc: Math.max(0, Number.isFinite(usdc) ? usdc : 500),
  };
}
