import type { CoinPretty, PricePretty } from "@keplr-wallet/unit";

export type AvailableOneClickTradingMessages =
  "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn";
export type OneClickTradingAuthenticatorType =
  | "SignatureVerificationAuthenticator"
  | "AnyOfAuthenticator"
  | "AllOfAuthenticator"
  | "SpendLimitAuthenticator"
  | "MessageFilterAuthenticator";
export type OneClickTradingResetPeriods = "day" | "week" | "month" | "year";
export interface OneClickTradingTimeLimit {
  /** Unix numeric in nanoseconds */
  start?: string;

  /** Unix numeric in nanoseconds */
  end: string;
}

export type OneClickTradingHumanizedSessionPeriod =
  | "10min"
  | "30min"
  | "1hour"
  | "3hours"
  | "12hours";

export interface OneClickTradingTransactionParams {
  isOneClickEnabled: boolean;
  spendLimit: PricePretty;
  networkFeeLimit: CoinPretty;

  // Period to reset the spend limit quota.
  resetPeriod: OneClickTradingResetPeriods;

  // Time limit for the session to be considered valid.
  sessionPeriod: {
    end: OneClickTradingHumanizedSessionPeriod;
  };
}
