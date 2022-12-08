import { MsgOpt } from "@keplr-wallet/stores";
import { Currency } from "@keplr-wallet/types";
import { Dec, DecUtils, Int, Coin } from "@keplr-wallet/unit";
import { Msg } from "@cosmjs/launchpad";
import * as WeightedPoolMath from "@osmosis-labs/math";

/**
 * Helpers for constructing Amino messages for Osmosis.
 * Amino Ref: https://github.com/tendermint/go-amino/
 *
 * Note: not an exhaustive list.
 */
export class Amino {
  public static makeMultihopSwapExactAmountInMsg(
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    tokenIn: { currency: Currency; amount: string },
    routes: {
      pool: {
        id: string;
        inPoolAsset: {
          coinDecimals: number;
          coinMinimalDenom: string;
          amount: Int;
          weight: Int;
        };
        outPoolAsset: { amount: Int; weight: Int };
        swapFee: Dec;
      };
      tokenOutCurrency: Currency;
    }[],
    maxSlippage: string = "0"
  ) {
    const estimated = WeightedPoolMath.estimateMultihopSwapExactAmountIn(
      {
        currency: tokenIn.currency,
        amount: new Dec(tokenIn.amount)
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              tokenIn.currency.coinDecimals
            )
          )
          .truncate()
          .toString(),
      },
      routes
    );
    const maxSlippageDec = new Dec(maxSlippage).quo(
      DecUtils.getTenExponentNInPrecisionRange(2)
    );

    const tokenOutMinAmount = maxSlippageDec.equals(new Dec(0))
      ? new Int(1)
      : WeightedPoolMath.calcPriceImpactTokenIn(
          estimated.spotPriceBeforeRaw,
          new Dec(tokenIn.amount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                tokenIn.currency.coinDecimals
              )
            )
            .truncate(),
          maxSlippageDec
        );

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
        routes: routes.map((route) => {
          return {
            pool_id: route.pool.id,
            token_out_denom: route.tokenOutCurrency.coinMinimalDenom,
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

  public static makeSwapExactAmountInMsg(
    pool: {
      id: string;
      inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight: Int;
      };
      outPoolAsset: { amount: Int; weight: Int };
      swapFee: Dec;
    },
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    tokenIn: { currency: Currency; amount: string },
    tokenOutCurrency: Currency,
    maxSlippage: string = "0"
  ): Msg {
    const inUAmount = new Dec(tokenIn.amount)
      .mul(
        DecUtils.getTenExponentNInPrecisionRange(tokenIn.currency.coinDecimals)
      )
      .truncate();
    const coin = new Coin(tokenIn.currency.coinMinimalDenom, inUAmount);

    const estimated = WeightedPoolMath.estimateSwapExactAmountIn(
      pool,
      coin,
      tokenOutCurrency
    );
    const maxSlippageDec = new Dec(maxSlippage).quo(
      DecUtils.getTenExponentNInPrecisionRange(2)
    );
    // TODO: Compare the computed slippage and wanted max slippage?

    const tokenOutMinAmount = maxSlippageDec.equals(new Dec(0))
      ? new Int(1)
      : WeightedPoolMath.calcPriceImpactTokenIn(
          estimated.raw.spotPriceBefore,
          inUAmount,
          maxSlippageDec
        );

    return {
      type: msgOpt.type,
      value: {
        sender,
        routes: [
          {
            pool_id: pool.id,
            token_out_denom: tokenOutCurrency.coinMinimalDenom,
          },
        ],
        token_in: {
          denom: coin.denom,
          amount: coin.amount.toString(),
        },
        token_out_min_amount: tokenOutMinAmount.toString(),
      },
    };
  }

  public static makeSwapExactAmountOutMsg(
    pool: {
      id: string;
      inPoolAsset: {
        coinDecimals: number;
        coinMinimalDenom: string;
        amount: Int;
        weight: Int;
      };
      outPoolAsset: { amount: Int; weight: Int };
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

    const estimated = WeightedPoolMath.estimateSwapExactAmountOut(
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
      : WeightedPoolMath.calcPriceImpactTokenOut(
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
