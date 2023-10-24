import { KVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QueryResponse,
} from "@osmosis-labs/keplr-stores";
import { computed, makeObservable } from "mobx";

import { AccountUnlockingCoins } from "./types";

export class ObservableQueryAccountUnlockingCoinsInner extends ObservableChainQuery<AccountUnlockingCoins> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/lockup/v1beta1/account_unlocking_coins/${bech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // 위의 쿼리는 주소가 비어있을 경우 모든 계정의 해당 결과를 리턴한다.
    // 하지만 이 특징은 이 프론트엔드에서는 필요가 없으므로 주소가 비어있으면 쿼리 자체를 하지 않는다.
    return this.bech32Address !== "";
  }

  protected setResponse(
    response: Readonly<QueryResponse<AccountUnlockingCoins>>
  ) {
    super.setResponse(response);

    const chainInfo = this.chainGetter.getChain(this.chainId);
    chainInfo.addUnknownCurrencies(...response.data.coins.map((c) => c.denom));
  }

  @computed
  get unlockingCoins(): CoinPretty[] {
    if (!this.response) {
      return [];
    }

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const result: CoinPretty[] = [];

    for (const currency of chainInfo.currencies) {
      const coinPrimitive = this.response.data.coins.find(
        (c) => c.denom === currency.coinMinimalDenom
      );
      if (coinPrimitive) {
        const pretty = new CoinPretty(currency, new Dec(coinPrimitive.amount));
        result.push(pretty);
      }
    }

    return result;
  }
}

export class ObservableQueryAccountUnlockingCoins extends ObservableChainQueryMap<AccountUnlockingCoins> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryAccountUnlockingCoinsInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  get(bech32Address: string): ObservableQueryAccountUnlockingCoinsInner {
    return super.get(
      bech32Address
    ) as ObservableQueryAccountUnlockingCoinsInner;
  }
}
