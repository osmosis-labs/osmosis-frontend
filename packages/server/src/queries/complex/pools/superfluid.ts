import { AssetList, Chain } from "@osmosis-labs/types";
import { Dec, DecUtils, RatePretty } from "@osmosis-labs/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import {
  queryDistributionParams,
  queryStakingPool,
} from "../../../queries/cosmos";
import {
  queryEpochProvisions,
  queryOsmosisMintParams,
  querySuperfluidParams,
} from "../../../queries/osmosis";
import {
  ConcentratedPoolRawResponse,
  StablePoolRawResponse,
  WeightedPoolRawResponse,
} from "../../../queries/osmosis/poolmanager";
import { queryAllSuperfluidAssets } from "../../../queries/osmosis/superfluid";
import { DEFAULT_LRU_OPTIONS } from "../../../utils/cache";
import { getEpochs } from "../osmosis";
import { getPool, Pool } from ".";

const superfluidCache = new LRUCache<string, CacheEntry>({ max: 1 });
const superfluidAprCache = new LRUCache<string, CacheEntry>(
  DEFAULT_LRU_OPTIONS
);

export function getSuperfluidPoolIds({ chainList }: { chainList: Chain[] }) {
  return cachified({
    cache: superfluidCache,
    key: "superfluid-pool-ids",
    ttl: 1000 * 60 * 5, // 5 mins
    getFreshValue: async () => {
      const { assets: superfluidAssets } = await queryAllSuperfluidAssets({
        chainList,
      });

      const superfluidPoolIds = new Set<string>();
      for (const asset of superfluidAssets) {
        // superfluid share pool
        if (asset.asset_type === "SuperfluidAssetTypeLPShare") {
          const poolId = asset.denom.split("/")[2];
          superfluidPoolIds.add(poolId);
        }

        // superfluid CL pool
        if (asset.asset_type === "SuperfluidAssetTypeConcentratedShare") {
          const poolId = asset.denom.split("/")[2];
          superfluidPoolIds.add(poolId);
        }
      }

      return Array.from(superfluidPoolIds);
    },
  });
}

/**
 * Superfluid staking APR of a pool: the OSMO staking APR scaled by the pool's
 * OSMO-equivalent multiplier. Zero for pools that aren't superfluid.
 */
export function getSuperfluidPoolApr({
  poolId,
  chainList,
  assetLists,
}: {
  poolId: string;
  chainList: Chain[];
  assetLists: AssetList[];
}): Promise<RatePretty> {
  return cachified({
    cache: superfluidAprCache,
    key: `superfluid-pool-apr-${poolId}`,
    ttl: 1000 * 60 * 5, // 5 mins
    getFreshValue: async () => {
      const superfluidPoolIds = await getSuperfluidPoolIds({ chainList });
      if (!superfluidPoolIds.includes(poolId)) return new RatePretty(0);

      const [stakingAprPercent, pool, { params }] = await Promise.all([
        getOsmoStakingAprPercent({ chainList }),
        getPool({ poolId, chainList, assetLists }),
        querySuperfluidParams({ chainList }),
      ]);

      const multiplier = getPoolOsmoEquivalentMultiplier({
        pool,
        osmoDenom: chainList[0].stakeCurrency!.coinMinimalDenom,
        minimumRiskFactor: new Dec(params.minimum_risk_factor),
      });

      return new RatePretty(
        stakingAprPercent.mul(multiplier).quo(DecUtils.getTenExponentN(2))
      );
    },
  });
}

/**
 * OSMO staking APR in percent, computed from on-chain mint and staking
 * parameters. Assumes a total supply of 100,000,000 OSMO, since Osmosis's
 * total supply includes tokens that are not yet minted.
 */
export function getOsmoStakingAprPercent({
  chainList,
}: {
  chainList: Chain[];
}): Promise<Dec> {
  return cachified({
    cache: superfluidAprCache,
    key: "osmo-staking-apr-percent",
    ttl: 1000 * 60 * 5, // 5 mins
    getFreshValue: async () => {
      const [mintParams, epochs, epochProvisions, stakingPool, distribution] =
        await Promise.all([
          queryOsmosisMintParams({ chainList }),
          getEpochs({ chainList }),
          queryEpochProvisions({ chainList }),
          queryStakingPool({ chainList }),
          queryDistributionParams({ chainList }),
        ]);

      return calcOsmoStakingAprPercent({
        epochProvisions: epochProvisions.epoch_provisions,
        stakingProportion: mintParams.params.distribution_proportions.staking,
        epochDurationSeconds:
          epochs
            .find(
              ({ identifier }) =>
                identifier === mintParams.params.epoch_identifier
            )
            ?.duration.asSeconds() ?? 0,
        bondedTokens: stakingPool.pool.bonded_tokens,
        communityTax: distribution.params.community_tax,
        stakeDecimals: chainList[0].stakeCurrency!.coinDecimals,
      });
    },
  });
}

