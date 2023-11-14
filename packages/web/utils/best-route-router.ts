import {
  NoRouteError,
  NotEnoughLiquidityError,
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

export type NamedRouter<TRouter> = {
  name: string;
  router: TRouter;
};

type BestSplitTokenInQuote = SplitTokenInQuote & {
  name: string;
  timeMs: number;
};

const timeoutSymbol = Symbol("timeout");

/**
 * This class is responsible for finding the best route for token in exchange.
 * It implements the TokenOutGivenInRouter interface and uses a list of routers
 * to find the route that offers the best quote for a given token in and token out.
 * If a route cannot be found within a specified timeout, it is ignored. */
export class BestRouteTokenInRouter implements TokenOutGivenInRouter {
  /**
   * @param tokenInRouters - An array of routers to be used for finding the best route for a token in.
   * @param waitPeriodMs - Tolerated time for all routers to provide a quote. Time is doubled until first quote is generated.
   * @param logBestQuote - Invoked when the best quote is picked amongst routers.
   */
  constructor(
    protected readonly tokenInRouters: NamedRouter<TokenOutGivenInRouter>[],
    protected readonly waitPeriodMs: number = 2_500,
    protected readonly logBestQuote?: (
      name: string,
      timeMs: number,
      quote: SplitTokenInQuote
    ) => void
  ) {}

  async getRoutableCurrencyDenoms(): Promise<string[]> {
    // Implementation depends on your specific use case
    const denoms = await Promise.all(
      this.tokenInRouters.map(({ router }) =>
        router.getRoutableCurrencyDenoms()
      )
    );
    const uniqueDenoms = Array.from(new Set(denoms.flat()));
    return uniqueDenoms;
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<BestSplitTokenInQuote> {
    let maxQuote: BestSplitTokenInQuote | null = null;

    const promises = this.tokenInRouters.map(async ({ name, router }) => {
      const t0 = performance.now();
      const quote = await Promise.race([
        router.routeByTokenIn(tokenIn, tokenOutDenom),
        new Promise<SplitTokenInQuote>((_, reject) =>
          setTimeout(() => {
            // wait longer if no quote yet.
            if (!maxQuote) {
              setTimeout(() => reject(timeoutSymbol), this.waitPeriodMs);
            } else reject(timeoutSymbol);
          }, this.waitPeriodMs)
        ),
      ]);
      const elapsedMs = performance.now() - t0;

      if (!maxQuote || quote.amount.gt(maxQuote.amount)) {
        maxQuote = { ...(quote as SplitTokenInQuote), name, timeMs: elapsedMs };
      }

      return quote;
    });

    // Using Promise.allSettled to ensure all promises in the array either resolve or reject.
    // This is important as we want to wait for all routers to finish their routing attempts
    // before proceeding, regardless of whether they were successful or not.
    // Tradeoff: all settled will force us to wait for timeout every time, but will give
    // slow routers a chance to generate a better quote.
    const resolves = await Promise.allSettled(promises);

    maxQuote = maxQuote as BestSplitTokenInQuote | null;

    // Reconcile errors from routers
    // * No route found
    // * Insufficient liquidity
    if (!maxQuote) {
      // Ignore timeouts
      const errorResolves = resolves.filter(
        (value) => value.status === "rejected" && value.reason !== timeoutSymbol
      );

      // First try to show some insufficient liquidity error
      if (
        errorResolves.some(
          (value) =>
            value.status === "rejected" &&
            value.reason instanceof NotEnoughLiquidityError
        )
      ) {
        throw new NotEnoughLiquidityError();
      }

      // Then no route error
      if (
        errorResolves.some(
          (value) =>
            value.status === "rejected" && value.reason instanceof NoRouteError
        )
      ) {
        throw new NoRouteError();
      }

      throw new Error("Unexpected multi router error(s)");
    }

    this.logBestQuote?.(maxQuote.name, maxQuote.timeMs, maxQuote);

    return maxQuote;
  }
}
