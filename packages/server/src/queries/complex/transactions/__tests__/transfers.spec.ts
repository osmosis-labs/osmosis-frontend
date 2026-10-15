import { AssetList, Chain } from "@osmosis-labs/types";
import {
  encodeAbiParameters,
  encodeFunctionData,
  getAddress,
  parseAbi,
  zeroAddress,
} from "viem";

import { AssetLists as MockAssetLists } from "../../../__tests__/mock-asset-lists";
import { MockChains } from "../../../__tests__/mock-chains";
import { Transaction } from "../../../data-services";
import {
  decodeGmpRecipient,
  mapTransfers,
  resolveAxelarTransfers,
  settleIbcWithdrawals,
} from "../transfers";
import { IndexedTransferTxs } from "./transfer-fixtures";

const SKIP_OUTPUT_DENOM =
  "ibc/794C7D7F3B857713878A3A1927251FA6AC1EEE520424C1F6FAFE9BA26D476138";

// the Skip fixture swaps into an asset the mock asset list doesn't have
const assetLists: AssetList[] = MockAssetLists.map((list) => {
  if (list.chain_name !== "osmosis") return list;
  const template = list.assets.find((a) => a.symbol === "LUNC")!;
  return {
    ...list,
    assets: [
      ...list.assets,
      { ...template, coinMinimalDenom: SKIP_OUTPUT_DENOM, symbol: "TESTOUT" },
    ],
  };
});

// the fixtures transfer to/from chains the mock chain list doesn't have
const cloneChain = (
  chain_name: string,
  chain_id: string,
  bech32Prefix: string,
  prettyName: string
): Chain => ({
  ...MockChains.find((c) => c.chain_name === "cosmoshub")!,
  chain_name,
  chain_id,
  bech32Prefix,
  prettyName,
});
const chainList: Chain[] = [
  ...MockChains,
  cloneChain("noble", "noble-1", "noble", "Noble"),
  cloneChain("terra", "columbus-5", "terra", "Terra Classic"),
];

function map(tx: Transaction, address = senderOf(tx)) {
  return mapTransfers({ transactions: [tx], address, assetLists, chainList });
}

function senderOf(tx: Transaction) {
  return tx.messages.find((m) => m.sender)!.sender!;
}

