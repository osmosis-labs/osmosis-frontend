import { CoinPretty, Int } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { getAsset } from "~/server/queries/complex/assets";
import { queryEpochs } from "~/server/queries/osmosis/epochs";
import {
  queryEpochProvisions,
  queryOsmosisMintParams,
} from "~/server/queries/osmosis/mint";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

const epochsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export function getEpochs() {
  return cachified({
    cache: epochsCache,
    key: "epochs",
    ttl: 1000 * 30, // 30 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const { epochs } = await queryEpochs();
      return epochs;
    },
  });
}

export async function getEpochProvisions(): Promise<CoinPretty | undefined> {
  return cachified({
    cache: epochsCache,
    key: "epoch-provisions",
    ttl: 1000 * 30, // 30 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const [mintParams, provisionsResponse] = await Promise.all([
        queryOsmosisMintParams(),
        queryEpochProvisions(),
      ]);

      if (!provisionsResponse || !mintParams.params.mint_denom) {
        return;
      }

      const mintCurrency = await getAsset({
        anyDenom: mintParams.params.mint_denom,
      });

      if (!mintCurrency) {
        throw new Error("Unknown currency");
      }

      let provision = provisionsResponse.epoch_provisions;
      if (provision.includes(".")) {
        provision = provision.slice(0, provision.indexOf("."));
      }
      return new CoinPretty(mintCurrency, new Int(provision));
    },
  });
}

export async function getEpoch({ identifier }: { identifier: string }) {
  const epochs = await getEpochs();

  const epoch = epochs.find((epoch) => epoch.identifier === identifier);
  if (!epoch) {
    throw new Error(`Epoch ${identifier} not found`);
  }

  const duration = parseInt(epoch.duration.replace("s", ""));

  return {
    duration,
  };
}
