import {
  CosmosQueries,
  CosmwasmQueries,
  QueriesStore,
} from "@osmosis-labs/keplr-stores";
import {
  AlloyedPoolCodeIds,
  TransmuterPoolCodeIds,
} from "@osmosis-labs/server";
import {
  AccountStore,
  ChainStore,
  CosmosAccount,
  CosmwasmAccount,
  LPCurrencyRegistrar,
  makeIndexedKVStore,
  OsmosisAccount,
  OsmosisQueries,
  PoolFallbackPriceStore,
  type TxEvents,
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
  IS_TESTNET,
  WALLETCONNECT_PROJECT_KEY,
  WALLETCONNECT_RELAY_URL,
} from "~/config";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import {
  getKeplrCompatibleChain,
  withCosmosKitFields,
} from "~/config/keplr-chain";

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

  protected readonly lpCurrencyRegistrar: LPCurrencyRegistrar<ChainInfoWithExplorer>;
  protected readonly ibcCurrencyRegistrar: UnsafeIbcCurrencyRegistrar<ChainInfoWithExplorer>;

  constructor({
    txEvents,
  }: {
    txEvents?: TxEvents;
  } = {}) {
    this.chainStore = new ChainStore(
      ChainList.map((chain) =>
        getKeplrCompatibleChain({ chain, assetLists: AssetLists })
      ),
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
      // These are Keplr store factories, not React Hooks.
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      CosmosQueries.use(),
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      CosmwasmQueries.use(),
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      OsmosisQueries.use(
        this.chainStore.osmosis.chainId,
        webApiBaseUrl,
        BlacklistedPoolIds,
        TransmuterPoolCodeIds,
        AlloyedPoolCodeIds,
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
      this.queriesStore.get(this.chainStore.osmosis.chainId).osmosis!
        .queryPools,
      assets
    );

    this.accountStore = new AccountStore(
      // CosmosKit reads the chain-registry fee and staking fields when suggesting chains.
      ChainList.map(withCosmosKitFields),
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
      // These are Keplr store factories, not React Hooks.
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      OsmosisAccount.use({ queriesStore: this.queriesStore }),
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      CosmosAccount.use({
        queriesStore: this.queriesStore,
      }),
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      CosmwasmAccount.use({ queriesStore: this.queriesStore })
    );

    this.lpCurrencyRegistrar = new LPCurrencyRegistrar(this.chainStore);
    this.ibcCurrencyRegistrar = new UnsafeIbcCurrencyRegistrar(
      this.chainStore,
      assets
    );
  }
}
