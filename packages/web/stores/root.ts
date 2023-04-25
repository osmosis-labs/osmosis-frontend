import { wallets as cosmosStationWallets } from "@cosmos-kit/cosmostation";
import { wallets as frontierWallets } from "@cosmos-kit/frontier";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as terrastationWallets } from "@cosmos-kit/terrastation";
import { wallets as trustWallets } from "@cosmos-kit/trust";
import { wallets as xdefiWallets } from "@cosmos-kit/xdefi-extension";
import {
  ChainInfoInner,
  CosmosQueries,
  CosmwasmQueries,
  IBCCurrencyRegsitrar,
  QueriesStore,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
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
} from "@osmosis-labs/stores";

import {
  toastOnBroadcast,
  toastOnBroadcastFailed,
  toastOnFulfill,
} from "~/components/alert";
import {
  ChainInfos,
  IBCAssetInfos,
  IS_FRONTIER,
  PoolPriceRoutes,
  WalletAssets,
  WALLETCONNECT_PROJECT_KEY,
  WALLETCONNECT_RELAY_URL,
} from "~/config";
import { AxelarTransferStatusSource } from "~/integrations/axelar";

import { ObservableAssets } from "./assets";
import { DerivedDataStore } from "./derived-data";
import { makeIndexedKVStore, makeLocalStorageKVStore } from "./kv-store";
import { NavBarStore } from "./nav-bar";
import { OsmoPixelsQueries } from "./pixels";
import { ProfileStore } from "./profile";
import {
  HideDustUserSetting,
  LanguageUserSetting,
  UserSettings,
} from "./user-settings";

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
  protected readonly ibcCurrencyRegistrar: IBCCurrencyRegsitrar<ChainInfoWithExplorer>;

  public readonly queryOsmoPixels: OsmoPixelsQueries;

  public readonly navBarStore: NavBarStore;

  public readonly userSettings: UserSettings;

  public readonly profileStore: ProfileStore;

  constructor() {
    this.chainStore = new ChainStore(
      ChainInfos,
      process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE ??
        (IS_TESTNET ? "osmo-test-4" : "osmosis")
    );

    this.queriesStore = new QueriesStore(
      makeIndexedKVStore("store_web_queries_v12"),
      this.chainStore,
      CosmosQueries.use(),
      CosmwasmQueries.use(),
      OsmosisQueries.use(this.chainStore.osmosis.chainId, IS_TESTNET)
    );

    this.accountStore = new AccountStore(
      ChainInfos,
      WalletAssets,
      [
        ...keplrWallets,
        ...leapWallets,
        ...cosmosStationWallets,
        ...trustWallets,
        ...terrastationWallets,
        ...frontierWallets,
        ...xdefiWallets,
      ],
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
      OsmosisAccount.use({ queriesStore: this.queriesStore }),
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
        : IS_FRONTIER
        ? "https://frontier.osmosis.zone"
        : "https://app.osmosis.zone",
      IS_TESTNET ? "https://api.testnet.osmosis.zone/" : undefined
    );

    this.assetsStore = new ObservableAssets(
      IBCAssetInfos,
      this.chainStore,
      this.accountStore,
      this.queriesStore,
      this.priceStore,
      this.chainStore.osmosis.chainId
    );

    this.derivedDataStore = new DerivedDataStore(
      this.chainStore.osmosis.chainId,
      this.queriesStore,
      this.queriesExternalStore,
      this.accountStore,
      this.priceStore,
      this.chainStore,
      this.assetsStore
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
    this.ibcCurrencyRegistrar = new IBCCurrencyRegsitrar(
      makeLocalStorageKVStore("store_ibc_currency_registrar"),
      3 * 24 * 3600 * 1000, // 3 days
      this.chainStore,
      {
        getAccount: (chainId: string) => {
          return {
            bech32Address:
              this.accountStore.getWallet(chainId as any)?.address ?? "",
          };
        },
        hasAccount: (chainId: string) => {
          return this.accountStore.hasWallet(chainId);
        },
      },
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

    this.navBarStore = new NavBarStore(
      this.chainStore.osmosis.chainId,
      this.accountStore,
      this.queriesStore
    );

    const userSettingKvStore = makeLocalStorageKVStore("user_setting");
    this.userSettings = new UserSettings(userSettingKvStore, [
      new LanguageUserSetting(0), // give index of default language in SUPPORTED_LANGUAGES
      new HideDustUserSetting(
        this.priceStore.getFiatCurrency(this.priceStore.defaultVsCurrency)
          ?.symbol ?? "$"
      ),
    ]);

    const profileStoreKvStore = makeLocalStorageKVStore("profile_store");
    this.profileStore = new ProfileStore(profileStoreKvStore);
  }
}
