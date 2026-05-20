import { Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import {
  DcaTimeInterval,
  DcaVaultStatus,
  queryDcaVaultsByOwner,
} from "../../osmosis";

const dcaVaultsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export interface DcaVault {
  id: string;
  sendDenom: string;
  targetDenom: string;
  swapAmount: string;
  timeInterval: string;
  status: DcaVaultStatus;
  balance: string;
  swappedAmount: string;
  receivedAmount: string;
}

function formatTimeInterval(interval: DcaTimeInterval | undefined): string {
  if (!interval) return "";
  if (typeof interval === "string") return interval;
  return `Custom(${interval.Custom?.seconds ?? 0}s)`;
}

export function getDcaVaultsByOwner({
  contractAddress,
  userOsmoAddress,
  chainList,
}: {
  contractAddress: string;
  userOsmoAddress: string;
  chainList: Chain[];
}) {
  return cachified({
    cache: dcaVaultsCache,
    key: `dcaVaults-${contractAddress}-${userOsmoAddress}`,
    ttl: 10_000,
    getFreshValue: () =>
      queryDcaVaultsByOwner({
        contractAddress,
        ownerAddress: userOsmoAddress,
        chainList,
      }).then(({ data }): DcaVault[] =>
        (data?.vaults ?? []).map((v) => ({
          id: v.id?.toString() ?? "",
          sendDenom: v.balance?.denom ?? "",
          targetDenom: v.target_denom ?? "",
          swapAmount: v.swap_amount ?? "0",
          timeInterval: formatTimeInterval(v.time_interval),
          status: v.status,
          balance: v.balance?.amount ?? "0",
          swappedAmount: v.swapped_amount?.amount ?? "0",
          receivedAmount: v.received_amount?.amount ?? "0",
        }))
      ),
  });
}
