import { useCallback, useEffect, useState } from "react";

import {
  hasActiveWarning,
  LossFigures,
  needsAcknowledgement,
  shouldResetAcknowledgement,
} from "~/components/loss-acknowledgement";

/**
 * Snapshot + re-arm state around the frozen-basis model in this directory's
 * `index.ts`. Ticking snapshots the current figures as the
 * acknowledged basis; the basis is cleared (re-armed) whenever it goes stale
 * per `shouldResetAcknowledgement`, or when no warning is active at all — so
 * "basis exists" always means "an active warning was explicitly acknowledged
 * for figures equivalent to the current ones".
 */
export function useLossAcknowledgement(current: LossFigures | undefined) {
  const [acknowledgedBasis, setAcknowledgedBasis] =
    useState<LossFigures | null>(null);

  useEffect(() => {
    if (!acknowledgedBasis) return;
    if (
      !current ||
      !hasActiveWarning(current) ||
      shouldResetAcknowledgement(acknowledgedBasis, current)
    ) {
      setAcknowledgedBasis(null);
    }
  }, [current, acknowledgedBasis]);

  const setLossAcknowledged = useCallback(
    (acknowledged: boolean) => {
      setAcknowledgedBasis(acknowledged && current ? current : null);
    },
    [current]
  );

  return {
    /** The figures the user accepted, frozen at tick time. Null when unticked or re-armed. */
    acknowledgedBasis,
    hasAcknowledgedLoss: acknowledgedBasis !== null,
    setLossAcknowledged,
    /**
     * True when an active warning has not been (validly) acknowledged — gates
     * confirm buttons. Evaluates staleness synchronously via the same
     * predicate as the sign-time guard, so a drifted quote disables the
     * button in the same render (the effect above clears the basis after).
     */
    warningNeedsAcknowledgement: needsAcknowledgement(
      acknowledgedBasis,
      current
    ),
  };
}
