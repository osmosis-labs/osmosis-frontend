import { CoinPretty, Dec, DecUtils } from "@keplr-wallet/unit";
import { AssetList, Chain } from "@osmosis-labs/types";
import cachified, { CacheEntry } from "cachified";
import { LRUCache } from "lru-cache";

import { DEFAULT_LRU_OPTIONS } from "../../../utils";
import {
  querySuperfluidAssetMultiplier,
  querySuperfluidParams,
} from "../../osmosis";
import { getAsset } from "../assets";
import { getShareDenomPoolId, makeGammShareCurrency } from "../pools";

const cache = new LRUCache<string, CacheEntry>(DEFAULT_LRU_OPTIONS);

/** Calculates the OSMO equivalent amount for the given superfluid asset. */
export async function calcOsmoSuperfluidEquivalent({
  amount,
  denom,
  chainList,
  assetLists,
}: {
  amount: string;
  denom: string;
  chainList: Chain[];
  assetLists: AssetList[];
}) {
  return cachified({
    cache: cache,
    key: `osmo-equivalent-${denom}-${amount}`,
    ttl: 1000 * 30, // 30 seconds
    getFreshValue: async () => {
      // primary chain
      const chain = chainList[0];

      const stakeDenom = chain.staking!.staking_tokens[0].denom;
      const stakeAsset = getAsset({ assetLists, anyDenom: stakeDenom });
      const equivalentAsset = denom.startsWith("gamm")
        ? makeGammShareCurrency(getShareDenomPoolId(denom))
        : getAsset({ assetLists, anyDenom: denom });

      const multipication = DecUtils.getTenExponentN(
        equivalentAsset.coinDecimals - stakeAsset.coinDecimals
      );

      const [minimumRiskFactor, assetMultiplier] = await Promise.all([
        querySuperfluidParams({
          chainList,
        }).then(({ params }) => new Dec(params.minimum_risk_factor)),
        querySuperfluidAssetMultiplier({
          chainList,
          denom,
        }).then(
          ({ osmo_equivalent_multiplier: { multiplier } }) =>
            new Dec(multiplier)
        ),
      ]);

      const multiplier = assetMultiplier
        .mul(new Dec(1).sub(minimumRiskFactor))
        .mul(multipication);

      return new CoinPretty(
        stakeAsset,
        new CoinPretty(equivalentAsset, amount)
          .mul(multiplier)
          .mul(DecUtils.getTenExponentN(stakeAsset.coinDecimals))
      );
    },
  });
}
