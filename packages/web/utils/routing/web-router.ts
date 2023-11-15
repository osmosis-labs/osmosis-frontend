import {
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

import { routeTokenOutGivenIn } from "~/server/queries/complex/route-token-out-given-in";

/** Router client for `OptimizedRoutes` router instance on Next.js web server. */
export class WebRouter implements TokenOutGivenInRouter {
  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote> {
    const { quote } = await routeTokenOutGivenIn(tokenIn, tokenOutDenom);
    return quote;
  }
}
