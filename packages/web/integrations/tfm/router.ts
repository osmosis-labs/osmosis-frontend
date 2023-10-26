import { Int } from "@keplr-wallet/unit";
import {
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools";

import { GetSwapRouteResponse } from "./types";

export class TfmRemoteRouter implements TokenOutGivenInRouter {
  protected readonly baseUrl: URL;

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly tfmBaseUrl: string
  ) {
    this.baseUrl = new URL(tfmBaseUrl);
  }

  async getRoutableCurrencyDenoms(): Promise<string[]> {
    throw new Error("Method not implemented.");
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string
  ): Promise<SplitTokenInQuote> {
    // fetch quote
    const params = new URLSearchParams();

    params.append("sourceChainId", this.osmosisChainId);
    params.append("destinationChainId", this.osmosisChainId);
    params.append("sourceDenom", tokenIn.denom);
    params.append("destinationDenom", tokenOutDenom);
    params.append("amount", tokenIn.amount.toString());

    const queryUrl = new URL(this.baseUrl.toString());
    queryUrl.search = params.toString();

    const response = await fetch(queryUrl);
    const result = (await response.json()) as GetSwapRouteResponse;

    // convert quote response to SplitTokenInQuote
    return {
      amount: new Int(result.returnAmount),
      split: result.routes.map(({ inputAmount, operations }) => {
        return {
          initialAmount: new Int(inputAmount),
          pools: operations.map((op) => ({ id: op.poolId.toString() })),
          tokenOutDenoms: operations.map((op) => op.offerToken),
          tokenInDenom: operations[0].askToken,
        };
      }),
    };
  }
}
