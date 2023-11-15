import { Dec, Int } from "@keplr-wallet/unit";
import {
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools/build/router";

import { apiClient } from "~/utils/api-client";

import { SidecarQuoteResponse } from "./types";

/** Use this as a client for generating quotes from a sidecar query server. */
export class OsmosisSidecarRemoteRouter implements TokenOutGivenInRouter {
  protected readonly baseUrl: URL;

  constructor(protected readonly sidecarBaseUrl: string) {
    this.baseUrl = new URL(sidecarBaseUrl);
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote> {
    const queryUrl = new URL("quote", this.baseUrl.toString());
    queryUrl.searchParams.append(
      "tokenIn",
      `${tokenIn.amount}${tokenIn.denom}`
    );
    queryUrl.searchParams.append("tokenOutDenom", tokenOutDenom);
    try {
      const {
        amount_out,
        route: routes,
        effective_fee,
      } = await apiClient<SidecarQuoteResponse>(queryUrl.toString());

      return {
        amount: new Int(amount_out),
        swapFee: new Dec(effective_fee),
        split: routes.map(({ Route: route, in_amount }) => ({
          initialAmount: new Int(in_amount),
          pools: route.pools.map(({ id }) => ({ id: id.toString() })),
          tokenInDenom: tokenIn.denom,
          tokenOutDenoms: route.pools.map(
            ({ token_out_denom }) => token_out_denom
          ),
        })),
      };
    } catch (e) {
      // handle error JSON as it comes from sidecar
      const error = e as { data: { message: string } };
      throw new Error(
        "Failed to get quote from sidecar: " + error.data.message
      );
    }
  }
}
