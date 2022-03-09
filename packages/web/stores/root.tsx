import {
  AccountStore,
  AccountWithCosmos,
  ChainInfoInner,
  CoinGeckoPriceStore,
  IBCCurrencyRegsitrar,
  QueriesStore,
  QueriesWithCosmos,
} from "@keplr-wallet/stores";
import { EmbedChainInfos, IBCAssetInfos } from "../config";
import { IndexedDBKVStore, LocalKVStore } from "@keplr-wallet/common";
import EventEmitter from "eventemitter3";
import { ChainStore } from "./chain";
import { QueriesOsmosisStore, LPCurrencyRegistrar } from "@osmosis-labs/stores";
import { AppCurrency, Keplr } from "@keplr-wallet/types";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { QueriesExternalStore } from "./external-queries/store";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<QueriesWithCosmos>;
  public readonly queriesOsmosisStore: QueriesOsmosisStore;
  public readonly queriesExternalStore: QueriesExternalStore;

  public readonly accountStore: AccountStore<AccountWithCosmos>;

  public readonly priceStore: CoinGeckoPriceStore;

  protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar;
  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar;

  constructor(getKeplr: () => Promise<Keplr | undefined>) {
    this.chainStore = new ChainStore(EmbedChainInfos, "osmosis");

    const eventListener = (() => {
      // On client-side (web browser), use the global window object.
      if (typeof window !== "undefined") {
        return window;
      }

      // On server-side (nodejs), there is no global window object.
      // Alternatively, use the event emitter library.
      const emitter = new EventEmitter();
      return {
        addEventListener: (type: string, fn: () => unknown) => {
          emitter.addListener(type, fn);
        },
        removeEventListener: (type: string, fn: () => unknown) => {
          emitter.removeListener(type, fn);
        },
      };
    })();

    this.queriesStore = new QueriesStore<QueriesWithCosmos>(
      new IndexedDBKVStore("store_web_queries"),
      this.chainStore,
      getKeplr,
      QueriesWithCosmos
    );
    this.queriesOsmosisStore = new QueriesOsmosisStore(
      (chainId: string) => this.queriesStore.get(chainId),
      new IndexedDBKVStore("store_web_queries"),
      this.chainStore
    );
    this.queriesExternalStore = new QueriesExternalStore(
      new IndexedDBKVStore("store_web_queries")
    );

    this.accountStore = new AccountStore<AccountWithCosmos>(
      eventListener,
      AccountWithCosmos,
      this.chainStore,
      this.queriesStore,
      {
        defaultOpts: {
          prefetching: false,
          suggestChain: true,
          autoInit: false,
          getKeplr,
          suggestChainFn: async (keplr, chainInfo) => {
            if (keplr.mode === "mobile-web") {
              // Can't suggest the chain on mobile web.
              return;
            }

            if (keplr instanceof KeplrWalletConnectV1) {
              // Can't suggest the chain using wallet connect.
              return;
            }

            await keplr.experimentalSuggestChain(chainInfo.raw);
          },
        },
      }
    );

    this.priceStore = new CoinGeckoPriceStore(
      new IndexedDBKVStore("store_web_prices"),
      {
        usd: {
          currency: "usd",
          symbol: "$",
          maxDecimals: 2,
          locale: "en-US",
        },
      },
      "usd"
    );

    this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
    this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar(
      new LocalKVStore("store_ibc_currency_registrar"),
      3 * 24 * 3600 * 1000, // 3 days
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      (
        denomTrace: {
          denom: string;
          paths: {
            portId: string;
            channelId: string;
          }[];
        },
        originChainInfo: ChainInfoInner | undefined,
        counterpartyChainInfo: ChainInfoInner | undefined,
        originCurrency: AppCurrency | undefined
      ) => {
        const firstPath = denomTrace.paths[0];

        // If the IBC Currency's channel is known.
        // Don't show the channel info on the coin denom.
        const knownAssetInfo = IBCAssetInfos.filter(
          (info) => info.sourceChannelId === firstPath.channelId
        ).find((info) => info.coinMinimalDenom === denomTrace.denom);
        if (knownAssetInfo) {
          return originCurrency ? originCurrency.coinDenom : denomTrace.denom;
        }

        return `${
          originCurrency ? originCurrency.coinDenom : denomTrace.denom
        } (${
          denomTrace.paths.length > 0
            ? denomTrace.paths[0].channelId
            : "Unknown"
        })`;
      }
    );
  }
}
