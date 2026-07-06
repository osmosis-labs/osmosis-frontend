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
    if (!this.response) {
      return;
    }

    // Duration strings like "0.000000001s", "60s", "3600s", "86400s".
    return this.response.data.authorized_uptimes
      .map((uptime) => Number(uptime.replace(/s$/, "")))
      .filter((seconds) => Number.isFinite(seconds));
  }
}