describe("mapTransfers", () => {
  it("maps a plain IBC send to the next hop chain", () => {
    const [transfer] = map(IndexedTransferTxs.send);

    expect(transfer).toMatchObject({
      type: "bridge-transfer",
      direction: "withdraw",
      provider: "IBC",
      statusProvider: "Skip",
      status: "pending",
      sendTxHash: IndexedTransferTxs.send.hash,
      fromChain: { chainType: "cosmos", chainId: "osmosis-1" },
      toChain: { chainType: "cosmos", chainId: "noble-1", prettyName: "Noble" },
      fromAddress: "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj",
      toAddress: "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
      fromAsset: {
        denom: "USDC",
        address:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        decimals: 6,
        amount: "224893756165",
      },
      networkFee: { address: "uosmo", amount: "45000" },
    });
    expect(transfer.createdAtUnix).toBe(
      Math.floor(
        new Date(IndexedTransferTxs.send.blockTimestamp).getTime() / 1000
      )
    );
  });

  it("maps an IBC arrival to a settled deposit", () => {
    const address = "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj";
    const [transfer] = map(IndexedTransferTxs.recv, address);

    expect(transfer).toMatchObject({
      direction: "deposit",
      provider: "IBC",
      status: "success",
      fromChain: { chainId: "noble-1" },
      toChain: { chainId: "osmosis-1" },
      fromAddress: "noble1ze3f954mtj30st8dw2qhylfvvtdv5q6x86q7dw",
      toAddress: address,
      osmoBech32Address: address,
      fromAsset: { denom: "USDC", amount: "224867279694" },
    });
    expect(transfer.statusProvider).toBeUndefined();
  });

  it("maps a Skip swap_and_action to the final forward hop", () => {
    const [transfer] = map(IndexedTransferTxs.skip);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Skip",
      statusProvider: "Skip",
      fromChain: { chainId: "osmosis-1" },
      // osmosis -> injective -> terra (packet forward memo)
      toChain: { chainId: "columbus-5" },
      toAddress: "terra1gygragtv7rhv86scnq4lkw0kw499939qer9ur5",
      fromAsset: { denom: "LUNC" },
      toAsset: { denom: "TESTOUT", address: SKIP_OUTPUT_DENOM },
    });
  });

  it("maps an Axelar GMP transfer to the EVM destination", () => {
    const [transfer] = map(IndexedTransferTxs.gmp);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Squid",
      statusProvider: "Skip",
      toChain: { chainType: "evm", chainId: 8453, prettyName: "Base" },
    });
    // the user's address from the payload, not Squid's router
    expect(transfer.toAddress.toLowerCase()).toBe(
      "0x20a15f256f7537da4f707a196f6ddc3e2e8be9da"
    );
  });

  it("maps a Skip Axelar send to the recipient in the payload", () => {
    const [transfer] = map(IndexedTransferTxs.skipGmpAvalanche);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Skip",
      toChain: { chainType: "evm", chainId: 43114 },
    });
    // not Skip's Axelar handler (0xBeB12d88...)
    expect(transfer.toAddress.toLowerCase()).toBe(
      "0x1678ac809e0a5f6b3edab7dc7099c74ee570d7fd"
    );
  });

  it("maps a Skip Axelar swap-and-send to the recipient in the payload", () => {
    const [transfer] = map(IndexedTransferTxs.skipGmpEthereum);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Skip",
      toChain: { chainType: "evm", chainId: 1 },
    });
    // not Skip's Axelar handler (0xB773bCc5...)
    expect(transfer.toAddress.toLowerCase()).toBe(
      "0xecd570f565f272c6d5fd77fd5c25dc68c2130e52"
    );
  });

  describe("Axelar GMP deposits", () => {
    const address = "osmo1yamxfey40t5r62ejss9g4kskptqq3a70e9we2l";
    const sourceTxHash =
      "0x7a6d3d0947d0670adc6dde991721bb1573cf91ad7dc43c0c97edbe4aae793fbd";

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("uses the source chain from the memo and the user as recipient", () => {
      const [transfer] = map(IndexedTransferTxs.gmpDeposit, address);

      expect(transfer).toMatchObject({
        direction: "deposit",
        provider: "Skip",
        status: "success",
        fromChain: { chainType: "evm", chainId: 1 },
        toChain: { chainId: "osmosis-1" },
        // not Skip's entry point contract the packet was sent to
        toAddress: address,
        // not Axelar's GMP account; resolved from Axelarscan
        fromAddress: "",
      });
    });

    it("resolves the source sender and links the source tx", async () => {
      const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              call: {
                transactionHash: sourceTxHash,
                transaction: {
                  from: "0x6fe3c2f1826f9cbe8b788112b44bb2f631979a64",
                },
              },
            },
          ],
        }),
      } as Response);

      const [transfer] = await resolveAxelarTransfers(
        map(IndexedTransferTxs.gmpDeposit, address)
      );

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.axelarscan.io/gmp/searchGMP",
        expect.objectContaining({
          body: JSON.stringify({
            txHash: IndexedTransferTxs.gmpDeposit.hash,
            size: 1,
          }),
        })
      );
      expect(transfer.fromAddress).toBe(
        getAddress("0x6fe3c2f1826f9cbe8b788112b44bb2f631979a64")
      );
      expect(transfer.explorerUrl).toBe(
        `https://axelarscan.io/gmp/${sourceTxHash}`
      );
    });

    it("leaves the transfer as is when the lookup fails", async () => {
      jest.spyOn(global, "fetch").mockRejectedValue(new Error("timeout"));
      const tx = {
        ...IndexedTransferTxs.gmpDeposit,
        // a hash the cache hasn't seen
        hash: "LOOKUPFAILS",
      };

      const [transfer] = await resolveAxelarTransfers(map(tx, address));

      expect(transfer.fromAddress).toBe("");
      expect(transfer.toAddress).toBe(address);
    });

    it("looks an unindexed call up again on a later request", async () => {
      const fetchMock = jest.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      } as Response);
      const tx = { ...IndexedTransferTxs.gmpDeposit, hash: "NOTINDEXEDYET" };

      await resolveAxelarTransfers(map(tx, address));
      await resolveAxelarTransfers(map(tx, address));

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  describe("IBC withdrawal outcomes", () => {
    const send = IndexedTransferTxs.send;
    const sender = "osmo1ze3f954mtj30st8dw2qhylfvvtdv5q6x8zxxrj";
    const sendMsg = send.messages[0] as Record<string, any>;

    /** A relayer's ack/timeout tx, shaped as the index returns it. */
    const outcome = (
      type: "MsgAcknowledgement" | "MsgTimeout",
      {
        minutesAfter = 1,
        acknowledgement = { result: "AQ==" } as unknown,
        amount = sendMsg.token.amount,
      } = {}
    ) =>
      ({
        hash: `${type}-${minutesAfter}-${amount}`,
        blockTimestamp: new Date(
          new Date(send.blockTimestamp).getTime() + minutesAfter * 60_000
        ).toISOString(),
        messages: [
          {
            "@type": `/ibc.core.channel.v1.${type}`,
            packet: {
              sequence: "1",
              source_port: "transfer",
              source_channel: sendMsg.source_channel,
              data: {
                amount,
                denom: "uusdc",
                receiver: sendMsg.receiver,
                sender,
              },
            },
            ...(type === "MsgAcknowledgement" ? { acknowledgement } : {}),
          },
        ],
      }) as unknown as Transaction;

    const settle = (outcomes: Transaction[]) =>
      settleIbcWithdrawals({
        transfers: map(send),
        transactions: [send],
        outcomes,
        address: sender,
      })[0].status;

    it("settles a delivered transfer from its acknowledgement", () => {
      expect(settle([outcome("MsgAcknowledgement")])).toBe("success");
    });

    it("settles an error ack or a timeout as refunded", () => {
      expect(
        settle([
          outcome("MsgAcknowledgement", {
            acknowledgement: { error: "ABCI code: 5" },
          }),
        ])
      ).toBe("refunded");
      expect(settle([outcome("MsgTimeout")])).toBe("refunded");
    });

    it("decodes a raw base64 acknowledgement", () => {
      expect(
        settle([
          outcome("MsgAcknowledgement", {
            acknowledgement: btoa(JSON.stringify({ error: "failed" })),
          }),
        ])
      ).toBe("refunded");
    });

    it("leaves it pending when identical sends' outcomes disagree", () => {
      // an identical send (same channel, receiver, amount) timed out: either
      // packet could be this send's
      expect(
        settle([
          outcome("MsgAcknowledgement", { minutesAfter: 1 }),
          outcome("MsgTimeout", { minutesAfter: 2 }),
        ])
      ).toBe("pending");
      // all agree: settled
      expect(
        settle([
          outcome("MsgAcknowledgement", { minutesAfter: 1 }),
          outcome("MsgAcknowledgement", { minutesAfter: 2 }),
        ])
      ).toBe("success");
    });

    it("leaves it pending without a matching packet", () => {
      expect(settle([])).toBe("pending");
      // a different amount, or a packet from before the send
      expect(settle([outcome("MsgAcknowledgement", { amount: "1" })])).toBe(
        "pending"
      );
      expect(
        settle([outcome("MsgAcknowledgement", { minutesAfter: -5 })])
      ).toBe("pending");
    });
  });

  describe("Axelar GMP withdrawals", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    const axelarscanResponse = (simplified_status: string) =>
      ({
        ok: true,
        json: async () => ({
          data: [
            {
              simplified_status,
              call: {
                transactionHash: IndexedTransferTxs.squid.hash,
                // withdrawals originate on Osmosis
                transaction: {
                  from: "osmo1yjkmhaq0xhpvhwzk7mncaurasdl0wyesf5cjcl",
                },
              },
            },
          ],
        }),
      }) as Response;

    it("takes the final status from Axelarscan", async () => {
      jest
        .spyOn(global, "fetch")
        .mockResolvedValue(axelarscanResponse("received"));

      const [transfer] = await resolveAxelarTransfers(
        map(IndexedTransferTxs.squid)
      );

      expect(transfer.status).toBe("success");
    });

    it("keeps an unsettled transfer pending and doesn't cache it", async () => {
      const fetchMock = jest
        .spyOn(global, "fetch")
        .mockResolvedValue(axelarscanResponse("approved"));
      const tx = { ...IndexedTransferTxs.gmp, hash: "INFLIGHT" };

      const [transfer] = await resolveAxelarTransfers(map(tx));
      await resolveAxelarTransfers(map(tx));

      expect(transfer.status).toBe("pending");
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("doesn't look up plain IBC withdrawals", async () => {
      const fetchMock = jest.spyOn(global, "fetch");

      await resolveAxelarTransfers(map(IndexedTransferTxs.send));

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  it("maps Squid's multicall contract to the EVM destination", () => {
    const [transfer] = map(IndexedTransferTxs.squid);

    expect(transfer).toMatchObject({
      direction: "withdraw",
      provider: "Squid",
      toChain: { chainType: "evm", chainId: 56 },
      fromAsset: { address: "uosmo", amount: "7000000" },
      toAsset: {
        address:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
      },
    });
  });

  describe("Squid recipients", () => {
    const SQUID_ROUTER = "0xce16F69375520ab01377ce7B88f5BA8C48F8D666";
    const user = "0xc8E4D1e39819d9C11B860356Ba5eF1100aB3A487";
    const refund = "0x1111111111111111111111111111111111111111";
    const token = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
    const router = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
    const multicall = "0xaD6Cea45f98444a922a2b4fE96b8C90F0862D2F4";

    type Call = {
      callType: number;
      target: `0x${string}`;
      callData: `0x${string}`;
    };
    const payload = (calls: Call[]) =>
      encodeAbiParameters(
        [
          {
            type: "tuple[]",
            components: [
              { name: "callType", type: "uint8" },
              { name: "target", type: "address" },
              { name: "value", type: "uint256" },
              { name: "callData", type: "bytes" },
              { name: "payload", type: "bytes" },
            ],
          },
          { type: "address" },
        ],
        [
          calls.map((c) => ({
            ...c,
            value: BigInt(0),
            payload: "0x" as const,
          })),
          refund,
        ]
      );
    const recipient = (calls: Call[]) =>
      decodeGmpRecipient({
        destination_address: SQUID_ROUTER,
        payload: payload(calls),
      });

    const erc20 = parseAbi([
      "function approve(address spender, uint256 amount)",
      "function transfer(address to, uint256 amount)",
    ]);
    const swapRouter02 = parseAbi([
      "function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) params)",
    ]);
    const approve: Call = {
      callType: 0,
      target: token,
      callData: encodeFunctionData({
        abi: erc20,
        functionName: "approve",
        args: [router, BigInt(1)],
      }),
    };
    const swapTo = (to: `0x${string}`): Call => ({
      callType: 1,
      target: router,
      callData: encodeFunctionData({
        abi: swapRouter02,
        functionName: "exactInputSingle",
        args: [
          {
            tokenIn: token,
            tokenOut: token,
            fee: 100,
            recipient: to,
            amountIn: BigInt(1),
            amountOutMinimum: BigInt(1),
            sqrtPriceLimitX96: BigInt(0),
          },
        ],
      }),
    });

    it("is whoever the last call pays out to, not the refund recipient", () => {
      // native balance send
      expect(
        recipient([
          approve,
          swapTo(multicall),
          { callType: 2, target: user, callData: "0x" },
        ])
      ).toBe(user);
      // ERC-20 transfer
      expect(
        recipient([
          approve,
          {
            callType: 1,
            target: token,
            callData: encodeFunctionData({
              abi: erc20,
              functionName: "transfer",
              args: [user, BigInt(1)],
            }),
          },
        ])
      ).toBe(user);
      // swap paying out directly
      expect(recipient([approve, swapTo(user)])).toBe(user);
    });

    it("is unknown when the last call isn't a recognised payout", () => {
      // paying back into the multicall
      expect(recipient([approve, swapTo(multicall)])).toBeUndefined();
      // an unknown call
      expect(recipient([approve])).toBeUndefined();
      expect(
        recipient([{ callType: 2, target: zeroAddress, callData: "0x" }])
      ).toBeUndefined();
      expect(recipient([])).toBeUndefined();
    });
  });

  it("decodes a hex GMP payload", () => {
    // Skip handler send: abi.encode(uint8 0, abi.encode(address recipient))
    const payload =
      "0x" +
      "0".repeat(64) +
      "40".padStart(64, "0") +
      "20".padStart(64, "0") +
      "1678ac809e0a5f6b3edab7dc7099c74ee570d7fd".padStart(64, "0");
    expect(
      decodeGmpRecipient({
        destination_address: "0xBeB12d8861765c850E8426Cc5c6a5207222f2477",
        payload,
      })?.toLowerCase()
    ).toBe("0x1678ac809e0a5f6b3edab7dc7099c74ee570d7fd");
    expect(decodeGmpRecipient({ payload: [] })).toBeUndefined();
  });

  it("marks a failed withdrawal as failed", () => {
    const [transfer] = map({ ...IndexedTransferTxs.send, code: 5 });
    expect(transfer.status).toBe("failed");
  });

  it("drops transfers sent by another address", () => {
    expect(map(IndexedTransferTxs.send, "osmo1someoneelse")).toEqual([]);
  });

  it("drops unrelated contract calls", () => {
    const tx: Transaction = {
      ...IndexedTransferTxs.skip,
      messages: [
        {
          ...IndexedTransferTxs.skip.messages[0],
          msg: { claim_rewards: {} },
        },
      ],
    };
    expect(map(tx)).toEqual([]);
  });

  it("drops transfers of unknown assets", () => {
    const tx: Transaction = {
      ...IndexedTransferTxs.send,
      messages: [
        {
          ...IndexedTransferTxs.send.messages[0],
          token: { denom: "ibc/UNKNOWN", amount: "1" },
        },
      ],
    };
    expect(map(tx)).toEqual([]);
  });
});
