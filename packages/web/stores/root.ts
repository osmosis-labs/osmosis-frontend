import {
  CosmosQueries,
  CosmwasmQueries,
  QueriesStore,
} from "@keplr-wallet/stores";
import {
  AccountStore,
  ChainInfoWithExplorer,
  ChainStore,
  CosmosAccount,
  CosmwasmAccount,
  IBCTransferHistoryStore,
  LPCurrencyRegistrar,
  NonIbcBridgeHistoryStore,
  OsmosisAccount,
  OsmosisQueries,
  PoolFallbackPriceStore,
  QueriesExternalStore,
  UnsafeIbcCurrencyRegistrar,
  UserUpgrades,
} from "@osmosis-labs/stores";

import {
  toastOnBroadcast,
  toastOnBroadcastFailed,
  toastOnFulfill,
} from "~/components/alert/tx-event-toast";
import {
  ChainInfos,
  IBCAssetInfos,
  INDEXER_DATA_URL,
  PoolPriceRoutes,
  TIMESERIES_DATA_URL,
  WalletAssets,
  WALLETCONNECT_PROJECT_KEY,
  WALLETCONNECT_RELAY_URL,
} from "~/config";
import { AxelarTransferStatusSource } from "~/integrations/axelar";
import { ObservableAssets } from "~/stores/assets";
import { DerivedDataStore } from "~/stores/derived-data";
import { makeIndexedKVStore, makeLocalStorageKVStore } from "~/stores/kv-store";
import { NavBarStore } from "~/stores/nav-bar";
import { ProfileStore } from "~/stores/profile";
import {
  HideDustUserSetting,
  LanguageUserSetting,
  UnverifiedAssetsUserSetting,
  UserSettings,
} from "~/stores/user-settings";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

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

  public readonly ibcTransferHistoryStore: IBCTransferHistoryStore;
  public readonly nonIbcBridgeHistoryStore: NonIbcBridgeHistoryStore;

  public readonly assetsStore: ObservableAssets;

  protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar<ChainInfoWithExplorer>;
  protected readonly ibcCurrencyRegistrar: UnsafeIbcCurrencyRegistrar<ChainInfoWithExplorer>;

  public readonly navBarStore: NavBarStore;

  public readonly userSettings: UserSettings;

  public readonly profileStore: ProfileStore;

  public readonly userUpgrades: UserUpgrades;

  constructor() {
    this.chainStore = new ChainStore(
      ChainInfos,
      process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE ??
        (IS_TESTNET ? "osmo-test-5" : "osmosis")
    );

    this.queriesStore = new QueriesStore(
      makeIndexedKVStore("store_web_queries_v12"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(this.chainStore.osmosis.chainId, IS_TESTNET)
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
      PoolPriceRoutes
    );

    const userSettingKvStore = makeLocalStorageKVStore("user_setting");
    this.userSettings = new UserSettings(userSettingKvStore, [
      new LanguageUserSetting(0), // give index of default language in SUPPORTED_LANGUAGES
      new HideDustUserSetting(
        this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)
          ?.symbol ?? "$"
      ),
      new UnverifiedAssetsUserSetting(),
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
      typeof window !== "undefined"
        ? window.origin
        : "https://app.osmosis.zone",
      TIMESERIES_DATA_URL,
      INDEXER_DATA_URL
    );

    this.accountStore = new AccountStore(
      ChainInfos,
      WalletAssets,
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
          onBroadcastFailed: toastOnBroadcastFailed((chainId) =>
            this.chainStore.getChain(chainId)
          ),
          onBroadcasted: toastOnBroadcast(),
          onFulfill: toastOnFulfill((chainId) =>
            this.chainStore.getChain(chainId)
          ),
        },
      },
      OsmosisAccount.use({
        queriesStore: this.queriesStore,
        queriesExternalStore: this.queriesExternalStore,
      }),
      CosmosAccount.use({
        queriesStore: this.queriesStore,
        msgOptsCreator(chainId) {
          if (chainId.startsWith("osmosis")) {
            return { ibcTransfer: { gas: 300000 } };
          }
          if (chainId.startsWith("evmos_")) {
            return { ibcTransfer: { gas: 250000 } };
          } else {
            return { ibcTransfer: { gas: 210000 } };
          }
        },
      }),
      CosmwasmAccount.use({ queriesStore: this.queriesStore })
    );

    this.assetsStore = new ObservableAssets(
      IBCAssetInfos,
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      this.priceStore,
      this.chainStore.osmosis.chainId,
      this.userSettings
    );

    this.derivedDataStore = new DerivedDataStore(
      this.chainStore.osmosis.chainId,
      this.queriesStore,
      this.queriesExternalStore,
      this.accountStore,
      this.priceStore,
      this.chainStore,
      this.assetsStore,
      this.userSettings
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

    this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
    this.ibcCurrencyRegistrar = new UnsafeIbcCurrencyRegistrar(
      this.chainStore,
      IBCAssetInfos,
      this.chainStore.osmosis.chainId
    );

    this.navBarStore = new NavBarStore(
      this.chainStore.osmosis.chainId,
      this.accountStore,
      this.queriesStore
    );

    const profileStoreKvStore = makeLocalStorageKVStore("profile_store");
    this.profileStore = new ProfileStore(profileStoreKvStore);

    this.userUpgrades = new UserUpgrades(
      this.chainStore.osmosis.chainId,
      this.queriesStore,
      this.accountStore,
      this.derivedDataStore
    );
  }
}
