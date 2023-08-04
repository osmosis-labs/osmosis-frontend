import { Int } from "@keplr-wallet/unit";

import { AmountsDataProvider, ConcentratedLiquidityPool } from "./pool";

type BankAmountResponse = {
  balances: {
    amount: string;
    denom: string;
  }[];
};

/** Provider of bank balances from bank module by bech32Address. Expected by concentrated liquidity pool.
 *  The instance lifecycle is assumed to follow the pool instance.
 */
export class FetchPoolAmountDataProvider implements AmountsDataProvider {
  /** Address => Response */
  protected static amountsCache = new Map<
    string,
    Awaited<ReturnType<AmountsDataProvider["getPoolAmounts"]>>
  >();

  protected static activeCacheTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  /** Set of `bech32Address: string` if fetching for that address. */
  protected static inFlightFetchPerAccount = new Set<string>();

  /**
   * Creates a new provider. The instance lifecycle is assumed to follow the pool instance.
   * @param baseNodeUrl Base URL of node to fetch balances from. Only used in default `amountFetcher`
   * @param poolId ID of pool balance being fetched from. Used for validation.
   * @param cacheDurationMs Duration in milliseconds to cache balances for before refetching.
   * @param amountFetcher Basic amount fetcher. Defaults to fetching from the bank module via `fetch` API. Assumes no client-side caching.
   */
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

    // check in flight requests
    if (FetchPoolAmountDataProvider.inFlightFetchPerAccount.has(pool.address)) {
      return { token0Amount: new Int(0), token1Amount: new Int(1) };
    }

    // check cache
    const cacheAmount = FetchPoolAmountDataProvider.amountsCache.get(
      pool.address
    );
    if (cacheAmount) return cacheAmount;

    // get updated amounts
    FetchPoolAmountDataProvider.inFlightFetchPerAccount.add(pool.address);
    const balancesRaw = (await this.amountFetcher(pool.address)).balances;
    FetchPoolAmountDataProvider.inFlightFetchPerAccount.delete(pool.address);
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
    FetchPoolAmountDataProvider.amountsCache.set(pool.address, amounts);
    const existingTimeoutId =
      FetchPoolAmountDataProvider.activeCacheTimeouts.get(pool.address);
    if (existingTimeoutId) {
      clearTimeout(existingTimeoutId);
      FetchPoolAmountDataProvider.activeCacheTimeouts.delete(pool.address);
    }
    const newTimeoutId = setTimeout(
      () => FetchPoolAmountDataProvider.amountsCache.delete(pool.address),
      this.cacheDurationMs
    );
    FetchPoolAmountDataProvider.activeCacheTimeouts.set(
      pool.address,
      newTimeoutId
    );

    return amounts;
  }
}
