import { Dec, Int } from "@keplr-wallet/unit";
import { NotEnoughQuotedError, PoolType } from "@osmosis-labs/pools";
import {
  NoRouteError,
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools/build/router";
import { apiClient } from "@osmosis-labs/utils";

import { SidecarPoolType, SidecarQuoteResponse } from "./types";

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
      // docs: https://github.com/osmosis-labs/sqs/blob/e95c66e3ee6a22d57118c74a384253f016a9bb85/README.md?plain=1#L267
      queryUrl.searchParams.append("poolID", forcePoolId);
      queryUrl.pathname = "/router/custom-direct-quote";
    }
    try {
      const {
        amount_out,
        route: routes,
        effective_fee,
        price_impact,
      } = await apiClient<SidecarQuoteResponse>(queryUrl.toString());

      const swapFee = new Dec(effective_fee);

      const priceImpact = new Dec(price_impact);

      return {
        amount: new Int(amount_out),
        swapFee,
        priceImpactTokenOut: priceImpact,
        tokenInFeeAmount: tokenIn.amount.toDec().mul(swapFee).truncate(),
        split: routes.map(({ pools, in_amount }) => ({
          initialAmount: new Int(in_amount),
          pools: pools.map(({ id, spread_factor, type, code_id }) => ({
            id: id.toString(),
            type: translatePoolTypeFromSidecar(type),
            swapFee: new Dec(spread_factor),
            codeId: code_id?.toString(),
          })),
          tokenInDenom: tokenIn.denom,
          tokenOutDenoms: pools.map(({ token_out_denom }) => token_out_denom),
        })),
      };
    } catch (e) {
      // handle error JSON as it comes from sidecar
      const error = e as { data: { message: string } };

      const errorMessage = error.data?.message;

      if (errorMessage?.includes("no routes were provided")) {
        throw new NoRouteError();
      }

      if (
        errorMessage?.includes("amount out is zero, try increasing amount in")
      ) {
        throw new NotEnoughQuotedError();
      }

      throw new Error(errorMessage ?? "Unexpected sidecar router error " + e);
    }
  }
}

function translatePoolTypeFromSidecar(
  sidecarPoolType: SidecarPoolType
): PoolType {
  switch (sidecarPoolType) {
    case SidecarPoolType.Weighted:
      return "weighted";
    case SidecarPoolType.Stable:
      return "stable";
    case SidecarPoolType.Concentrated:
      return "concentrated";
    case SidecarPoolType.CosmWasm:
      return "cosmwasm";
    default:
      throw new Error(`Unknown SidecarPoolType: ${sidecarPoolType}`);
  }
}
