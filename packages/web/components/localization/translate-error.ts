import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "@osmosis-labs/keplr-hooks";
import {
  NoRouteError,
  NotEnoughLiquidityError,
  NotEnoughQuotedError,
} from "@osmosis-labs/pools";
import {
  CalculatingShareOutAmountError,
  DepositNoBalanceError,
  HighSwapFeeError,
  InsufficientBalanceError,
  InsufficientBalanceForFeeError,
  InvalidScalingFactorControllerAddress,
  InvalidSlippageError,
  InvalidSwapFeeError,
  MaxAssetsCountError,
  MinAssetsCountError,
  NegativePercentageError,
  NegativeSlippageError,
  NegativeSwapFeeError,
  NoAvailableSharesError,
  NoSendCurrencyError,
  NotInitializedError,
  PercentageSumError,
  ScalingFactorTooLowError,
} from "@osmosis-labs/stores";

import { InvalidRangeError } from "~/hooks";
import { t } from "~/hooks";

/** Returns localization key given a custom Error subclass, typically from UI configs. */
export function tError<TError extends Error>(e?: TError): Parameters<typeof t> {
  if (e instanceof EmptyAmountError) {
    return ["errors.emptyAmount"];
  } else if (e instanceof InvalidNumberAmountError) {
    return ["errors.invalidNumberAmount"];
  } else if (e instanceof ZeroAmountError) {
    return ["errors.zeroAmount"];
  } else if (e instanceof NegativeAmountError) {
    return ["errors.negativeAmount"];
  } else if (e instanceof InsufficientAmountError) {
    return ["errors.insufficientAmount"];
  } else if (e instanceof NegativeSwapFeeError) {
    return ["errors.negativeSwapFee"];
  } else if (e instanceof HighSwapFeeError) {
    return ["errors.highSwapFee"];
  } else if (e instanceof InvalidSwapFeeError) {
    return ["errors.invalidSwapFee"];
  } else if (e instanceof InvalidScalingFactorControllerAddress) {
    return ["errors.invalidScalingFactorControllerAddress"];
  } else if (e instanceof MinAssetsCountError) {
    return ["errors.minAssetsCount", { num: e.message.split(" ")[2] }];
  } else if (e instanceof MaxAssetsCountError) {
    return ["errors.maxAssetsCount", { num: e.message.split(" ")[2] }];
  } else if (e instanceof NegativePercentageError) {
    return ["errors.negativePercentage"];
  } else if (e instanceof ScalingFactorTooLowError) {
    return ["errors.scalingFactorTooLow"];
  } else if (e instanceof PercentageSumError) {
    return ["errors.percentageSum"];
  } else if (e instanceof DepositNoBalanceError) {
    return ["errors.depositNoBalance"];
  } else if (e instanceof NegativeSlippageError) {
    return ["errors.negativeSlippage"];
  } else if (e instanceof InvalidSlippageError) {
    return ["errors.invalidSlippage"];
  } else if (e instanceof NoSendCurrencyError) {
    return ["errors.noSendCurrency"];
  } else if (e instanceof InsufficientBalanceError) {
    return ["errors.insufficientBal"];
  } else if (e instanceof InsufficientBalanceForFeeError) {
    return ["errors.insufficientBalForFee"];
  } else if (e instanceof NotInitializedError) {
    return ["errors.notInitialized"];
  } else if (e instanceof CalculatingShareOutAmountError) {
    return ["errors.calculatingShareOutAmount"];
  } else if (e instanceof NoAvailableSharesError) {
    return ["errors.noAvailableShares", { denom: e.message.split(" ")[2] }];
  } else if (e instanceof NotEnoughLiquidityError) {
    return ["errors.insufficientLiquidity"];
  } else if (e instanceof NotEnoughQuotedError) {
    return ["errors.insufficientAmount"];
  } else if (e instanceof NoRouteError) {
    return ["errors.noRoute"];
  } else if (e instanceof InvalidRangeError) {
    return ["errors.invalidRange"];
  }

  return ["errors.generic"];
}
