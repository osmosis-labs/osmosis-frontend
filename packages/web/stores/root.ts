import {
  AxelarTransferStatusProvider,
  IbcTransferStatusProvider,
  SkipTransferStatusProvider,
  SquidTransferStatusProvider,
} from "@osmosis-labs/bridge";
import {
  CosmosQueries,
  CosmwasmQueries,
  QueriesStore,
} from "@osmosis-labs/keplr-stores";
import {
  AccountStore,
  ChainStore,
  CosmosAccount,
  CosmwasmAccount,
  DerivedDataStore,
  LPCurrencyRegistrar,
  makeIndexedKVStore,
  makeLocalStorageKVStore,
  OsmosisAccount,
  OsmosisQueries,
  PoolFallbackPriceStore,
  TxEvents,
  UnsafeIbcCurrencyRegistrar,
} from "@osmosis-labs/stores";
import type { ChainInfoWithExplorer } from "@osmosis-labs/types";

import {
  toastOnBroadcast,
  toastOnBroadcastFailed,
  toastOnFulfill,
} from "~/components/alert/tx-event-toast";
import {
  BlacklistedPoolIds,
  INDEXER_DATA_URL,
  IS_TESTNET,
  TIMESERIES_DATA_URL,
  TransmuterPoolCodeIds,
  WALLETCONNECT_PROJECT_KEY,
  WALLETCONNECT_RELAY_URL,
} from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { NavBarStore } from "~/stores/nav-bar";
import { ProfileStore } from "~/stores/profile";
import { QueriesExternalStore } from "~/stores/queries-external";
import {
  HideBalancesUserSetting,
  HideDustUserSetting,
  LanguageUserSetting,
  UnverifiedAssetsUserSetting,
  UserSettings,
} from "~/stores/user-settings";

import { TransferHistoryStore } from "./transfer-history";

const assets = AssetLists.flatMap((list) => list.assets);

export class RootStore {
  public readonly chainStore: ChainStore;

  public readonly queriesStore: QueriesStore<
    [CosmosQueries, CosmwasmQueries, OsmosisQueries]
  >;

  public readonly accountStore: AccountStore<
    [OsmosisAccount, CosmosAccount, CosmwasmAccount]
  >;

  public readonly priceStore: PoolFallbackPriceStore;

  public readonly queriesExternalStore: QueriesExternalStore;

  public readonly derivedDataStore: DerivedDataStore;

  public readonly transferHistoryStore: TransferHistoryStore;

  protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar<ChainInfoWithExplorer>;
  protected readonly ibcCurrencyRegistrar: UnsafeIbcCurrencyRegistrar<ChainInfoWithExplorer>;

  public readonly navBarStore: NavBarStore;

  public readonly userSettings: UserSettings;

  public readonly profileStore: ProfileStore;

  constructor({
    txEvents,
  }: {
    txEvents?: TxEvents;
  } = {}) {
    this.chainStore = new ChainStore(
      ChainList.map((chain) => chain.keplrChain),
      process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE ??
        (IS_TESTNET ? "osmo-test-5" : "osmosis")
    );

    const webApiBaseUrl =
      typeof window !== "undefined"
        ? window.origin
        : "https://app.osmosis.zone";

    this.queriesStore = new QueriesStore(
      makeIndexedKVStore("store_web_queries_v12"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(
        this.chainStore.osmosis.chainId,
        webApiBaseUrl,
        BlacklistedPoolIds,
        TransmuterPoolCodeIds,
        IS_TESTNET
      )
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
      ).osmosis!.queryPools,
      assets
    );

    const userSettingKvStore = makeLocalStorageKVStore("user_setting");
    this.userSettings = new UserSettings(userSettingKvStore, [
      new LanguageUserSetting(0), // give index of default language in SUPPORTED_LANGUAGES
      new HideDustUserSetting(
        this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)
          ?.symbol ?? "$"
      ),
      new UnverifiedAssetsUserSetting(),
      new HideBalancesUserSetting(),
    ]);

