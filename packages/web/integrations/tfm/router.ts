import { Dec, Int } from "@keplr-wallet/unit";
import { NotEnoughLiquidityError } from "@osmosis-labs/pools";
import {
  NoRouteError,
  SplitTokenInQuote,
  Token,
  TokenOutGivenInRouter,
} from "@osmosis-labs/pools/build/router";
import { apiClient } from "@osmosis-labs/utils";

import { GetSwapRouteResponse } from "./types";

export class TfmRemoteRouter implements TokenOutGivenInRouter {
  protected readonly baseUrl: URL;

  constructor(
    protected readonly osmosisChainId: string,
    protected readonly tfmBaseUrl: string
  ) {
    this.baseUrl = new URL(tfmBaseUrl);
  }

  async routeByTokenIn(
    tokenIn: Token,
    tokenOutDenom: string,
    forcePoolId?: string
  ): Promise<SplitTokenInQuote> {
    // return empty quote since TFM doesn't support forced swap through a pool
    if (forcePoolId) {
      return {
        amount: new Int(0),
        split: [],
      };
    }

    // fetch quote
    const tokenInDenomEncoded = encodeURIComponent(tokenIn.denom);
    const tokenOutDenomEncoded = encodeURIComponent(tokenOutDenom);
    const queryUrl = new URL(
      `/api/v1/ibc/swap/route/${this.osmosisChainId}/${this.osmosisChainId}/${tokenInDenomEncoded}/${tokenOutDenomEncoded}/${tokenIn.amount}`,
      this.baseUrl.toString()
    );
    queryUrl.searchParams.append("swapMode", "Turbo");

    try {
      const result = await apiClient<GetSwapRouteResponse>(queryUrl.toString());

      const priceImpactTokenOut = new Dec(result.routes[0].priceImpact);

      // TFM will always return the max out that can be swapped
      // But since it will result in failed tx, return an error
      if (priceImpactTokenOut.gt(new Dec(0.5))) {
        throw new NotEnoughLiquidityError();
      }

      // convert quote response to SplitTokenInQuote
      return {
        amount: new Int(result.returnAmount),
        split: result.routes[0].routes.map(({ inputAmount, operations }) => {
          return {
            initialAmount: new Int(inputAmount),
            pools: operations.map((op) => ({ id: op.poolId.toString() })),
            tokenOutDenoms: operations.map((op) => op.askToken),
            tokenInDenom: operations[0].offerToken,
          };
        }),
        priceImpactTokenOut,
      };
    } catch (e) {
      // TFM responded with an error as custom formatted JSON
      const tfmJsonError = e as {
        data: { error: { code: number; message: string } };
        status: number;
        statusText: string;
      };

      if (tfmJsonError.status === 504) {
        throw new Error("TFM timed out");
      }

      if (tfmJsonError?.data?.error?.code === 500) {
        // consider a no router error
        throw new NoRouteError();
      }

      throw new Error(
        tfmJsonError?.data?.error?.message ?? "Unexpected TFM router error"
      );
    }
  }
}
