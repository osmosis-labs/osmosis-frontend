//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import { base64FromBytes, bytesFromBase64 } from "../../../helpers";
/** MsgIBCSend */
export interface MsgIBCSend {
  /** the channel by which the packet will be sent */
  channel: string;
  /**
   * Timeout height relative to the current block height.
   * The timeout is disabled when set to 0.
   */
  timeoutHeight: bigint;
  /**
   * Timeout timestamp (in nanoseconds) relative to the current block timestamp.
   * The timeout is disabled when set to 0.
   */
  timeoutTimestamp: bigint;
  /**
   * Data is the payload to transfer. We must not make assumption what format or
   * content is in here.
   */
  data: Uint8Array;
}
export interface MsgIBCSendProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.MsgIBCSend";
  value: Uint8Array;
}
/** MsgIBCSend */
export interface MsgIBCSendAmino {
  /** the channel by which the packet will be sent */
  channel?: string;
  /**
   * Timeout height relative to the current block height.
   * The timeout is disabled when set to 0.
   */
  timeout_height?: string;
  /**
   * Timeout timestamp (in nanoseconds) relative to the current block timestamp.
   * The timeout is disabled when set to 0.
   */
  timeout_timestamp?: string;
  /**
   * Data is the payload to transfer. We must not make assumption what format or
   * content is in here.
   */
  data?: string;
}
export interface MsgIBCSendAminoMsg {
  type: "wasm/MsgIBCSend";
  value: MsgIBCSendAmino;
}
/** MsgIBCSend */
export interface MsgIBCSendSDKType {
  channel: string;
  timeout_height: bigint;
  timeout_timestamp: bigint;
  data: Uint8Array;
}
/** MsgIBCSendResponse */
export interface MsgIBCSendResponse {
  /** Sequence number of the IBC packet sent */
  sequence: bigint;
}
export interface MsgIBCSendResponseProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.MsgIBCSendResponse";
  value: Uint8Array;
}
/** MsgIBCSendResponse */
export interface MsgIBCSendResponseAmino {
  /** Sequence number of the IBC packet sent */
  sequence?: string;
}
export interface MsgIBCSendResponseAminoMsg {
  type: "wasm/MsgIBCSendResponse";
  value: MsgIBCSendResponseAmino;
}
/** MsgIBCSendResponse */
export interface MsgIBCSendResponseSDKType {
  sequence: bigint;
}
/** MsgIBCCloseChannel port and channel need to be owned by the contract */
export interface MsgIBCCloseChannel {
  channel: string;
}
export interface MsgIBCCloseChannelProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.MsgIBCCloseChannel";
  value: Uint8Array;
}
/** MsgIBCCloseChannel port and channel need to be owned by the contract */
export interface MsgIBCCloseChannelAmino {
  channel?: string;
}
export interface MsgIBCCloseChannelAminoMsg {
  type: "wasm/MsgIBCCloseChannel";
  value: MsgIBCCloseChannelAmino;
}
/** MsgIBCCloseChannel port and channel need to be owned by the contract */
export interface MsgIBCCloseChannelSDKType {
  channel: string;
}
function createBaseMsgIBCSend(): MsgIBCSend {
  return {
    channel: "",
    timeoutHeight: BigInt(0),
    timeoutTimestamp: BigInt(0),
    data: new Uint8Array(),
  };
}
export const MsgIBCSend = {
  typeUrl: "/cosmwasm.wasm.v1.MsgIBCSend",
  encode(
    message: MsgIBCSend,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.channel !== "") {
      writer.uint32(18).string(message.channel);
    }
    if (message.timeoutHeight !== BigInt(0)) {
      writer.uint32(32).uint64(message.timeoutHeight);
    }
    if (message.timeoutTimestamp !== BigInt(0)) {
      writer.uint32(40).uint64(message.timeoutTimestamp);
    }
    if (message.data.length !== 0) {
      writer.uint32(50).bytes(message.data);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgIBCSend {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgIBCSend();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.channel = reader.string();
          break;
        case 4:
          message.timeoutHeight = reader.uint64();
          break;
        case 5:
          message.timeoutTimestamp = reader.uint64();
          break;
        case 6:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgIBCSend>): MsgIBCSend {
    const message = createBaseMsgIBCSend();
    message.channel = object.channel ?? "";
    message.timeoutHeight =
      object.timeoutHeight !== undefined && object.timeoutHeight !== null
        ? BigInt(object.timeoutHeight.toString())
        : BigInt(0);
    message.timeoutTimestamp =
      object.timeoutTimestamp !== undefined && object.timeoutTimestamp !== null
        ? BigInt(object.timeoutTimestamp.toString())
        : BigInt(0);
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgIBCSendAmino): MsgIBCSend {
    const message = createBaseMsgIBCSend();
    if (object.channel !== undefined && object.channel !== null) {
      message.channel = object.channel;
    }
    if (object.timeout_height !== undefined && object.timeout_height !== null) {
      message.timeoutHeight = BigInt(object.timeout_height);
    }
    if (
      object.timeout_timestamp !== undefined &&
      object.timeout_timestamp !== null
    ) {
      message.timeoutTimestamp = BigInt(object.timeout_timestamp);
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },
  toAmino(message: MsgIBCSend): MsgIBCSendAmino {
    const obj: any = {};
    obj.channel = message.channel === "" ? undefined : message.channel;
    obj.timeout_height =
      message.timeoutHeight !== BigInt(0)
        ? message.timeoutHeight.toString()
        : undefined;
    obj.timeout_timestamp =
      message.timeoutTimestamp !== BigInt(0)
        ? message.timeoutTimestamp.toString()
        : undefined;
    obj.data = message.data ? base64FromBytes(message.data) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgIBCSendAminoMsg): MsgIBCSend {
    return MsgIBCSend.fromAmino(object.value);
  },
  toAminoMsg(message: MsgIBCSend): MsgIBCSendAminoMsg {
    return {
      type: "wasm/MsgIBCSend",
      value: MsgIBCSend.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgIBCSendProtoMsg): MsgIBCSend {
    return MsgIBCSend.decode(message.value);
  },
  toProto(message: MsgIBCSend): Uint8Array {
    return MsgIBCSend.encode(message).finish();
  },
  toProtoMsg(message: MsgIBCSend): MsgIBCSendProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MsgIBCSend",
      value: MsgIBCSend.encode(message).finish(),
    };
  },
};
function createBaseMsgIBCSendResponse(): MsgIBCSendResponse {
  return {
    sequence: BigInt(0),
  };
}
export const MsgIBCSendResponse = {
  typeUrl: "/cosmwasm.wasm.v1.MsgIBCSendResponse",
  encode(
    message: MsgIBCSendResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sequence !== BigInt(0)) {
      writer.uint32(8).uint64(message.sequence);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgIBCSendResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgIBCSendResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgIBCSendResponse>): MsgIBCSendResponse {
    const message = createBaseMsgIBCSendResponse();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? BigInt(object.sequence.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgIBCSendResponseAmino): MsgIBCSendResponse {
    const message = createBaseMsgIBCSendResponse();
    if (object.sequence !== undefined && object.sequence !== null) {
      message.sequence = BigInt(object.sequence);
    }
    return message;
  },
  toAmino(message: MsgIBCSendResponse): MsgIBCSendResponseAmino {
    const obj: any = {};
    obj.sequence =
      message.sequence !== BigInt(0) ? message.sequence.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgIBCSendResponseAminoMsg): MsgIBCSendResponse {
    return MsgIBCSendResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgIBCSendResponse): MsgIBCSendResponseAminoMsg {
    return {
      type: "wasm/MsgIBCSendResponse",
      value: MsgIBCSendResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgIBCSendResponseProtoMsg): MsgIBCSendResponse {
    return MsgIBCSendResponse.decode(message.value);
  },
  toProto(message: MsgIBCSendResponse): Uint8Array {
    return MsgIBCSendResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgIBCSendResponse): MsgIBCSendResponseProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MsgIBCSendResponse",
      value: MsgIBCSendResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgIBCCloseChannel(): MsgIBCCloseChannel {
  return {
    channel: "",
  };
}
export const MsgIBCCloseChannel = {
  typeUrl: "/cosmwasm.wasm.v1.MsgIBCCloseChannel",
  encode(
    message: MsgIBCCloseChannel,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.channel !== "") {
      writer.uint32(18).string(message.channel);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgIBCCloseChannel {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgIBCCloseChannel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.channel = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgIBCCloseChannel>): MsgIBCCloseChannel {
    const message = createBaseMsgIBCCloseChannel();
    message.channel = object.channel ?? "";
    return message;
  },
  fromAmino(object: MsgIBCCloseChannelAmino): MsgIBCCloseChannel {
    const message = createBaseMsgIBCCloseChannel();
    if (object.channel !== undefined && object.channel !== null) {
      message.channel = object.channel;
    }
    return message;
  },
  toAmino(message: MsgIBCCloseChannel): MsgIBCCloseChannelAmino {
    const obj: any = {};
    obj.channel = message.channel === "" ? undefined : message.channel;
    return obj;
  },
  fromAminoMsg(object: MsgIBCCloseChannelAminoMsg): MsgIBCCloseChannel {
    return MsgIBCCloseChannel.fromAmino(object.value);
  },
  toAminoMsg(message: MsgIBCCloseChannel): MsgIBCCloseChannelAminoMsg {
    return {
      type: "wasm/MsgIBCCloseChannel",
      value: MsgIBCCloseChannel.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgIBCCloseChannelProtoMsg): MsgIBCCloseChannel {
    return MsgIBCCloseChannel.decode(message.value);
  },
  toProto(message: MsgIBCCloseChannel): Uint8Array {
    return MsgIBCCloseChannel.encode(message).finish();
  },
  toProtoMsg(message: MsgIBCCloseChannel): MsgIBCCloseChannelProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.MsgIBCCloseChannel",
      value: MsgIBCCloseChannel.encode(message).finish(),
    };
  },
};
