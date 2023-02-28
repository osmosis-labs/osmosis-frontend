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
  /** Estimate min amount out givem a pool with asset weights or reserves with scaling factors. (AKA weighted, or stable.) */
  public static makeMultihopSwapExactAmountInMsg(
    msgOpt: Pick<MsgOpt, "type">,
    sender: string,
    tokenIn: { currency: Currency; amount: string },
    pools: {
      pool: {
        id: string;
        swapFee: Dec;
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
        isIncentivized: boolean;
      };
      tokenOutCurrency: Currency;
    }[],
    stakeCurrencyMinDenom: string,
    maxSlippage: string = "0"
  ) {
    const estimated = PoolMath.estimateMultihopSwapExactAmountIn(
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
      pools,
      stakeCurrencyMinDenom
    );
    const maxSlippageDec = new Dec(maxSlippage).quo(
      DecUtils.getTenExponentNInPrecisionRange(2)
    );

    const tokenOutMinAmount = maxSlippageDec.equals(new Dec(0))
      ? new Int(1)
      : PoolMath.calcPriceImpactWithAmount(
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
        routes: pools.map((route) => {
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

  /** Estimate min amount out given a pool with asset weights or reserves with scaling factors. (AKA weighted, or stable.) */
  public static makeSwapExactAmountInMsg(
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

    const estimated = PoolMath.estimateSwapExactAmountIn(
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
      : PoolMath.calcPriceImpactWithAmount(
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
