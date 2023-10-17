import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { ObservableQueryExternalBase } from "@osmosis-labs/stores";
import { action, computed, makeObservable, observable } from "mobx";

import type { AvailableBridges } from "~/integrations/bridges/bridge-manager";
import type { GetBridgeQuoteParams } from "~/integrations/bridges/types";
import { TransactionForBridgeResponse } from "~/pages/api/bridge-transfer/transaction-requests/[bridge]";

type BridgeTransactionRequestParams = Omit<
  GetBridgeQuoteParams,
  "fromAmount"
> & { providerId?: AvailableBridges };

function getUrl({
  providerId,
  ...params
}: GetBridgeQuoteParams & Pick<BridgeTransactionRequestParams, "providerId">) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, JSON.stringify(value));
  });

  return `/bridge-transfer/transaction-requests/${providerId}?${searchParams.toString()}`;
}

export class ObservableQueryBridgeTransactionInner extends ObservableQueryExternalBase<TransactionForBridgeResponse> {
  @observable
  private amount: string = "";

  protected canFetch(): boolean {
    return Boolean(
      this.params.fromChain &&
        this.params.toChain &&
        this.params.fromAddress &&
        this.params.toAddress &&
        this.params.fromAsset &&
        this.params.toAsset &&
        this.params.providerId &&
        this.amount !== "" &&
        this.amount !== "0"
    );
  }

  @computed
  get transactionRequest() {
    if (!this.response) return;
    return this.response.data.transactionRequest;
  }

  constructor(
    kvStore: KVStore,
    protected readonly params: BridgeTransactionRequestParams
  ) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, JSON.stringify(value));
    });

    super(kvStore, "/api", "");

    makeObservable(this);
  }

  @action
  setAmount(amount: string) {
    this.amount = amount;
    this.setUrl(getUrl({ ...this.params, fromAmount: amount }));
  }
}

export class ObservableQueryBridgeTransaction extends HasMapStore<ObservableQueryBridgeTransactionInner> {
  constructor(protected readonly kvStore: KVStore) {
    super((key: string) => {
      const params = this.decodeKVKey(key);
      return new ObservableQueryBridgeTransactionInner(this.kvStore, params);
    });
  }

  getTransactionRequest(
    params: BridgeTransactionRequestParams
  ): ObservableQueryBridgeTransactionInner {
    return this.get(
      this.makeKVKey(params)
    ) as ObservableQueryBridgeTransactionInner;
  }

  makeKVKey(params: BridgeTransactionRequestParams): string {
    return JSON.stringify(params);
  }

  decodeKVKey(key: string): BridgeTransactionRequestParams {
    return JSON.parse(key);
  }
}
