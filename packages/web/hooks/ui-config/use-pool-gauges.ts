import { useMemo } from "react";
import { Duration } from "dayjs/plugin/duration";
import { RatePretty, CoinPretty } from "@keplr-wallet/unit";
import { usePoolDetailConfig } from "./use-pool-detail-config";
import { useSuperfluidPoolConfig } from "./use-superfluid-pool-config";
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

  const { poolDetailConfig, pool } = usePoolDetailConfig(poolId);
  const { superfluidPoolConfig } = useSuperfluidPoolConfig(poolDetailConfig);

  const allowedGauges =
    pool && ExternalIncentiveGaugeAllowList[pool.id]
      ? poolDetailConfig?.queryAllowedExternalGauges(
          (denom) => chainStore.getChain(chainId).findCurrency(denom),
          ExternalIncentiveGaugeAllowList[pool.id]
        ) ?? []
      : [];
  const externalGauges = poolDetailConfig?.allExternalGauges ?? [];
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
    superfluidPoolConfig?.gaugesWithSuperfluidApr.forEach((gauge) => {
      gaugeDurationMap.set(gauge.duration.asSeconds(), gauge);
    });

    return Array.from(gaugeDurationMap.values()).sort(
      (a, b) => a.duration.asSeconds() - b.duration.asSeconds()
    );
  }, [
    allowedGauges,
    externalGauges,
    superfluidPoolConfig?.gaugesWithSuperfluidApr,
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
    superfluidPoolConfig?.gaugesWithSuperfluidApr.forEach((gauge) => {
      gaugeDurationMap.set(gauge.duration.asSeconds(), gauge);
    });

    return Array.from(gaugeDurationMap.values()).sort(
      (a, b) => a.duration.asSeconds() - b.duration.asSeconds()
    );
  }, [allowedGauges, superfluidPoolConfig?.gaugesWithSuperfluidApr]);

  return {
    allAggregatedGauges,
    allowedAggregatedGauges,
    internalGauges: poolDetailConfig?.internalGauges ?? [],
    externalGauges,
  };
}
