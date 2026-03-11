/**
 * @file balance-checker.ts
 * @description Balance checker utility for e2e tests.
 *
 * Checks wallet balances and logs results. This utility is **always warn-only**:
 * it never throws on insufficient balances. The blocking behaviour lives in
 * the precursor script (`scripts/check-balances.ts`).
 *
 * Supports two ways to identify an account:
 * - A hex-encoded private key (auto-detected, address derived via deriveAddress)
 * - A bech32 `osmo1...` address
 *
 * Supports two balance requirement units:
 * - `"token"` (default) — amount is in token units (e.g. 1.1 OSMO)
 * - `"usd"` — amount is in US dollars, converted to tokens via live SQS prices
 *   with a configurable buffer (default 1 %, set via `PRICE_BUFFER_PERCENT`)
 *
 * @example
 * ```ts
 * // Token-unit check (default)
 * await ensureBalances(address, [{ token: 'OSMO', amount: 1.1 }]);
 *
 * // USD check — "need $1.55 worth of BTC"
 * await ensureBalances(address, [{ token: 'BTC', amount: 1.55, unit: 'usd' }]);
 *
 * // Pass a private key instead of address
 * await ensureBalances(privateKeyHex, [{ token: 'USDC', amount: 5 }]);
 * ```
 *
 * ## Environment Variables
 * - `SKIP_BALANCE_CHECKS=true` — Skip all balance checks
 * - `PRICE_BUFFER_PERCENT` — Buffer added to USD→token conversion (default: 1)
 * - `REST_ENDPOINT` — Custom LCD endpoint (default: https://lcd.osmosis.zone)
 */

import { REST_ENDPOINT } from "./config";
import { fetchTokenPrices } from "./price-utils";
import { deriveAddress, isPrivateKey } from "./wallet-utils";

export const TOKEN_DENOMS: Record<
  string,
  { denom: string; decimals: number }
> = {
  OSMO: { denom: "uosmo", decimals: 6 },
  USDC: {
    denom: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
    decimals: 6,
  },
  ATOM: {
    denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
    decimals: 6,
  },
  TIA: {
    denom: "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
    decimals: 6,
  },
  INJ: {
    denom: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
    decimals: 18,
  },
  AKT: {
    denom: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
    decimals: 6,
  },
  BTC: {
    denom: "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
    decimals: 8,
  },
  WBTC: {
    denom: "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
    decimals: 8,
  },
  USDT: {
    denom: "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
    decimals: 6,
  },
  "USDC.eth.axl": {
    denom: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
    decimals: 6,
  },
  DAI: {
    denom: "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
    decimals: 18,
  },
  "ETH.axl": {
    denom: "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
    decimals: 18,
  },
  ETH: {
    denom: "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH",
    decimals: 18,
  },
  SOL: {
    denom: "factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL",
    decimals: 9,
  },
  milkTIA: {
    denom: "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
    decimals: 6,
  },
};

export interface BalanceRequirement {
  token: string;
  amount: number;
  /** `"token"` (default) = amount in token units; `"usd"` = amount in US dollars. */
  unit?: "token" | "usd";
}

