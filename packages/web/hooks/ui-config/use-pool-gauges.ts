import { useMemo } from "react";
import { Duration } from "dayjs/plugin/duration";
import { RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { usePoolDetailStore } from "./use-pool-detail-store";
import { useSuperfluidPoolStore } from "./use-superfluid-pool-store";
import { useStore } from "../../stores";
import { ExternalIncentiveGaugeAllowList } from "../../config";

export type Gauge = {
  id: string;
  duration: Duration;
  apr?: RatePretty;
  superfluidApr?: RatePretty;

  /** Applicable to external gauges only. */
  rewardAmount?: CoinPretty;
  /** Applicable to external gauges only. */
  remainingEpochs?: number;
};

/** Resolves all and whitelisted gauges by durations. Aggregates Gauges by duration. */
export function usePoolGauges(poolId?: string): {
  /** Aggregated by duration. */
  allAggregatedGauges: Gauge[];
  /** Aggregated by duration. */
  allowedAggregatedGauges: Gauge[];
  externalGauges: Gauge[];
  internalGauges: Gauge[];
} {
  const { chainStore } = useStore();

  const {
    osmosis: { chainId },
  } = chainStore;

  const { poolDetailStore, pool } = usePoolDetailStore(poolId);
  const { superfluidPoolStore } = useSuperfluidPoolStore(poolDetailStore);

  const allowedGauges =
    pool && ExternalIncentiveGaugeAllowList[pool.id]
      ? poolDetailStore?.queryAllowedExternalGauges(
          (denom) => chainStore.getChain(chainId).findCurrency(denom),
          ExternalIncentiveGaugeAllowList[pool.id]
        ) ?? []
      : [];
  const externalGauges = poolDetailStore?.allExternalGauges ?? [];
  const allAggregatedGauges: Gauge[] | undefined = useMemo(() => {
    const gaugeDurationMap = new Map<number, Gauge>();

    // uniqued external gauges by duration
    externalGauges.concat(allowedGauges).forEach((extGauge) => {
      gaugeDurationMap.set(extGauge.duration.asSeconds(), {
        id: extGauge.id,
        duration: extGauge.duration,
        rewardAmount: extGauge.rewardAmount,
        remainingEpochs: extGauge.remainingEpochs,
      });
    });

    // overwrite any external gauges with internal gauges w/ apr calcs
    superfluidPoolStore?.gaugesWithSuperfluidApr.forEach((gauge) => {
      gaugeDurationMap.set(gauge.duration.asSeconds(), gauge);
    });

    return Array.from(gaugeDurationMap.values()).sort(
      (a, b) => a.duration.asSeconds() - b.duration.asSeconds()
    );
  }, [
    allowedGauges,
    externalGauges,
    superfluidPoolStore?.gaugesWithSuperfluidApr,
  ]);
  const allowedAggregatedGauges = useMemo(() => {
    const gaugeDurationMap = new Map<number, Gauge>();

    // uniqued external gauges by duration
    allowedGauges.forEach((extGauge) => {
      gaugeDurationMap.set(extGauge.duration.asSeconds(), {
        id: extGauge.id,
        duration: extGauge.duration,
        rewardAmount: extGauge.rewardAmount,
        remainingEpochs: extGauge.remainingEpochs,
      });
    });

    // overwrite any external gauges with internal gauges w/ apr calcs
    superfluidPoolStore?.gaugesWithSuperfluidApr.forEach((gauge) => {
      gaugeDurationMap.set(gauge.duration.asSeconds(), gauge);
    });

    return Array.from(gaugeDurationMap.values()).sort(
      (a, b) => a.duration.asSeconds() - b.duration.asSeconds()
    );
  }, [allowedGauges, superfluidPoolStore?.gaugesWithSuperfluidApr]);

  return {
    allAggregatedGauges,
    allowedAggregatedGauges,
    internalGauges: poolDetailStore?.internalGauges ?? [],
    externalGauges,
  };
}
