import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { CoinPretty, Dec, PricePretty } from "@keplr-wallet/unit";
import { IPriceStore, ObservableQueryExternalBase } from "@osmosis-labs/stores";
import dayjs from "dayjs";
import { computed } from "mobx";

import { GetBridgeQuoteParams } from "~/integrations/bridges/types";
import { BestQuoteResponse } from "~/pages/api/bridge-transfer/best-quote";

export class ObservableQueryBridgeBestQuoteInner extends ObservableQueryExternalBase<BestQuoteResponse> {
  constructor(
    kvStore: KVStore,
    protected readonly priceStore: IPriceStore,
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

  @computed
  get gasCost(): CoinPretty | undefined {
    if (!this.response || !this.response?.data?.bestQuote?.estimatedGasFee)
      return undefined;
    return new CoinPretty(
      {
        coinDecimals: this.response.data.bestQuote.estimatedGasFee.decimals,
        coinDenom: this.response.data.bestQuote.estimatedGasFee.denom,
        coinMinimalDenom:
          this.response.data.bestQuote.estimatedGasFee.coinMinimalDenom,
      },
      new Dec(this.response.data.bestQuote.estimatedGasFee.amount)
    ).maxDecimals(8);
  }

  @computed
  get transferFee(): CoinPretty | undefined {
    if (!this.response || !this.response?.data?.bestQuote?.transferFee)
      return undefined;

    return new CoinPretty(
      {
        coinDecimals: this.response.data.bestQuote.transferFee.decimals,
        coinDenom: this.response.data.bestQuote.transferFee.denom,
        coinMinimalDenom:
          this.response.data.bestQuote.transferFee.coinMinimalDenom,
      },
      new Dec(this.response.data.bestQuote.transferFee.amount)
    ).maxDecimals(8);
  }

  @computed
  get transferFeeFiat(): PricePretty | undefined {
    if (
      !this.response ||
      !this.response?.data?.bestQuote?.transferFee?.fiatValue
    )
      return;
    const transferFeeFiatValue =
      this.response.data.bestQuote.transferFee.fiatValue;
    const fiat = this.priceStore.getFiatCurrency(transferFeeFiatValue.currency);
    if (!fiat) return undefined;

    return new PricePretty(fiat, new Dec(transferFeeFiatValue.amount));
  }

  @computed
  get gasCostFiat(): PricePretty | undefined {
    if (
      !this.response ||
      !this.response?.data?.bestQuote?.estimatedGasFee?.fiatValue
    )
      return;
    const gasCostFiatValue =
      this.response.data.bestQuote.estimatedGasFee.fiatValue;
    const fiat = this.priceStore.getFiatCurrency(gasCostFiatValue.currency);
    if (!fiat) return undefined;

    return new PricePretty(fiat, new Dec(gasCostFiatValue.amount));
  }

  @computed
  get estimatedTime() {
    if (!this.response) return undefined;
    return dayjs.duration({
      seconds: this.response.data.bestQuote.estimatedTime,
    });
  }

  get providerId(): string | undefined {
    if (!this.response) return undefined;
    return this.response.data.bestQuote.providerId;
  }
}

export class ObservableQueryBridgeBestQuote extends HasMapStore<ObservableQueryBridgeBestQuoteInner> {
  constructor(
    protected readonly kvStore: KVStore,
    protected readonly priceStore: IPriceStore
  ) {
    super((key: string) => {
      const params = this.decodeKVKey(key);
      return new ObservableQueryBridgeBestQuoteInner(
        this.kvStore,
        priceStore,
        params
      );
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
