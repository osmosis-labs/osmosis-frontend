import { createHash } from "node:crypto";

import { WalletStatus } from "@cosmos-kit/core";
import {
  AccountStoreNoBroadcastErrorEvent,
  ApiClientError,
} from "@osmosis-labs/utils";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { SimulateNotAvailableError } from "../../gas";
import { createWalletTxClient, type WalletTxDependencies } from "../client";
import type { AccountStoreWallet } from "../types";

const mockTrace = jest.fn();
const mockClose = jest.fn();
jest.mock("../../tracer", () => ({
  TxTracer: jest
    .fn()
    .mockImplementation(() => ({ traceTx: mockTrace, close: mockClose })),
}));

const chainId = "wallet-ci";
const address = "osmo1test";
const fee = { gas: "100000", amount: [{ denom: "uosmo", amount: "2500" }] };
const message = {
  typeUrl: "/cosmos.bank.v1beta1.MsgSend",
  value: {
    fromAddress: address,
    toAddress: "osmo1recipient",
    amount: [{ denom: "uosmo", amount: "1" }],
  },
};
const signature = {
  pub_key: { type: "tendermint/PubKeySecp256k1", value: "" },
  signature: Buffer.alloc(64).toString("base64"),
};

function fixture(mode: "direct" | "amino" = "direct") {
  const signDirect = jest.fn(async (_chainId, _address, signed) => ({
    signed,
    signature,
  }));
  const signAmino = jest.fn(async (_chainId, _address, signed) => ({
    signed: { ...signed, memo: "wallet-edited memo" },
    signature,
  }));
  const wallet = {
    address,
    chainId,
    chain: { chain_id: chainId },
    walletStatus: WalletStatus.Connected,
    walletInfo: {},
    offlineSigner: {
      getAccounts: async () => [
        { address, algo: "secp256k1", pubkey: new Uint8Array(33).fill(2) },
      ],
    },
    client: mode === "amino" ? { signAmino } : { signDirect },
    getRestEndpoint: async () => "http://localhost:1317",
    getRpcEndpoint: async () => "http://localhost:26657",
  } as unknown as AccountStoreWallet;
  const transport = {
    get: jest.fn().mockResolvedValue({
      data: {
        account: {
          address,
          account_number: "18446744073709551615",
          sequence: "7",
        },
      },
    }),
    post: jest.fn().mockResolvedValue({
      data: { tx_response: { code: 0, txhash: "abcd" } },
    }),
    request: jest.fn().mockResolvedValue(fee),
  };
  const setTxTypeInProgress = jest.fn();
  const deps: WalletTxDependencies = {
    chains: [],
    getWallet: () => wallet,
    transport,
    hash: (bytes) =>
      new Uint8Array(createHash("sha256").update(bytes).digest()),
    setTxTypeInProgress,
  };
  return {
    wallet,
    signDirect,
    signAmino,
    transport,
    setTxTypeInProgress,
    deps,
    client: createWalletTxClient(deps),
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockTrace.mockResolvedValue({ code: 0, height: 12, events: [] });
});

it.each(["direct", "amino"] as const)(
  "preserves uint64 account numbers in %s signing",
  async (mode) => {
    const { client, signDirect, signAmino, wallet } = fixture(mode);
    const raw = await client.sign({
      wallet,
      messages: [message],
      fee,
      memo: "user memo",
    });
    const body = TxBody.decode(raw.bodyBytes);
    if (mode === "direct") {
      expect(signDirect.mock.calls[0][2].accountNumber.toString()).toBe(
        "18446744073709551615"
      );
      expect(body.memo).toContain("user memo");
    } else {
      expect(signAmino.mock.calls[0][2].account_number).toBe(
        "18446744073709551615"
      );
      expect(body.memo).toBe("wallet-edited memo");
    }
    expect(body.messages[0].typeUrl).toBe(message.typeUrl);
  }
);

it("orders sign, acceptance, progress cleanup, and fulfillment callbacks", async () => {
  const { client, deps, setTxTypeInProgress, transport } = fixture();
  const order: string[] = [];
  deps.options = {
    preTxEvents: {
      onSign: () => {
        order.push("global-sign");
      },
      onBroadcasted: () => {
        order.push("global-broadcast");
      },
      onFulfill: () => {
        order.push("global-fulfill");
      },
    },
  };
  const onSign = jest.fn(() => {
    order.push("sign");
  });
  await client.signAndBroadcast(
    chainId,
    "send",
    [message],
    "memo",
    fee,
    undefined,
    {
      onSign,
      onBroadcasted: () => {
        order.push("broadcast");
      },
      onFulfill: () => {
        expect(setTxTypeInProgress).toHaveBeenLastCalledWith(chainId, "");
        order.push("fulfill");
      },
    }
  );
  const encoded = Buffer.from(
    transport.post.mock.calls[0][1].tx_bytes,
    "base64"
  );
  expect(onSign).toHaveBeenCalledWith(deps.hash(encoded));
  expect(order).toEqual([
    "global-sign",
    "sign",
    "global-broadcast",
    "broadcast",
    "global-fulfill",
    "fulfill",
  ]);
  expect(mockClose).toHaveBeenCalledTimes(1);
});

it("discards signed bytes when the pre-broadcast guard rejects", async () => {
  const { client, transport, setTxTypeInProgress } = fixture();
  await expect(
    client.signAndBroadcast(chainId, "send", [message], "", fee, undefined, {
      onSign: () => {
        throw new AccountStoreNoBroadcastErrorEvent("stale state");
      },
    })
  ).rejects.toThrow("stale state");
  expect(transport.post).not.toHaveBeenCalled();
  expect(setTxTypeInProgress).toHaveBeenLastCalledWith(chainId, "");
});

