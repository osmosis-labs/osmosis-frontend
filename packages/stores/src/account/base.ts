import type { AssetList, Chain } from "@chain-registry/types";
import { EncodeObject, Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  BroadcastTxError,
  DeliverTxResponse,
  StdFee,
  TimeoutError,
} from "@cosmjs/stargate";
import { Tendermint34Client } from "@cosmjs/tendermint-rpc";
import {
  ChainWalletBase,
  MainWalletBase,
  WalletConnectOptions,
  WalletManager,
  WalletStatus,
} from "@cosmos-kit/core";
import {
  ChainedFunctionifyTuple,
  ChainGetter,
  CosmosQueries,
  CosmwasmQueries,
  Functionify,
  QueriesStore,
} from "@keplr-wallet/stores";
import { KeplrSignOptions } from "@keplr-wallet/types";
import {
  cosmosProtoRegistry,
  cosmwasmProtoRegistry,
  ibcProtoRegistry,
  osmosisProtoRegistry,
} from "@osmosis-labs/proto-codecs";
import { Buffer } from "buffer";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { action, makeObservable, observable, runInAction } from "mobx";
import { UnionToIntersection } from "utility-types";

import { OsmosisQueries } from "../queries";
import { aminoConverters } from "./amino-converters";
import {
  CosmosKitAccountsLocalStorageKey,
  getWalletEndpoints,
  logger,
  sleep,
} from "./utils";

export class AccountStore<Injects extends Record<string, any>[] = []> {
  protected accountSetCreators: ChainedFunctionifyTuple<
    AccountStore<Injects>,
    [ChainGetter, string],
    Injects
  >;

  injectedAccounts = observable.map<
    string,
    UnionToIntersection<Injects[number]>
  >();

  @observable
  private _refreshRequests = 0;

  txTypeInProgressByChain = observable.map<string, string>();

  private _walletManager: WalletManager;
  private _wallets: MainWalletBase[] = [];

