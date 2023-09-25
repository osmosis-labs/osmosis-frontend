# Router

The goal of the router is take the fact that someone wants to trade X for Y, and split this up across pools.

Right now we need to fix a few things:

- This is really slow, and makes the UI feel sluggish
- Its estimating price depth wrong
- Preferred pools is forcing trades that are worse for the user
- If theres an error, its not isolated and may fail to route at all

## API exposed

```ts
export interface TokenOutGivenInRouter {
  /** Route, with splits, given an in token and out denom. */
  routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote>;

  /** Converges on an optimal set of routes to split through for a given amount of token in and out token. */
  getOptimizedRoutesByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<RouteWithInAmount[]>;

  /** Calculate the amount of token out by simulating a swap through a set of routes (split). */
  calculateTokenOutByTokenIn(
    routes: RouteWithInAmount[]
  ): Promise<SplitTokenInQuote>;
}
```
