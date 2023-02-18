import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";

export type Params = {
  param: {
    subspace: "gamm";
    key: "PoolCreationFee";
    // '[{"denom":"uosmo","amount":"1"}]';
    value: string;
  };
};

export class ObservableQueryPoolCreationFee extends ObservableChainQuery<Params> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/cosmos/params/v1beta1/params?subspace=gamm&key=PoolCreationFee`
    );

    makeObservable(this);
  }

  @computed
  get poolCreationFee(): CoinPretty[] {
    if (!this.response) {
      return [];
    }

    const value = JSON.parse(this.response.data.param.value) as {
      denom: string;
      amount: string;
    }[];

    const chainInfo = this.chainGetter.getChain(this.chainId);

    const result: CoinPretty[] = [];

    for (const fee of value) {
      const currency = chainInfo.forceFindCurrency(fee.denom);
      result.push(new CoinPretty(currency, new Dec(fee.amount)));
    }

    return result;
  }
}
