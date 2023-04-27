//@ts-nocheck
/* eslint-disable */
import {
  InterchainAccountPacketData,
  InterchainAccountPacketDataAmino,
  InterchainAccountPacketDataSDKType,
} from "../../v1/packet";
import { Long } from "../../../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** MsgRegisterInterchainAccount defines the payload for Msg/RegisterAccount */
export interface MsgRegisterInterchainAccount {
  owner: string;
  connectionId: string;
  version: string;
}
export interface MsgRegisterInterchainAccountProtoMsg {
  typeUrl: "/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccount";
  value: Uint8Array;
}
/** MsgRegisterInterchainAccount defines the payload for Msg/RegisterAccount */
export interface MsgRegisterInterchainAccountAmino {
  owner: string;
  connection_id: string;
  version: string;
}
export interface MsgRegisterInterchainAccountAminoMsg {
  type: "cosmos-sdk/MsgRegisterInterchainAccount";
  value: MsgRegisterInterchainAccountAmino;
}
/** MsgRegisterInterchainAccount defines the payload for Msg/RegisterAccount */
export interface MsgRegisterInterchainAccountSDKType {
  owner: string;
  connection_id: string;
  version: string;
}
/** MsgRegisterInterchainAccountResponse defines the response for Msg/RegisterAccount */
export interface MsgRegisterInterchainAccountResponse {
  channelId: string;
  portId: string;
}
export interface MsgRegisterInterchainAccountResponseProtoMsg {
  typeUrl: "/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccountResponse";
  value: Uint8Array;
}
/** MsgRegisterInterchainAccountResponse defines the response for Msg/RegisterAccount */
export interface MsgRegisterInterchainAccountResponseAmino {
  channel_id: string;
  port_id: string;
}
export interface MsgRegisterInterchainAccountResponseAminoMsg {
  type: "cosmos-sdk/MsgRegisterInterchainAccountResponse";
  value: MsgRegisterInterchainAccountResponseAmino;
}
/** MsgRegisterInterchainAccountResponse defines the response for Msg/RegisterAccount */
export interface MsgRegisterInterchainAccountResponseSDKType {
  channel_id: string;
  port_id: string;
}
/** MsgSendTx defines the payload for Msg/SendTx */
export interface MsgSendTx {
  owner: string;
  connectionId: string;
  packetData?: InterchainAccountPacketData;
  /**
   * Relative timeout timestamp provided will be added to the current block time during transaction execution.
   * The timeout timestamp must be non-zero.
   */
  relativeTimeout: Long;
}
export interface MsgSendTxProtoMsg {
  typeUrl: "/ibc.applications.interchain_accounts.controller.v1.MsgSendTx";
  value: Uint8Array;
}
/** MsgSendTx defines the payload for Msg/SendTx */
export interface MsgSendTxAmino {
  owner: string;
  connection_id: string;
  packet_data?: InterchainAccountPacketDataAmino;
  /**
   * Relative timeout timestamp provided will be added to the current block time during transaction execution.
   * The timeout timestamp must be non-zero.
   */
  relative_timeout: string;
}
export interface MsgSendTxAminoMsg {
  type: "cosmos-sdk/MsgSendTx";
  value: MsgSendTxAmino;
}
/** MsgSendTx defines the payload for Msg/SendTx */
export interface MsgSendTxSDKType {
  owner: string;
  connection_id: string;
  packet_data?: InterchainAccountPacketDataSDKType;
  relative_timeout: Long;
}
/** MsgSendTxResponse defines the response for MsgSendTx */
export interface MsgSendTxResponse {
  sequence: Long;
}
export interface MsgSendTxResponseProtoMsg {
  typeUrl: "/ibc.applications.interchain_accounts.controller.v1.MsgSendTxResponse";
  value: Uint8Array;
}
/** MsgSendTxResponse defines the response for MsgSendTx */
export interface MsgSendTxResponseAmino {
  sequence: string;
}
export interface MsgSendTxResponseAminoMsg {
  type: "cosmos-sdk/MsgSendTxResponse";
  value: MsgSendTxResponseAmino;
}
/** MsgSendTxResponse defines the response for MsgSendTx */
export interface MsgSendTxResponseSDKType {
  sequence: Long;
}
function createBaseMsgRegisterInterchainAccount(): MsgRegisterInterchainAccount {
  return {
    owner: "",
    connectionId: "",
    version: "",
  };
}
export const MsgRegisterInterchainAccount = {
  typeUrl:
    "/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccount",
  encode(
    message: MsgRegisterInterchainAccount,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.connectionId !== "") {
      writer.uint32(18).string(message.connectionId);
    }
    if (message.version !== "") {
      writer.uint32(26).string(message.version);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRegisterInterchainAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterInterchainAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.connectionId = reader.string();
          break;
        case 3:
          message.version = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgRegisterInterchainAccount>
  ): MsgRegisterInterchainAccount {
    const message = createBaseMsgRegisterInterchainAccount();
    message.owner = object.owner ?? "";
    message.connectionId = object.connectionId ?? "";
    message.version = object.version ?? "";
    return message;
  },
  fromAmino(
    object: MsgRegisterInterchainAccountAmino
  ): MsgRegisterInterchainAccount {
    return {
      owner: object.owner,
      connectionId: object.connection_id,
      version: object.version,
    };
  },
  toAmino(
    message: MsgRegisterInterchainAccount
  ): MsgRegisterInterchainAccountAmino {
    const obj: any = {};
    obj.owner = message.owner;
    obj.connection_id = message.connectionId;
    obj.version = message.version;
    return obj;
  },
  fromAminoMsg(
    object: MsgRegisterInterchainAccountAminoMsg
  ): MsgRegisterInterchainAccount {
    return MsgRegisterInterchainAccount.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgRegisterInterchainAccount
  ): MsgRegisterInterchainAccountAminoMsg {
    return {
      type: "cosmos-sdk/MsgRegisterInterchainAccount",
      value: MsgRegisterInterchainAccount.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgRegisterInterchainAccountProtoMsg
  ): MsgRegisterInterchainAccount {
    return MsgRegisterInterchainAccount.decode(message.value);
  },
  toProto(message: MsgRegisterInterchainAccount): Uint8Array {
    return MsgRegisterInterchainAccount.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRegisterInterchainAccount
  ): MsgRegisterInterchainAccountProtoMsg {
    return {
      typeUrl:
        "/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccount",
      value: MsgRegisterInterchainAccount.encode(message).finish(),
    };
  },
};
function createBaseMsgRegisterInterchainAccountResponse(): MsgRegisterInterchainAccountResponse {
  return {
    channelId: "",
    portId: "",
  };
}
export const MsgRegisterInterchainAccountResponse = {
  typeUrl:
    "/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccountResponse",
  encode(
    message: MsgRegisterInterchainAccountResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.channelId !== "") {
      writer.uint32(10).string(message.channelId);
    }
    if (message.portId !== "") {
      writer.uint32(18).string(message.portId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgRegisterInterchainAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRegisterInterchainAccountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.channelId = reader.string();
          break;
        case 2:
          message.portId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgRegisterInterchainAccountResponse>
  ): MsgRegisterInterchainAccountResponse {
    const message = createBaseMsgRegisterInterchainAccountResponse();
    message.channelId = object.channelId ?? "";
    message.portId = object.portId ?? "";
    return message;
  },
  fromAmino(
    object: MsgRegisterInterchainAccountResponseAmino
  ): MsgRegisterInterchainAccountResponse {
    return {
      channelId: object.channel_id,
      portId: object.port_id,
    };
  },
  toAmino(
    message: MsgRegisterInterchainAccountResponse
  ): MsgRegisterInterchainAccountResponseAmino {
    const obj: any = {};
    obj.channel_id = message.channelId;
    obj.port_id = message.portId;
    return obj;
  },
  fromAminoMsg(
    object: MsgRegisterInterchainAccountResponseAminoMsg
  ): MsgRegisterInterchainAccountResponse {
    return MsgRegisterInterchainAccountResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgRegisterInterchainAccountResponse
  ): MsgRegisterInterchainAccountResponseAminoMsg {
    return {
      type: "cosmos-sdk/MsgRegisterInterchainAccountResponse",
      value: MsgRegisterInterchainAccountResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgRegisterInterchainAccountResponseProtoMsg
  ): MsgRegisterInterchainAccountResponse {
    return MsgRegisterInterchainAccountResponse.decode(message.value);
  },
  toProto(message: MsgRegisterInterchainAccountResponse): Uint8Array {
    return MsgRegisterInterchainAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRegisterInterchainAccountResponse
  ): MsgRegisterInterchainAccountResponseProtoMsg {
    return {
      typeUrl:
        "/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccountResponse",
      value: MsgRegisterInterchainAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSendTx(): MsgSendTx {
  return {
    owner: "",
    connectionId: "",
    packetData: undefined,
    relativeTimeout: Long.UZERO,
  };
}
export const MsgSendTx = {
  typeUrl: "/ibc.applications.interchain_accounts.controller.v1.MsgSendTx",
  encode(
    message: MsgSendTx,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.connectionId !== "") {
      writer.uint32(18).string(message.connectionId);
    }
    if (message.packetData !== undefined) {
      InterchainAccountPacketData.encode(
        message.packetData,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (!message.relativeTimeout.isZero()) {
      writer.uint32(32).uint64(message.relativeTimeout);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendTx {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendTx();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.connectionId = reader.string();
          break;
        case 3:
          message.packetData = InterchainAccountPacketData.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.relativeTimeout = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSendTx>): MsgSendTx {
    const message = createBaseMsgSendTx();
    message.owner = object.owner ?? "";
    message.connectionId = object.connectionId ?? "";
    message.packetData =
      object.packetData !== undefined && object.packetData !== null
        ? InterchainAccountPacketData.fromPartial(object.packetData)
        : undefined;
    message.relativeTimeout =
      object.relativeTimeout !== undefined && object.relativeTimeout !== null
        ? Long.fromValue(object.relativeTimeout)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgSendTxAmino): MsgSendTx {
    return {
      owner: object.owner,
      connectionId: object.connection_id,
      packetData: object?.packet_data
        ? InterchainAccountPacketData.fromAmino(object.packet_data)
        : undefined,
      relativeTimeout: Long.fromString(object.relative_timeout),
    };
  },
  toAmino(message: MsgSendTx): MsgSendTxAmino {
    const obj: any = {};
    obj.owner = message.owner;
    obj.connection_id = message.connectionId;
    obj.packet_data = message.packetData
      ? InterchainAccountPacketData.toAmino(message.packetData)
      : undefined;
    obj.relative_timeout = message.relativeTimeout
      ? message.relativeTimeout.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSendTxAminoMsg): MsgSendTx {
    return MsgSendTx.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSendTx): MsgSendTxAminoMsg {
    return {
      type: "cosmos-sdk/MsgSendTx",
      value: MsgSendTx.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSendTxProtoMsg): MsgSendTx {
    return MsgSendTx.decode(message.value);
  },
  toProto(message: MsgSendTx): Uint8Array {
    return MsgSendTx.encode(message).finish();
  },
  toProtoMsg(message: MsgSendTx): MsgSendTxProtoMsg {
    return {
      typeUrl: "/ibc.applications.interchain_accounts.controller.v1.MsgSendTx",
      value: MsgSendTx.encode(message).finish(),
    };
  },
};
function createBaseMsgSendTxResponse(): MsgSendTxResponse {
  return {
    sequence: Long.UZERO,
  };
}
export const MsgSendTxResponse = {
  typeUrl:
    "/ibc.applications.interchain_accounts.controller.v1.MsgSendTxResponse",
  encode(
    message: MsgSendTxResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.sequence.isZero()) {
      writer.uint32(8).uint64(message.sequence);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSendTxResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSendTxResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSendTxResponse>): MsgSendTxResponse {
    const message = createBaseMsgSendTxResponse();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? Long.fromValue(object.sequence)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgSendTxResponseAmino): MsgSendTxResponse {
    return {
      sequence: Long.fromString(object.sequence),
    };
  },
  toAmino(message: MsgSendTxResponse): MsgSendTxResponseAmino {
    const obj: any = {};
    obj.sequence = message.sequence ? message.sequence.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSendTxResponseAminoMsg): MsgSendTxResponse {
    return MsgSendTxResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSendTxResponse): MsgSendTxResponseAminoMsg {
    return {
      type: "cosmos-sdk/MsgSendTxResponse",
      value: MsgSendTxResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSendTxResponseProtoMsg): MsgSendTxResponse {
    return MsgSendTxResponse.decode(message.value);
  },
  toProto(message: MsgSendTxResponse): Uint8Array {
    return MsgSendTxResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgSendTxResponse): MsgSendTxResponseProtoMsg {
    return {
      typeUrl:
        "/ibc.applications.interchain_accounts.controller.v1.MsgSendTxResponse",
      value: MsgSendTxResponse.encode(message).finish(),
    };
  },
};
