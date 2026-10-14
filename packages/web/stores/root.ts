import {
  AccountStore,
  CosmosAccount,
  CosmwasmAccount,
  OsmosisAccount,
} from "@osmosis-labs/stores";
import type { TxEvents } from "@osmosis-labs/tx";

import {
  toastOnBroadcast,
  toastOnBroadcastFailed,
  toastOnFulfill,
} from "~/components/alert/tx-event-toast";
import { WALLETCONNECT_PROJECT_KEY, WALLETCONNECT_RELAY_URL } from "~/config";
import { OsmosisChainInfo, StaticChainGetter } from "~/config/chain";
import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { withCosmosKitFields } from "~/config/keplr-chain";
import { WalletRuntime } from "~/stores/wallet-runtime";

export class RootStore {
  public readonly walletRuntime: WalletRuntime;
  public readonly accountStore: AccountStore<
    [OsmosisAccount, CosmosAccount, CosmwasmAccount]
  >;

  constructor({
    txEvents,
  }: {
    txEvents?: TxEvents;
  } = {}) {
    const preTxEvents: TxEvents = {
      ...txEvents,
      onBroadcastFailed: (string, e) => {
        txEvents?.onBroadcastFailed?.(string, e);
        return toastOnBroadcastFailed((chainId) =>
          StaticChainGetter.getChain(chainId)
        )(string, e);
      },
      onBroadcasted: (string, txHash) => {
        txEvents?.onBroadcasted?.(string, txHash);
        return toastOnBroadcast()();
      },
      onFulfill: (chainId, tx) => {
        txEvents?.onFulfill?.(chainId, tx);
        return toastOnFulfill((chainId) => StaticChainGetter.getChain(chainId))(
          chainId,
          tx
        );
      },
    };

    this.accountStore = new AccountStore(
      // CosmosKit reads the chain-registry fee and staking fields when suggesting chains.
      ChainList.map(withCosmosKitFields),
      OsmosisChainInfo.chainId,
      AssetLists,
      /**
       * No need to add default wallets as we'll lazily install them as needed.
       * @see wallet-select.tsx
       * @see wallet-registry.ts
       */
      [],
      StaticChainGetter,
      {
        walletConnectOptions: {
          signClient: {
            projectId: WALLETCONNECT_PROJECT_KEY ?? "",
            relayUrl: WALLETCONNECT_RELAY_URL,
          },
        },
        preTxEvents,
      },
      // These are Keplr store factories, not React Hooks.
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      OsmosisAccount.use(),
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      CosmosAccount.use(),
      // eslint-disable-next-line react-hooks/rules-of-hooks -- Factory API is named `use` by the upstream SDK.
      CosmwasmAccount.use()
    );
    this.walletRuntime = new WalletRuntime(this.accountStore, { preTxEvents });
  }
}
