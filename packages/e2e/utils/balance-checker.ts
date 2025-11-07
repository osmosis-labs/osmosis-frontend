/**
 * Balance checker utility for e2e tests
 * Provides functions to check wallet balances before running tests
 * to fail fast with clear error messages instead of wasting CI time
 * Optionally, you can skip the checks by setting the SKIP_BALANCE_CHECKS environment variable to true.
 * or set warnOnly to true to log warnings instead of throwing errors.
 * 
 * ## Usage
 * 
 * ### Strict mode (default):
 * ```typescript
 * await ensureBalances(walletId, [
 *   { token: 'ATOM', amount: 0.1 },
 *   { token: 'USDC', amount: 1.0 }
 * ]);
 * ```
 * 
 * ### Warn-only mode (for development):
 * ```typescript
 * // Per-call option
 * await ensureBalances(walletId, [...], { warnOnly: true });
 * 
 * // Or use environment variable to skip all checks
 * // SKIP_BALANCE_CHECKS=true npx playwright test
 * ```
 * 
 * ## Environment Variables
 * - `SKIP_BALANCE_CHECKS=true` - Skip all balance checks (useful for local dev)
 * - `REST_ENDPOINT` - Custom Osmosis REST endpoint (defaults to https://lcd.osmosis.zone)
 */

// Token denomination mapping - from test files
export const TOKEN_DENOMS: Record<string, { denom: string; decimals: number }> = {
  OSMO: { 
    denom: "uosmo", 
    decimals: 6 
  },
  USDC: { 
    denom: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", 
    decimals: 6 
  },
  ATOM: { 
    denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", 
    decimals: 6 
  },
  TIA: { 
    denom: "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877", 
    decimals: 6 
  },
  INJ: { 
    denom: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273", 
    decimals: 18 
  },
  AKT: { 
    denom: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4", 
    decimals: 6 
  },
  BTC: { 
    denom: "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC", 
    decimals: 8 
  },
  WBTC: { 
    denom: "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc", 
    decimals: 8 
  },
  USDT: { 
    denom: "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT", 
    decimals: 6 
  },
  "USDC.eth.axl": { 
    denom: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858", 
    decimals: 6 
  },
  DAI: { 
    denom: "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7", 
    decimals: 18 
  },
  "ETH.axl": { 
    denom: "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5", 
    decimals: 18 
  },
  ETH: { 
    denom: "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH", 
    decimals: 18 
  },
  SOL: { 
    denom: "factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL", 
    decimals: 9 
  },
  milkTIA: { 
    denom: "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA", 
    decimals: 6 
  },
};

interface BalanceRequirement {
  token: string;
  amount: number;
}

interface EnsureBalancesOptions {
  /** If true, log warnings instead of throwing errors when balances are insufficient */
  warnOnly?: boolean;
}

interface BalanceResponse {
  balances: Array<{
    denom: string;
    amount: string;
  }>;
}

/**
 * Get the REST endpoint for Osmosis mainnet
 */
function getRestEndpoint(): string {
  return process.env.REST_ENDPOINT || "https://lcd.osmosis.zone";
}

/**
 * Fetch balance for a specific token denomination
 */
export async function getBalance(
  address: string,
  denom: string
): Promise<number> {
  const restEndpoint = getRestEndpoint();
  const url = `${restEndpoint}/cosmos/bank/v1beta1/balances/${address}?pagination.limit=1000`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch balances: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as BalanceResponse;
    const balance = data.balances.find((b) => b.denom === denom);

    if (!balance) {
      return 0;
    }

    // Find decimals for this denom
    const tokenInfo = Object.values(TOKEN_DENOMS).find(t => t.denom === denom);
    const decimals = tokenInfo?.decimals || 6;

    // Convert from chain decimals to human-readable
    return parseFloat(balance.amount) / Math.pow(10, decimals);
  } catch (error) {
    console.error(`Error fetching balance for ${denom}:`, error);
    throw new Error(`Failed to fetch balance: ${error}`);
  }
}

/**
 * Ensure a single balance meets the minimum requirement
 */
