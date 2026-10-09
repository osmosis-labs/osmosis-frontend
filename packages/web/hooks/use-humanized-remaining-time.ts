import dayjs from "dayjs";

import { useNow } from "~/hooks/use-now";
import { humanizeTime } from "~/utils/date";

/**
 * Get the live humanized remaining time from a given number of seconds.
 */
export const useHumanizedRemainingTime = ({
  unix,
}: {
  unix: number | undefined;
}) => {
  const now = useNow();

  if (!unix || now === null) return { humanizedRemainingTime: undefined };

  const target = dayjs.unix(unix);
  const current = dayjs(now);
  // humanizeTime is direction-agnostic (uses absolute diffs), so an expired
  // target would render as a positive future-looking duration. Callers of
  // this hook expect a countdown, so clear once the target has passed.
  if (target.isBefore(current)) return { humanizedRemainingTime: undefined };

  return { humanizedRemainingTime: humanizeTime(target, false, current) };
};
