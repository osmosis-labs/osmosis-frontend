import type { StdFee } from "@cosmjs/launchpad";
import { type EncodeObject, type Registry } from "@cosmjs/proto-signing";
import type { SignerData } from "@cosmjs/stargate";
import { Hash, PrivKeySecp256k1 } from "@keplr-wallet/crypto";
import { SignDoc } from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { Chain } from "@osmosis-labs/types";
import { apiClient, removeLastSlash } from "@osmosis-labs/utils";
import type { MsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";
import type { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { TxTracer } from "./tracer";

export async function getSmartAccountExtensionOptions({
  authenticatorId,
}: {
  authenticatorId: string;
}): Promise<{ typeUrl: string; value: Uint8Array }[]> {
  const { TxExtension } = await import(
    "@osmosis-labs/proto-codecs/build/codegen/osmosis/smartaccount/v1beta1/tx"
  );
  return [
    {
      typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension",
      value: TxExtension.encode({
        selectedAuthenticators: [BigInt(authenticatorId)],
      }).finish(),
    },
  ];
}

export async function signWithAuthenticator({
  messages,
  fee,
  memo,
  privateKey: privateKeyParam,
  publicKey,
  authenticatorId,
  registry,
  signerData: { accountNumber, sequence, chainId },
}: {
  messages: readonly EncodeObject[];
  fee: StdFee;
  memo: string;
  signerData: SignerData;
  registry: Registry;
  privateKey: string;
  publicKey: Uint8Array;
  authenticatorId: string;
}): Promise<TxRaw> {
  const [
    { encodeSecp256k1Pubkey, encodeSecp256k1Signature },
    { fromBase64 },
    { Int53 },
    { makeAuthInfoBytes, makeSignDoc, encodePubkey },
    { TxRaw },
  ] = await Promise.all([
    import("@cosmjs/amino"),
    import("@cosmjs/encoding"),
    import("@cosmjs/math"),
    import("@cosmjs/proto-signing"),
    import("cosmjs-types/cosmos/tx/v1beta1/tx"),
  ]);

  const pubkey = encodePubkey(encodeSecp256k1Pubkey(publicKey));

  const txBodyBytes = registry.encodeTxBody({
    messages,
    memo,
    nonCriticalExtensionOptions: [
      ...(await getSmartAccountExtensionOptions({
        authenticatorId,
      })),
    ],
  }) as Uint8Array;

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
    accountNumber
  );

  const privateKey = new PrivKeySecp256k1(fromBase64(privateKeyParam));

  const sig = privateKey.signDigest32(
    Hash.sha256(
      SignDoc.encode(
        SignDoc.fromPartial({
          bodyBytes: signDoc.bodyBytes,
          authInfoBytes: signDoc.authInfoBytes,
          chainId: signDoc.chainId,
          accountNumber: signDoc.accountNumber.toString(),
        })
      ).finish()
    )
  );

  const signature = encodeSecp256k1Signature(
    privateKey.getPubKey().toBytes(),
    new Uint8Array([...sig.r, ...sig.s])
  );

  return TxRaw.fromPartial({
    bodyBytes: signDoc.bodyBytes,
    authInfoBytes: signDoc.authInfoBytes,
    signatures: [fromBase64(signature.signature)],
  });
}

export interface TxFee {
  readonly amount: readonly {
    readonly denom: string;
    readonly amount: string;
  }[];
  readonly gas: string;
}

export type TxEvent = {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
};

export interface DeliverTxResponse {
  readonly events?: TxEvent[];
  readonly height?: number;
  /** Error code. The transaction succeeded if code is 0. */
  readonly code: number;
  readonly transactionHash: string;
  readonly rawLog?: string;
  readonly data?: readonly MsgData[];
  readonly gasUsed: string;
  readonly gasWanted: string;
}

export async function broadcastTx({
  tx,
  proxyBroadcastUrl,
  wsObject,
  onBroadcasted,
  chainId,
  chainList,
}: {
  tx: TxRaw;
  chainId: string;
  chainList: Chain[];
  proxyBroadcastUrl?: string;
  wsObject?: new (url: string, protocols?: string | string[]) => WebSocket;
  onBroadcasted?: (param: { txHash: Uint8Array }) => void;
}): Promise<DeliverTxResponse> {
  const chain = chainList.find((c) => c.chain_id === chainId);

  if (!chain) {
    throw new Error("Chain not found");
  }

  const restEndpoint = chain.apis.rest[0].address;
  const rpcEndpoint = chain.apis.rpc[0].address;

  if (!restEndpoint || !rpcEndpoint) {
    throw new Error(
      "Could not broadcast transaction as endpoints are not defined."
    );
  }

  const { TxRaw } = await import("cosmjs-types/cosmos/tx/v1beta1/tx");
  const encodedTx = TxRaw.encode(tx).finish();

  // Broadcast transaction using apiClient
  const broadcasted = await apiClient<{
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
  }>(
    proxyBroadcastUrl ??
      `${removeLastSlash(restEndpoint)}/cosmos/tx/v1beta1/txs`,
    {
      data: {
        ...(proxyBroadcastUrl
          ? { restEndpoint: removeLastSlash(restEndpoint) }
          : {}),
        tx_bytes: Buffer.from(encodedTx).toString("base64"),
        mode: "BROADCAST_MODE_SYNC",
      },
    }
  ).then((res) => res.tx_response);

  // Check for broadcast errors
  if (broadcasted.code) {
    const { BroadcastTxError } = await import("@cosmjs/stargate");
    throw new BroadcastTxError(broadcasted.code, "", broadcasted.raw_log);
  }

  const txHashBuffer = Buffer.from(broadcasted.txhash, "hex");

  if (onBroadcasted) {
    onBroadcasted({ txHash: txHashBuffer });
  }

  // Trace transaction
  const txTracer = new TxTracer(rpcEndpoint, "/websocket", { wsObject });

  const tracedTx = await txTracer.traceTx(txHashBuffer).then(
    (tx: {
      data?: string;
      events?: TxEvent[];
      gas_used?: string;
      gas_wanted?: string;
      log?: string;
      code?: number;
      height?: number;
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

  return tracedTx;
}