interface BalanceResponse {
  balances: Array<{ denom: string; amount: string }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateAddress(address: string): boolean {
  if (!address.startsWith("osmo1")) {
    console.warn(
      `  Invalid Osmosis address format: expected "osmo1...", got "${address.substring(0, 10)}..."`
    );
    console.warn("  Skipping balance checks.\n");
    return false;
  }
  if (address.length < 39 || address.length > 50) {
    console.warn(
      `  Invalid address length: expected 39-50, got ${address.length}`
    );
    console.warn("  Skipping balance checks.\n");
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Core balance fetching
// ---------------------------------------------------------------------------

/**
 * Fetches the human-readable balance of a specific denomination for a wallet.
 */
export async function getBalance(
  address: string,
  denom: string
): Promise<number> {
  const url = `${REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch balances: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as BalanceResponse;
  const balance = data.balances.find((b) => b.denom === denom);
  if (!balance) return 0;

  const tokenInfo = Object.values(TOKEN_DENOMS).find(
    (t) => t.denom === denom
  );
  const decimals = tokenInfo?.decimals ?? 6;
  return parseFloat(balance.amount) / Math.pow(10, decimals);
}

/**
 * Fetches all non-zero balances for an address.
 * Returns a map of denom → human-readable balance.
 */
export async function getAllBalances(
  address: string
): Promise<Record<string, number>> {
  const url = `${REST_ENDPOINT}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch balances: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as BalanceResponse;
  const result: Record<string, number> = {};

  for (const { denom, amount } of data.balances) {
    const raw = parseFloat(amount);
    if (raw === 0) continue;
    const tokenInfo = Object.values(TOKEN_DENOMS).find(
      (t) => t.denom === denom
    );
    const decimals = tokenInfo?.decimals ?? 6;
    result[denom] = raw / Math.pow(10, decimals);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Resolve address from private key or address string
// ---------------------------------------------------------------------------

/**
 * Resolves a bech32 address from either a hex private key or an osmo1... address.
 */
export async function resolveAddress(
  privateKeyOrAddress: string
): Promise<string | null> {
  if (isPrivateKey(privateKeyOrAddress)) {
    try {
      const { address } = await deriveAddress(privateKeyOrAddress);
      return address;
    } catch (e) {
      console.warn(
        `  Failed to derive address from private key: ${e instanceof Error ? e.message : e}`
      );
      return null;
    }
  }
  return privateKeyOrAddress;
}

// ---------------------------------------------------------------------------
// USD → token conversion
// ---------------------------------------------------------------------------

const _rawBuffer = parseFloat(process.env.PRICE_BUFFER_PERCENT ?? "1");
const PRICE_BUFFER = 1 + ((Number.isFinite(_rawBuffer) ? _rawBuffer : 1) / 100);

async function resolveUsdRequirements(
  requirements: BalanceRequirement[]
): Promise<{ token: string; requiredTokens: number }[]> {
  const usdReqs = requirements.filter((r) => r.unit === "usd");
  const tokenReqs = requirements.filter((r) => r.unit !== "usd");

  const resolved = tokenReqs.map((r) => ({
    token: r.token,
    requiredTokens: r.amount,
  }));

  if (usdReqs.length === 0) return resolved;

  const denoms = usdReqs.map((r) => {
    const info = TOKEN_DENOMS[r.token];
    if (!info) throw new Error(`Unknown token: ${r.token}`);
    return info.denom;
  });

  let prices: Record<string, number>;
  try {
    prices = await fetchTokenPrices(denoms);
  } catch (e) {
    console.warn(
      `  Could not fetch prices for USD conversion; USD-denominated requirements will be skipped. Reason: ${e instanceof Error ? e.message : e}`
    );
    return resolved;
  }

  for (const req of usdReqs) {
    const info = TOKEN_DENOMS[req.token]!;
    const price = prices[info.denom];
    if (!price || price <= 0) {
      console.warn(
        `  No price available for ${req.token}; skipping USD-denominated requirement of $${req.amount}.`
      );
      continue;
    }
    const tokensNeeded = (req.amount * PRICE_BUFFER) / price;
    const d = Math.min(TOKEN_DENOMS[req.token]?.decimals ?? 6, 8);
    console.log(
      `  ${req.token}: $${req.amount} @ $${price.toFixed(4)}/${req.token} → ${tokensNeeded.toFixed(d)} ${req.token} (with ${((PRICE_BUFFER - 1) * 100).toFixed(0)}% buffer)`
    );
    resolved.push({ token: req.token, requiredTokens: tokensNeeded });
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check that a wallet has sufficient balances for the given requirements.
 *
 * **Always warn-only** — logs results but never throws. Use the precursor
 * script (`check-balances.ts`) for blocking checks.
 *
 * @param privateKeyOrAddress - Hex private key or osmo1... address.
 * @param requirements - Array of token balance requirements.
 */
export async function ensureBalances(
  privateKeyOrAddress: string,
  requirements: BalanceRequirement[]
): Promise<void> {
  if (process.env.SKIP_BALANCE_CHECKS === "true") {
    console.log("  Balance checks skipped (SKIP_BALANCE_CHECKS=true)\n");
    return;
  }

  const address = await resolveAddress(privateKeyOrAddress);
  if (!address || !validateAddress(address)) return;

  console.log(
    `\n  Checking balances for ${address} (${requirements.length} tokens)...\n`
  );

  let resolved: { token: string; requiredTokens: number }[];
  try {
    resolved = await resolveUsdRequirements(requirements);
  } catch (e) {
    console.warn(
      `  Failed to resolve requirements: ${e instanceof Error ? e.message : e}\n`
    );
    return;
  }

  const skippedCount = requirements.length - resolved.length;
  if (skippedCount > 0) {
    console.warn(
      `  ${skippedCount} USD-denominated requirement(s) could not be validated (price fetch failed).`
    );
  }

  let allBalances: Record<string, number>;
  try {
    allBalances = await getAllBalances(address);
  } catch (e) {
    console.warn(
      `  Failed to fetch balances: ${e instanceof Error ? e.message : e}\n`
    );
    return;
  }

  const results = resolved.map(({ token, requiredTokens }) => {
    const tokenInfo = TOKEN_DENOMS[token];
    if (!tokenInfo) return { token, required: requiredTokens, current: 0, error: `Unknown token: ${token}` };
    const currentBalance = allBalances[tokenInfo.denom] ?? 0;
    return { token, required: requiredTokens, current: currentBalance };
  });

  const insufficientTokens: string[] = [];

  for (const result of results) {
    const { token, required, current } = result;

    if ("error" in result) {
      console.warn(`  Failed to check ${token}: ${result.error}`);
      continue;
    }

    const d = Math.min(TOKEN_DENOMS[token]?.decimals ?? 6, 8);
    if (current >= required) {
      console.log(
        `  ${token}: ${current.toFixed(d)} >= ${required.toFixed(d)} (ok)`
      );
    } else {
      const shortfall = required - current;
      console.warn(
        `  ${token}: ${current.toFixed(d)} < ${required.toFixed(d)} (need ${shortfall.toFixed(d)} more)`
      );
      insufficientTokens.push(token);
    }
  }

  if (insufficientTokens.length > 0) {
    console.warn(
      `\n  Insufficient balances for: ${insufficientTokens.join(", ")}` +
        `\n  Wallet: ${address}\n`
    );
  } else if (skippedCount > 0) {
    console.warn(
      `\n  Token-unit checks passed, but ${skippedCount} USD requirement(s) were skipped.\n`
    );
  } else {
    console.log(`\n  All balance checks passed.\n`);
  }
}