const ASSUMED_OSMO_SUPPLY = DecUtils.getTenExponentN(8);

export function calcOsmoStakingAprPercent({
  epochProvisions,
  stakingProportion,
  epochDurationSeconds,
  bondedTokens,
  communityTax,
  stakeDecimals,
}: {
  /** Dec string, base units. */
  epochProvisions: string;
  /** Dec string. */
  stakingProportion: string;
  epochDurationSeconds: number;
  /** Int string, base units. */
  bondedTokens: string;
  /** Dec string. */
  communityTax: string;
  stakeDecimals: number;
}): Dec {
  if (epochDurationSeconds <= 0) return new Dec(0);

  const decimals = DecUtils.getTenExponentN(stakeDecimals);
  const provision = new Dec(epochProvisions.split(".")[0]).quo(decimals);
  const stakingEpochProvision = new Dec(
    provision.mul(new Dec(stakingProportion)).truncate()
  );
  const yearlyStakingProvision = stakingEpochProvision.mul(
    new Dec(((365 * 24 * 3600) / epochDurationSeconds).toString())
  );
  const inflationPercent = yearlyStakingProvision
    .quo(ASSUMED_OSMO_SUPPLY)
    .mul(DecUtils.getTenExponentN(2));

  const bonded = new Dec(bondedTokens);
  if (inflationPercent.isZero() || !bonded.isPositive()) {
    return new Dec(0);
  }

  const bondedRatio = bonded.quo(ASSUMED_OSMO_SUPPLY.mul(decimals));
  return inflationPercent
    .mul(new Dec(1).sub(new Dec(communityTax)))
    .quo(bondedRatio);
}

/**
 * How much of a pool share counts as OSMO for superfluid staking, after the
 * minimum risk factor. Weighted pools use the OSMO weight, stable pools the
 * OSMO scaling factor, and concentrated pools assume a 1:1 split.
 */
export function getPoolOsmoEquivalentMultiplier({
  pool,
  osmoDenom,
  minimumRiskFactor,
}: {
  pool: Pick<Pool, "type" | "raw">;
  osmoDenom: string;
  minimumRiskFactor: Dec;
}): Dec {
  const afterRisk = new Dec(1).sub(minimumRiskFactor);

  if (pool.type === "weighted") {
    const raw = pool.raw as WeightedPoolRawResponse;
    const totalWeight = new Dec(raw.total_weight);
    const osmoAsset = raw.pool_assets.find(
      ({ token }) => token.denom === osmoDenom
    );
    if (!osmoAsset || !totalWeight.isPositive()) return new Dec(0);

    return new Dec(osmoAsset.weight).quo(totalWeight).mul(afterRisk);
  }

  if (pool.type === "stable") {
    const raw = pool.raw as StablePoolRawResponse;
    const osmoIndex = raw.pool_liquidity.findIndex(
      ({ denom }) => denom === osmoDenom
    );
    if (osmoIndex === -1) return new Dec(0);

    const otherScalingFactors = raw.scaling_factors
      .filter((_, index) => index !== osmoIndex)
      .reduce((acc, factor) => acc.add(new Dec(factor)), new Dec(0));
    if (!otherScalingFactors.isPositive()) return new Dec(0);

    return new Dec(0.5).mul(
      new Dec(raw.scaling_factors[osmoIndex])
        .quo(otherScalingFactors)
        .mul(afterRisk)
    );
  }

  if (pool.type === "concentrated") {
    const raw = pool.raw as ConcentratedPoolRawResponse;
    if (raw.token0 !== osmoDenom && raw.token1 !== osmoDenom) {
      return new Dec(0);
    }

    return new Dec(0.5).mul(afterRisk);
  }

  return new Dec(0);
}
