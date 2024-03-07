import { osmosis } from "@osmosis-labs/proto-codecs";
import { Currency } from "@osmosis-labs/types";

export function makeSplitRoutesSwapExactAmountInMsg({
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

export function makeSwapExactAmountInMsg({
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
