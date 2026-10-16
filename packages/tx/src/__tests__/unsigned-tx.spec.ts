import { BaseAccountTypeStr, queryBaseAccount } from "@osmosis-labs/server";
import { Buffer } from "buffer/";
import { AuthInfo, TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { generateCosmosUnsignedTx } from "../gas";

jest.mock("@osmosis-labs/server");

const options = {
  chainId: "osmosis-1",
  chainList: [{ chain_id: "osmosis-1" }] as any,
  bech32Address: "osmo1address",
  body: {
    messages: [{ typeUrl: "/test.Msg", value: Uint8Array.from([8, 1]) }],
    memo: "fixture",
    extensionOptions: [
      { typeUrl: "/test.Extension", value: Uint8Array.from([8, 2]) },
    ],
  },
};

// Recorded using cosmjs-types 0.5.2 with exact unsigned Long sequences.
const bodyHex =
  "0a320a0f0a092f746573742e4d736712020801120766697874757265fa3f150a0f2f746573742e457874656e73696f6e12020802";
const signaturesHex = "1a40" + "00".repeat(64);
const fixtures = [
  ["0", "120a0a0612040a02087f1200"],
  ["1", "120c0a0812040a02087f18011200"],
  ["9007199254740993", "12130a0f12040a02087f1881808080808080101200"],
  ["18446744073709551615", "12150a1112040a02087f18ffffffffffffffffff011200"],
];

describe.each(["base", "nested", "vesting"])(
  "%s account simulation bytes",
  (shape) => {
    function mockAccount(sequence: unknown) {
      const baseAccount = { sequence };
      const account =
        shape === "base"
          ? { "@type": BaseAccountTypeStr, ...baseAccount }
          : shape === "nested"
          ? {
              "@type": "/injective.types.v1beta1.EthAccount",
              base_account: baseAccount,
            }
          : {
              "@type": "/cosmos.vesting.v1beta1.ContinuousVestingAccount",
              base_vesting_account: { base_account: baseAccount },
            };
      jest.mocked(queryBaseAccount).mockResolvedValue({ account } as any);
    }

    it.each(fixtures)(
      "preserves wire bytes for sequence %s",
      async (sequence, authHex) => {
        mockAccount(sequence);
        const { rawUnsignedTx, unsignedTx } = await generateCosmosUnsignedTx(
          options
        );
        const expectedHex = bodyHex + authHex + signaturesHex;
        expect(Buffer.from(rawUnsignedTx).toString("hex")).toBe(expectedHex);
        expect(unsignedTx).toBe(
          Buffer.from(expectedHex, "hex").toString("base64")
        );
        const tx = TxRaw.decode(rawUnsignedTx);
        expect(AuthInfo.decode(tx.authInfoBytes).signerInfos[0].sequence).toBe(
          BigInt(sequence)
        );
      }
    );

    it.each([
      "",
      "-1",
      "1.5",
      "1e3",
      " 1",
      "0x10",
      "invalid",
      "18446744073709551616",
      "1".repeat(1000),
      undefined,
      null,
      -1,
      1.5,
      Number.MAX_SAFE_INTEGER + 1,
      NaN,
    ])("rejects invalid uint64 sequence %#", async (sequence) => {
      mockAccount(sequence);
      await expect(generateCosmosUnsignedTx(options)).rejects.toThrow(
        "Invalid sequence number:"
      );
    });

    it.each(fixtures.slice(0, 2))(
      "accepts exact numeric sequence %s",
      async (sequence, authHex) => {
        mockAccount(Number(sequence));
        const { rawUnsignedTx } = await generateCosmosUnsignedTx(options);
        expect(Buffer.from(rawUnsignedTx).toString("hex")).toBe(
          bodyHex + authHex + signaturesHex
        );
      }
    );
  }
);
