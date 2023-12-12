import { Dec, Int } from "@keplr-wallet/unit";
import {
  NoRouteError,
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools/build/router";
import { apiClient } from "@osmosis-labs/utils";

import { SidecarQuoteResponse } from "./types";

/** Use this as a client for generating quotes from a sidecar query server. */
export class OsmosisSidecarRemoteRouter implements TokenOutGivenInRouter {
  protected readonly baseUrl: URL;

  constructor(protected readonly sidecarBaseUrl: string) {
    this.baseUrl = new URL(sidecarBaseUrl);
  }

  /** Docs: https://github.com/osmosis-labs/osmosis/blob/e4f91eaf6a0ce475dcd13ee337e27c8e67cd939f/ingest/sqs/README.md?plain=1#L70C5-L70C5 */
  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string,
    forcePoolId?: string
  ): Promise<SplitTokenInQuote> {
    const queryUrl = new URL("/router/quote", this.baseUrl.toString());
    queryUrl.searchParams.append(
      "tokenIn",
      `${tokenIn.amount}${tokenIn.denom}`
    );
    queryUrl.searchParams.append("tokenOutDenom", tokenOutDenom);
    if (forcePoolId) {
      // docs: https://github.com/osmosis-labs/osmosis/blob/e4f91eaf6a0ce475dcd13ee337e27c8e67cd939f/ingest/sqs/README.md?plain=1#L221
      queryUrl.searchParams.append("poolIDs", forcePoolId);
      queryUrl.pathname = "/router/custom-quote";
    }
    try {
      const {
        amount_out,
        route: routes,
        effective_fee,
      } = await apiClient<SidecarQuoteResponse>(queryUrl.toString());

      const swapFee = new Dec(effective_fee);

      return {
        amount: new Int(amount_out),
        swapFee,
        tokenInFeeAmount: tokenIn.amount.toDec().mul(swapFee).truncate(),
        split: routes.map(({ pools, in_amount }) => ({
          initialAmount: new Int(in_amount),
          pools: pools.map(({ id }) => ({ id: id.toString() })),
          tokenInDenom: tokenIn.denom,
          tokenOutDenoms: pools.map(({ token_out_denom }) => token_out_denom),
        })),
      };
    } catch (e) {
      // handle error JSON as it comes from sidecar
      const error = e as { data: { message: string } };

      if (error.data?.message?.includes("no routes were provided")) {
        throw new NoRouteError();
      }

      throw new Error(error.data?.message ?? "Unexpected sidecar router error");
    }
  }
}
