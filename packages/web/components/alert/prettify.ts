import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import {
  isInsufficientFeeError,
  isSlippageErrorMessage,
} from "@osmosis-labs/tx";

import { MultiLanguageT } from "~/hooks";

const regexLegacySignatureVerificationFailed =
  /^signature verification failed; please verify account number \(\d*\), sequence \((\d*)\) and chain-id \(.*\): unauthorized/;
const regexSignatureVerificationFailed =
  /^account sequence mismatch, expected (\d*), got (\d*): incorrect account sequence/;
const regexFailedToExecuteMessageAt =
  /^failed to execute message; message index: (\d+): (.+)/;
const regexCoinsOrDenoms = /(\d*)([a-zA-Z][a-zA-Z0-9/]{2,127})(,*)/g;
const regexSplitAmountAndDenomOfCoin = /(\d+)([a-zA-Z][a-zA-Z0-9/]{2,127})/;

const regexInvalidClPositionAmounts =
  /failed to execute message; message index: (\d+): slippage bound: insufficient amount of token (\d+) created. Actual: \((\d+)\). Minimum estimated: \((\d+)\)/;

const regexFailedSwapSlippage =
  /failed to execute message; message index: \d+: (.*?) token is lesser than min amount: calculated amount is lesser than min amount: invalid request/;

const regexRejectedTx = /Request rejected/;

const regexOverspendError =
  /Spend limit error: Overspend: (\d+) has been spent but limit is (\d+)/;

export function isOverspendErrorMessage({
  message,
}: {
  message: string;
}): boolean {
  return regexOverspendError.test(message);
}

export function isRejectedTxErrorMessage({
  message,
}: {
  message: string;
}): boolean {
  return regexRejectedTx.test(message);
}

/** Uses regex matching to map less readable chain errors to a less technical user-friendly string.
 *  @param message Error message from chain.
 *  @param currencies Currencies used to map to human-readable coin denoms (e.g. ATOM)
 *  @returns Human readable error message if possible. */
export function prettifyTxError(
  message: string,
  currencies: AppCurrency[]
): Parameters<MultiLanguageT> | string | undefined {
  if (isSlippageErrorMessage(message)) {
    return ["swapFailed"];
  }

  try {
    const matchLegacySignatureVerificationFailed = message.match(
      regexLegacySignatureVerificationFailed
    );
    if (matchLegacySignatureVerificationFailed) {
      if (matchLegacySignatureVerificationFailed.length >= 2) {
        const sequence = matchLegacySignatureVerificationFailed[1];
        if (!Number.isNaN(parseInt(sequence))) {
          return ["errors.sequenceNumber", { sequence }];
        }
      }
    }

    const matchSignatureVerificationFailed = message.match(
      regexSignatureVerificationFailed
    );
    if (matchSignatureVerificationFailed) {
      if (matchSignatureVerificationFailed.length >= 3) {
        const sequence = matchSignatureVerificationFailed[2];
        if (!Number.isNaN(parseInt(sequence))) {
          return ["errors.sequenceNumber", { sequence }];
        }
      }
    }

    // Failed swap due to slippage
    const matchFailedSwapSlippage = message.match(regexFailedSwapSlippage);
    if (matchFailedSwapSlippage) {
      if (matchFailedSwapSlippage.length >= 2) {
        const denom = matchFailedSwapSlippage[1];
        const coinDenom = currencies.find(
          (cur) => cur.coinMinimalDenom === denom
        )?.coinDenom;
        return ["errors.swapSlippage", { coinDenom: coinDenom ?? denom }];
      }
    }

    // Invalid CL position amounts
    const matchInvalidClPositionAmounts = message.match(
      regexInvalidClPositionAmounts
    );
    if (matchInvalidClPositionAmounts) {
      return ["errors.invalidAmounts"];
    }

    // It is not important to let the usual users to know that in which order the transaction failed.
    const matchFailedToExecuteMessageAt = message.match(
      regexFailedToExecuteMessageAt
    );
    if (matchFailedToExecuteMessageAt) {
      if (matchFailedToExecuteMessageAt.length >= 3) {
        const failedAt = matchFailedToExecuteMessageAt[1];
        const actualMessage = matchFailedToExecuteMessageAt[2];
        if (!Number.isNaN(parseInt(failedAt))) {
          message = `${actualMessage.trim()} (at msg ${failedAt})`;
        }
      }
    }

    if (isInsufficientFeeError(message)) {
      return ["errors.insufficientFee"];
    }

    if (isRejectedTxErrorMessage({ message })) {
      return ["requestRejected"];
    }

    const currencyMap: Record<string, AppCurrency> = {};
    for (const currency of currencies) {
      currencyMap[currency.coinMinimalDenom] = currency;
    }

    // Remove the stack trace to avoid excessively long error messages.
    const stackIndex = message.indexOf("stack:");
    if (stackIndex !== -1) {
      message = message.slice(0, stackIndex).trim();
    }

    const split = message.split(" ");

    for (let i = 0; i < split.length; i++) {
      const frag = split[i];
      const matchCoinsOrDenoms = frag.match(regexCoinsOrDenoms);
      if (matchCoinsOrDenoms) {
        // Actually, many cases can pass the regexCoinsOrDenoms because that regex tests onlt that the string has only alphabet or number or "/", ",".
        const mayCoinOrDenom = frag.split(",");
        for (let i = 0; i < mayCoinOrDenom.length; i++) {
          const value = mayCoinOrDenom[i];

          const valueHasLastColon =
            value.length > 0 && value.indexOf(":") === value.length - 1;

          const splitAmountAndDenom = value.match(
            regexSplitAmountAndDenomOfCoin
          );
          if (splitAmountAndDenom && splitAmountAndDenom.length === 3) {
            const amount = splitAmountAndDenom[1];
            const denom = splitAmountAndDenom[2];
            const currency = currencyMap[denom];
            if (currency) {
              const coinPretty = new CoinPretty(currency, new Int(amount))
                .separator("")
                .trim(true);
              mayCoinOrDenom[i] =
                coinPretty.toString() + (valueHasLastColon ? ":" : "");
            }
          } else if (currencyMap[value]) {
            mayCoinOrDenom[i] =
              currencyMap[value].coinDenom + (valueHasLastColon ? ":" : "");
          }
        }

        split[i] = mayCoinOrDenom.join(",");
      }
    }

    return split.join(" ");
  } catch (e) {
    console.error(e);
  }
}
