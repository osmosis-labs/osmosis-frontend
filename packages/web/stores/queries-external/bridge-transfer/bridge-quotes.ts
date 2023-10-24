import { KVStore } from "@keplr-wallet/common";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { HasMapStore } from "@osmosis-labs/keplr-stores";
import { IPriceStore, ObservableQueryExternalBase } from "@osmosis-labs/stores";
import dayjs from "dayjs";
import {
  action,
  autorun,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";

import type { AvailableBridges } from "~/integrations/bridges/bridge-manager";
import type { GetBridgeQuoteParams } from "~/integrations/bridges/types";
import type { BestQuoteResponse } from "~/pages/api/bridge-transfer/quotes";

type BridgeQuotesParams = Omit<GetBridgeQuoteParams, "fromAmount">;

function getUrl(params: GetBridgeQuoteParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, JSON.stringify(value));
  });

  return `/bridge-transfer/quotes?${searchParams.toString()}`;
}

export class ObservableQueryBridgeQuotesInner extends ObservableQueryExternalBase<BestQuoteResponse> {
  @observable
  private selectedProviderId: AvailableBridges | null = null;

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
        this.amount !== "" &&
        this.amount !== "0"
    );
  }

  @computed
  get selectedQuote() {
    if (!this.response || !this.selectedProviderId) return undefined;

    return this.response.data.quotes.find(
      ({ provider }) => provider.id === this.selectedProviderId
    );
  }

  @computed
  get gasCost(): CoinPretty | undefined {
    if (!this.selectedQuote || !this.selectedQuote?.estimatedGasFee)
      return undefined;
    return new CoinPretty(
      {
        coinDecimals: this.selectedQuote.estimatedGasFee.decimals,
        coinDenom: this.selectedQuote.estimatedGasFee.denom,
        coinMinimalDenom: this.selectedQuote.estimatedGasFee.coinMinimalDenom,
      },
      new Dec(this.selectedQuote.estimatedGasFee.amount)
    ).maxDecimals(8);
  }

  @computed
  get transferFee(): CoinPretty | undefined {
    if (!this.selectedQuote || !this.selectedQuote?.transferFee)
      return undefined;

    return new CoinPretty(
      {
        coinDecimals: this.selectedQuote.transferFee.decimals,
        coinDenom: this.selectedQuote.transferFee.denom,
        coinMinimalDenom: this.selectedQuote.transferFee.coinMinimalDenom,
      },
      new Dec(this.selectedQuote.transferFee.amount)
    ).maxDecimals(8);
  }

  @computed
  get transferFeeFiat(): PricePretty | undefined {
    if (!this.selectedQuote || !this.selectedQuote?.transferFee?.fiatValue)
      return;
    const transferFeeFiatValue = this.selectedQuote.transferFee.fiatValue;
    const fiat = this.priceStore.getFiatCurrency(transferFeeFiatValue.currency);
    if (!fiat) return undefined;

    return new PricePretty(fiat, new Dec(transferFeeFiatValue.amount));
  }

  @computed
  get gasCostFiat(): PricePretty | undefined {
    if (!this.selectedQuote || !this.selectedQuote?.estimatedGasFee?.fiatValue)
      return;
    const gasCostFiatValue = this.selectedQuote.estimatedGasFee.fiatValue;
    const fiat = this.priceStore.getFiatCurrency(gasCostFiatValue.currency);
    if (!fiat) return undefined;

    return new PricePretty(fiat, new Dec(gasCostFiatValue.amount));
  }

  @computed
  get estimatedTime() {
    if (!this.selectedQuote) return undefined;
    return dayjs.duration({
      seconds: this.selectedQuote.estimatedTime,
    });
  }

  @computed
  get allBridgeProviders() {
    if (!this.response) return undefined;
    return this.response.data.quotes.map((quote) => quote.provider);
  }

  constructor(
    kvStore: KVStore,
    protected readonly priceStore: IPriceStore,
    protected readonly params: BridgeQuotesParams
  ) {
    super(kvStore, "/api", "");

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, JSON.stringify(value));
    });

    makeObservable(this);

    /**
     * If the selected provider is not in the list of quotes, then set the selected provider to null.
     */
    autorun(() => {
      if (!this.response) return;

      runInAction(() => {
        if (
          this.response!.data.quotes.length === 0 ||
          !this.response!.data.quotes.some(
            ({ provider }) => provider.id === this.selectedProviderId
          ) === undefined
        ) {
          this.selectedProviderId = null;
        }
      });
    });

    autorun(() => {
      if (!this.response || this.selectedProviderId) return;
      runInAction(() => {
        this.selectedProviderId = this.response!.data.quotes[0].provider.id;
      });
    });
  }

  @action
  setSelectBridgeProvider(providerId: AvailableBridges | null) {
    this.selectedProviderId = providerId;
  }

  @action
  setAmount(amount: string) {
    this.amount = amount;
    this.setUrl(getUrl({ ...this.params, fromAmount: amount }));
  }
}

export class ObservableQueryBridgeQuotes extends HasMapStore<ObservableQueryBridgeQuotesInner> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly priceStore: IPriceStore
  ) {
    super((key: string) => {
      const params = this.decodeKVKey(key);
      return new ObservableQueryBridgeQuotesInner(
        this.kvStore,
        priceStore,
        params
      );
    });
  }

  getQuotes(params: BridgeQuotesParams): ObservableQueryBridgeQuotesInner {
    return this.get(this.makeKVKey(params)) as ObservableQueryBridgeQuotesInner;
  }

  makeKVKey(params: BridgeQuotesParams): string {
    return JSON.stringify(params);
  }

  decodeKVKey(key: string): BridgeQuotesParams {
    return JSON.parse(key);
  }
}
