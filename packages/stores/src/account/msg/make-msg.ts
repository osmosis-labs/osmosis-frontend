import { Msg } from "@cosmjs/launchpad";
import { MsgOpt } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { Coin, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import * as PoolMath from "@osmosis-labs/math";

/**
 * Helpers for constructing Amino messages involving min amount estimates for Osmosis.
 * Amino Ref: https://github.com/tendermint/go-amino/
 *
 * Note: not an exhaustive list.
 */
export class Amino {
  /** Estimate min amount in given a pool with asset weights or reserves with scaling factors. (AKA weighted, or stable.) */
  public static makeSwapExactAmountOutMsg(
    pool: {
      id: string;
      inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight?: Int;
      };
      outPoolAsset: { denom: string; amount: Int; weight?: Int };
      poolAssets: {
        amount: Int;
        denom: string;
        scalingFactor: number;
      }[];
      swapFee: Dec;
    },
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    tokenInCurrency: Currency,
    tokenOut: { currency: Currency; amount: string },
    maxSlippage: string = "0"
  ): Msg {
    const outUAmount = new Dec(tokenOut.amount)
      .mul(
        DecUtils.getTenExponentNInPrecisionRange(tokenOut.currency.coinDecimals)
      )
      .truncate();
    const coin = new Coin(tokenOut.currency.coinMinimalDenom, outUAmount);

    const estimated = PoolMath.estimateSwapExactAmountOut(
      pool,
      coin,
      tokenInCurrency
    );

    const maxSlippageDec = new Dec(maxSlippage).quo(
      DecUtils.getTenExponentNInPrecisionRange(2)
    );

    const tokenInMaxAmount = maxSlippageDec.equals(new Dec(0))
      ? // TODO: Set exact 2^128 - 1
        new Int(1_000_000_000_000)
      : PoolMath.calcPriceImpactWithAmount(
          estimated.raw.spotPriceBefore,
          outUAmount,
          maxSlippageDec
        );

    return {
      type: msgOpt.type,
      value: {
        sender,
        routes: [
          {
            pool_id: pool.id,
            token_in_denom: tokenInCurrency.coinMinimalDenom,
          },
        ],
        token_out: {
          denom: coin.denom,
          amount: coin.amount.toString(),
        },
        token_in_max_amount: tokenInMaxAmount.toString(),
      },
    };
  }
}