export async function ensureBalance(
  address: string,
  token: string,
  minAmount: number,
  options?: EnsureBalancesOptions
): Promise<void> {
  const skipChecks = process.env.SKIP_BALANCE_CHECKS === 'true';
  const warnOnly = options?.warnOnly || skipChecks;
  
  const tokenInfo = TOKEN_DENOMS[token];
  
  if (!tokenInfo) {
    throw new Error(`Unknown token: ${token}. Available tokens: ${Object.keys(TOKEN_DENOMS).join(', ')}`);
  }

  if (skipChecks) {
    console.log(`⚠️  Balance check skipped for ${token} (SKIP_BALANCE_CHECKS=true)`);
    return;
  }

  console.log(`Checking balance for ${token}...`);
  const currentBalance = await getBalance(address, tokenInfo.denom);

  if (currentBalance < minAmount) {
    const shortfall = minAmount - currentBalance;
    const message =
      `\n❌ Insufficient balance for ${token}:\n` +
      `   Required:  ${minAmount.toFixed(6)} ${token}\n` +
      `   Current:   ${currentBalance.toFixed(6)} ${token}\n` +
      `   Shortfall: ${shortfall.toFixed(6)} ${token}\n` +
      `\n` +
      `Please top up wallet: ${address}\n`;
    
    if (warnOnly) {
      console.warn(`⚠️  ${message}`);
      return;
    }
    
    throw new Error(message);
  }

  console.log(`✓ ${token} balance sufficient: ${currentBalance.toFixed(6)} (required: ${minAmount})`);
}

/**
 * Ensure multiple balances meet their minimum requirements
 * Checks all balances and reports all insufficiencies at once
 * 
 * @param address - Wallet address to check
 * @param requirements - Array of token requirements
 * @param options - Options for balance checking
 *   - warnOnly: If true, logs warnings instead of throwing errors
 * 
 * @example
 * // Strict mode (default) - throws on insufficient balance
 * await ensureBalances(address, [{ token: 'ATOM', amount: 0.1 }]);
 * 
 * @example
 * // Warn-only mode - logs warnings but doesn't fail tests
 * await ensureBalances(address, [{ token: 'ATOM', amount: 0.1 }], { warnOnly: true });
 * 
 * @example
 * // Skip checks entirely with env var
 * // SKIP_BALANCE_CHECKS=true npx playwright test
 */
export async function ensureBalances(
  address: string,
  requirements: BalanceRequirement[],
  options?: EnsureBalancesOptions
): Promise<void> {
  const skipChecks = process.env.SKIP_BALANCE_CHECKS === 'true';
  const warnOnly = options?.warnOnly || skipChecks;

  if (skipChecks) {
    console.log('⚠️  Balance checks skipped (SKIP_BALANCE_CHECKS=true)\n');
    return;
  }

  console.log(`\n🔍 Checking balances for ${requirements.length} tokens...\n`);

  const results = await Promise.allSettled(
    requirements.map(async ({ token, amount }) => {
      const tokenInfo = TOKEN_DENOMS[token];
      
      if (!tokenInfo) {
        throw new Error(`Unknown token: ${token}`);
      }

      const currentBalance = await getBalance(address, tokenInfo.denom);
      
      return {
        token,
        required: amount,
        current: currentBalance,
        sufficient: currentBalance >= amount,
      };
    })
  );

  const insufficientBalances: Array<{
    token: string;
    required: number;
    current: number;
  }> = [];

  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const { token, amount } = requirements[i];

    if (result.status === 'rejected') {
      errors.push(`Failed to check ${token}: ${result.reason}`);
    } else if (!result.value.sufficient) {
      insufficientBalances.push({
        token: result.value.token,
        required: result.value.required,
        current: result.value.current,
      });
      console.log(`❌ ${token}: ${result.value.current.toFixed(6)} < ${amount} (insufficient)`);
    } else {
      console.log(`✓ ${token}: ${result.value.current.toFixed(6)} >= ${amount} (sufficient)`);
    }
  }

  if (errors.length > 0) {
    const errorMessage = `\nErrors checking balances:\n${errors.join('\n')}\n`;
    if (warnOnly) {
      console.warn(`⚠️  ${errorMessage}`);
    } else {
      throw new Error(errorMessage);
    }
  }

  if (insufficientBalances.length > 0) {
    const errorMessage = [
      `\n❌ Insufficient balances detected for ${insufficientBalances.length} token(s):\n`,
      ...insufficientBalances.map(({ token, required, current }) => {
        const shortfall = required - current;
        return (
          `  ${token}:\n` +
          `    Required:  ${required.toFixed(6)} ${token}\n` +
          `    Current:   ${current.toFixed(6)} ${token}\n` +
          `    Shortfall: ${shortfall.toFixed(6)} ${token}`
        );
      }),
      `\nPlease top up wallet: ${address}\n`,
    ].join('\n');

    if (warnOnly) {
      console.warn(`⚠️  ${errorMessage}`);
      console.log(`\n⚠️  Balance checks completed with warnings (warnOnly mode)\n`);
      return;
    }

    throw new Error(errorMessage);
  }

  console.log(`\n✅ All balance checks passed!\n`);
}