it("retains the pre-broadcast hash on ambiguous POST failures", async () => {
  const { client, transport } = fixture();
  transport.post.mockRejectedValueOnce(new Error("timeout after acceptance"));
  const onSign = jest.fn(),
    onBroadcasted = jest.fn();
  await expect(
    client.signAndBroadcast(chainId, "send", [message], "", fee, undefined, {
      onSign,
      onBroadcasted,
    })
  ).rejects.toThrow("timeout");
  expect(onSign).toHaveBeenCalledTimes(1);
  expect(onBroadcasted).not.toHaveBeenCalled();
  expect(mockTrace).not.toHaveBeenCalled();
});

it("records acceptance before tracing errors and closes the tracer", async () => {
  const { client } = fixture();
  mockTrace.mockRejectedValueOnce(new Error("trace failed"));
  const onBroadcasted = jest.fn();
  await expect(
    client.signAndBroadcast(chainId, "send", [message], "", fee, undefined, {
      onBroadcasted,
    })
  ).rejects.toThrow("trace failed");
  expect(onBroadcasted).toHaveBeenCalledWith(Buffer.from("abcd", "hex"));
  expect(mockClose).toHaveBeenCalledTimes(1);
});

it("does not broadcast after wallet rejection or message preparation failure", async () => {
  const { client, signDirect, transport, setTxTypeInProgress } = fixture();
  signDirect.mockRejectedValueOnce(new Error("Request rejected"));
  await expect(
    client.signAndBroadcast(chainId, "send", [message], "", fee)
  ).rejects.toThrow("Request rejected");
  await expect(
    client.signAndBroadcast(chainId, "send", async () => {
      throw new Error("preflight failed");
    })
  ).rejects.toThrow("preflight failed");
  expect(transport.post).not.toHaveBeenCalled();
  expect(setTxTypeInProgress).toHaveBeenLastCalledWith(chainId, "");
});

it("preserves simulation errors and fee amount selection", async () => {
  const { client, wallet, transport } = fixture();
  await expect(
    client.estimateFee({ wallet, messages: [message] })
  ).resolves.toEqual({ gas: fee.gas, amount: [] });
  await expect(
    client.estimateFee({
      wallet,
      messages: [message],
      signOptions: { preferNoSetFee: true },
    })
  ).resolves.toEqual(fee);
  transport.request.mockRejectedValueOnce(
    new ApiClientError({
      message: "simulation failed",
      data: { message: "invalid empty tx" },
      response: { status: 400 } as Response,
    })
  );
  await expect(
    client.estimateFee({ wallet, messages: [message] })
  ).rejects.toBeInstanceOf(SimulateNotAvailableError);
});

it("falls back to the wallet when session eligibility fails, without prompting about its fee limit", async () => {
  const { deps, wallet, signDirect } = fixture();
  const signSession = jest.fn();
  const confirm = jest.fn();
  deps.oneClick = {
    getInfo: async () => ({ networkFeeLimit: "invalid" }) as any,
    shouldSign: async () => false,
    extensionOptions: async () => undefined,
    sign: signSession,
  };
  deps.options = { preTxEvents: { onExceeds1CTNetworkFeeLimit: confirm } };
  await createWalletTxClient(deps).sign({
    wallet,
    messages: [message],
    fee,
    memo: "",
    signOptions: { useOneClickTrading: true },
  });
  expect(signDirect).toHaveBeenCalledTimes(1);
  expect(signSession).not.toHaveBeenCalled();
  expect(confirm).not.toHaveBeenCalled();
});

it.each(["continue", "finish"] as const)(
  "honors %s when an eligible session exceeds its gas limit",
  async (decision) => {
    const { deps, wallet, signDirect } = fixture();
    const signSession = jest.fn();
    deps.oneClick = {
      getInfo: async () =>
        ({ networkFeeLimit: "1", userOsmoAddress: address }) as any,
      shouldSign: async () => true,
      extensionOptions: async () => undefined,
      sign: signSession,
    };
    deps.options = {
      preTxEvents: {
        onExceeds1CTNetworkFeeLimit: ({ continueTx, finish }) =>
          decision === "continue" ? continueTx() : finish(),
      },
    };
    const pending = createWalletTxClient(deps).sign({
      wallet,
      messages: [message],
      fee,
      memo: "",
      signOptions: { useOneClickTrading: true },
    });
    if (decision === "finish") {
      await expect(pending).rejects.toThrow("User cancelled");
      expect(signDirect).not.toHaveBeenCalled();
    } else {
      await pending;
      expect(signDirect).toHaveBeenCalledTimes(1);
    }
    expect(signSession).not.toHaveBeenCalled();
  }
);

it("passes the checked session to signing if it changes during eligibility", async () => {
  const { deps, wallet } = fixture();
  const checked = {
    networkFeeLimit: "100000",
    userOsmoAddress: address,
  } as any;
  const replaced = { ...checked, authenticatorId: "other" };
  let current = checked;
  const sign = jest.fn();
  deps.oneClick = {
    getInfo: async () => current,
    shouldSign: async () => {
      current = replaced;
      return true;
    },
    extensionOptions: async () => undefined,
    sign,
  };
  await createWalletTxClient(deps).sign({
    wallet,
    messages: [message],
    fee,
    memo: "",
    signOptions: { useOneClickTrading: true },
  });
  expect(sign.mock.calls[0][0].oneClickTradingInfo).toBe(checked);
});
