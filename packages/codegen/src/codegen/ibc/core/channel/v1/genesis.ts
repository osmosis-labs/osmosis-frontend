import { IdentifiedChannel, PacketState } from "./channel";
import * as _m0 from "protobufjs/minimal";
import { Long, isSet, DeepPartial } from "@osmonauts/helpers";

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

/**
 * PacketSequence defines the genesis type necessary to retrieve and store
 * next send and receive sequences.
 */
export interface PacketSequence {
  portId: string;
  channelId: string;
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
    nextChannelSequence: Long.UZERO
  };
}

export const GenesisState = {
  encode(message: GenesisState, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
          message.channels.push(IdentifiedChannel.decode(reader, reader.uint32()));
          break;

        case 2:
          message.acknowledgements.push(PacketState.decode(reader, reader.uint32()));
          break;

        case 3:
          message.commitments.push(PacketState.decode(reader, reader.uint32()));
          break;

        case 4:
          message.receipts.push(PacketState.decode(reader, reader.uint32()));
          break;

        case 5:
          message.sendSequences.push(PacketSequence.decode(reader, reader.uint32()));
          break;

        case 6:
          message.recvSequences.push(PacketSequence.decode(reader, reader.uint32()));
          break;

        case 7:
          message.ackSequences.push(PacketSequence.decode(reader, reader.uint32()));
          break;

        case 8:
          message.nextChannelSequence = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): GenesisState {
    return {
      channels: Array.isArray(object?.channels) ? object.channels.map((e: any) => IdentifiedChannel.fromJSON(e)) : [],
      acknowledgements: Array.isArray(object?.acknowledgements) ? object.acknowledgements.map((e: any) => PacketState.fromJSON(e)) : [],
      commitments: Array.isArray(object?.commitments) ? object.commitments.map((e: any) => PacketState.fromJSON(e)) : [],
      receipts: Array.isArray(object?.receipts) ? object.receipts.map((e: any) => PacketState.fromJSON(e)) : [],
      sendSequences: Array.isArray(object?.sendSequences) ? object.sendSequences.map((e: any) => PacketSequence.fromJSON(e)) : [],
      recvSequences: Array.isArray(object?.recvSequences) ? object.recvSequences.map((e: any) => PacketSequence.fromJSON(e)) : [],
      ackSequences: Array.isArray(object?.ackSequences) ? object.ackSequences.map((e: any) => PacketSequence.fromJSON(e)) : [],
      nextChannelSequence: isSet(object.nextChannelSequence) ? Long.fromString(object.nextChannelSequence) : Long.UZERO
    };
  },

  toJSON(message: GenesisState): unknown {
    const obj: any = {};

    if (message.channels) {
      obj.channels = message.channels.map(e => e ? IdentifiedChannel.toJSON(e) : undefined);
    } else {
      obj.channels = [];
    }

    if (message.acknowledgements) {
      obj.acknowledgements = message.acknowledgements.map(e => e ? PacketState.toJSON(e) : undefined);
    } else {
      obj.acknowledgements = [];
    }

    if (message.commitments) {
      obj.commitments = message.commitments.map(e => e ? PacketState.toJSON(e) : undefined);
    } else {
      obj.commitments = [];
    }

    if (message.receipts) {
      obj.receipts = message.receipts.map(e => e ? PacketState.toJSON(e) : undefined);
    } else {
      obj.receipts = [];
    }

    if (message.sendSequences) {
      obj.sendSequences = message.sendSequences.map(e => e ? PacketSequence.toJSON(e) : undefined);
    } else {
      obj.sendSequences = [];
    }

    if (message.recvSequences) {
      obj.recvSequences = message.recvSequences.map(e => e ? PacketSequence.toJSON(e) : undefined);
    } else {
      obj.recvSequences = [];
    }

    if (message.ackSequences) {
      obj.ackSequences = message.ackSequences.map(e => e ? PacketSequence.toJSON(e) : undefined);
    } else {
      obj.ackSequences = [];
    }

    message.nextChannelSequence !== undefined && (obj.nextChannelSequence = (message.nextChannelSequence || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.channels = object.channels?.map(e => IdentifiedChannel.fromPartial(e)) || [];
    message.acknowledgements = object.acknowledgements?.map(e => PacketState.fromPartial(e)) || [];
    message.commitments = object.commitments?.map(e => PacketState.fromPartial(e)) || [];
    message.receipts = object.receipts?.map(e => PacketState.fromPartial(e)) || [];
    message.sendSequences = object.sendSequences?.map(e => PacketSequence.fromPartial(e)) || [];
    message.recvSequences = object.recvSequences?.map(e => PacketSequence.fromPartial(e)) || [];
    message.ackSequences = object.ackSequences?.map(e => PacketSequence.fromPartial(e)) || [];
    message.nextChannelSequence = object.nextChannelSequence !== undefined && object.nextChannelSequence !== null ? Long.fromValue(object.nextChannelSequence) : Long.UZERO;
    return message;
  }

};

function createBasePacketSequence(): PacketSequence {
  return {
    portId: "",
    channelId: "",
    sequence: Long.UZERO
  };
}

export const PacketSequence = {
  encode(message: PacketSequence, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
          message.sequence = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): PacketSequence {
    return {
      portId: isSet(object.portId) ? String(object.portId) : "",
      channelId: isSet(object.channelId) ? String(object.channelId) : "",
      sequence: isSet(object.sequence) ? Long.fromString(object.sequence) : Long.UZERO
    };
  },

  toJSON(message: PacketSequence): unknown {
    const obj: any = {};
    message.portId !== undefined && (obj.portId = message.portId);
    message.channelId !== undefined && (obj.channelId = message.channelId);
    message.sequence !== undefined && (obj.sequence = (message.sequence || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<PacketSequence>): PacketSequence {
    const message = createBasePacketSequence();
    message.portId = object.portId ?? "";
    message.channelId = object.channelId ?? "";
    message.sequence = object.sequence !== undefined && object.sequence !== null ? Long.fromValue(object.sequence) : Long.UZERO;
    return message;
  }

};