import dayjs from "dayjs";
import { useEffect } from "react";

import { useNow } from "~/hooks/use-now";
import { api } from "~/utils/trpc";

const REWARD_EPOCH_IDENTIFIER = "day";

/**
 * The cached epoch.endTime describes the epoch we're tracking; once it lapses
 * we need to refetch to get the next boundary. The chain may not have ticked
 * the next epoch yet, so refetch immediately on expiry and then poll at this
 * interval until fresh data arrives.
 */
const RETRY_REFETCH_EVERY_MS = 30_000;

/**
 * Returns the time remaining until the next daily-epoch reward distribution,
 * formatted as `HH:mm:ss`. Updates every second.
 *
 * Returns null until the epoch query resolves or if the daily epoch isn't found.
 */
export function useDailyEpochCountdown(): string | null {
  const { data: epochs, refetch } = api.local.params.getEpochs.useQuery();
  const now = useNow();

  const endTime = epochs?.find(
    (e) => e.identifier === REWARD_EPOCH_IDENTIFIER
  )?.endTime;
  const remainingSeconds =
    endTime !== undefined && now !== null
      ? dayjs(endTime).diff(dayjs(now), "second")
      : null;
  const isExpired = remainingSeconds !== null && remainingSeconds <= 0;

  useEffect(() => {
    if (!isExpired) return;
    void refetch();
    const id = setInterval(() => void refetch(), RETRY_REFETCH_EVERY_MS);
    return () => clearInterval(id);
  }, [isExpired, refetch]);

  if (remainingSeconds === null) return null;
  return dayjs
    .duration(Math.max(0, remainingSeconds), "second")
    .format("HH:mm:ss");
}
