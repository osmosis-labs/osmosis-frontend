import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { api } from "~/utils/trpc";

const REWARD_EPOCH_IDENTIFIER = "day";

/**
 * Returns the time remaining until the next daily-epoch reward distribution,
 * formatted as `HH:mm:ss`. Updates every second.
 *
 * Returns null until the epoch query resolves or if the daily epoch isn't found.
 */
export function useDailyEpochCountdown(): string | null {
  const { data: epochs, refetch } = api.local.params.getEpochs.useQuery();

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!epochs) {
      setTimeRemaining(null);
      return;
    }
    const epoch = epochs.find((e) => e.identifier === REWARD_EPOCH_IDENTIFIER);
    if (!epoch) {
      setTimeRemaining(null);
      return;
    }

    // The cached epoch.endTime describes the epoch we're tracking; once it
    // lapses, we need to refetch to get the next boundary. The chain may not
    // have ticked the next epoch yet, so refetch immediately on first expiry
    // and then poll every 30s until fresh data arrives.
    const RETRY_REFETCH_EVERY_SECONDS = 30;
    let secondsSinceLastRefetch = RETRY_REFETCH_EVERY_SECONDS;
    const update = () => {
      const remainingSeconds = dayjs(epoch.endTime).diff(dayjs(), "second");
      setTimeRemaining(
        dayjs
          .duration(Math.max(0, remainingSeconds), "second")
          .format("HH:mm:ss")
      );

      if (remainingSeconds <= 0) {
        secondsSinceLastRefetch += 1;
        if (secondsSinceLastRefetch >= RETRY_REFETCH_EVERY_SECONDS) {
          secondsSinceLastRefetch = 0;
          void refetch();
        }
      }
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [epochs, refetch]);

  return timeRemaining;
}
