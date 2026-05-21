import type { PricePretty } from "@osmosis-labs/unit";

/* ----------------------- 1CT permission category model ------------------- */

/** Each 1CT session bakes an authenticator into the user's account whose
 *  `MessageFilter` set is locked at creation time. Onchain there is one flat
 *  list of allowed message types; we group that flat list into user-meaningful
 *  categories so the session-creation UI can offer per-bundle opt-outs.
 *
 *  Categories are split by "what does a session-key compromise let an attacker
 *  do?" Forced categories (`swaps`, `rewards`) are always on - turning them
 *  off would either defeat the purpose of 1CT (no swaps) or block harmless
 *  user actions (no claiming rewards the user already owns). Optional
 *  categories default to on but the user can disable them per session. */

export const FORCED_ONE_CLICK_CATEGORIES = ["swaps", "rewards"] as const;

export const OPTIONAL_ONE_CLICK_CATEGORIES = ["poolManagement"] as const;

export const ONE_CLICK_CATEGORIES = [
  ...FORCED_ONE_CLICK_CATEGORIES,
  ...OPTIONAL_ONE_CLICK_CATEGORIES,
] as const;

export type ForcedOneClickCategory =
  (typeof FORCED_ONE_CLICK_CATEGORIES)[number];
export type OptionalOneClickCategory =
  (typeof OPTIONAL_ONE_CLICK_CATEGORIES)[number];
export type OneClickCategory = (typeof ONE_CLICK_CATEGORIES)[number];

/** Source of truth for which message types are 1CT-eligible and which category
 *  they fall under. Keep ordering stable within each category - the runtime
 *  authenticator's MessageFilter list is derived from this and reordering
 *  would invalidate existing in-memory representations. */
export const ONE_CLICK_MESSAGES_BY_CATEGORY = {
  swaps: [
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
    "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
  ],
  rewards: [
    "/osmosis.valsetpref.v1beta1.MsgWithdrawDelegationRewards",
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
    "/osmosis.valsetpref.v1beta1.MsgSetValidatorSetPreference",
  ],
  poolManagement: [
    "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
    "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
    "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
    "/osmosis.gamm.v1beta1.MsgJoinPool",
    "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
    "/osmosis.gamm.v1beta1.MsgExitPool",
  ],
} as const satisfies Record<OneClickCategory, readonly string[]>;

/** Flat union of every 1CT-eligible Osmosis-chain message type, derived from
 *  the category config so the type and the runtime data can't drift. */
export type AvailableOneClickTradingMessages =
  (typeof ONE_CLICK_MESSAGES_BY_CATEGORY)[OneClickCategory][number];

/** Default opt-state for optional categories at session creation. Forced
 *  categories are not in this map - they're always on. */
export const DEFAULT_ENABLED_OPTIONAL_CATEGORIES: Record<
  OptionalOneClickCategory,
  boolean
> = {
  poolManagement: true,
};

/** Returns the flat list of allowed message types for a given set of optional
 *  category toggles. Forced categories (swaps, rewards) are always included. */
export function getAllowedMessagesForCategories(
  enabledOptional: Record<OptionalOneClickCategory, boolean>
): AvailableOneClickTradingMessages[] {
  const messages: AvailableOneClickTradingMessages[] = [];
  for (const category of FORCED_ONE_CLICK_CATEGORIES) {
    messages.push(...ONE_CLICK_MESSAGES_BY_CATEGORY[category]);
  }
  for (const category of OPTIONAL_ONE_CLICK_CATEGORIES) {
    if (enabledOptional[category]) {
      messages.push(...ONE_CLICK_MESSAGES_BY_CATEGORY[category]);
    }
  }
  return messages;
}

/* ---------------------------- Existing types ----------------------------- */

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

  /** Which optional permission categories the user is granting for this
   *  session. Forced categories (swaps, rewards) are always granted and
   *  not represented here. */
  enabledOptionalCategories: Record<OptionalOneClickCategory, boolean>;
}
