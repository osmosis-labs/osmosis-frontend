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
 *  Maintains a static class, so multiple instances of this class will share the same cache per query node.
 */
export class FetchPoolAmountDataProvider implements AmountsDataProvider {
  /** Address => Response */
  protected static _amountsCache = new Map<
    string,
    Awaited<ReturnType<AmountsDataProvider["getPoolAmounts"]>>
  >();

  /** Address => Timeout ID */
  protected static _activeCacheTimeouts = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  /** Map of `bech32Address: string` => Promise if fetching for that address. */
  protected static _inFlightFetchPerAddress = new Map<
    string,
    Promise<BankAmountResponse>
  >();

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
    let request = FetchPoolAmountDataProvider._inFlightFetchPerAddress.get(
      pool.address
    );
    if (!request) {
      // create new in flight request
      request = this.amountFetcher(pool.address);
      FetchPoolAmountDataProvider._inFlightFetchPerAddress.set(
        pool.address,
        request
      );
    }

    // check cache
    const cacheAmount = FetchPoolAmountDataProvider._amountsCache.get(
      pool.address
    );
    if (cacheAmount) return cacheAmount;

    // get updated amounts
    const balancesRaw = (await request).balances;
    FetchPoolAmountDataProvider._inFlightFetchPerAddress.delete(pool.address);
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
    FetchPoolAmountDataProvider._amountsCache.set(pool.address, amounts);
    const existingTimeoutId =
      FetchPoolAmountDataProvider._activeCacheTimeouts.get(pool.address);
    if (existingTimeoutId) {
      clearTimeout(existingTimeoutId);
      FetchPoolAmountDataProvider._activeCacheTimeouts.delete(pool.address);
    }
    const newTimeoutId = setTimeout(
      () => FetchPoolAmountDataProvider._amountsCache.delete(pool.address),
      this.cacheDurationMs
    );
    FetchPoolAmountDataProvider._activeCacheTimeouts.set(
      pool.address,
      newTimeoutId
    );

    return amounts;
  }
}
