//@ts-nocheck
/* eslint-disable */
import {
  IdentifiedChannel,
  IdentifiedChannelAmino,
  IdentifiedChannelSDKType,
  PacketState,
  PacketStateAmino,
  PacketStateSDKType,
} from "./channel";
import { Long } from "../../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** GenesisState defines the ibc channel submodule's genesis state. */
export interface GenesisState {
  channels: IdentifiedChannel[];
  acknowledgements: PacketState[];
  commitments: PacketState[];
  receipts: PacketState[];
  sendSequences: PacketSequence[];
  recvSequences: PacketSequence[];
  ackSequences: PacketSequence[];
  /** the sequence for the next generated channel identifier */
  nextChannelSequence: Long;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/ibc.core.channel.v1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the ibc channel submodule's genesis state. */
export interface GenesisStateAmino {
  channels: IdentifiedChannelAmino[];
  acknowledgements: PacketStateAmino[];
  commitments: PacketStateAmino[];
  receipts: PacketStateAmino[];
  send_sequences: PacketSequenceAmino[];
  recv_sequences: PacketSequenceAmino[];
  ack_sequences: PacketSequenceAmino[];
  /** the sequence for the next generated channel identifier */
  next_channel_sequence: string;
}
export interface GenesisStateAminoMsg {
  type: "cosmos-sdk/GenesisState";
  value: GenesisStateAmino;
}
/** GenesisState defines the ibc channel submodule's genesis state. */
export interface GenesisStateSDKType {
  channels: IdentifiedChannelSDKType[];
  acknowledgements: PacketStateSDKType[];
  commitments: PacketStateSDKType[];
  receipts: PacketStateSDKType[];
  send_sequences: PacketSequenceSDKType[];
  recv_sequences: PacketSequenceSDKType[];
  ack_sequences: PacketSequenceSDKType[];
  next_channel_sequence: Long;
}
/**
 * PacketSequence defines the genesis type necessary to retrieve and store
 * next send and receive sequences.
 */
export interface PacketSequence {
  portId: string;
  channelId: string;
  sequence: Long;
}
export interface PacketSequenceProtoMsg {
  typeUrl: "/ibc.core.channel.v1.PacketSequence";
  value: Uint8Array;
}
/**
 * PacketSequence defines the genesis type necessary to retrieve and store
 * next send and receive sequences.
 */
export interface PacketSequenceAmino {
  port_id: string;
  channel_id: string;
  sequence: string;
}
export interface PacketSequenceAminoMsg {
  type: "cosmos-sdk/PacketSequence";
  value: PacketSequenceAmino;
}
/**
 * PacketSequence defines the genesis type necessary to retrieve and store
 * next send and receive sequences.
 */
export interface PacketSequenceSDKType {
  port_id: string;
  channel_id: string;
  sequence: Long;
}
function createBaseGenesisState(): GenesisState {
  return {
    channels: [],
    acknowledgements: [],
    commitments: [],
    receipts: [],
    sendSequences: [],
    recvSequences: [],
    ackSequences: [],
    nextChannelSequence: Long.UZERO,
  };
}
export const GenesisState = {
  typeUrl: "/ibc.core.channel.v1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.channels) {
      IdentifiedChannel.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.acknowledgements) {
      PacketState.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.commitments) {
      PacketState.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.receipts) {
      PacketState.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.sendSequences) {
      PacketSequence.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.recvSequences) {
      PacketSequence.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    for (const v of message.ackSequences) {
      PacketSequence.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (!message.nextChannelSequence.isZero()) {
      writer.uint32(64).uint64(message.nextChannelSequence);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.channels.push(
            IdentifiedChannel.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.acknowledgements.push(
            PacketState.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.commitments.push(PacketState.decode(reader, reader.uint32()));
          break;
        case 4:
          message.receipts.push(PacketState.decode(reader, reader.uint32()));
          break;
        case 5:
          message.sendSequences.push(
            PacketSequence.decode(reader, reader.uint32())
          );
          break;
        case 6:
          message.recvSequences.push(
            PacketSequence.decode(reader, reader.uint32())
          );
          break;
        case 7:
          message.ackSequences.push(
            PacketSequence.decode(reader, reader.uint32())
          );
          break;
        case 8:
          message.nextChannelSequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.channels =
      object.channels?.map((e) => IdentifiedChannel.fromPartial(e)) || [];
    message.acknowledgements =
      object.acknowledgements?.map((e) => PacketState.fromPartial(e)) || [];
    message.commitments =
      object.commitments?.map((e) => PacketState.fromPartial(e)) || [];
    message.receipts =
      object.receipts?.map((e) => PacketState.fromPartial(e)) || [];
    message.sendSequences =
      object.sendSequences?.map((e) => PacketSequence.fromPartial(e)) || [];
    message.recvSequences =
      object.recvSequences?.map((e) => PacketSequence.fromPartial(e)) || [];
    message.ackSequences =
      object.ackSequences?.map((e) => PacketSequence.fromPartial(e)) || [];
    message.nextChannelSequence =
      object.nextChannelSequence !== undefined &&
      object.nextChannelSequence !== null
        ? Long.fromValue(object.nextChannelSequence)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      channels: Array.isArray(object?.channels)
        ? object.channels.map((e: any) => IdentifiedChannel.fromAmino(e))
        : [],
      acknowledgements: Array.isArray(object?.acknowledgements)
        ? object.acknowledgements.map((e: any) => PacketState.fromAmino(e))
        : [],
      commitments: Array.isArray(object?.commitments)
        ? object.commitments.map((e: any) => PacketState.fromAmino(e))
        : [],
      receipts: Array.isArray(object?.receipts)
        ? object.receipts.map((e: any) => PacketState.fromAmino(e))
        : [],
      sendSequences: Array.isArray(object?.send_sequences)
        ? object.send_sequences.map((e: any) => PacketSequence.fromAmino(e))
        : [],
      recvSequences: Array.isArray(object?.recv_sequences)
        ? object.recv_sequences.map((e: any) => PacketSequence.fromAmino(e))
        : [],
      ackSequences: Array.isArray(object?.ack_sequences)
        ? object.ack_sequences.map((e: any) => PacketSequence.fromAmino(e))
        : [],
      nextChannelSequence: Long.fromString(object.next_channel_sequence),
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    if (message.channels) {
      obj.channels = message.channels.map((e) =>
        e ? IdentifiedChannel.toAmino(e) : undefined
      );
    } else {
      obj.channels = [];
    }
    if (message.acknowledgements) {
      obj.acknowledgements = message.acknowledgements.map((e) =>
        e ? PacketState.toAmino(e) : undefined
      );
    } else {
      obj.acknowledgements = [];
    }
    if (message.commitments) {
      obj.commitments = message.commitments.map((e) =>
        e ? PacketState.toAmino(e) : undefined
      );
    } else {
      obj.commitments = [];
    }
    if (message.receipts) {
      obj.receipts = message.receipts.map((e) =>
        e ? PacketState.toAmino(e) : undefined
      );
    } else {
      obj.receipts = [];
    }
    if (message.sendSequences) {
      obj.send_sequences = message.sendSequences.map((e) =>
        e ? PacketSequence.toAmino(e) : undefined
      );
    } else {
      obj.send_sequences = [];
    }
    if (message.recvSequences) {
      obj.recv_sequences = message.recvSequences.map((e) =>
        e ? PacketSequence.toAmino(e) : undefined
      );
    } else {
      obj.recv_sequences = [];
    }
    if (message.ackSequences) {
      obj.ack_sequences = message.ackSequences.map((e) =>
        e ? PacketSequence.toAmino(e) : undefined
      );
    } else {
      obj.ack_sequences = [];
    }
    obj.next_channel_sequence = message.nextChannelSequence
      ? message.nextChannelSequence.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "cosmos-sdk/GenesisState",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/ibc.core.channel.v1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBasePacketSequence(): PacketSequence {
  return {
    portId: "",
    channelId: "",
    sequence: Long.UZERO,
  };
}
export const PacketSequence = {
  typeUrl: "/ibc.core.channel.v1.PacketSequence",
  encode(
    message: PacketSequence,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.portId !== "") {
      writer.uint32(10).string(message.portId);
    }
    if (message.channelId !== "") {
      writer.uint32(18).string(message.channelId);
    }
    if (!message.sequence.isZero()) {
      writer.uint32(24).uint64(message.sequence);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PacketSequence {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePacketSequence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.portId = reader.string();
          break;
        case 2:
          message.channelId = reader.string();
          break;
        case 3:
          message.sequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PacketSequence>): PacketSequence {
    const message = createBasePacketSequence();
    message.portId = object.portId ?? "";
    message.channelId = object.channelId ?? "";
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? Long.fromValue(object.sequence)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: PacketSequenceAmino): PacketSequence {
    return {
      portId: object.port_id,
      channelId: object.channel_id,
      sequence: Long.fromString(object.sequence),
    };
  },
  toAmino(message: PacketSequence): PacketSequenceAmino {
    const obj: any = {};
    obj.port_id = message.portId;
    obj.channel_id = message.channelId;
    obj.sequence = message.sequence ? message.sequence.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: PacketSequenceAminoMsg): PacketSequence {
    return PacketSequence.fromAmino(object.value);
  },
  toAminoMsg(message: PacketSequence): PacketSequenceAminoMsg {
    return {
      type: "cosmos-sdk/PacketSequence",
      value: PacketSequence.toAmino(message),
    };
  },
  fromProtoMsg(message: PacketSequenceProtoMsg): PacketSequence {
    return PacketSequence.decode(message.value);
  },
  toProto(message: PacketSequence): Uint8Array {
    return PacketSequence.encode(message).finish();
  },
  toProtoMsg(message: PacketSequence): PacketSequenceProtoMsg {
    return {
      typeUrl: "/ibc.core.channel.v1.PacketSequence",
      value: PacketSequence.encode(message).finish(),
    };
  },
};
