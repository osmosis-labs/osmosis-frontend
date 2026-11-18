import type { OfflineAminoSigner, StdFee } from "@cosmjs/amino";
import type {
  EncodeObject,
  OfflineDirectSigner,
  Registry,
} from "@cosmjs/proto-signing";
import type { AminoTypes } from "@cosmjs/stargate";
import { WalletStatus } from "@cosmos-kit/core";
import { queryRPCStatus } from "@osmosis-labs/server";
import type { Chain } from "@osmosis-labs/types";
import {
  AccountStoreNoBroadcastErrorEvent,
  ApiClientError,
  BaseAccount,
  getChain,
  InsufficientBalanceForFeeError,
  MultiEndpointClient,
} from "@osmosis-labs/utils";
import { Buffer } from "buffer/";
import type { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { Optional } from "utility-types";

import { encodeAnyBase64 } from "../codec";
import { TxStatusUnknownError } from "../error";
import { type QuoteStdFee, SimulateNotAvailableError } from "../gas";
import { TxTracer } from "../tracer";
import { getAminoConverters } from "./amino-converters";
import { appendFeMemoTag, FeMemoTag, type TxFeMemoFlags } from "./memo";
import { confirmOneClickFeeLimit, isWithinOneClickFeeLimit } from "./one-click";
import type {
  AccountStoreWallet,
  DeliverTxResponse,
  OneClickTradingInfo,
  SignOptions,
  TxEvent,
  TxEvents,
} from "./types";
import {
  GasMultiplier,
  getEndpointString,
  getPublicKeyTypeUrl,
  makeSignDocAmino,
  NEXT_TX_TIMEOUT_HEIGHT_OFFSET,
  removeLastSlash,
  runBroadcastedCallbacks,
} from "./utils";

/** How long to wait for an accepted tx to be included before reporting its
 *  status as unknown. Generous for the ~6s blocks of some Cosmos chains we
 *  sign bridge deposits on; nothing is cancelled when it passes. */
export const TX_TRACE_TIMEOUT_MS = 120_000;

export type SignerData = {
  accountNumber: string;
  sequence: number;
  chainId: string;
};
/** The account pubkey as stored onchain: its proto type URL and base64 key. */
export type AccountPubKey = { typeUrl: string; key: string };
export type SessionSignRequest = {
  wallet: AccountStoreWallet;
  /** The session checked against the signer, so another tab cannot swap it. */
  oneClickTradingInfo: OneClickTradingInfo;
  signerAddress: string;
  messages: readonly EncodeObject[];
  fee: StdFee;
  memo: string;
  signerData: SignerData;
  /**
   * Read from the chain rather than the wallet, so a session-key signature
   * never waits on the wallet. A WalletConnect wallet relays every request to
   * the phone, and a closed app holds it until reopened.
   */
  accountPubKey: AccountPubKey | undefined;
  memoFlags?: TxFeMemoFlags;
};
export type OneClickSigningAdapter = {
  getInfo: () => Promise<OneClickTradingInfo | undefined>;
  shouldSign: (input: {
    messages: readonly EncodeObject[];
    chainId?: string;
  }) => Promise<boolean>;
  extensionOptions: (input: {
    oneClickTradingInfo: OneClickTradingInfo | undefined;
  }) => Promise<{ typeUrl: string; value: Uint8Array }[] | undefined>;
  sign: (input: SessionSignRequest) => Promise<TxRaw>;
};
/** Explicit browser/server transport boundary; callers can use the real API
 * handlers without replacing estimation or broadcast logic in integration tests. */
export type WalletTxTransport = {
  post: <T>(url: string, data: unknown) => Promise<{ data: T }>;
  get: <T>(
    url: string,
    options?: { validateStatus: (status: number) => boolean }
  ) => Promise<{ data: T }>;
  request: <T>(
    url: string,
    options: { data: Record<string, unknown> }
  ) => Promise<T>;
};
export type WalletTxDependencies = {
  chains: Chain[];
  getWallet: (chainId: string) => AccountStoreWallet | undefined;
  transport: WalletTxTransport;
  hash: (bytes: Uint8Array) => Uint8Array;
  setTxTypeInProgress?: (chainId: string, type: string) => void;
  oneClick?: OneClickSigningAdapter;
  options?: {
    preTxEvents?: TxEvents;
    broadcastUrl?: string;
    wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
  };
};

/** Plain transaction functions sharing lazy codecs, with no store or React lifecycle. */
export function createWalletTxClient(deps: WalletTxDependencies) {
  let aminoTypes: AminoTypes | null = null;
  let registry: Registry | null = null;
  const service = {
    async getAminoTypes() {
      if (!aminoTypes) {
        const [{ AminoTypes }, aminoConverters] = await Promise.all([
          import("@cosmjs/stargate"),
          getAminoConverters(),
        ]);
        aminoTypes = new AminoTypes(aminoConverters);
      }
      return aminoTypes;
    },
    async getRegistry() {
      if (!registry) {
        const [
          {
            cosmosProtoRegistry,
            cosmwasmProtoRegistry,
            ibcProtoRegistry,
            osmosisProtoRegistry,
          },
          { Registry },
        ] = await Promise.all([
          import("@osmosis-labs/proto-codecs"),
          import("@cosmjs/proto-signing"),
        ]);

        registry = new Registry([
          ...cosmwasmProtoRegistry,
          ...cosmosProtoRegistry,
          ...ibcProtoRegistry,
          ...osmosisProtoRegistry,
        ]);
      }
      return registry;
    },
    async signAndBroadcast(
      chainNameOrId: string,
      type: string | "unknown",
      msgs: EncodeObject[] | (() => Promise<EncodeObject[]> | EncodeObject[]),
      memo = "",
      fee?: StdFee,
      signOptions?: SignOptions,
      onTxEvents?:
        | ((tx: DeliverTxResponse) => void | Promise<void>)
        | {
            onBroadcastFailed?: (e?: Error) => void;
            onBroadcasted?: (txHash: Uint8Array) => void;
            onFulfill?: (tx: DeliverTxResponse) => void;
            /** Runs immediately before the broadcast POST with the hash of the
             *  signed tx, which is known before broadcast (sha256 of the tx
             *  bytes). A throw aborts the broadcast and discards the signed tx. */
            onSign?: (txHash: Uint8Array) => Promise<void> | void;
          },
      memoFlags?: TxFeMemoFlags,
      /** Expiry-bind a direct-signed transaction; see {@link sign}. */
      useTimeoutHeight?: boolean
    ) {
      deps.setTxTypeInProgress?.(chainNameOrId, type);

      try {
        const wallet = deps.getWallet(chainNameOrId);
        if (!wallet) {
          throw new Error(`Wallet for chain ${chainNameOrId} is not provided.`);
        }
        if (wallet.walletStatus !== WalletStatus.Connected) {
          throw new Error(
            `Wallet for chain ${chainNameOrId} is not connected.`
          );
        }

        if (typeof msgs === "function") {
          msgs = await msgs();
        }

        if (msgs.length === 0) {
          throw new Error("There is no msg to send");
        }

        let onBroadcasted: ((txHash: Uint8Array) => void) | undefined;
        let onFulfill: ((tx: DeliverTxResponse) => void) | undefined;
        let onSign: ((txHash: Uint8Array) => Promise<void> | void) | undefined;

        if (onTxEvents) {
          if (typeof onTxEvents === "function") {
            onFulfill = onTxEvents;
          } else {
            onBroadcasted = onTxEvents?.onBroadcasted;
            onFulfill = onTxEvents?.onFulfill;
            onSign = onTxEvents?.onSign;
          }
        }

        if (!wallet.address) {
          throw new Error(
            "Address is required to estimate fee. Try connect to fetch address."
          );
        }

        const mergedSignOptions = {
          ...wallet.walletInfo?.signOptions,
          ...signOptions,
        };

        // Estimate gas fee & token if not provided
        if (typeof fee === "undefined") {
          try {
            fee = await service.estimateFee({
              wallet,
              messages: msgs,
              signOptions: mergedSignOptions,
            });
          } catch (e) {
            if (e instanceof SimulateNotAvailableError) {
              console.warn(
                "Gas simulation not supported for chain ID:",
                chainNameOrId
              );
            }

            throw e;
          }
        }

        // Pre-probe REST endpoints to find a working one for broadcast.
        // Falls back to the wallet's default endpoint if probe fails.
        // Started before signing and resolved before the onSign gates below, so
        // the wallet wait absorbs the probe's latency and nothing between an
        // onSign check and the actual broadcast can take a probe's worth of
        // time.
        const restEndpointPromise = (async () => {
          let restEndpoint = getEndpointString(
            await wallet.getRestEndpoint(true)
          );
          const restUrls = service.getChainRestUrls(wallet);
          if (restUrls.length > 1) {
            try {
              const client = new MultiEndpointClient(
                restUrls.map((url) => ({ address: url }))
              );
              const { endpointAddress } = await client.fetchWithEndpoint(
                "/cosmos/base/node/v1beta1/config"
              );
              restEndpoint = endpointAddress;
            } catch {
              // Pre-probe failed; use wallet default
            }
          }
          return restEndpoint;
        })();
        // If signing throws before this is awaited, the rejection must not
        // surface as unhandled; awaiting below still rethrows the real error.
        restEndpointPromise.catch(() => {});

        const txRaw = await service.sign({
          wallet,
          fee,
          memo: memo || "",
          messages: msgs,
          signOptions: mergedSignOptions,
          memoFlags,
          useTimeoutHeight,
        });
        const { TxRaw } = await import("cosmjs-types/cosmos/tx/v1beta1/tx");
        const encodedTx = TxRaw.encode(txRaw).finish();

        const restEndpoint = await restEndpointPromise;

        if (deps.options?.preTxEvents?.onSign) {
          await deps.options?.preTxEvents.onSign();
        }

        if (onSign) {
          // Callers persisting in-flight state (duplicate-creation guards) need
          // the hash before the POST: if the POST fails ambiguously (timeout,
          // 5xx after the node accepted), it is the only handle to reconcile.
          await onSign(deps.hash(encodedTx));
        }

        const res = await deps.transport.post<{
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
        }>(deps.options?.broadcastUrl ?? "/api/broadcast-transaction", {
          restEndpoint: removeLastSlash(restEndpoint),
          tx_bytes: Buffer.from(encodedTx).toString("base64"),
          mode: "BROADCAST_MODE_SYNC",
        });

        const broadcasted = res.data.tx_response;

        if (broadcasted.code) {
          const { BroadcastTxError } = await import("@cosmjs/stargate");
          throw new BroadcastTxError(broadcasted.code, "", broadcasted.raw_log);
        }

        // The POST returning code 0 IS acceptance: record it via onBroadcasted
        // before any tracer setup, whose endpoint resolution can itself fail —
        // callers persisting acceptance state (e.g. duplicate-creation guards)
        // must learn the tx hash even when everything after this point throws.
        const txHashBuffer = Buffer.from(broadcasted.txhash, "hex");

        // The per-call callback records acceptance and must not be skipped
        // because the store-wide one (toasts, analytics) threw.
        runBroadcastedCallbacks({
          chainId: chainNameOrId,
          txHash: txHashBuffer,
          preTxEvent: deps.options?.preTxEvents?.onBroadcasted,
          perCall: onBroadcasted,
        });

        // From here on the tx is accepted, so failing to learn its result
        // must not report it as failed: it may still be included.
        const traceTx = async () => {
          // Pass all RPC endpoints to TxTracer for WebSocket failover.
          const rpcUrls = service.getChainRpcUrls(wallet);
          let sortedRpcUrls: string[] =
            rpcUrls.length > 0
              ? rpcUrls
              : [getEndpointString(await wallet.getRpcEndpoint(true))];
          if (rpcUrls.length > 1) {
            try {
              const client = new MultiEndpointClient(
                rpcUrls.map((url) => ({ address: url }))
              );
              const { endpointAddress } =
                await client.fetchWithEndpoint("/status");
              sortedRpcUrls = [
                endpointAddress,
                ...rpcUrls.filter((u) => u !== endpointAddress),
              ];
            } catch {
              // Pre-probe failed; use default order
            }
          }

          const txTracer = new TxTracer(sortedRpcUrls, "/websocket", {
            wsObject: deps.options?.wsObject,
          });
          return txTracer
            .traceTx(txHashBuffer, { timeoutMs: TX_TRACE_TIMEOUT_MS })
            .finally(() => txTracer.close());
        };

        const tx = await traceTx()
          .catch((e: unknown) => {
            throw new TxStatusUnknownError(broadcasted.txhash, e);
          })
          .then(
            (tx: {
              data?: string;
              events?: TxEvent[];
              gas_used?: string;
              gas_wanted?: string;
              log?: string;
              code?: number;
              // A live subscription gives a number, an indexed lookup a string.
              height?: number | string;
              tx_result?: {
                data: string;
                code?: number;
                codespace: string;
                events: TxEvent[];
                gas_used: string;
                gas_wanted: string;
                info: string;
                log: string;
              };
            }) => {
              return {
                transactionHash: broadcasted.txhash.toLowerCase(),
                code: tx?.code ?? tx?.tx_result?.code ?? 0,
                height:
                  tx?.height !== undefined ? Number(tx.height) : undefined,
                rawLog: tx?.log ?? tx?.tx_result?.log ?? "",
                events: tx?.events ?? tx?.tx_result?.events,
                gasUsed: tx?.gas_used ?? tx?.tx_result?.gas_used ?? "",
                gasWanted: tx?.gas_wanted ?? tx?.tx_result?.gas_wanted ?? "",
              };
            }
          );

        deps.setTxTypeInProgress?.(chainNameOrId, "");

        if (deps.options?.preTxEvents?.onFulfill) {
          deps.options?.preTxEvents.onFulfill(chainNameOrId, tx);
        }

        if (onFulfill) {
          await onFulfill(tx);
        }
      } catch (e) {
        const error = e as Error | AccountStoreNoBroadcastErrorEvent;
        deps.setTxTypeInProgress?.(chainNameOrId, "");

        if (error instanceof AccountStoreNoBroadcastErrorEvent) {
          throw e;
        }

        if (deps.options?.preTxEvents?.onBroadcastFailed) {
          deps.options?.preTxEvents.onBroadcastFailed(chainNameOrId, error);
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
    },
    async sign({
      wallet,
      messages,
      fee,
      memo,
      signOptions,
      memoFlags,
      useTimeoutHeight,
    }: {
      wallet: AccountStoreWallet;
      messages: readonly EncodeObject[];
      fee: StdFee;
      memo: string;
      signOptions?: SignOptions;
      memoFlags?: TxFeMemoFlags;
      /**
       * Expiry-bind a direct-signed transaction with the standard timeout
       * height offset. Opt-in per flow rather than app-wide: the amino path
       * has always set it, but changing every direct-signed transaction's
       * behavior is its own decision, so only flows whose safety model needs
       * a bounded broadcast window (the CL migration) pass true.
       */
      useTimeoutHeight?: boolean;
    }): Promise<TxRaw> {
      const { accountNumber, sequence, pubKey } =
        await service.getSequence(wallet);
      const chainId = wallet?.chainId;

      if (!chainId) {
        throw new Error("Chain ID is not provided");
      }

      if (!wallet.offlineSigner) {
        await wallet.initOfflineSigner();
      }

      if (!wallet.offlineSigner) {
        throw new Error("Offline signer failed to initialize");
      }

      const offlineSigner = wallet.offlineSigner;

      const signerData: SignerData = {
        accountNumber: accountNumber,
        sequence: sequence,
        chainId: chainId,
      };

      const oneClickTradingInfo = signOptions?.useOneClickTrading
        ? await deps.oneClick?.getInfo()
        : undefined;

      const eligible = Boolean(
        signOptions?.useOneClickTrading &&
        oneClickTradingInfo?.userOsmoAddress === wallet.address &&
        (await deps.oneClick?.shouldSign({ messages, chainId: wallet.chainId }))
      );
      const isWithinNetworkFeeLimit =
        eligible &&
        !!oneClickTradingInfo &&
        isWithinOneClickFeeLimit(oneClickTradingInfo, fee.gas);

      if (
        eligible &&
        /**
         * Should not surpass network fee limit.
         */
        isWithinNetworkFeeLimit
      ) {
        return deps.oneClick!.sign({
          wallet,
          oneClickTradingInfo: oneClickTradingInfo!,
          signerAddress: wallet.address ?? "",
          messages,
          fee,
          memo,
          signerData,
          accountPubKey: pubKey,
          memoFlags,
        });
      }

      if (
        eligible &&
        !isWithinNetworkFeeLimit &&
        deps.options?.preTxEvents?.onExceeds1CTNetworkFeeLimit
      ) {
        await confirmOneClickFeeLimit(
          deps.options.preTxEvents.onExceeds1CTNetworkFeeLimit
        );
      }

      return "signAmino" in offlineSigner || "signAmino" in wallet.client
        ? service.signAmino({
            wallet,
            signerAddress: wallet.address ?? "",
            messages,
            fee,
            memo,
            signerData,
            signOptions,
            memoFlags,
          })
        : service.signDirect({
            wallet,
            signerAddress: wallet.address ?? "",
            messages,
            fee,
            memo,
            signerData,
            signOptions,
            memoFlags,
            useTimeoutHeight,
          });
    },
    async signAmino({
      wallet,
      signerAddress,
      messages,
      fee,
      memo,
      signerData: { accountNumber, sequence, chainId },
      signOptions,
      memoFlags,
    }: {
      wallet: AccountStoreWallet;
      signerAddress: string;
      messages: readonly EncodeObject[];
      fee: StdFee;
      memo: string;
      signerData: SignerData;
      signOptions?: SignOptions;
      memoFlags?: TxFeMemoFlags;
    }): Promise<TxRaw> {
      if (!wallet.offlineSigner) {
        throw new Error("offlineSigner is not available in wallet");
      }

      if (
        !("signAmino" in wallet.client) &&
        !("signAmino" in wallet.offlineSigner)
      ) {
        throw new Error("signAmino is not available in wallet");
      }

      const accountFromSigner = (await wallet.offlineSigner.getAccounts()).find(
        (account) => account.address === signerAddress
      );

      if (!accountFromSigner) {
        throw new Error("Failed to retrieve account from signer");
      }

      // Tag the memo so we know the tx originated from the frontend (QA), plus
      // any warn-accept flags the user acknowledged. On this path the wallet
      // can return an edited memo (`signed.memo` below is what gets encoded) —
      // callers stamping flags should set `preferNoSetMemo`.
      memo = appendFeMemoTag(memo, FeMemoTag, memoFlags);

      const [
        { encodeSecp256k1Pubkey },
        { encodePubkey, makeAuthInfoBytes },
        { fromBase64 },
        { Int53 },
        { TxRaw },
        { SignMode },
      ] = await Promise.all([
        import("@cosmjs/amino"),
        import("@cosmjs/proto-signing"),
        import("@cosmjs/encoding"),
        import("@cosmjs/math"),
        import("cosmjs-types/cosmos/tx/v1beta1/tx"),
        import("cosmjs-types/cosmos/tx/signing/v1beta1/signing"),
      ]);

      const pubkey = encodePubkey(
        encodeSecp256k1Pubkey(accountFromSigner.pubkey)
      );

      const pubKeyTypeUrl = getPublicKeyTypeUrl({
        chainId: wallet.chain.chain_id,
        coinType:
          deps.chains.find(({ chain_id }) => chain_id === wallet.chain.chain_id)
            ?.slip44 ?? 118,
      });

      pubkey.typeUrl = pubKeyTypeUrl;

      const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;
      const aminoTypes = await service.getAminoTypes();
      const registry = await service.getRegistry();

      /**
       * Encode the messages to the proto format to normalize data types like Decimals.
       * Then, convert the messages to their amino representations.
       *
       * This is necessary due to changes in Decimals in Osmosis v26.
       * It will fix the following transactions:
       * - Unbonding Weighted pool shares
       * - Withdrawing concentrated liquidity positions
       * - Creating all types of pools
       */
      const normalizedMessages = messages.map((msg) => {
        const encodedMessage = registry.encode(msg);
        const decodedMessage = registry.decode({
          typeUrl: msg.typeUrl,
          value: encodedMessage,
        });
        return {
          value: decodedMessage,
          typeUrl: msg.typeUrl,
        } satisfies EncodeObject;
      });

      const msgs = normalizedMessages.map((msg) => aminoTypes.toAmino(msg));

      const timeoutHeight = await service.getTimeoutHeight(chainId);

      const signDoc = await makeSignDocAmino(
        msgs,
        fee,
        chainId,
        memo,
        accountNumber,
        sequence,
        timeoutHeight
      );

      const { signature, signed } = await (wallet.client.signAmino
        ? wallet.client.signAmino(
            wallet.chainId,
            signerAddress,
            signDoc,
            signOptions
          )
        : (wallet.offlineSigner as unknown as OfflineAminoSigner).signAmino(
            signerAddress,
            signDoc
          ));

      const signedTxBodyBytes = registry.encodeTxBody({
        messages,
        memo: signed.memo,
        timeoutHeight: BigInt(signDoc.timeout_height ?? "0"),
      });

      const signedGasLimit = Int53.fromString(
        String(signed.fee.gas)
      ).toNumber();
      const signedSequence = Int53.fromString(
        String(signed.sequence)
      ).toNumber();
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
    },
    async getTimeoutHeight(chainId: string): Promise<bigint> {
      const chain = getChain({ chainId, chainList: deps.chains });
      if (!chain) return BigInt("0");
      const rpcUrls = chain.apis.rpc.map((rpc) => rpc.address).filter(Boolean);
      if (rpcUrls.length === 0) return BigInt("0");
      const status = await queryRPCStatus({ rpcUrls });
      return (
        BigInt(status.result.sync_info.latest_block_height) +
        NEXT_TX_TIMEOUT_HEIGHT_OFFSET
      );
    },
    async signDirect({
      wallet,
      signerAddress,
      messages,
      fee,
      memo,
      signerData: { accountNumber, sequence, chainId },
      signOptions,
      memoFlags,
      useTimeoutHeight,
    }: {
      wallet: AccountStoreWallet;
      signerAddress: string;
      messages: readonly EncodeObject[];
      fee: StdFee;
      memo: string;
      signerData: SignerData;
      signOptions?: SignOptions;
      memoFlags?: TxFeMemoFlags;
      useTimeoutHeight?: boolean;
    }): Promise<TxRaw> {
      if (!wallet.offlineSigner) {
        throw new Error("offlineSigner is not available in wallet");
      }

      if (
        !("signDirect" in wallet.client) &&
        !("signDirect" in wallet.offlineSigner)
      ) {
        throw new Error("signDirect is not available in wallet");
      }

      const accountFromSigner = (await wallet.offlineSigner.getAccounts()).find(
        (account) => account.address === signerAddress
      );
      if (!accountFromSigner) {
        throw new Error("Failed to retrieve account from signer");
      }

      const [
        { encodeSecp256k1Pubkey },
        { encodePubkey },
        { fromBase64 },
        { Int53 },
        { makeAuthInfoBytes, makeSignDoc },
        { TxRaw },
      ] = await Promise.all([
        import("@cosmjs/amino"),
        import("@cosmjs/proto-signing"),
        import("@cosmjs/encoding"),
        import("@cosmjs/math"),
        import("@cosmjs/proto-signing"),
        import("cosmjs-types/cosmos/tx/v1beta1/tx"),
      ]);

      const pubkey = encodePubkey(
        encodeSecp256k1Pubkey(accountFromSigner.pubkey)
      );

      const pubKeyTypeUrl = getPublicKeyTypeUrl({
        chainId: wallet.chain.chain_id,
        coinType:
          deps.chains.find(({ chain_id }) => chain_id === wallet.chain.chain_id)
            ?.slip44 ?? 118,
      });

      pubkey.typeUrl = pubKeyTypeUrl;

      // Tag the memo so we know the tx originated from the frontend (QA), plus
      // any warn-accept flags the user acknowledged.
      memo = appendFeMemoTag(memo, FeMemoTag, memoFlags);

      // Expiry-bind the transaction like the amino path always has, but only
      // when the flow opts in: without a timeout height a direct-signed
      // transaction stays broadcastable forever, so state checked before
      // broadcast could precede an arbitrarily late submission. Zero (the
      // opt-out) means no expiry - proto3 omits it from the encoded body. A
      // failed height lookup does NOT fall back to zero: getTimeoutHeight
      // throws and the flow stops before anything is signed, which is the
      // safe direction for a flow that opted into expiry.
      const timeoutHeight = useTimeoutHeight
        ? await service.getTimeoutHeight(chainId)
        : BigInt(0);

      const txBodyEncodeObject = {
        typeUrl: "/cosmos.tx.v1beta1.TxBody",
        value: {
          messages: messages,
          memo: memo,
          timeoutHeight,
        },
      };

      const registry = await service.getRegistry();
      const txBodyBytes = registry.encode(txBodyEncodeObject);
      const gasLimit = Int53.fromString(String(fee.gas)).toNumber();
      const authInfoBytes = makeAuthInfoBytes(
        [{ pubkey, sequence }],
        fee.amount,
        gasLimit,
        undefined,
        undefined
      );
      const signDoc = makeSignDoc(
        txBodyBytes,
        authInfoBytes,
        chainId,
        // Typed as a number upstream, but only ever handed to BigInt(), which is
        // exact on a decimal string. Cast goes away on the @cosmjs 0.39.0 upgrade.
        accountNumber as unknown as number
      );

      const { signature, signed } = await (wallet.client.signDirect
        ? wallet.client.signDirect(
            wallet.chainId,
            signerAddress,
            signDoc,
            signOptions
          )
        : (wallet.offlineSigner as unknown as OfflineDirectSigner).signDirect(
            signerAddress,
            signDoc
          ));

      return TxRaw.fromPartial({
        bodyBytes: signed.bodyBytes,
        authInfoBytes: signed.authInfoBytes,
        signatures: [fromBase64(signature.signature)],
      });
    },
    getChainRestUrls(wallet: AccountStoreWallet): string[] {
      const chain = deps.chains.find(
        ({ chain_id }) => chain_id === wallet.chain.chain_id
      );
      return chain?.apis?.rest?.map((r) => r.address).filter(Boolean) ?? [];
    },
    getChainRpcUrls(wallet: AccountStoreWallet): string[] {
      const chain = deps.chains.find(
        ({ chain_id }) => chain_id === wallet.chain.chain_id
      );
      return chain?.apis?.rpc?.map((r) => r.address).filter(Boolean) ?? [];
    },
    async getAccountFromNode(wallet: AccountStoreWallet) {
      const address = wallet?.address;

      if (!address) {
        throw new Error("Address is not provided");
      }

      const restUrls = service.getChainRestUrls(wallet);

      // Pick the best available REST endpoint: use the pre-probed winning endpoint
      // if multiple are available, otherwise fall back to the wallet's default.
      let endpoint: string;
      if (restUrls.length > 1) {
        try {
          const client = new MultiEndpointClient(
            restUrls.map((url) => ({ address: url }))
          );
          const { endpointAddress } = await client.fetchWithEndpoint(
            `/cosmos/auth/v1beta1/accounts/${address}`
          );
          endpoint = endpointAddress;
        } catch {
          endpoint = getEndpointString(await wallet?.getRestEndpoint(true));
        }
      } else {
        endpoint = getEndpointString(await wallet?.getRestEndpoint(true));
      }

      if (!endpoint) {
        throw new Error("Endpoint is not provided");
      }

      const { data } = await deps.transport.get<{ account?: any }>(
        removeLastSlash(endpoint) + "/cosmos/auth/v1beta1/accounts/" + address,
        {
          validateStatus: (status: number) =>
            (status >= 200 && status < 300) || status === 404,
        }
      );
      const account = BaseAccount.fromProtoJSON(data, address);
      return {
        accountNumber: account.getAccountNumber(),
        sequence: account.getSequence(),
        pubKey: account.getPubKey(),
      };
    },
    async getSequence(wallet: AccountStoreWallet): Promise<{
      accountNumber: string;
      sequence: number;
      pubKey?: AccountPubKey;
    }> {
      const account = await service.getAccountFromNode(wallet);
      if (!account) {
        throw new Error(
          `Account '${wallet?.address}' does not exist on chain. Send some tokens there before trying to query sequence.`
        );
      }

      return {
        // account_number is a uint64 and can exceed Number.MAX_SAFE_INTEGER, so
        // keep the exact decimal string the node returned.
        accountNumber: account.accountNumber.toString(),
        sequence: Number(account.sequence.toString()),
        pubKey: account.pubKey,
      };
    },
    async estimateFee({
      wallet,
      messages,
      signOptions = {},
      fallbackGasLimit,
    }: {
      wallet: AccountStoreWallet;
      messages: readonly EncodeObject[];
      initialFee?: Optional<StdFee, "gas">;
      signOptions?: SignOptions;
      fallbackGasLimit?: number;
    }): Promise<StdFee> {
      if (!wallet.address) throw new Error("No wallet address available.");

      try {
        const registry = await service.getRegistry();
        const encodedMessages = messages.map((m) => registry.encodeAsAny(m));

        // Check ownership against the same session used for decoration.
        const oneClickTradingInfo = signOptions?.useOneClickTrading
          ? await deps.oneClick?.getInfo()
          : undefined;
        const shouldBeSignedWithOneClickTrading =
          signOptions?.useOneClickTrading &&
          oneClickTradingInfo?.userOsmoAddress === wallet.address &&
          (await deps.oneClick?.shouldSign({
            messages,
            chainId: wallet.chainId,
          }));
        const nonCriticalExtensionOptions = shouldBeSignedWithOneClickTrading
          ? await deps.oneClick?.extensionOptions({
              oneClickTradingInfo,
            })
          : undefined;

        const estimate = await deps.transport.request<QuoteStdFee>(
          "/api/estimate-gas-fee",
          {
            data: {
              chainId: wallet.chainId,
              messages: encodedMessages.map(encodeAnyBase64),
              nonCriticalExtensionOptions:
                nonCriticalExtensionOptions?.map(encodeAnyBase64),
              bech32Address: wallet.address,
              gasMultiplier: GasMultiplier,
              fallbackGasLimit,
            } satisfies {
              chainId: string;
              messages: { typeUrl: string; value: string }[];
              nonCriticalExtensionOptions?: {
                typeUrl: string;
                value: string;
              }[];
              bech32Address: string;
              onlyDefaultFeeDenom?: boolean;
              gasMultiplier: number;
              fallbackGasLimit?: number;
            },
          }
        );

        const getGasAmount =
          signOptions.preferNoSetFee || signOptions.useOneClickTrading;

        if (!getGasAmount) {
          return {
            gas: estimate.gas,
            amount: [],
          };
        }

        // avoid returning isSubtractiveFee, a utility returned from the estimateGasFee function that is not used here
        // Also, for now, only single-token fee payments are supported.
        return {
          gas: estimate.gas,
          amount: [
            {
              denom: estimate.amount[0].denom,
              amount: estimate.amount[0].amount,
            },
          ],
        };
      } catch (e) {
        if (e instanceof ApiClientError) {
          const apiClientError = e as ApiClientError<{
            code?: number;
            message: string;
          }>;

          const status = apiClientError.response?.status;
          const message = apiClientError.data?.message;

          if (status !== 400 || !message || typeof message !== "string")
            throw e;

          if (message.includes("invalid empty tx")) {
            throw new SimulateNotAvailableError(message);
          }

          if (
            message.includes(
              "No fee tokens found with sufficient balance on account"
            )
          ) {
            throw new InsufficientBalanceForFeeError(
              "Insufficient balance for transaction fees. Please add funds to continue."
            );
          }

          // If there is a code, it's a simulate tx error and we should forward its message.
          if (apiClientError?.data?.code) {
            throw new Error(apiClientError?.data?.message);
          }
        }

        throw e;
      }
    },
    async simulatePositionMigration({
      chainId,
      messages,
      bech32Address,
    }: {
      chainId: string;
      messages: readonly EncodeObject[];
      bech32Address: string;
    }): Promise<{
      gasUsed: number;
      coinsSpent: { denom: string; amount: string }[];
      events: { type: string; attributes: { key: string; value: string }[] }[];
    }> {
      const registry = await service.getRegistry();
      const encodedMessages = messages.map((m) => registry.encodeAsAny(m));

      return await deps.transport.request<{
        gasUsed: number;
        coinsSpent: { denom: string; amount: string }[];
        events: {
          type: string;
          attributes: { key: string; value: string }[];
        }[];
      }>("/api/simulate-position-migration", {
        data: {
          chainId,
          messages: encodedMessages.map(encodeAnyBase64),
          bech32Address,
        },
      });
    },
  };
  return service;
}

export type WalletTxClient = ReturnType<typeof createWalletTxClient>;
