import type { MsgSwapExactAmountOut } from "@osmosis-labs/proto-codecs/build/codegen/osmosis/gamm/v1beta1/tx";
import type { Currency } from "@osmosis-labs/types";

import { getOsmosisCodec } from "../../codec";

/**
 * Constructs a message for performing a split route swap with an exact input amount across
 * multiple routes. This function allows users to swap a specific amount of one token
 * for another through a series of split routes, specifying the minimum amount of
 * the output token they are willing to accept.
 */
export async function makeSplitRoutesSwapExactAmountInMsg({
  routes,
  tokenIn,
  tokenOutMinAmount,
  userOsmoAddress,
}: {
  routes: {
    pools: {
      id: string;
      tokenOutDenom: string;
    }[];
    tokenInAmount: string;
  }[];
  tokenIn: { currency: Currency };
  tokenOutMinAmount: string;
  userOsmoAddress: string;
}) {
  const osmosis = await getOsmosisCodec();
  return osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl.splitRouteSwapExactAmountIn(
    {
      sender: userOsmoAddress,
      routes: routes.map(({ pools, tokenInAmount }) => ({
        pools: pools.map(({ id, tokenOutDenom }) => ({
          poolId: BigInt(id),
          tokenOutDenom: tokenOutDenom,
        })),
        tokenInAmount: tokenInAmount,
      })),
      tokenInDenom: tokenIn.currency.coinMinimalDenom,
      tokenOutMinAmount,
    }
  );
}

/**
 * Constructs a message for performing a swap with an exact input amount across a route
 * — single or multiple liquidity pools. This function enables users to swap a specific
 * amount of one token for another through specified liquidity pools, with a minimum
 * acceptable amount of the output token.
 */
export async function makeSwapExactAmountInMsg({
  pools,
  tokenIn,
  tokenOutMinAmount,
  userOsmoAddress,
}: {
  pools: {
    id: string;
    tokenOutDenom: string;
  }[];
  tokenIn: { currency: Currency; amount: string };
  tokenOutMinAmount: string;
  userOsmoAddress: string;
}) {
  const osmosis = await getOsmosisCodec();
  return osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl.swapExactAmountIn(
    {
      sender: userOsmoAddress,
      routes: pools.map(({ id, tokenOutDenom }) => {
        return {
          poolId: BigInt(id),
          tokenOutDenom: tokenOutDenom,
        };
      }),
      tokenIn: {
        denom: tokenIn.currency.coinMinimalDenom,
        amount: tokenIn.amount.toString(),
      },
      tokenOutMinAmount,
    }
  );
}

export async function makeSwapExactAmountOutMsg({
  sender,
  routes,
  tokenInMaxAmount,
  tokenOut,
}: MsgSwapExactAmountOut) {
  const osmosis = await getOsmosisCodec();
  return osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl.swapExactAmountOut(
    {
      sender,
      routes,
      tokenInMaxAmount,
      tokenOut,
    }
  );
}
