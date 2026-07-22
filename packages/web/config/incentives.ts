/** Constants for the external incentive gauge flow (x/incentives).
 *
 *  These are chain-side constants and params surfaced in the incentivize-pool
 *  UI. They live here (not inlined in the component) so a chain change is a
 *  single-file edit and the store getter and modal share one source of truth.
 */

/** The chain's x/incentives `min_value_for_distribution`, in OSMO. Per-recipient
 *  payouts worth less than this per epoch are silently skipped (spam/dust
 *  defense), and a reward denom with no OSMO pool route is never valued, so it
 *  never distributes. Update if governance changes it. */
export const MIN_DISTR_VALUE_OSMO = "0.01";
/** Display label for {@link MIN_DISTR_VALUE_OSMO}; keep the two in sync. */
export const MIN_DISTR_VALUE_LABEL = "0.01 OSMO";

/** The dust floor is per recipient and the recipient count is unknowable ahead
 *  of an epoch, so an exact sub-floor check is impossible client-side.
 *  Heuristic: warn when the whole daily emission couldn't clear the floor for
 *  even this many positions — in any realistically busy pool, most recipients
 *  would then be skipped. */
export const DUST_WARN_POSITIONS = 500;

/** Mainnet CL `authorized_uptimes` (1ns / 1min / 1h / 24h), used when the chain
 *  param can't be fetched so the uptime selector still offers the full set
 *  instead of a lone fallback button. */
export const FALLBACK_UPTIMES_SECONDS = [0.000000001, 60, 3600, 86400];

/** x/incentives hardcoded fees (`CreateGaugeFee` / `AddToGaugeFee`), sent to the
 *  community pool. These are constants in the chain, not gov params. When a
 *  gauge is funded with OSMO, the fee is charged on top of the reward amount,
 *  so the sender needs reward + fee in OSMO. */
export const CREATE_GAUGE_FEE_OSMO = 50;
export const ADD_TO_GAUGE_FEE_OSMO = 25;
export const CREATE_GAUGE_FEE_LABEL = `${CREATE_GAUGE_FEE_OSMO} OSMO`;
export const ADD_TO_GAUGE_FEE_LABEL = `${ADD_TO_GAUGE_FEE_OSMO} OSMO`;

/** Hour (UTC) a custom start date is pinned to. A custom start is a date-only
 *  choice, so we pin the time of day to 17:00, safely before the daily
 *  distribution epoch (observed at ~17:15 UTC). The chain floors a start time
 *  up to the next epoch, so 17:00 lands on the same day's ~17:15 epoch and the
 *  gauge activates on the intended day rather than a day late. User-facing copy
 *  states the real ~17:15 epoch (when distribution actually begins); this
 *  constant is the earlier, safe pin the picker uses internally. */
export const EPOCH_HOUR_UTC = 17;
