import dayjs from "dayjs";
import { useEffect, useState } from "react";

import { humanizeTime } from "~/utils/date";

/**
 * Get the live humanized remaining time from a given number of seconds.
 */
export const useHumanizedRemainingTime = ({
  unix,
}: {
  unix: number | undefined;
}) => {
  const [humanizedRemainingTime, setHumanizedRemainingTime] =
    useState<ReturnType<typeof humanizeTime>>();

  useEffect(() => {
    if (!unix) return setHumanizedRemainingTime(undefined);

    const updateTime = () => {
      // humanizeTime is now direction-agnostic (uses absolute diffs), so an
      // expired target would render as a positive future-looking duration.
      // Callers of this hook expect a countdown, so clear once the target
      // has passed.
      if (dayjs.unix(unix).isBefore(dayjs())) {
        setHumanizedRemainingTime(undefined);
        return;
      }
      setHumanizedRemainingTime(humanizeTime(dayjs.unix(unix)));
    };

    updateTime();

    const intervalId = setInterval(updateTime, 1_000);

    return () => clearInterval(intervalId);
  }, [unix]);

  return { humanizedRemainingTime };
};