    this.queriesExternalStore = new QueriesExternalStore(
      makeIndexedKVStore("store_web_queries"),
      this.priceStore,
      this.chainStore,
      this.chainStore.osmosis.chainId,
      this.queriesStore.get(
        this.chainStore.osmosis.chainId
      ).osmosis!.queryGauge,
      this.queriesStore.get(
        this.chainStore.osmosis.chainId
      ).osmosis!.queryIncentivizedPools,
      webApiBaseUrl,
      TIMESERIES_DATA_URL,
      INDEXER_DATA_URL
    );

    this.accountStore = new AccountStore(
      ChainList,
      this.chainStore.osmosis.chainId,
      AssetLists,
      /**
       * No need to add default wallets as we'll lazily install them as needed.
       * @see wallet-select.tsx
       * @see wallet-registry.ts
       */
      [],
      this.queriesStore,
      this.chainStore,
      {
        walletConnectOptions: {
          signClient: {
            projectId: WALLETCONNECT_PROJECT_KEY ?? "",
            relayUrl: WALLETCONNECT_RELAY_URL,
          },
        },
        preTxEvents: {
          ...txEvents,
          onBroadcastFailed: (string, e) => {
            txEvents?.onBroadcastFailed?.(string, e);
            return toastOnBroadcastFailed((chainId) =>
              this.chainStore.getChain(chainId)
            )(string, e);
          },
          onBroadcasted: (string, txHash) => {
            txEvents?.onBroadcasted?.(string, txHash);
            return toastOnBroadcast()();
          },
          onFulfill: (chainId, tx) => {
            txEvents?.onFulfill?.(chainId, tx);
            return toastOnFulfill((chainId) =>
              this.chainStore.getChain(chainId)
            )(chainId, tx);
          },
        },
      },
      OsmosisAccount.use({
        queriesStore: this.queriesStore,
        queriesExternalStore: this.queriesExternalStore,
      }),
      CosmosAccount.use({
        queriesStore: this.queriesStore,
      }),
      CosmwasmAccount.use({ queriesStore: this.queriesStore })
    );

    this.derivedDataStore = new DerivedDataStore(
      this.chainStore.osmosis.chainId,
      this.queriesStore,
      this.queriesExternalStore,
      this.accountStore,
      this.priceStore,
      this.chainStore
    );

    const transferStatusProviders = [
      new AxelarTransferStatusProvider(IS_TESTNET ? "testnet" : "mainnet"),
      new SquidTransferStatusProvider(
        IS_TESTNET ? "testnet" : "mainnet",
        ChainList
      ),
      new SkipTransferStatusProvider(
        IS_TESTNET ? "testnet" : "mainnet",
        ChainList,
        {
          transactionStatus: async ({ chainID, txHash, env }) => {
            const response = await fetch(
              `/api/skip-tx-status?chainID=${chainID}&txHash=${txHash}&env=${env}`
            );
            const responseJson = await response.json();
            if (!response.ok) {
              throw new Error(
                "Failed to fetch transaction status: " + responseJson.error
              );
            }
            return responseJson;
          },
          trackTransaction: async ({ chainID, txHash, env }) => {
            const response = await fetch(
              `/api/skip-track-tx?chainID=${chainID}&txHash=${txHash}&env=${env}`
            );
            const responseJson = await response.json();
            if (!response.ok) {
              throw new Error(
                "Failed to track transaction: " + responseJson.error
              );
            }
            return responseJson;
          },
        }
      ),
      new IbcTransferStatusProvider(ChainList, AssetLists),
    ];

    this.transferHistoryStore = new TransferHistoryStore(
      (accountAddress) => {
        this.queriesStore
          .get(this.chainStore.osmosis.chainId)
          .queryBalances.getQueryBech32Address(accountAddress)
          .fetch();
        // txEvents passed to root store is used to invalidate
        // tRPC queries, the params are not used
        txEvents?.onFulfill?.("", "");
      },
      makeLocalStorageKVStore("nonibc_transfer_history"),
      transferStatusProviders
    );

    this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
    this.ibcCurrencyRegistrar = new UnsafeIbcCurrencyRegistrar(
      this.chainStore,
      assets
    );

    this.navBarStore = new NavBarStore(this.chainStore.osmosis.chainId);

    const profileStoreKvStore = makeLocalStorageKVStore("profile_store");
    this.profileStore = new ProfileStore(profileStoreKvStore);
  }
}
