import { StdFee } from "@cosmjs/launchpad";
import { Logger, WalletManager, WalletStatus } from "@cosmos-kit/core";
import { wallets as cosmosStationWallets } from "@cosmos-kit/cosmostation";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as trustWallets } from "@cosmos-kit/trust";
import { wallets as xdefiWallets } from "@cosmos-kit/xdefi-extension";
import {
  CosmosQueries,
  CosmwasmQueries,
  ProtoMsgsOrWithAminoMsgs,
  QueriesStore,
} from "@keplr-wallet/stores";
import { KeplrSignOptions } from "@keplr-wallet/types";
import { assets, chains } from "chain-registry";
import { action, makeObservable, observable } from "mobx";
import { isFunction } from "mobx/dist/internal";

import { OsmosisQueries } from "./queries";
import { TxTracer } from "./tx";

const logger = new Logger("WARN");

export class AccountStore {
  @observable
  private _refreshRequests = 0;

  @observable
  txTypeInProgress = "";

  private _walletManager: WalletManager = new WalletManager(
    chains,
    assets,
    [
      ...keplrWallets,
      ...leapWallets,
      ...cosmosStationWallets,
      ...trustWallets,
      ...xdefiWallets,
    ],
    logger,
    "icns",
    {
      signClient: {
        projectId: "a8510432ebb71e6948cfd6cde54b70f7", // TODO: replace with our own
        relayUrl: "wss://relay.walletconnect.org",
      },
    },
    undefined,
    undefined,
    {
      duration: Infinity,
    }
  );

  constructor(
    public readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, OsmosisQueries]
    >,
    protected readonly txOpts: {
      preTxEvents?: {
        onBroadcastFailed?: (chainId: string, e?: Error) => void;
        onBroadcasted?: (chainId: string, txHash: Uint8Array) => void;
        onFulfill?: (chainId: string, tx: any) => void;
      };
    } = {}
  ) {
    this.walletManager.setActions({
      viewWalletRepo: () => this.refresh(),
      data: () => this.refresh(),
      state: () => this.refresh(),
      message: () => this.refresh(),
    });
    this.walletManager.walletRepos.forEach((repo) => {
      repo.setActions({
        viewWalletRepo: () => this.refresh(),
      });
      repo.wallets.forEach((wallet) => {
        wallet.setActions({
          data: () => this.refresh(),
          state: () => this.refresh(),
          message: () => this.refresh(),
        });
      });
    });

    makeObservable(this);
  }

  @action
  private refresh() {
    this._refreshRequests++;
  }

  @action
  private setTxTypeInProgress(type: string) {
    this.txTypeInProgress = type;
  }

  get walletManager() {
    // trigger a refresh as we don't have access to the internal methods of the wallet manager.
    this._refreshRequests;
    return this._walletManager;
  }

  /**
   * Get wallet repository for a given chain name or chain id.
   *
   * @param chainName - Chain name or chain id
   * @returns Wallet repository
   */
  getWalletRepo(chainName: string) {
    const walletRepo = this.walletManager.walletRepos.find(
      (repo) =>
        repo.chainName === chainName ||
        repo.chainRecord.chain.chain_id === chainName
    );

    if (!walletRepo) {
      throw new Error(`Chain ${chainName} is not provided.`);
    }

    walletRepo.activate();
    return walletRepo;
  }

  /**
   * Get the current wallet for the given chain name
   * @param chainName - Chain name
   * @returns ChainWalletBase
   */
  getWallet(chainName: string) {
    const walletRepo = this.getWalletRepo(chainName);
    const wallet = walletRepo.current;
    return wallet;
  }

  hasWallet(chainId: string): boolean {
    const wallet = this.getWallet(chainId as any);
    return Boolean(wallet);
  }

  async sign(
    chainId: string,
    type: string | "unknown",
    msgs:
      | ProtoMsgsOrWithAminoMsgs
      | (() => Promise<ProtoMsgsOrWithAminoMsgs> | ProtoMsgsOrWithAminoMsgs),
    memo = "",
    fee: StdFee,
    signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: any) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: any) => void;
        }
  ) {
    let txHash: Uint8Array;

    this.setTxTypeInProgress(type);

    const wallet = this.getWallet(chainId);

    if (!wallet) {
      throw new Error(`Wallet for chain ${chainId} is not provided.`);
    }

    try {
      if (wallet.walletStatus !== WalletStatus.Connected) {
        throw new Error(`Wallet for chain ${chainId} is not connected.`);
      }

      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      // TODO: verify if map is needed.
      const aminoMsgs = msgs.aminoMsgs.map((msg) => ({
        typeUrl: msg.type,
        value: msg.value,
      }));

      // TODO: verify if proto msg are still required
      const protoMsgs: any[] = msgs.protoMsgs;

      if (aminoMsgs.length === 0 || protoMsgs.length === 0) {
        throw new Error("There is no msg to send");
      }

      if (aminoMsgs.length !== protoMsgs.length) {
        throw new Error("The length of aminoMsgs and protoMsgs are different");
      }

      const result = await wallet.signAndBroadcast(aminoMsgs, fee, memo);

      txHash = new TextEncoder().encode(result.transactionHash);
    } catch (e) {
      const error = e as Error;
      this.setTxTypeInProgress("");

      if (this.txOpts.preTxEvents?.onBroadcastFailed) {
        this.txOpts.preTxEvents.onBroadcastFailed(chainId, error);
      }

      if (
        onTxEvents &&
        "onBroadcastFailed" in onTxEvents &&
        onTxEvents.onBroadcastFailed
      ) {
        onTxEvents.onBroadcastFailed(error);
      }

      throw e;
    }

    let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
    let onFulfill: ((tx: any) => void) | undefined;

    if (onTxEvents) {
      if (isFunction(onTxEvents)) {
        onFulfill = onTxEvents;
      } else {
        onBroadcasted = onTxEvents?.onBroadcasted;
        onFulfill = onTxEvents?.onFulfill;
      }
    }

    if (this.txOpts.preTxEvents?.onBroadcasted) {
      this.txOpts.preTxEvents.onBroadcasted(chainId, txHash);
    }

    if (onBroadcasted) {
      onBroadcasted(txHash);
    }

    const rpcEndpoint = await wallet?.getRpcEndpoint();

    const txTracer = new TxTracer(rpcEndpoint ?? "", "/websocket");

    txTracer.traceTx(txHash).then((tx) => {
      txTracer.close();

      this.setTxTypeInProgress("");

      // After sending tx, the balances is probably changed due to the fee.
      for (const feeAmount of fee.amount) {
        if (!wallet.address) continue;

        const queries = this.queriesStore.get(chainId);
        const bal = queries.queryBalances
          .getQueryBech32Address(wallet.address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }

      // Always add the tx hash data.
      if (tx && !tx.hash) {
        tx.hash = Buffer.from(txHash).toString("hex");
      }

      if (this.txOpts.preTxEvents?.onFulfill) {
        this.txOpts.preTxEvents.onFulfill(chainId, tx);
      }

      if (onFulfill) {
        console.log("fulfilled!");
        onFulfill(tx);
      }
    });
  }
}
