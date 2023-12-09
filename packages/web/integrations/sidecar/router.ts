import { Dec, Int } from "@keplr-wallet/unit";
import {
  NoRouteError,
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
    const queryUrl = new URL("/router/quote", this.baseUrl.toString());
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
        split: routes.map(({ pools, in_amount }) => ({
          initialAmount: new Int(in_amount),
          pools: pools.map(({ id }) => ({ id: id.toString() })),
          tokenInDenom: tokenIn.denom,
          tokenOutDenoms: pools.map(({ token_out_denom }) => token_out_denom),
        })),
      };
    } catch (e) {
      // perhaps this is from the apiClient, i.e. a timeout
      if (e instanceof Error) throw e;

      // handle error JSON as it comes from sidecar
      const error = e as { data: { message: string } };

      if (error.data?.message?.includes("no routes were provided")) {
        throw new NoRouteError();
      }

      throw new Error(error.data?.message ?? "Unexpected sidecar router error");
    }
  }
}
