import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { LRUCache } from "lru-cache";

import { Epochs, queryEpochs } from "../../../queries/osmosis/epochs";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";

const epochsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export type Epoch = {
  duration: Duration;
  startTime: Date;
  endTime: Date;
} & Omit<Epochs["epochs"][0], "duration">;

export function getEpochs({
  chainList,
}: {
  chainList: Chain[];
}): Promise<Epoch[]> {
  return cachified({
    cache: epochsCache,
    key: "epochs",
    ttl: 1000 * 60, // 60 seconds
    getFreshValue: () =>
      queryEpochs({ chainList }).then(({ epochs }) =>
        epochs.map((e) => {
          const duration = dayjs.duration(
            parseInt(e.duration.replace("s", "")) * 1000
          );
          const startTime = new Date(e.current_epoch_start_time);

          return {
            ...e,
            duration,
            startTime,
            endTime: dayjs(startTime).add(duration).toDate(),
          };
        })
      ),
  });
}
