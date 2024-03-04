import { Dec } from "@keplr-wallet/unit";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { queryOsmosisMintParams } from "~/server/queries/osmosis/mint";
import { querySuperfluidParams } from "~/server/queries/osmosis/superfluid/superfluid-params";
import { DEFAULT_LRU_OPTIONS } from "~/utils/cache";

const paramsCache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

export async function getOsmosisMintParams() {
  return cachified({
    cache: paramsCache,
    key: "osmosis-mint-params",
    ttl: 1000 * 30, // 30 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const { params: mintParams } = await queryOsmosisMintParams();

      const distributionProportions: {
        staking: Dec;
        poolIncentives: Dec;
        developerRewards: Dec;
      } = {
        staking: new Dec(mintParams.distribution_proportions.staking),
        poolIncentives: new Dec(
          mintParams.distribution_proportions.pool_incentives
        ),
        developerRewards: new Dec(
          mintParams.distribution_proportions.developer_rewards
        ),
      };

      return {
        mintDenom: mintParams.mint_denom,
        genesisEpochProvisions: mintParams.genesis_epoch_provisions,
        epochIdentifier: mintParams.epoch_identifier,
        reductionPeriodInEpochs: mintParams.reduction_period_in_epochs,
        reductionFactor: mintParams.reduction_factor,
        distributionProportions,
        developerRewardsReceiver: mintParams.developer_rewards_receiver,
      };
    },
  });
}

export async function getSuperfluidParams() {
  return cachified({
    cache: paramsCache,
    key: "osmosis-superfluid-params",
    ttl: 1000 * 30, // 30 seconds
    staleWhileRevalidate: 1000 * 60 * 5, // 5 minutes
    getFreshValue: async () => {
      const { params } = await querySuperfluidParams();

      return {
        minimumRiskFactor: new Dec(params.minimum_risk_factor),
      };
    },
  });
}
