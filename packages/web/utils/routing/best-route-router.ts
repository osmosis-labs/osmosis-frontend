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

export type BestSplitTokenInQuote = SplitTokenInQuote & {
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
   */
  constructor(
    protected readonly tokenInRouters: NamedRouter<TokenOutGivenInRouter>[],
    protected readonly waitPeriodMs: number = 2_000
  ) {}

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<BestSplitTokenInQuote> {
    let maxQuote: BestSplitTokenInQuote | null = null;

    const promises = this.tokenInRouters.map(async ({ name, router }) => {
      const t0 = Date.now();
      const quote = await Promise.race([
        new Promise<SplitTokenInQuote>((resolve, reject) =>
          router
            .routeByTokenIn(tokenIn, tokenOutDenom)
            .then(resolve)
            .catch((e) => reject({ name, error: e }))
        ),
        new Promise<SplitTokenInQuote>((_, reject) =>
          setTimeout(() => {
            // wait longer if no quote yet.
            if (!maxQuote) {
              setTimeout(
                () => reject({ name, error: timeoutSymbol }),
                this.waitPeriodMs
              );
            } else reject({ name, error: timeoutSymbol });
          }, this.waitPeriodMs)
        ),
      ]);
      const elapsedMs = Date.now() - t0;

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
      /** Only resolved errors without timeouts */
      const errorResolves = resolves.filter(
        (value) =>
          value.status === "rejected" && value.reason.error !== timeoutSymbol
      );

      // First try to show some insufficient liquidity error
      if (
        errorResolves.some(
          (value) =>
            value.status === "rejected" &&
            value.reason.error instanceof NotEnoughLiquidityError
        )
      ) {
        throw new NotEnoughLiquidityError();
      }

      // Then no route error
      if (
        errorResolves.some(
          (value) =>
            value.status === "rejected" &&
            value.reason.error instanceof NoRouteError
        )
      ) {
        throw new NoRouteError();
      }

      const combinedErrorString = errorResolves.reduce((acc, value) => {
        if (value.status === "rejected") {
          const { name, error } = value.reason;
          return `${acc} && Router ${name}: ${error}`;
        }
        return acc;
      }, "");

      throw new Error(
        "Unexpected multi router error(s):" + combinedErrorString
      );
    }

    return maxQuote;
  }
}
