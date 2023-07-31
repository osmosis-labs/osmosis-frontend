import { Int } from "@keplr-wallet/unit";

import { AmountsDataProvider, ConcentratedLiquidityPool } from "./pool";

type BankAmountResponse = {
  balances: {
    amount: string;
    denom: string;
  }[];
};

/** Provider of bank balances from bank module by bech32Address. Expected by concentrated liquidity pool. */
export class FetchPoolAmountProvider implements AmountsDataProvider {
  /** Address => Response */
  protected amountsCache = new Map<
    string,
    Awaited<ReturnType<AmountsDataProvider["getPoolAmounts"]>>
  >();

  protected activeCacheTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    protected readonly baseNodeUrl: string,
    protected readonly poolId: string,
    protected readonly cacheDurationMs = 1000 * 30, // 30 seconds
    protected readonly amountFetcher: (
      bech32Address: string
    ) => Promise<BankAmountResponse> = async (bech32Address) => {
      if (fetch === undefined)
        throw new Error("Fetch method must be available in the environment");

      const baseUrl = `${this.baseNodeUrl}cosmos/bank/v1beta1/balances`;

      const url = new URL(baseUrl);
      url.pathname += `/${bech32Address}`;

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error("Failed to fetch balances");
      }
      return (await res.json()) as BankAmountResponse;
    }
  ) {}

  async getPoolAmounts(
    pool: ConcentratedLiquidityPool
  ): Promise<{ token0Amount: Int; token1Amount: Int }> {
    if (pool.id !== this.poolId) throw new Error("Pool mismatch");

    // check cache
    const cacheAmount = this.amountsCache.get(pool.address);
    if (cacheAmount) return cacheAmount;

    // get updated amounts
    const balancesRaw = (await this.amountFetcher(pool.address)).balances;
    const token0AmountRaw = balancesRaw.find(
      ({ denom }) => denom === pool.token0
    );
    const token1AmountRaw = balancesRaw.find(
      ({ denom }) => denom === pool.token1
    );
    const amounts = {
      token0Amount: new Int(token0AmountRaw?.amount ?? "0"),
      token1Amount: new Int(token1AmountRaw?.amount ?? "0"),
    };

    // set cache, clear existing timeouts, and set new timeout to flush cache later
    this.amountsCache.set(pool.address, amounts);
    const existingTimeoutId = this.activeCacheTimeouts.get(pool.address);
    if (existingTimeoutId) {
      clearTimeout(existingTimeoutId);
      this.activeCacheTimeouts.delete(pool.address);
    }
    const newTimeoutId = setTimeout(
      () => this.amountsCache.delete(pool.address),
      this.cacheDurationMs
    );
    this.activeCacheTimeouts.set(pool.address, newTimeoutId);

    return amounts;
  }
}
