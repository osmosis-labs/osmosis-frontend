import { Dec, Int } from "@keplr-wallet/unit";
import {
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";
import { makeIBCMinimalDenom } from "@osmosis-labs/stores";

import { apiClient } from "~/utils/api-client";

import { IBCAssetInfos } from "../../config/ibc-assets";
import { SidecarQuoteResponse } from "./types";

/** Use all IBC denoms from config. */
const ibcDenoms = IBCAssetInfos.map(({ sourceChannelId, coinMinimalDenom }) =>
  makeIBCMinimalDenom(sourceChannelId, coinMinimalDenom)
);

/** Use this as a client for generating quotes from a sidecar query server. */
export class OsmosisSidecarRemoteRouter implements TokenOutGivenInRouter {
  protected readonly baseUrl: URL;

  constructor(protected readonly sidecarBaseUrl: string) {
    this.baseUrl = new URL(sidecarBaseUrl);
  }

  async getRoutableCurrencyDenoms(): Promise<string[]> {
    return ibcDenoms;
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
  }
}
