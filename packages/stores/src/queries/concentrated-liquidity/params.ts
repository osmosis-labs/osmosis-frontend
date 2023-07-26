import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { Dec } from "@keplr-wallet/unit";
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
}
