import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { makeSignBytes, makeSignDoc, Registry } from "@cosmjs/proto-signing";
import { Hash } from "@keplr-wallet/crypto/build/hash";
import { PrivKeySecp256k1 } from "@keplr-wallet/crypto/build/key";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { AuthInfo, TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import type { SessionSignRequest } from "../client";
import {
  canSignOneClick,
  confirmOneClickFeeLimit,
  getOneClickExtensionOptions,
  isWithinOneClickFeeLimit,
  signOneClick,
} from "../one-click";
import type { OneClickTradingInfo } from "../types";

const key = new PrivKeySecp256k1(new Uint8Array(32).fill(1));
const typeUrl = "/cosmos.bank.v1beta1.MsgSend";
const messages = [
  {
    typeUrl,
    value: {
      fromAddress: "osmo1owner",
      toAddress: "osmo1recipient",
      amount: [],
    },
  },
];
const info: OneClickTradingInfo = {
  authenticatorId: "18446744073709551615",
  publicKey: toBase64(key.getPubKey().toBytes()),
  sessionKey: toBase64(key.toBytes()),
  userOsmoAddress: "osmo1owner",
  allowedMessages: [typeUrl],
  sessionPeriod: { start: "1000000000", end: "9999999999999999999" },
  sessionStartedAtUnix: 1,
  networkFeeLimit: "200000",
  spendLimit: { amount: "10", decimals: 6 },
  humanizedSessionPeriod: "1day",
  hasSeenExpiryToast: false,
};
const context = {
  info,
  enabled: true,
  address: info.userOsmoAddress,
  chainId: "osmosis-1",
  osmosisChainId: "osmosis-1",
  messages,
  nowMs: 2000,
};

it("permits only the session owner's allowed messages within its time bounds", () => {
  expect(canSignOneClick(context)).toBe(true);
  for (const change of [
    { enabled: false },
    { address: "osmo1other" },
    { chainId: "cosmoshub-4" },
    { info: undefined },
    { messages: [] },
    { messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgMultiSend", value: {} }] },
    { nowMs: 0 },
    { info: { ...info, sessionPeriod: { end: "2000000000" } } },
    { info: { ...info, sessionPeriod: { end: "invalid" } } },
  ])
    expect(canSignOneClick({ ...context, ...change })).toBe(false);
});

it("treats a missing start as already active and expiry as exclusive", () => {
  expect(
    canSignOneClick({
      ...context,
      info: { ...info, sessionPeriod: { end: "2000000001" } },
    })
  ).toBe(true);
  expect(
    canSignOneClick({
      ...context,
      info: { ...info, sessionPeriod: { end: "2000000000" } },
    })
  ).toBe(false);
});

it("uses the configured gas limit inclusively", () => {
  expect(isWithinOneClickFeeLimit(info, "200000")).toBe(true);
  expect(isWithinOneClickFeeLimit(info, "200001")).toBe(false);
});

it("honors fee-limit continuation, cancellation and absent UI handlers", async () => {
  await expect(confirmOneClickFeeLimit(undefined)).resolves.toBeUndefined();
  await expect(
    confirmOneClickFeeLimit(({ continueTx }) => continueTx())
  ).resolves.toBeUndefined();
  await expect(
    confirmOneClickFeeLimit(({ finish }) => finish())
  ).rejects.toThrow("User cancelled");
});

it.each([1, 31, 32])(
  "signs with a persisted %s-byte session key and exact uint64 account number",
  async (length) => {
    const bytes = new Uint8Array(length).fill(1);
    const padded = new Uint8Array(32);
    padded.set(bytes, 32 - length);
    const sessionKey = new PrivKeySecp256k1(padded);
    const currentInfo = {
      ...info,
      sessionKey: toBase64(bytes),
      publicKey: toBase64(sessionKey.getPubKey().toBytes()),
    };
    const registry = new Registry([[typeUrl, MsgSend]]);
    const request = {
      wallet: {
        address: info.userOsmoAddress,
        chain: { chain_id: "osmosis-1" },
        offlineSigner: {
          getAccounts: async () => [
            {
              address: info.userOsmoAddress,
              pubkey: key.getPubKey().toBytes(),
              algo: "secp256k1",
            },
          ],
        },
      },
      signerAddress: info.userOsmoAddress,
      messages,
      fee: { amount: [], gas: "200000" },
      memo: "memo",
      signerData: {
        accountNumber: "18446744073709551615",
        sequence: 7,
        chainId: "osmosis-1",
      },
    } as unknown as SessionSignRequest;
    const tx = await signOneClick(request, {
      chains: [],
      registry,
      oneClickTradingInfo: currentInfo,
      osmosisChainId: "osmosis-1",
    });
    const body = TxBody.decode(tx.bodyBytes);
    expect(body.memo).toBe("memo \n1CT");
    expect(body.nonCriticalExtensionOptions).toEqual(
      await getOneClickExtensionOptions({ oneClickTradingInfo: info })
    );
    expect(AuthInfo.decode(tx.authInfoBytes).signerInfos[0].sequence).toBe(
      BigInt(7)
    );
    const doc = makeSignDoc(
      tx.bodyBytes,
      tx.authInfoBytes,
      "osmosis-1",
      "18446744073709551615" as unknown as number
    );
    expect(
      sessionKey
        .getPubKey()
        .verifyDigest32(Hash.sha256(makeSignBytes(doc)), tx.signatures[0])
    ).toBe(true);
    expect(fromBase64(currentInfo.sessionKey)).toHaveLength(length);
    await expect(
      signOneClick(
        { ...request, signerAddress: "osmo1other" },
        {
          chains: [],
          registry,
          oneClickTradingInfo: currentInfo,
          osmosisChainId: "osmosis-1",
        }
      )
    ).rejects.toThrow("not valid");
  }
);
