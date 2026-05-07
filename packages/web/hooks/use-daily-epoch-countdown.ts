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
  const { data: epochs } = api.local.params.getEpochs.useQuery();

  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!epochs) return;
    const epoch = epochs.find((e) => e.identifier === REWARD_EPOCH_IDENTIFIER);
    if (!epoch) return;

    const update = () => {
      const remaining = dayjs.duration(
        dayjs(epoch.endTime).diff(dayjs(), "second"),
        "second"
      );
      const formatted =
        remaining.asSeconds() <= 0
          ? dayjs.duration(0, "seconds").format("HH-mm-ss")
          : remaining.format("HH-mm-ss");
      const [h, m, s] = formatted.split("-");
      setTimeRemaining(`${h}:${m}:${s}`);
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [epochs]);

  return timeRemaining;
}
