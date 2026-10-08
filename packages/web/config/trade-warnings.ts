import { Dec } from "@osmosis-labs/unit";

/**
 * Central thresholds for the high-loss acknowledgement gates (MTN-199 /
 * MTN-150). Every surface that requires the user to tick an acknowledgement
 * checkbox before executing a high-impact trade or transfer reads its gate
 * from this file — tuning a value here propagates to all of them. Do not
 * re-declare these as inline literals elsewhere.
 */

/**
 * Price impact (as a positive fraction, e.g. 0.05 = 5%) at or above which a
 * trade/transfer requires explicit user acknowledgement. Consumers must
 * normalize sign conventions (swap quotes report negative impact) before
 * comparing.
 *
 * Deliberately shared with the bridge, unlike the two slippage gates below.
 * Those measure different quantities on either side — a realized loss on the
 * bridge, a ceiling the user typed on a trade — but price impact means the
 * same thing on both: the impact of an Osmosis swap. The bridge's is the
 * impact of the swap its own quote bundles, so it should move with this value
 * rather than diverge from it.
 *
 * Lowered from 10% to 5% (MTN-150) because 10% let a clearly bad trade through
 * unacknowledged, and because the swap page already treats 5% impact as
 * warning-worthy — the gate was the figure out of step, not the display.
 */
export const HighPriceImpactGate = new Dec(0.05);

/**
 * Realized value loss (as a positive fraction, e.g. 0.06 = 6%) above which a
 * transfer requires explicit user acknowledgement. On the bridge this is the
 * total fiat loss between input and expected output, bridge fees included.
 *
 * Deliberately separate from `HighSlippageToleranceGate`: this is a loss the
 * user actually incurs, that one is a ceiling the user chooses. They are
 * different quantities and must not be tuned as one — dropping this to the
 * trade gate's value would re-gate a large share of ordinary bridge transfers,
 * whose fees routinely exceed it.
 */
export const HighSlippageGate = new Dec(0.06);

/**
 * Slippage *tolerance* (as a positive fraction, e.g. 0.02 = 2%) at or above
 * which a trade requires explicit user acknowledgement. This is the ceiling the
 * user set, not a loss they have taken, which is why it stamps `slip=` and
 * never `loss=` (see `deriveTradeMemoFlags`).
 *
 * Set to match the threshold at which the review-order modal already warns that
 * a trade "may result in significant loss of value". Before that alignment the
 * warning appeared from 2% while the gate sat at 6%, so anyone choosing a
 * tolerance in between read a loss warning with nothing to acknowledge and no
 * gate behind it. Slippage is a single typed field — there is no preset picker
 * wired up in the UI — so reaching this gate is always a deliberate act.
 */
export const HighSlippageToleranceGate = new Dec(0.02);

/**
 * How much (in absolute fraction points, e.g. 0.01 = 1 percentage point) a
 * previously acknowledged loss figure may worsen before the acknowledgement
 * is reset and the user must re-tick the checkbox. Improvements never re-arm.
 * This also bounds how stale the figures stamped into the tx memo (MTN-137)
 * can be relative to what is signed.
 */
export const AckReArmTolerance = new Dec(0.01);
