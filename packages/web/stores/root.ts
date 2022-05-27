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
  OsmosisAccount,
  isSlippageError,
  prettifyTxError,
  IPriceStore,
  PoolFallbackPriceStore,
} from "@osmosis-labs/stores";
import { AppCurrency, Keplr } from "@keplr-wallet/types";
import { suggestChainFromWindow } from "../hooks/use-keplr/utils";
import { displayToast, ToastType } from "../components/alert";
import { ObservableAssets } from "./assets";
import { makeIndexedKVStore, makeLocalStorageKVStore } from "./kv-store";
import { PoolPriceRoutes } from "../config";

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, OsmosisQueries]
  >;
  public readonly queriesExternalStore: QueriesExternalStore;

  public readonly accountStore: AccountStore<
    [CosmosAccount, CosmwasmAccount, OsmosisAccount]
  >;

  public readonly priceStore: IPriceStore;

  public readonly ibcTransferHistoryStore: IBCTransferHistoryStore;

  public readonly assetsStore: ObservableAssets;

  protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar<ChainInfoWithExplorer>;
  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithExplorer>;

  constructor(
    getKeplr: () => Promise<Keplr | undefined> = () =>
      Promise.resolve(undefined)
  ) {
    this.chainStore = new ChainStore(ChainInfos, "osmosis");

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
      makeIndexedKVStore("store_web_queries")
    );

    this.queriesStore = new QueriesStore(
      makeIndexedKVStore("store_web_queries"),
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
            await suggestChainFromWindow(keplr, chainInfo.raw);
          },
          autoInit: false,
          getKeplr,
        };
      },
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator: () => ({ ibcTransfer: { gas: 130000 } }),
        preTxEvents: {
          onBroadcastFailed: (chainId: string, e?: Error) => {
            let caption: string = "Unknown error";
            if (e instanceof Error) {
              caption = e.message;
            } else if (typeof e === "string") {
              caption = e;
            }

            displayToast(
              {
                message: "Transaction Failed",
                caption:
                  prettifyTxError(
                    caption,
                    this.chainStore.getChain(chainId).currencies
                  ) ?? caption,
              },
              ToastType.ERROR
            );
          },
          onBroadcasted: () => {
            displayToast(
              {
                message: "Transaction Broadcasting",
                caption: "Waiting for transaction to be included in the block",
              },
              ToastType.LOADING
            );
          },
          onFulfill: (chainId: string, tx: any) => {
            const chainInfo = this.chainStore.getChain(chainId);
            if (tx.code) {
              displayToast(
                {
                  message: "Transaction Failed",
                  caption: isSlippageError(tx)
                    ? "Swap failed. Liquidity may not be sufficient. Try adjusting the allowed slippage."
                    : prettifyTxError(tx.log, chainInfo.currencies) ?? tx.log,
                },
                ToastType.ERROR
              );
            } else {
              displayToast(
                {
                  message: "Transaction Successful",
                  learnMoreUrl: chainInfo.raw.explorerUrlToTx.replace(
                    "{txHash}",
                    tx.hash.toUpperCase()
                  ),
                  learnMoreUrlCaption: "View explorer",
                },
                ToastType.SUCCESS
              );
            }
          },
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
  }
}
