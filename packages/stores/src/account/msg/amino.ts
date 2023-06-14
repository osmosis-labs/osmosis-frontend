// eslint-disable-next-line import/no-extraneous-dependencies
import { Msg } from "@cosmjs/launchpad";
import { MsgOpt } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { Coin, Dec, DecUtils } from "@keplr-wallet/unit";

/**
 * Helpers for constructing Amino messages involving min amount estimates for Osmosis.
 * Amino Ref: https://github.com/tendermint/go-amino/
 *
 * Note: not an exhaustive list.
 */
export class Amino {
  public static makeSplitRouteSwapExactAmountInMsg(
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    routes: {
      pools: {
        id: string;
        tokenOutDenom: string;
      }[];
      tokenInAmount: string;
    }[],
    tokenInDenom: string,
    tokenOutMinAmount: string
  ) {
    return {
      type: msgOpt.type,
      value: {
        sender,
        routes: routes.map(({ pools, tokenInAmount }) => ({
          pools: pools.map(({ id, tokenOutDenom }) => ({
            pool_id: id,
            token_out_denom: tokenOutDenom,
          })),
          token_in_amount: tokenInAmount,
        })),
        token_in_denom: tokenInDenom,
        token_out_min_amount: tokenOutMinAmount,
      },
    };
  }

  public static makeSwapExactAmountInMsg(
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    tokenIn: { currency: Currency; amount: string },
    pools: {
      id: string;
      tokenOutDenom: string;
    }[],
    tokenOutMinAmount: string
  ) {
    const amount = new Dec(tokenIn.amount)
      .mul(
        DecUtils.getTenExponentNInPrecisionRange(tokenIn.currency.coinDecimals)
      )
      .truncate();
    const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

    return {
      type: msgOpt.type,
      value: {
        sender,
        routes: pools.map(({ id, tokenOutDenom }) => {
          return {
            pool_id: id,
            token_out_denom: tokenOutDenom,
          };
        }),
        token_in: {
          denom: coin.denom,
          amount: coin.amount.toString(),
        },
        token_out_min_amount: tokenOutMinAmount.toString(),
      },
    };
  }

  /** Estimate min amount in given a pool with asset weights or reserves with scaling factors. (AKA weighted, or stable.) */
  public static makeSwapExactAmountOutMsg(
    tokenOut: { currency: Currency; amount: string },
    pools: {
      id: string;
      tokenInDenom: string;
    }[],
    tokenInMaxAmount: string,
    msgOpt: Pick<MsgOpt, "type">,
    sender: string
  ): Msg {
    const outUAmount = new Dec(tokenOut.amount)
      .mul(
        DecUtils.getTenExponentNInPrecisionRange(tokenOut.currency.coinDecimals)
      )
      .truncate();
    const coin = new Coin(tokenOut.currency.coinMinimalDenom, outUAmount);

    return {
      type: msgOpt.type,
      value: {
        sender,
        routes: pools.map(({ id, tokenInDenom }) => {
          return {
            pool_id: id,
            token_in_denom: tokenInDenom,
          };
        }),
        token_out: {
          denom: coin.denom,
          amount: coin.amount.toString(),
        },
        token_in_max_amount: tokenInMaxAmount,
      },
    };
  }
}
