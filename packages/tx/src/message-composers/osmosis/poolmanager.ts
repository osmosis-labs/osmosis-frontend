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
  tokenIn: { coinMinimalDenom: string };
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
      tokenInDenom: tokenIn.coinMinimalDenom,
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
  tokenIn: { coinMinimalDenom: string; amount: string };
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
        denom: tokenIn.coinMinimalDenom,
        amount: tokenIn.amount.toString(),
      },
      tokenOutMinAmount,
    }
  );
}

/**
 * Constructs a message for performing a swap with an exact output amount across a route
 * — single or multiple liquidity pools. This function enables users to swap a specific
 * amount of one token for another through specified liquidity pools, with a maximum
 * acceptable amount of the input token.
 */
export async function makeSwapExactAmountOutMsg({
  pools,
  tokenInMaxAmount,
  tokenOut,
  userOsmoAddress,
}: {
  pools: {
    id: string;
    tokenInDenom: string;
  }[];
  tokenInMaxAmount: string;
  tokenOut: { coinMinimalDenom: string; amount: string };
  userOsmoAddress: string;
}) {
  const osmosis = await getOsmosisCodec();
  return osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl.swapExactAmountOut(
    {
      sender: userOsmoAddress,
      routes: pools.map(({ id, tokenInDenom }) => {
        return {
          poolId: BigInt(id),
          tokenInDenom: tokenInDenom,
        };
      }),
      tokenOut: {
        denom: tokenOut.coinMinimalDenom,
        amount: tokenOut.amount,
      },
      tokenInMaxAmount,
    }
  );
}

/**
 * Constructs a message for performing a split route swap with an exact output amount across
 * multiple routes. This function allows users to swap a specific amount of one token
 * for another through a series of split routes, specifying the maximum amount of
 * the input token they are willing to accept.
 */
export async function makeSplitRoutesSwapExactAmountOutMsg({
  routes,
  tokenOut,
  tokenInMaxAmount,
  userOsmoAddress,
}: {
  routes: {
    pools: {
      id: string;
      tokenInDenom: string;
    }[];
    tokenOutAmount: string;
  }[];
  tokenOut: { coinMinimalDenom: string };
  tokenInMaxAmount: string;
  userOsmoAddress: string;
}) {
  const osmosis = await getOsmosisCodec();
  return osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl.splitRouteSwapExactAmountOut(
    {
      sender: userOsmoAddress,
      routes: routes.map(({ pools, tokenOutAmount }) => ({
        pools: pools.map(({ id, tokenInDenom }) => ({
          poolId: BigInt(id),
          tokenInDenom: tokenInDenom,
        })),
        tokenOutAmount: tokenOutAmount,
      })),
      tokenOutDenom: tokenOut.coinMinimalDenom,
      tokenInMaxAmount,
    }
  );
}
