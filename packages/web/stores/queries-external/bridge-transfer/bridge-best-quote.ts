import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "@osmosis-labs/stores";

import { GetBridgeQuoteParams } from "~/integrations/bridges/base";

export class ObservableQueryBridgeBestQuoteInner extends ObservableQueryExternalBase<any> {
  constructor(
    kvStore: KVStore,
    protected readonly params: GetBridgeQuoteParams
  ) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, JSON.stringify(value));
    });

    super(
      kvStore,
      "/api",
      `/bridge-transfer/best-quote?${searchParams.toString()}`
    );
  }

  protected canFetch(): boolean {
    console.log(this.params);
    return Boolean(
      this.params.fromChain &&
        this.params.toChain &&
        this.params.fromAddress &&
        this.params.toAddress &&
        this.params.fromAsset &&
        this.params.toAsset &&
        this.params.fromAmount
    );
  }
}

export class ObservableQueryBridgeBestQuote extends HasMapStore<ObservableQueryBridgeBestQuoteInner> {
  constructor(protected readonly kvStore: KVStore) {
    super((key: string) => {
      const params = this.decodeKVKey(key);
      return new ObservableQueryBridgeBestQuoteInner(this.kvStore, params);
    });
  }

  getBestQuote(
    params: GetBridgeQuoteParams
  ): ObservableQueryBridgeBestQuoteInner {
    return this.get(
      this.makeKVKey(params)
    ) as ObservableQueryBridgeBestQuoteInner;
  }

  makeKVKey(params: GetBridgeQuoteParams): string {
    return JSON.stringify(params);
  }

  decodeKVKey(key: string): GetBridgeQuoteParams {
    return JSON.parse(key);
  }
}
