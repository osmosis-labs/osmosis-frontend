import type { PricePretty } from "@keplr-wallet/unit";

export type AvailableOneClickTradingMessages =
  | "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn"
  | "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn";

export type OneClickTradingResetPeriods = "day" | "week" | "month" | "year";
export interface OneClickTradingTimeLimit {
  /** Unix numeric in nanoseconds */
  start?: string;

  /** Unix numeric in nanoseconds */
  end: string;
}

export type OneClickTradingHumanizedSessionPeriod =
  | "5min"
  | "10min"
  | "30min"
  | "1hour"
  | "3hours"
  | "12hours";

export interface OneClickTradingTransactionParams {
  isOneClickEnabled: boolean;
  spendLimit: PricePretty;

  /**
   * Max gas limit allowed for the transaction.
   */
  networkFeeLimit: string;

  // Time limit for the session to be considered valid.
  sessionPeriod: {
    end: OneClickTradingHumanizedSessionPeriod;
  };
}
