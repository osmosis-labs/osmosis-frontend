import {
  AccountStore,
  ChainInfoInner,
  CosmosQueries,
  CosmosAccount,
  CosmwasmQueries,
  CosmwasmAccount,
  IBCCurrencyRegsitrar,
  QueriesStore,
} from "@keplr-wallet/stores";
import { ChainInfos, IBCAssetInfos } from "../config";
import EventEmitter from "eventemitter3";
import { ChainStore, ChainInfoWithExplorer } from "./chain";
import {
  OsmosisQueries,
  LPCurrencyRegistrar,
  QueriesExternalStore,
  IBCTransferHistoryStore,
  NonIbcBridgeHistoryStore,
  OsmosisAccount,
  PoolFallbackPriceStore,
} from "@osmosis-labs/stores";
import { AppCurrency, Keplr } from "@keplr-wallet/types";
import { suggestChainFromWindow } from "../hooks/use-keplr/utils";
import {
  toastOnBroadcastFailed,
  toastOnBroadcast,
  toastOnFulfill,
} from "../components/alert";
import { AxelarTransferStatusSource } from "../integrations/axelar";
import { ObservableAssets } from "./assets";
import { makeIndexedKVStore, makeLocalStorageKVStore } from "./kv-store";
import { PoolPriceRoutes } from "../config";
import { KeplrWalletConnectV1 } from "@keplr-wallet/wc-client";
import { OsmoPixelsQueries } from "./pixels";
const semver = require("semver");
const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, OsmosisQueries]
  >;
  public readonly queriesExternalStore: QueriesExternalStore;

  public readonly accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, OsmosisAccount]
  >;

  public readonly priceStore: PoolFallbackPriceStore;

  public readonly ibcTransferHistoryStore: IBCTransferHistoryStore;
  public readonly nonIbcBridgeHistoryStore: NonIbcBridgeHistoryStore;

  public readonly assetsStore: ObservableAssets;

  protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar<ChainInfoWithExplorer>;
  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithExplorer>;

  public readonly queryOsmoPixels: OsmoPixelsQueries;

  constructor(
    getKeplr: () => Promise<Keplr | undefined> = () =>
      Promise.resolve(undefined)
  ) {
    this.chainStore = new ChainStore(
      ChainInfos,
      IS_TESTNET ? "osmo-test-4" : "osmosis"
    );

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

    this.queriesExternalStore = new QueriesExternalStore(
      makeIndexedKVStore("store_web_queries"),
      IS_TESTNET ? "https://api.testnet.osmosis.zone/" : undefined
    );

    this.queriesStore = new QueriesStore(
      makeIndexedKVStore("store_web_queries_v12"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(this.chainStore.osmosis.chainId)
    );

    this.accountStore = new AccountStore(
      eventListener,
      this.chainStore,
      () => {
        return {
          suggestChain: true,
          suggestChainFn: async (keplr, chainInfo) => {
            if (
              keplr.mode === "mobile-web" &&
              // In keplr mobile below 0.10.9, there is no receiver for the suggest chain.
              // Therefore, it cannot be processed because it takes infinite pending.
              // As of 0.10.10, experimental support was added.
              !semver.satisfies(keplr.version, ">=0.10.10")
            ) {
              // Can't suggest the chain on mobile web.
              return;
            }

            if (keplr instanceof KeplrWalletConnectV1) {
              // Still, can't suggest the chain using wallet connect.
              return;
            }

            await suggestChainFromWindow(keplr, chainInfo.raw);
          },
          autoInit: false,
          getKeplr,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: (chainId) =>
          chainId.startsWith("evmos_")
            ? { ibcTransfer: { gas: 160000 } }
            : { ibcTransfer: { gas: 130000 } },
        preTxEvents: {
          onBroadcastFailed: toastOnBroadcastFailed((chainId) =>
            this.chainStore.getChain(chainId)
          ),
          onBroadcasted: toastOnBroadcast(),
          onFulfill: toastOnFulfill((chainId) =>
            this.chainStore.getChain(chainId)
          ),
        },
      }),
      CosmwasmAccount.use({ queriesStore: this.queriesStore }),
      OsmosisAccount.use({ queriesStore: this.queriesStore })
    );

    this.priceStore = new PoolFallbackPriceStore(
      this.chainStore.osmosis.chainId,
      this.chainStore,
      makeIndexedKVStore("store_web_prices"),
      {
        usd: {
          currency: "usd",
          symbol: "$",
          maxDecimals: 2,
          locale: "en-US",
        },
      },
      "usd",
      this.queriesStore.get(
        this.chainStore.osmosis.chainId
      ).osmosis!.queryGammPools,
      PoolPriceRoutes
    );

    this.ibcTransferHistoryStore = new IBCTransferHistoryStore(
      makeIndexedKVStore("ibc_transfer_history"),
      this.chainStore
    );
    this.nonIbcBridgeHistoryStore = new NonIbcBridgeHistoryStore(
      this.queriesStore,
      this.chainStore.osmosis.chainId,
      makeLocalStorageKVStore("nonibc_transfer_history"),
      [
        new AxelarTransferStatusSource(
          IS_TESTNET ? "https://testnet.axelarscan.io" : undefined,
          IS_TESTNET ? "https://testnet.api.axelarscan.io" : undefined
        ),
      ]
    );

    this.assetsStore = new ObservableAssets(
      IBCAssetInfos,
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      this.priceStore,
      this.chainStore.osmosis.chainId
    );

    this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
    this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar(
      makeLocalStorageKVStore("store_ibc_currency_registrar"),
      3 * 24 * 3600 * 1000, // 3 days
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      this.queriesStore,
      (
        denomTrace: {
          denom: string;
          paths: {
            portId: string;
            channelId: string;
          }[];
        },
        _originChainInfo: ChainInfoInner | undefined,
        _counterpartyChainInfo: ChainInfoInner | undefined,
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

    this.queryOsmoPixels = new OsmoPixelsQueries(
      makeIndexedKVStore("query_osmo_pixels"),
      "https://pixels-osmosis.keplr.app"
    );
  }
}
