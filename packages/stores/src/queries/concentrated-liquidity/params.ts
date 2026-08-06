import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@osmosis-labs/keplr-stores";
import { Dec } from "@osmosis-labs/unit";
import { computed } from "mobx";

export type ConcentratedLiquidityParams = {
  authorized_tick_spacing: string[];
  authorized_spread_factors: string[];
  balancer_shares_reward_discount: string;
  authorized_quote_denoms: string[];
  authorized_uptimes: string[];
  is_permissionless_pool_creation_enabled: boolean;
};

export class ObservableQueryConcentratedLiquidityParams extends ObservableChainQuery<ConcentratedLiquidityParams> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      "/osmosis/concentratedliquidity/v1beta1/params"
    );
  }

  @computed
  get balancerSharesRewardDiscount(): Dec | undefined {
    if (!this.response) {
      return;
    }

    return new Dec(this.response.data.balancer_shares_reward_discount);
  }

  /** Uptimes (in seconds) an external concentrated-liquidity gauge may
   *  require of positions before they qualify for its incentives. Includes
   *  the effectively-none 1ns option. */
  @computed
  get authorizedUptimes(): number[] | undefined {
    // Guard the full path: error responses and older nodes can produce a
    // response object without the expected params shape.
    const uptimes = this.response?.data?.authorized_uptimes;
    if (!Array.isArray(uptimes)) {
      return;
    }

    // Duration strings like "0.000000001s", "60s", "3600s", "86400s".
    const parsed = uptimes
      .filter((uptime): uptime is string => typeof uptime === "string")
      .map((uptime) => Number(uptime.replace(/s$/, "")))
      .filter((seconds) => Number.isFinite(seconds));

    // Return undefined (not an empty array) when nothing parsed, so callers'
    // `?? fallback` fires instead of masking with a non-nullish empty set.
    return parsed.length > 0 ? parsed : undefined;
  }
}