  constructor(
    protected readonly chains: Chain[],
    protected readonly assets: AssetList[],
    protected readonly wallets: MainWalletBase[],
    protected readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, OsmosisQueries]
    >,
    protected readonly chainGetter: ChainGetter,
    protected readonly options: {
      walletConnectOptions?: WalletConnectOptions;
      preTxEvents?: {
        onBroadcastFailed?: (string: string, e?: Error) => void;
        onBroadcasted?: (string: string, txHash: Uint8Array) => void;
        onFulfill?: (string: string, tx: any) => void;
      };
    } = {},
    ...accountSetCreators: ChainedFunctionifyTuple<
      AccountStore<Injects>,
      [ChainGetter, string],
      Injects
    >
  ) {
    this._wallets = wallets;
    this._walletManager = this.createWalletManager(wallets);
    this.accountSetCreators = accountSetCreators;

    makeObservable(this);
  }

  private createWalletManager(wallets: MainWalletBase[]) {
    const walletManager = new WalletManager(
      this.chains,
      this.assets,
      wallets,
      logger,
      "icns",
      this.options.walletConnectOptions,
      {
        signingStargate: () => ({
          aminoTypes: new AminoTypes(aminoConverters),
          registry: new Registry([
            ...cosmwasmProtoRegistry,
            ...cosmosProtoRegistry,
            ...ibcProtoRegistry,
            ...osmosisProtoRegistry,
          ]) as any,
        }),
      },
      {
        endpoints: getWalletEndpoints(this.chains),
      },
      {
        duration: 31556926000, // 1 year
        callback() {
          window?.localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
        },
      }
    );

    walletManager.setActions({
      viewWalletRepo: () => this.refresh(),
      data: () => this.refresh(),
      state: () => this.refresh(),
      message: () => this.refresh(),
    });
    walletManager.walletRepos.forEach((repo) => {
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

    this.refresh();

    return walletManager;
  }

  @action
  private refresh() {
    this._refreshRequests++;
  }

  addWallet(wallet: MainWalletBase) {
    this._wallets = [...this._wallets, wallet];
    this._walletManager = this.createWalletManager(this._wallets);
    this.refresh();
    return this._walletManager;
  }

  get walletManager() {
    // trigger a refresh as we don't have access to the internal methods of the wallet manager.
    this._refreshRequests;
    return this._walletManager;
  }

  /**
   * Get wallet repository for a given chain name or chain id.
   *
   * @param chainNameOrId - Chain name or chain id
   * @returns Wallet repository
   */
  getWalletRepo(chainNameOrId: string) {
    const walletRepo = this.walletManager.walletRepos.find(
      (repo) =>
        repo.chainName === chainNameOrId ||
        repo.chainRecord.chain.chain_id === chainNameOrId
    );

    if (!walletRepo) {
      throw new Error(`Chain ${chainNameOrId} is not provided.`);
    }

    walletRepo.activate();
    return walletRepo;
  }

  /**
   * Get the current wallet for the given chain id
   * @param chainNameOrId - Chain Id
   * @returns ChainWalletBase
   */
  getWallet(chainNameOrId: string) {
    const walletRepo = this.getWalletRepo(chainNameOrId);
    const wallet = walletRepo.current;
    const txInProgress = this.txTypeInProgressByChain.get(chainNameOrId);

    if (wallet) {
      const walletWithAccountSet = wallet as ChainWalletBase &
        UnionToIntersection<Injects[number]> & {
          txTypeInProgress: string;
          isReadyToSendTx: boolean;
        };

      const injectedAccountsForChain = this.getInjectedAccounts(chainNameOrId);

      /**
       * Merge the accounts into the wallet.
       */
      for (const key of Object.keys(injectedAccountsForChain as object)) {
        if (
          walletWithAccountSet[
            key as keyof UnionToIntersection<Injects[number]>
          ]
        ) {
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        walletWithAccountSet[key] = injectedAccountsForChain[key];
      }

      walletWithAccountSet.txTypeInProgress = txInProgress ?? "";
      walletWithAccountSet.isReadyToSendTx =
        walletWithAccountSet.walletStatus === WalletStatus.Connected &&
        Boolean(walletWithAccountSet.address);
      walletWithAccountSet.activate();

      return walletWithAccountSet;
    }

    return wallet;
  }

  getInjectedAccounts(
    chainNameOrId: string
  ): UnionToIntersection<Injects[number]> {
    const previousInjectedAccounts = this.injectedAccounts.get(chainNameOrId);
    if (previousInjectedAccounts) {
      return previousInjectedAccounts;
    }

    const newInjectedAccounts = {} as UnionToIntersection<Injects[number]>;

    for (let i = 0; i < this.accountSetCreators.length; i++) {
      const fn = this.accountSetCreators[i] as Functionify<
        [AccountStore<Injects>, ChainGetter, string],
        Injects[number]
      >;
      const r = fn(this, this.chainGetter, chainNameOrId);

      for (const key of Object.keys(r)) {
        if (
          newInjectedAccounts[key as keyof UnionToIntersection<Injects[number]>]
        ) {
          continue;
        }

        newInjectedAccounts[key as keyof UnionToIntersection<Injects[number]>] =
          r[key];
      }
    }

    this.injectedAccounts.set(chainNameOrId, newInjectedAccounts);
    return newInjectedAccounts;
  }

  hasWallet(string: string): boolean {
    const wallet = this.getWallet(string);
    return Boolean(wallet);
  }

  async sign(
    chainNameOrId: string,
    type: string | "unknown",
    msgs: EncodeObject[] | (() => Promise<EncodeObject[]> | EncodeObject[]),
    memo = "",
    fee: StdFee,
    _signOptions?: KeplrSignOptions,
    onTxEvents?:
      | ((tx: DeliverTxResponse) => void)
      | {
          onBroadcastFailed?: (e?: Error) => void;
          onBroadcasted?: (txHash: Uint8Array) => void;
          onFulfill?: (tx: DeliverTxResponse) => void;
        }
  ) {
    runInAction(() => {
      this.txTypeInProgressByChain.set(chainNameOrId, type);
    });

    const wallet = this.getWallet(chainNameOrId);

    if (!wallet) {
      throw new Error(`Wallet for chain ${chainNameOrId} is not provided.`);
    }

    try {
      if (wallet.walletStatus !== WalletStatus.Connected) {
        throw new Error(`Wallet for chain ${chainNameOrId} is not connected.`);
      }

      if (typeof msgs === "function") {
        msgs = await msgs();
      }

      if (msgs.length === 0) {
        throw new Error("There is no msg to send");
      }

      let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
      let onFulfill: ((tx: DeliverTxResponse) => void) | undefined;

      if (onTxEvents) {
        if (typeof onTxEvents === "function") {
          onFulfill = onTxEvents;
        } else {
          onBroadcasted = onTxEvents?.onBroadcasted;
          onFulfill = onTxEvents?.onFulfill;
        }
      }

      const txRaw = await wallet.sign(msgs, fee, memo);
      const encodedTx = TxRaw.encode(txRaw).finish();
      const endpoint = await wallet.getRpcEndpoint(true);

      /**
       * Manually create a Tendermint client to broadcast the transaction to have more control over transaction tracking.
       * Cosmjs team is working on a similar solution within their library.
       * @see https://github.com/cosmos/cosmjs/issues/1316
       */
      const tmClient = await Tendermint34Client.connect(
        typeof endpoint === "string" ? endpoint : endpoint.url
      );

      const broadcasted = await tmClient.broadcastTxSync({ tx: encodedTx });

      if (broadcasted.code) {
        throw new BroadcastTxError(broadcasted.code, "", broadcasted.log);
      }

      if (this.options.preTxEvents?.onBroadcasted) {
        this.options.preTxEvents.onBroadcasted(chainNameOrId, broadcasted.hash);
      }

      if (onBroadcasted) {
        onBroadcasted(broadcasted.hash);
      }

      const signingClient = await wallet.getSigningStargateClient();
      const timeoutMs = signingClient.broadcastTimeoutMs ?? 60_000;
      const pollIntervalMs = signingClient.broadcastPollIntervalMs ?? 3_000;

      let timedOut = false;
      const txPollTimeout = setTimeout(() => {
        timedOut = true;
      }, timeoutMs);

      const pollForTx = async (txId: string): Promise<DeliverTxResponse> => {
        if (timedOut) {
          throw new TimeoutError(
            `Transaction with ID ${txId} was submitted but was not yet found on the chain. You might want to check later. There was a wait of ${
              timeoutMs / 1000
            } seconds.`,
            txId
          );
        }
        await sleep(pollIntervalMs);
        const result = await signingClient.getTx(txId);
        return result
          ? {
              code: result.code,
              height: result.height,
              rawLog: result.rawLog,
              transactionHash: txId,
              gasUsed: result.gasUsed,
              gasWanted: result.gasWanted,
            }
          : pollForTx(txId);
      };

      const tx = await new Promise<DeliverTxResponse>((resolve, reject) =>
        pollForTx(Buffer.from(broadcasted.hash).toString("hex")).then(
          (value) => {
            clearTimeout(txPollTimeout);
            resolve(value);
          },
          (error) => {
            clearTimeout(txPollTimeout);
            reject(error);
          }
        )
      );

      runInAction(() => {
        this.txTypeInProgressByChain.set(chainNameOrId, "");
      });

      /**
       * Refetch balances.
       * After sending tx, the balances have probably changed due to the fee.
       */
      for (const feeAmount of fee.amount) {
        if (!wallet.address) continue;

        const queries = this.queriesStore.get(chainNameOrId);
        const bal = queries.queryBalances
          .getQueryBech32Address(wallet.address)
          .balances.find(
            (bal) => bal.currency.coinMinimalDenom === feeAmount.denom
          );

        if (bal) {
          bal.fetch();
        }
      }

      if (this.options.preTxEvents?.onFulfill) {
        this.options.preTxEvents.onFulfill(chainNameOrId, tx);
      }

      if (onFulfill) {
        onFulfill(tx);
      }
    } catch (e) {
      const error = e as Error;
      runInAction(() => {
        this.txTypeInProgressByChain.set(chainNameOrId, "");
      });

      if (this.options.preTxEvents?.onBroadcastFailed) {
        this.options.preTxEvents.onBroadcastFailed(chainNameOrId, error);
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
  }
}
