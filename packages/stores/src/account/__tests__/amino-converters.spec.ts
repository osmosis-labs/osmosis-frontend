import { Registry } from "@cosmjs/proto-signing";
import { AminoTypes } from "@cosmjs/stargate";
import { ibcProtoRegistry } from "@osmosis-labs/proto-codecs";
import { MsgTransfer as LocalMsgTransfer } from "@osmosis-labs/proto-codecs/build/codegen/ibc/applications/transfer/v1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

import { getAminoConverters } from "../amino-converters";

describe("IBC transfer Amino conversion", () => {
  it.each(["0", "9007199254740993", "18446744073709551615"])(
    "round trips uint64 timeouts %s and memo",
    async (value) => {
      const converter = (await getAminoConverters())[
        "/ibc.applications.transfer.v1.MsgTransfer"
      ];
      const message = MsgTransfer.fromPartial({
        sourcePort: "transfer",
        sourceChannel: "channel-0",
        sender: "osmo1sender",
        receiver: "cosmos1receiver",
        token: { denom: "uosmo", amount: "123" },
        timeoutHeight: {
          revisionNumber: BigInt(value),
          revisionHeight: BigInt(value),
        },
        timeoutTimestamp: BigInt(value),
        memo: '{"forward":{"receiver":"destination"}}',
      });
      const amino = converter.toAmino(message);
      if (value === "0") {
        expect(amino).not.toHaveProperty("timeout_timestamp");
      } else {
        expect(amino.timeout_timestamp).toBe(value);
      }
      expect(amino.timeout_height).toEqual({
        revision_height: value,
        revision_number: value === "0" ? undefined : value,
      });
      expect(amino.memo).toBe(message.memo);
      const restored = converter.fromAmino(amino);
      expect(restored).toEqual(message);
      expect(MsgTransfer.encode(restored).finish()).toEqual(
        MsgTransfer.encode(message).finish()
      );
    }
  );

  it("defaults omitted timeout and memo fields to modern codec values", async () => {
    const converter = (await getAminoConverters())[
      "/ibc.applications.transfer.v1.MsgTransfer"
    ];
    const restored = converter.fromAmino({});
    expect(restored).toEqual(MsgTransfer.fromPartial({}));
    expect(() => MsgTransfer.encode(restored).finish()).not.toThrow();
    const amino = converter.toAmino(restored);
    expect(amino).not.toHaveProperty("timeout_timestamp");
    expect(amino).not.toHaveProperty("memo");
  });

  it.each(["", '{"forward":{"receiver":"destination"}}'])(
    "preserves signing JSON after registry normalization with memo %s",
    async (memo) => {
      const typeUrl = "/ibc.applications.transfer.v1.MsgTransfer";
      const registry = new Registry(ibcProtoRegistry);
      const message = LocalMsgTransfer.fromPartial({
        sourcePort: "transfer",
        sourceChannel: "channel-0",
        sender: "osmo1sender",
        receiver: "cosmos1receiver",
        token: { denom: "uosmo", amount: "123" },
        timeoutHeight: {
          revisionNumber: BigInt(1),
          revisionHeight: BigInt(12345),
        },
        memo,
      });
      const normalized = registry.decode({
        typeUrl,
        value: registry.encode({ typeUrl, value: message }),
      });
      const aminoTypes = new AminoTypes(await getAminoConverters());
      const aminoMessage = aminoTypes.toAmino({ typeUrl, value: normalized });
      expect(aminoMessage.value).toEqual({
        source_port: "transfer",
        source_channel: "channel-0",
        sender: "osmo1sender",
        receiver: "cosmos1receiver",
        token: { denom: "uosmo", amount: "123" },
        timeout_height: { revision_number: "1", revision_height: "12345" },
        ...(memo && { memo }),
      });
    }
  );
});
