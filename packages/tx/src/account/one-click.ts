import type { EncodeObject, Registry } from "@cosmjs/proto-signing";
import { Hash } from "@keplr-wallet/crypto/build/hash";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto/build/key";
import type { Chain } from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
import {
  AccountStoreNoBroadcastErrorEvent,
  OneClickTradingMaxGasLimit,
} from "@osmosis-labs/utils";
import type { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import type { SessionSignRequest } from "./client";
import { appendFeMemoTag, OneClickFeMemoTag } from "./memo";
import type { OneClickTradingInfo, TxEvents } from "./types";
import { getPublicKeyTypeUrl, padSessionKeyBytes } from "./utils";

export type OneClickSessionContext = {
  info: OneClickTradingInfo | undefined | null;
  enabled: boolean;
  address: string | undefined;
  chainId: string;
  osmosisChainId: string;
  nowMs?: number;
};

/** Sessions are scoped to their owner and the Osmosis chain they authorize. */
export function canSignOneClick({
  info,
  enabled,
  address,
  chainId,
  osmosisChainId,
  messages,
  nowMs = Date.now(),
}: OneClickSessionContext & { messages: readonly EncodeObject[] }): boolean {
  if (
    !enabled ||
    !info ||
    !address ||
    address !== info.userOsmoAddress ||
    chainId !== osmosisChainId ||
    messages.length === 0 ||
    !Array.isArray(info.allowedMessages)
  )
    return false;
  try {
    const now = BigInt(Math.trunc(nowMs)) * BigInt(1_000_000);
    if (
      (info.sessionPeriod.start !== undefined &&
        now < BigInt(info.sessionPeriod.start)) ||
      now >= BigInt(info.sessionPeriod.end)
    )
      return false;
  } catch {
    return false;
  }
  return messages.every(({ typeUrl }) =>
    info.allowedMessages.includes(typeUrl)
  );
}

export function isWithinOneClickFeeLimit(
  info: OneClickTradingInfo,
  gas: string
): boolean {
  return new Dec(gas).lte(
    new Dec(
      typeof info.networkFeeLimit === "string"
        ? info.networkFeeLimit
        : OneClickTradingMaxGasLimit
    )
  );
}

export async function confirmOneClickFeeLimit(
  onExceeds: TxEvents["onExceeds1CTNetworkFeeLimit"]
): Promise<void> {
  if (!onExceeds) return;
  const decision = await new Promise<"continue" | "finish">((resolve) =>
    onExceeds({
      continueTx: () => resolve("continue"),
      finish: () => resolve("finish"),
    })
  );
  if (decision === "finish")
    throw new AccountStoreNoBroadcastErrorEvent("User cancelled");
}

export async function getOneClickExtensionOptions({
  oneClickTradingInfo,
}: {
  oneClickTradingInfo: OneClickTradingInfo | undefined;
}) {
  if (!oneClickTradingInfo) return undefined;
  const { TxExtension } =
    await import("@osmosis-labs/proto-codecs/build/codegen/osmosis/smartaccount/v1beta1/tx");
  return [
    {
      typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension",
      value: TxExtension.encode({
        selectedAuthenticators: [BigInt(oneClickTradingInfo.authenticatorId)],
      }).finish(),
    },
  ];
}

export async function signOneClick(
  {
    wallet,
    signerAddress,
    messages,
    fee,
    memo,
    signerData: { accountNumber, sequence, chainId },
    accountPubKey,
    memoFlags,
  }: SessionSignRequest,
  deps: {
    chains: Chain[];
    registry: Registry;
    oneClickTradingInfo: OneClickTradingInfo | undefined;
    osmosisChainId: string;
    isSessionCurrent?: () => boolean;
  }
): Promise<TxRaw> {
  const assertSession = () => {
    if (
      !canSignOneClick({
        info: deps.oneClickTradingInfo,
        enabled: true,
        address: wallet.address === signerAddress ? signerAddress : undefined,
        chainId,
        osmosisChainId: deps.osmosisChainId,
        messages,
      }) ||
      deps.isSessionCurrent?.() === false
    )
      throw new Error(
        "One click trading session is not valid for this transaction"
      );
    if (!isWithinOneClickFeeLimit(deps.oneClickTradingInfo!, fee.gas))
      throw new Error("One click trading network fee limit exceeded");
  };
  assertSession();
  // Creating the session was a signed tx, so the chain has the pubkey.
  if (!accountPubKey) {
    throw new Error("Account public key is not available onchain");
  }

  const oneClickTradingInfo = deps.oneClickTradingInfo;
  if (!oneClickTradingInfo) {
    throw new Error("One click trading info is not available");
  }

  // Tag the memo so we know the tx originated from the frontend (QA), plus
  // any warn-accept flags the user acknowledged.
  memo = appendFeMemoTag(memo, OneClickFeMemoTag, memoFlags);

  const [
    { encodeSecp256k1Pubkey, encodeSecp256k1Signature },
    { TxExtension },
    { fromBase64 },
    { Int53 },
    { makeAuthInfoBytes, makeSignBytes, makeSignDoc, encodePubkey },
    { TxRaw },
  ] = await Promise.all([
    import("@cosmjs/amino"),
    import("@osmosis-labs/proto-codecs/build/codegen/osmosis/smartaccount/v1beta1/tx"),
    import("@cosmjs/encoding"),
    import("@cosmjs/math"),
    import("@cosmjs/proto-signing"),
    import("cosmjs-types/cosmos/tx/v1beta1/tx"),
  ]);

  const pubKeyTypeUrl = getPublicKeyTypeUrl({
    chainId: wallet.chain.chain_id,
    coinType:
      deps.chains.find(({ chain_id }) => chain_id === wallet.chain.chain_id)
        ?.slip44 ?? 118,
  });
  // A different key type would put the wrong pubkey in the signer info.
  if (accountPubKey.typeUrl !== pubKeyTypeUrl) {
    throw new Error(
      `Unsupported account public key type: ${accountPubKey.typeUrl}`
    );
  }

  const pubkey = encodePubkey(
    encodeSecp256k1Pubkey(fromBase64(accountPubKey.key))
  );
  pubkey.typeUrl = pubKeyTypeUrl;

  const registry = deps.registry;
  const txBodyBytes = registry.encodeTxBody({
    messages,
    memo,
    nonCriticalExtensionOptions: [
      {
        typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension",
        value: TxExtension.encode({
          selectedAuthenticators: [BigInt(oneClickTradingInfo.authenticatorId)],
        }).finish(),
      },
    ],
  }) as Uint8Array;

  assertSession();
  const privateKey = new PrivKeySecp256k1(
    padSessionKeyBytes(fromBase64(oneClickTradingInfo.sessionKey))
  );

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

  const sig = privateKey.signDigest32(Hash.sha256(makeSignBytes(signDoc)));

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
