import type { PricePretty } from "@osmosis-labs/unit";

export type AvailableOneClickTradingMessages =
  // Trading - Swaps
  | "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn"
  | "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn"
  | "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut"
  | "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut"
  // LP Management - Concentrated Liquidity
  | "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition"
  | "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards"
  | "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives"
  | "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition"
  | "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition"
  // LP Management - GAMM Pools
  | "/osmosis.gamm.v1beta1.MsgJoinPool"
  | "/osmosis.gamm.v1beta1.MsgExitPool"
  // Staking Reward Management
  | "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference"
  | "/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards";

export type OneClickTradingResetPeriods = "day" | "week" | "month" | "year";
export interface OneClickTradingTimeLimit {
  /** Unix numeric in nanoseconds */
  start?: string;

  /** Unix numeric in nanoseconds */
  end: string;
}

export type OneClickTradingHumanizedSessionPeriod =
  | "1hour"
  | "1day"
  | "7days"
  | "30days";

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
