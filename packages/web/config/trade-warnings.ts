import { Dec } from "@osmosis-labs/unit";

/**
 * Central thresholds for the high-loss acknowledgement gates (MTN-199 /
 * MTN-150). Every surface that requires the user to tick an acknowledgement
 * checkbox before executing a high-impact trade or transfer reads its gate
 * from this file — tuning a value here propagates to all of them. Do not
 * re-declare these as inline literals elsewhere.
 */

/**
 * Price impact (as a positive fraction, e.g. 0.10 = 10%) at or above which a
 * trade/transfer requires explicit user acknowledgement. Consumers must
 * normalize sign conventions (swap quotes report negative impact) before
 * comparing.
 */
export const HighPriceImpactGate = new Dec(0.1);

/**
 * Value loss / slippage (as a positive fraction, e.g. 0.06 = 6%) above which
 * a trade/transfer requires explicit user acknowledgement. On the bridge this
 * is the total fiat loss between input and expected output.
 */
export const HighSlippageGate = new Dec(0.06);

/**
 * How much (in absolute fraction points, e.g. 0.01 = 1 percentage point) a
 * previously acknowledged loss figure may worsen before the acknowledgement
 * is reset and the user must re-tick the checkbox. Improvements never re-arm.
 * This also bounds how stale the figures stamped into the tx memo (MTN-137)
 * can be relative to what is signed.
 */
export const AckReArmTolerance = new Dec(0.01);
