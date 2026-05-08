import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
} from "@osmosis-labs/keplr-stores";
import { CoinPretty, Int } from "@osmosis-labs/unit";
import Axios, { AxiosInstance } from "axios";
import { computed, makeObservable, override } from "mobx";

type BalanceByDenomResponse = {
  balance: { denom: string; amount: string };
};

type DisplayCurrency = {
  coinMinimalDenom: string;
  coinDecimals: number;
  coinDenom: string;
};

export class ObservableQueryDenomBalanceInner extends ObservableChainQuery<BalanceByDenomResponse> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    readonly address: string,
    readonly denom: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/api/tokenfactory/denom-balance?address=${encodeURIComponent(address)}&denom=${encodeURIComponent(denom)}`
    );
    makeObservable(this);
  }

  @override
  protected get instance(): AxiosInstance {
    return Axios.create({ baseURL: "" });
  }

  protected canFetch(): boolean {
    return this.address !== "" && this.denom !== "";
  }

  @computed
  get balanceRaw(): string {
    return this.response?.data.balance?.amount ?? "0";
  }

  balance(currency: DisplayCurrency): CoinPretty {
    return new CoinPretty(currency, new Int(this.balanceRaw));
  }
}

export class ObservableQueryDenomBalance extends ObservableChainQueryMap<BalanceByDenomResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (key: string) => {
      const [address, ...denomParts] = key.split("|");
      return new ObservableQueryDenomBalanceInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        address,
        denomParts.join("|")
      );
    });
  }

  getBalance(address: string, denom: string): ObservableQueryDenomBalanceInner {
    return super.get(`${address}|${denom}`) as ObservableQueryDenomBalanceInner;
  }
}

type SupplyByDenomResponse = {
  amount: { denom: string; amount: string };
};

export class ObservableQueryTotalSupplyInner extends ObservableChainQuery<SupplyByDenomResponse> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    readonly denom: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `/api/tokenfactory/total-supply?denom=${encodeURIComponent(denom)}`
    );
    makeObservable(this);
  }

  @override
  protected get instance(): AxiosInstance {
    return Axios.create({ baseURL: "" });
  }

  protected canFetch(): boolean {
    return this.denom !== "";
  }

  @computed
  get totalSupplyRaw(): string {
    return this.response?.data.amount?.amount ?? "0";
  }

  totalSupply(currency: { coinMinimalDenom: string; coinDecimals: number; coinDenom: string }): CoinPretty {
    return new CoinPretty(currency, new Int(this.totalSupplyRaw));
  }
}

export class ObservableQueryTotalSupply extends ObservableChainQueryMap<SupplyByDenomResponse> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (denom: string) => {
      return new ObservableQueryTotalSupplyInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        denom
      );
    });
  }

  get(denom: string): ObservableQueryTotalSupplyInner {
    return super.get(denom) as ObservableQueryTotalSupplyInner;
  }
}
