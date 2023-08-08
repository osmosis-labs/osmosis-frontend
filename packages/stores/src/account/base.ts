import type { AssetList, Chain } from "@chain-registry/types";
import {
  AminoMsg,
  encodeSecp256k1Pubkey,
  makeSignDoc as makeSignDocAmino,
  OfflineAminoSigner,
} from "@cosmjs/amino";
import { fromBase64 } from "@cosmjs/encoding";
import { Int53 } from "@cosmjs/math";
import {
  EncodeObject,
  encodePubkey,
  isOfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignDoc,
  OfflineDirectSigner,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import {
  AminoTypes,
  BroadcastTxError,
  SignerData,
  SigningStargateClient,
} from "@cosmjs/stargate";
import {
  ChainWalletBase,
  MainWalletBase,
  WalletConnectOptions,
  WalletManager,
  WalletStatus,
} from "@cosmos-kit/core";
import { BaseAccount } from "@keplr-wallet/cosmos";
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
import axios, { AxiosError } from "axios";
import { Buffer } from "buffer/";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { action, makeObservable, observable, runInAction } from "mobx";
import { Optional, UnionToIntersection } from "utility-types";

import { OsmosisQueries } from "../queries";
import { TxTracer } from "../tx";
import { aminoConverters } from "./amino-converters";
import { DeliverTxResponse, TxEvent } from "./types";
import {
  CosmosKitAccountsLocalStorageKey,
  getEndpointString,
  getWalletEndpoints,
  getWalletWindowName,
  isWalletOfflineDirectSigner,
  logger,
  removeLastSlash,
  TxFee,
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

  private aminoTypes = new AminoTypes(aminoConverters);
  private registry = new Registry([
    ...cosmwasmProtoRegistry,
    ...cosmosProtoRegistry,
    ...ibcProtoRegistry,
    ...osmosisProtoRegistry,
  ]) as unknown as SigningStargateClient["registry"];

  constructor(
    public readonly chains: (Chain & { features?: string[] })[],
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
      broadcastUrl?: string;
      simulateUrl?: string;
      wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
    } = {},
    ...accountSetCreators: ChainedFunctionifyTuple<
      AccountStore<Injects>,
      [ChainGetter, string],
      Injects
    >
  ) {
    this._wallets = wallets;
    this._walletManager = this._createWalletManager(wallets);
    this.accountSetCreators = accountSetCreators;

    makeObservable(this);
  }

  private _createWalletManager(wallets: MainWalletBase[]) {
    this._walletManager = new WalletManager(
      this.chains,
      this.assets,
      wallets,
      logger,
      true,
      "icns",
      this.options.walletConnectOptions,
      {
        signingStargate: () => ({
          aminoTypes: this.aminoTypes,
          registry: this.registry,
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

    this._walletManager.setActions({
      viewWalletRepo: () => this.refresh(),
      data: () => this.refresh(),
      state: () => this.refresh(),
      message: () => this.refresh(),
    });
    this._walletManager.walletRepos.forEach((repo) => {
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

    return this._walletManager;
  }

  @action
  private refresh() {
    this._refreshRequests++;
  }

  async addWallet(wallet: MainWalletBase) {
    this._wallets = [...this._wallets, wallet];
    // Unmount the previous wallet manager.
    await this._walletManager.onUnmounted();
    this._createWalletManager(this._wallets);
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

  async signAndBroadcast(
    chainNameOrId: string,
    type: string | "unknown",
    msgs: EncodeObject[] | (() => Promise<EncodeObject[]> | EncodeObject[]),
    memo = "",
    fee?: TxFee,
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

      if (!wallet.address) {
        throw new Error(
          "Address is required to estimate fee. Try connect to fetch address."
        );
      }

      if (!wallet.offlineSigner) {
        await wallet.initOfflineSigner();
      }

      if (!wallet.offlineSigner) {
        throw new Error("Offline signer failed to initialize");
      }

      let usedFee: TxFee;
      if (typeof fee === "undefined" || !fee?.force) {
        usedFee = await this.estimateFee(
          wallet,
          msgs,
          fee ?? { amount: [] },
          memo
        );
      } else {
        usedFee = fee;
      }

      const txRaw = await this.sign(
        wallet,
        wallet.offlineSigner,
        msgs,
        usedFee,
        memo || ""
      );
      const encodedTx = TxRaw.encode(txRaw).finish();

      const restEndpoint = getEndpointString(
        await wallet.getRestEndpoint(true)
      );

      const res = await axios.post<{
        tx_response: {
          height: string;
          txhash: string;
          codespace: string;
          code: number;
          data: string;
          raw_log: string;
          logs: unknown[];
          info: string;
          gas_wanted: string;
          gas_used: string;
          tx: unknown;
          timestamp: string;
          events: unknown[];
        };
      }>(this.options?.broadcastUrl ?? "/api/broadcast-transaction", {
        restEndpoint: removeLastSlash(restEndpoint),
        tx_bytes: Buffer.from(encodedTx).toString("base64"),
        mode: "BROADCAST_MODE_SYNC",
      });

      const broadcasted = res.data.tx_response;

      const rpcEndpoint = getEndpointString(await wallet.getRpcEndpoint(true));

      const txTracer = new TxTracer(rpcEndpoint, "/websocket", {
        wsObject: this?.options?.wsObject,
      });

      if (broadcasted.code) {
        throw new BroadcastTxError(broadcasted.code, "", broadcasted.raw_log);
      }

      const txHashBuffer = Buffer.from(broadcasted.txhash, "hex");

      if (this.options.preTxEvents?.onBroadcasted) {
        this.options.preTxEvents.onBroadcasted(chainNameOrId, txHashBuffer);
      }

      if (onBroadcasted) {
        onBroadcasted(txHashBuffer);
      }

      const tx = await txTracer.traceTx(txHashBuffer).then(
        (tx: {
          data?: string;
          events?: TxEvent;
          gas_used?: string;
          gas_wanted?: string;
          log?: string;
          code?: number;
          height?: number;
          tx_result?: {
            data: string;
            code?: number;
            codespace: string;
            events: TxEvent;
            gas_used: string;
            gas_wanted: string;
            info: string;
            log: string;
          };
        }) => {
          txTracer.close();

          return {
            transactionHash: broadcasted.txhash.toLowerCase(),
            code: tx?.code ?? tx?.tx_result?.code ?? 0,
            height: tx?.height,
            rawLog: tx?.log ?? tx?.tx_result?.log ?? "",
            events: tx?.events ?? tx?.tx_result?.events,
            gasUsed: tx?.gas_used ?? tx?.tx_result?.gas_used ?? "",
            gasWanted: tx?.gas_wanted ?? tx?.tx_result?.gas_wanted ?? "",
          };
        }
      );

      runInAction(() => {
        this.txTypeInProgressByChain.set(chainNameOrId, "");
      });

      /**
       * Refetch balances.
       * After sending tx, the balances have probably changed due to the fee.
       */
      for (const feeAmount of usedFee.amount) {
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

  public async sign(
    wallet: ChainWalletBase,
    signer: OfflineSigner,
    messages: readonly EncodeObject[],
    fee: TxFee,
    memo: string
  ): Promise<TxRaw> {
    const { accountNumber, sequence } = await this.getSequence(wallet);
    const chainId = wallet?.chainId;

    if (!chainId) {
      throw new Error("Chain ID is not provided");
    }

    const signerData: SignerData = {
      accountNumber: accountNumber,
      sequence: sequence,
      chainId: chainId,
    };

    return isOfflineDirectSigner(signer)
      ? this.signDirect(
          wallet,
          signer,
          wallet.address ?? "",
          messages,
          fee,
          memo,
          signerData
        )
      : this.signAmino(
          wallet,
          signer,
          wallet.address ?? "",
          messages,
          fee,
          memo,
          signerData
        );
  }

  private async signAmino(
    wallet: ChainWalletBase,
    signer: OfflineSigner,
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: TxFee,
    memo: string,
    { accountNumber, sequence, chainId }: SignerData
  ): Promise<TxRaw> {
    if (isOfflineDirectSigner(signer)) {
      throw new Error("Signer has to be OfflineAminoSigner");
    }

    const accountFromSigner = (await signer.getAccounts()).find(
      (account) => account.address === signerAddress
    );

    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey)
    );

    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
    const msgs = messages.map((msg) =>
      wallet?.signingStargateOptions?.aminoTypes?.toAmino(msg)
    ) as AminoMsg[];

    const signDoc = makeSignDocAmino(
      msgs,
      fee,
      chainId,
      memo,
      accountNumber,
      sequence
    );

    const { signature, signed } = await (
      signer as unknown as OfflineAminoSigner
    ).signAmino(signerAddress, signDoc);

    const signedTxBody = {
      messages: signed.msgs.map((msg) =>
        wallet?.signingStargateOptions?.aminoTypes?.fromAmino(msg)
      ),
      memo: signed.memo,
    };

    const signedTxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };

    const signedTxBodyBytes = wallet?.signingStargateOptions?.registry?.encode(
      signedTxBodyEncodeObject
    );

    const signedGasLimit = Int53.fromString(String(signed.fee.gas)).toNumber();
    const signedSequence = Int53.fromString(String(signed.sequence)).toNumber();
    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      signed.fee.amount,
      signedGasLimit,
      signed.fee.granter,
      signed.fee.payer,
      signMode
    );

    return TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  private async signDirect(
    wallet: ChainWalletBase,
    signer: OfflineSigner,
    signerAddress: string,
    messages: readonly EncodeObject[],
    fee: TxFee,
    memo: string,
    { accountNumber, sequence, chainId }: SignerData,
    forceSignDirect = false
  ): Promise<TxRaw> {
    if (!isOfflineDirectSigner(signer) && !forceSignDirect) {
      throw new Error("Signer has to be OfflineDirectSigner");
    }

    const accountFromSigner = (await signer.getAccounts()).find(
      (account) => account.address === signerAddress
    );
    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }
    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey)
    );
    const txBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: messages,
        memo: memo,
      },
    };
    const txBodyBytes = wallet?.signingStargateOptions?.registry?.encode(
      txBodyEncodeObject
    ) as Uint8Array;
    const gasLimit = Int53.fromString(String(fee.gas)).toNumber();
    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence }],
      fee.amount,
      gasLimit,
      fee.granter,
      fee.payer
    );
    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      chainId,
      accountNumber
    );

    const walletWindowName = getWalletWindowName(wallet.walletName);

    const { signature, signed } = isWalletOfflineDirectSigner(
      signer,
      walletWindowName
    )
      ? await signer[walletWindowName].signDirect.call(
          signer[walletWindowName],
          wallet.chainId,
          signerAddress,
          signDoc
        )
      : await (signer as unknown as OfflineDirectSigner).signDirect(
          signerAddress,
          signDoc
        );

    return TxRaw.fromPartial({
      bodyBytes: signed.bodyBytes,
      authInfoBytes: signed.authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  public async getAccountFromNode(wallet: ChainWalletBase) {
    try {
      const endpoint = getEndpointString(await wallet?.getRestEndpoint(true));
      const address = wallet?.address;

      if (!address) {
        throw new Error("Address is not provided");
      }

      if (!endpoint) {
        throw new Error("Endpoint is not provided");
      }

      const account = await BaseAccount.fetchFromRest(
        axios.create({
          baseURL: removeLastSlash(endpoint),
        }),
        address,
        true
      );

      return {
        accountNumber: account.getAccountNumber(),
        sequence: account.getSequence(),
      };
    } catch (error: any) {
      throw error;
    }
  }

  public async getSequence(
    wallet: ChainWalletBase
  ): Promise<{ accountNumber: number; sequence: number }> {
    const account = await this.getAccountFromNode(wallet);
    if (!account) {
      throw new Error(
        `Account '${wallet?.address}' does not exist on chain. Send some tokens there before trying to query sequence.`
      );
    }

    return {
      accountNumber: Number(account.accountNumber.toString()),
      sequence: Number(account.sequence.toString()),
    };
  }

  /**
   * Simulates a transaction and estimates the transaction fee (gas cost) needed to execute it.
   *
   * @param wallet - The wallet object containing information about the blockchain wallet.
   * @param messages - An array of message objects to be encoded and included in the transaction.
   * @param fee - An optional fee structure that might be used as a backup fee if the chain doesn't support transaction simulation.
   * @param memo - A string used as a memo or note with the transaction.
   *
   * @returns A promise that resolves to the estimated transaction fee, including the estimated gas cost.
   *
   * @remarks
   * The function performs the following steps:
   * 1. Encodes the messages using the available registry.
   * 2. Constructs an unsigned transaction object, including specific signing modes, and possibly ignores the public key in simulation.
   * 3. Sends a POST request to simulate the transaction.
   * 4. Calculates the estimated gas used, multiplying by a fixed factor (1.5) to provide a buffer.
   * 5. Includes specific error handling for errors returned from the axios request.
   * 6. Utilizes a placeholder signature since the transaction signature is not actually verified.
   *
   * Note: The estimated gas might be slightly lower than actual given fluctuations in gas prices.
   * This is offset by multiplying the estimated gas by a fixed factor (1.5) to provide a buffer.
   *
   * If the chain does not support transaction simulation, the function may
   * fall back to using the provided fee parameter.
   */
  public async estimateFee(
    wallet: ChainWalletBase,
    messages: readonly EncodeObject[],
    fee: Optional<TxFee, "gas">,
    memo: string
  ): Promise<TxFee> {
    const encodedMessages = messages.map((m) => this.registry.encodeAsAny(m));
    const { sequence } = await this.getSequence(wallet);

    const unsignedTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: encodedMessages,
          memo: memo,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          SignerInfo.fromPartial({
            // Pub key is ignored.
            // It is fine to ignore the pub key when simulating tx.
            // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
              },
              multi: undefined,
            },
            sequence,
          }),
        ],
        fee: Fee.fromPartial({
          amount: fee.amount.map((amount) => {
            return { amount: amount.amount, denom: amount.denom };
          }),
        }),
      }).finish(),
      // Because of the validation of tx itself, the signature must exist.
      // However, since they do not actually verify the signature, it is okay to use any value.
      signatures: [new Uint8Array(64)],
    }).finish();

    const restEndpoint = getEndpointString(await wallet.getRestEndpoint(true));

    try {
      const result = await axios.post<{
        gas_info: {
          gas_used: string;
        };
      }>(this.options?.simulateUrl ?? "/api/simulate-transaction", {
        restEndpoint: removeLastSlash(restEndpoint),
        tx_bytes: Buffer.from(unsignedTx).toString("base64"),
      });

      const gasUsed = Number(result.data.gas_info.gas_used);
      if (Number.isNaN(gasUsed)) {
        throw new Error(
          `Invalid integer gas: ${result.data.gas_info.gas_used}`
        );
      }

      const multiplier = 1.5;
      return {
        /**
         * The gas amount is multiplied by a specific factor to provide additional
         * gas to the transaction, mitigating the risk of failure due to fluctuating gas prices.
         *  */
        gas: String(Math.round(gasUsed * multiplier)),
        amount: [],
      };
    } catch (e) {
      if (e instanceof AxiosError) {
        const axiosError = e as AxiosError<{ code?: number; message: string }>;

        const status = axiosError.response?.status;
        const message = axiosError.response?.data?.message;

        if (status !== 400 || !message || typeof message !== "string") throw e;

        /**
         * If the error message includes "invalid empty tx", it means that the chain does not
         * support tx simulation. In this case, just return the backup fee if available.
         */
        if (message.includes("invalid empty tx") && fee.gas) {
          return fee as TxFee;
        }

        // If there is a code, it's a simulate tx error and we should forward its message.
        if (axiosError.response?.data?.code) {
          throw new Error(axiosError.response?.data?.message);
        }
      }

      throw e;
    }
  }
}
