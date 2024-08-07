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
      setHumanizedRemainingTime(humanizeTime(dayjs.unix(unix)));
    };

    updateTime();

    const intervalId = setInterval(updateTime, 1_000);

    return () => clearInterval(intervalId);
  }, [unix]);

  return { humanizedRemainingTime };
};
