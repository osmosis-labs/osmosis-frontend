import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";

import { queryAccountLockedLongerDuration } from "../../osmosis/lockup";

export type UserLock = {
  ID: string;
  duration: Duration;
  endTime: Date;
  isCurrentlyUnlocking: boolean;
  coins: {
    denom: string;
    amount: string;
  }[];
};

export async function getUserLocks(bech32Address: string): Promise<UserLock[]> {
  const { locks: userLocks } = await queryAccountLockedLongerDuration({
    bech32Address,
  });

  return userLocks.map((lock) => ({
    ID: lock.ID,
    duration: dayjs.duration(parseInt(lock.duration.slice(0, -1)) * 1_000),
    endTime: new Date(lock.end_time),
    isCurrentlyUnlocking: lock.end_time !== "0001-01-01T00:00:00Z",
    coins: lock.coins,
  }));
}
