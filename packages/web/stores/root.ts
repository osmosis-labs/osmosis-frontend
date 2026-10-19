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

    this.walletRuntime = new WalletRuntime(
      {
        chains: ChainList.map(withCosmosKitFields),
        assets: AssetLists,
        osmosisChainId: OsmosisChainInfo.chainId,
        walletConnectOptions: {
          signClient: {
            projectId: WALLETCONNECT_PROJECT_KEY ?? "",
            relayUrl: WALLETCONNECT_RELAY_URL,
          },
        },
      },
      {
        preTxEvents,
        findCurrency: (chainId, denom) =>
          StaticChainGetter.getChain(chainId).findCurrency(denom),
      }
    );
  }
}
