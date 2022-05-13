import { computed, makeObservable, observable } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import { ChainStore as BaseChainStore } from "@keplr-wallet/stores";

import { ChainInfo } from "@keplr-wallet/types";

export interface ChainInfoWithExplorer extends ChainInfo {
  /** Formed as "https://explorer.com/{txHash}" */
  explorerUrlToTx: string;
  /** Add optional stable coin peg info to currencies. */
  currencies: Array<
    AppCurrency & {
      pegMechanism?: "collateralized" | "algorithmic" | "hybrid";
    }
  >;
}

export class ChainStore extends BaseChainStore<ChainInfoWithExplorer> {
  @observable
  protected readonly osmosisChainId: string;

  constructor(
    embedChainInfos: ChainInfoWithExplorer[],
    osmosisChainId: string
  ) {
    super(embedChainInfos);

    this.osmosisChainId = osmosisChainId;

    makeObservable(this);
  }

  @computed
  get osmosis(): ChainInfoWithExplorer {
    if (this.hasChain(this.osmosisChainId)) {
      return this.getChain(this.osmosisChainId).raw;
    }

    throw new Error("osmosis chain not set");
  }
}
