import { Dec, Int } from "@keplr-wallet/unit";
import {
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

import { GetSwapRouteResponse, GetTokensResponse } from "./types";

export class TfmRemoteRouter implements TokenOutGivenInRouter {
  protected readonly baseUrl: URL;

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly tfmBaseUrl: string
  ) {
    this.baseUrl = new URL(tfmBaseUrl);
  }

  async getRoutableCurrencyDenoms(): Promise<string[]> {
    const params = new URLSearchParams();
    params.append("isTrading", "True");
    const queryUrl = new URL(
      "/api/v1/ibc/chain/osmosis-1/tokens",
      this.baseUrl.toString()
    );
    const response = await fetch(queryUrl.toString());
    const result = (await response.json()) as GetTokensResponse;

    return result
      .filter((token) => {
        return (
          token.isTrading &&
          !token.contractAddr.includes("gamm/") &&
          !token.contractAddr.includes("cl/")
        );
      })
      .map((token) => token.contractAddr);
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote> {
    // fetch quote
    const params = new URLSearchParams();
    params.append("swapMode", "Turbo");
    const tokenInDenomEncoded = encodeURIComponent(tokenIn.denom);
    const tokenOutDenomEncoded = encodeURIComponent(tokenOutDenom);
    const queryUrl = new URL(
      `/api/v1/ibc/swap/route/${this.osmosisChainId}/${this.osmosisChainId}/${tokenInDenomEncoded}/${tokenOutDenomEncoded}/${tokenIn.amount}`,
      this.baseUrl.toString()
    );
    const response = await fetch(queryUrl.toString());
    const result = (await response.json()) as GetSwapRouteResponse;

    // convert quote response to SplitTokenInQuote
    return {
      amount: new Int(result.returnAmount),
      split: result.routes[0].routes.map(({ inputAmount, operations }) => {
        return {
          initialAmount: new Int(inputAmount),
          pools: operations.map((op) => ({ id: op.poolId.toString() })),
          tokenOutDenoms: operations.map((op) => op.offerToken),
          tokenInDenom: operations[0].askToken,
        };
      }),
      priceImpactTokenOut: new Dec(result.routes[0].priceImpact),
    };
  }
}
