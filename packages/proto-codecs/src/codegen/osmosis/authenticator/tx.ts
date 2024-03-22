//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticator {
  sender: string;
  type: string;
  data: Uint8Array;
}
export interface MsgAddAuthenticatorProtoMsg {
  typeUrl: "/osmosis.authenticator.MsgAddAuthenticator";
  value: Uint8Array;
}
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticatorAmino {
  sender: string;
  type: string;
  data: Uint8Array;
}
export interface MsgAddAuthenticatorAminoMsg {
  type: "osmosis/authenticator/add-authenticator";
  value: MsgAddAuthenticatorAmino;
}
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticatorSDKType {
  sender: string;
  type: string;
  data: Uint8Array;
}
/** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
export interface MsgAddAuthenticatorResponse {
  /** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
  success: boolean;
}
export interface MsgAddAuthenticatorResponseProtoMsg {
  typeUrl: "/osmosis.authenticator.MsgAddAuthenticatorResponse";
  value: Uint8Array;
}
/** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
export interface MsgAddAuthenticatorResponseAmino {
  /** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
  success: boolean;
}
export interface MsgAddAuthenticatorResponseAminoMsg {
  type: "osmosis/authenticator/add-authenticator-response";
  value: MsgAddAuthenticatorResponseAmino;
}
/** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
export interface MsgAddAuthenticatorResponseSDKType {
  success: boolean;
}
/**
 * MsgRemoveAuthenticatorRequest defines the Msg/RemoveAuthenticator request
 * type.
 */
export interface MsgRemoveAuthenticator {
  sender: string;
  id: bigint;
}
export interface MsgRemoveAuthenticatorProtoMsg {
  typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticator";
  value: Uint8Array;
}
/**
 * MsgRemoveAuthenticatorRequest defines the Msg/RemoveAuthenticator request
 * type.
 */
export interface MsgRemoveAuthenticatorAmino {
  sender: string;
  id: string;
}
export interface MsgRemoveAuthenticatorAminoMsg {
  type: "osmosis/authenticator/remove-authenticator";
  value: MsgRemoveAuthenticatorAmino;
}
/**
 * MsgRemoveAuthenticatorRequest defines the Msg/RemoveAuthenticator request
 * type.
 */
export interface MsgRemoveAuthenticatorSDKType {
  sender: string;
  id: bigint;
}
/**
 * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
 * type.
 */
export interface MsgRemoveAuthenticatorResponse {
  /**
   * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
   * type.
   */
  success: boolean;
}
export interface MsgRemoveAuthenticatorResponseProtoMsg {
  typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticatorResponse";
  value: Uint8Array;
}
/**
 * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
 * type.
 */
export interface MsgRemoveAuthenticatorResponseAmino {
  /**
   * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
   * type.
   */
  success: boolean;
}
export interface MsgRemoveAuthenticatorResponseAminoMsg {
  type: "osmosis/authenticator/remove-authenticator-response";
  value: MsgRemoveAuthenticatorResponseAmino;
}
/**
 * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
 * type.
 */
export interface MsgRemoveAuthenticatorResponseSDKType {
  success: boolean;
}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtension {
  /**
   * selected_authenticators holds indices for the chosen authenticators per
   * message.
   */
  selectedAuthenticators: number[];
}
export interface TxExtensionProtoMsg {
  typeUrl: "/osmosis.authenticator.TxExtension";
  value: Uint8Array;
}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtensionAmino {
  /**
   * selected_authenticators holds indices for the chosen authenticators per
   * message.
   */
  selected_authenticators: number[];
}
export interface TxExtensionAminoMsg {
  type: "osmosis/authenticator/tx-extension";
  value: TxExtensionAmino;
}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtensionSDKType {
  selected_authenticators: number[];
}
function createBaseMsgAddAuthenticator(): MsgAddAuthenticator {
  return {
    sender: "",
    type: "",
    data: new Uint8Array(),
  };
}
export const MsgAddAuthenticator = {
  typeUrl: "/osmosis.authenticator.MsgAddAuthenticator",
  encode(
    message: MsgAddAuthenticator,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.type !== "") {
      writer.uint32(18).string(message.type);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgAddAuthenticator {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddAuthenticator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.type = reader.string();
          break;
        case 3:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAddAuthenticator>): MsgAddAuthenticator {
    const message = createBaseMsgAddAuthenticator();
    message.sender = object.sender ?? "";
    message.type = object.type ?? "";
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgAddAuthenticatorAmino): MsgAddAuthenticator {
    return {
      sender: object.sender,
      type: object.type,
      data: object.data,
    };
  },
  toAmino(message: MsgAddAuthenticator): MsgAddAuthenticatorAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.type = message.type;
    obj.data = message.data;
    return obj;
  },
  fromAminoMsg(object: MsgAddAuthenticatorAminoMsg): MsgAddAuthenticator {
    return MsgAddAuthenticator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAddAuthenticator): MsgAddAuthenticatorAminoMsg {
    return {
      type: "osmosis/authenticator/add-authenticator",
      value: MsgAddAuthenticator.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgAddAuthenticatorProtoMsg): MsgAddAuthenticator {
    return MsgAddAuthenticator.decode(message.value);
  },
  toProto(message: MsgAddAuthenticator): Uint8Array {
    return MsgAddAuthenticator.encode(message).finish();
  },
  toProtoMsg(message: MsgAddAuthenticator): MsgAddAuthenticatorProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.MsgAddAuthenticator",
      value: MsgAddAuthenticator.encode(message).finish(),
    };
  },
};
function createBaseMsgAddAuthenticatorResponse(): MsgAddAuthenticatorResponse {
  return {
    success: false,
  };
}
export const MsgAddAuthenticatorResponse = {
  typeUrl: "/osmosis.authenticator.MsgAddAuthenticatorResponse",
  encode(
    message: MsgAddAuthenticatorResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgAddAuthenticatorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddAuthenticatorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgAddAuthenticatorResponse>
  ): MsgAddAuthenticatorResponse {
    const message = createBaseMsgAddAuthenticatorResponse();
    message.success = object.success ?? false;
    return message;
  },
  fromAmino(
    object: MsgAddAuthenticatorResponseAmino
  ): MsgAddAuthenticatorResponse {
    return {
      success: object.success,
    };
  },
  toAmino(
    message: MsgAddAuthenticatorResponse
  ): MsgAddAuthenticatorResponseAmino {
    const obj: any = {};
    obj.success = message.success;
    return obj;
  },
  fromAminoMsg(
    object: MsgAddAuthenticatorResponseAminoMsg
  ): MsgAddAuthenticatorResponse {
    return MsgAddAuthenticatorResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgAddAuthenticatorResponse
  ): MsgAddAuthenticatorResponseAminoMsg {
    return {
      type: "osmosis/authenticator/add-authenticator-response",
      value: MsgAddAuthenticatorResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgAddAuthenticatorResponseProtoMsg
  ): MsgAddAuthenticatorResponse {
    return MsgAddAuthenticatorResponse.decode(message.value);
  },
  toProto(message: MsgAddAuthenticatorResponse): Uint8Array {
    return MsgAddAuthenticatorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgAddAuthenticatorResponse
  ): MsgAddAuthenticatorResponseProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.MsgAddAuthenticatorResponse",
      value: MsgAddAuthenticatorResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgRemoveAuthenticator(): MsgRemoveAuthenticator {
  return {
    sender: "",
    id: BigInt(0),
  };
}
export const MsgRemoveAuthenticator = {
  typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticator",
  encode(
    message: MsgRemoveAuthenticator,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.id !== BigInt(0)) {
      writer.uint32(16).uint64(message.id);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgRemoveAuthenticator {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveAuthenticator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.id = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgRemoveAuthenticator>): MsgRemoveAuthenticator {
    const message = createBaseMsgRemoveAuthenticator();
    message.sender = object.sender ?? "";
    message.id =
      object.id !== undefined && object.id !== null
        ? BigInt(object.id.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgRemoveAuthenticatorAmino): MsgRemoveAuthenticator {
    return {
      sender: object.sender,
      id: BigInt(object.id),
    };
  },
  toAmino(message: MsgRemoveAuthenticator): MsgRemoveAuthenticatorAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.id = message.id ? message.id.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgRemoveAuthenticatorAminoMsg): MsgRemoveAuthenticator {
    return MsgRemoveAuthenticator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRemoveAuthenticator): MsgRemoveAuthenticatorAminoMsg {
    return {
      type: "osmosis/authenticator/remove-authenticator",
      value: MsgRemoveAuthenticator.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgRemoveAuthenticatorProtoMsg
  ): MsgRemoveAuthenticator {
    return MsgRemoveAuthenticator.decode(message.value);
  },
  toProto(message: MsgRemoveAuthenticator): Uint8Array {
    return MsgRemoveAuthenticator.encode(message).finish();
  },
  toProtoMsg(message: MsgRemoveAuthenticator): MsgRemoveAuthenticatorProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticator",
      value: MsgRemoveAuthenticator.encode(message).finish(),
    };
  },
};
function createBaseMsgRemoveAuthenticatorResponse(): MsgRemoveAuthenticatorResponse {
  return {
    success: false,
  };
}
export const MsgRemoveAuthenticatorResponse = {
  typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticatorResponse",
  encode(
    message: MsgRemoveAuthenticatorResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.success === true) {
      writer.uint32(8).bool(message.success);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgRemoveAuthenticatorResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRemoveAuthenticatorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.success = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgRemoveAuthenticatorResponse>
  ): MsgRemoveAuthenticatorResponse {
    const message = createBaseMsgRemoveAuthenticatorResponse();
    message.success = object.success ?? false;
    return message;
  },
  fromAmino(
    object: MsgRemoveAuthenticatorResponseAmino
  ): MsgRemoveAuthenticatorResponse {
    return {
      success: object.success,
    };
  },
  toAmino(
    message: MsgRemoveAuthenticatorResponse
  ): MsgRemoveAuthenticatorResponseAmino {
    const obj: any = {};
    obj.success = message.success;
    return obj;
  },
  fromAminoMsg(
    object: MsgRemoveAuthenticatorResponseAminoMsg
  ): MsgRemoveAuthenticatorResponse {
    return MsgRemoveAuthenticatorResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgRemoveAuthenticatorResponse
  ): MsgRemoveAuthenticatorResponseAminoMsg {
    return {
      type: "osmosis/authenticator/remove-authenticator-response",
      value: MsgRemoveAuthenticatorResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgRemoveAuthenticatorResponseProtoMsg
  ): MsgRemoveAuthenticatorResponse {
    return MsgRemoveAuthenticatorResponse.decode(message.value);
  },
  toProto(message: MsgRemoveAuthenticatorResponse): Uint8Array {
    return MsgRemoveAuthenticatorResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgRemoveAuthenticatorResponse
  ): MsgRemoveAuthenticatorResponseProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.MsgRemoveAuthenticatorResponse",
      value: MsgRemoveAuthenticatorResponse.encode(message).finish(),
    };
  },
};
function createBaseTxExtension(): TxExtension {
  return {
    selectedAuthenticators: [],
  };
}
export const TxExtension = {
  typeUrl: "/osmosis.authenticator.TxExtension",
  encode(
    message: TxExtension,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.selectedAuthenticators) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TxExtension {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTxExtension();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.selectedAuthenticators.push(reader.int32());
            }
          } else {
            message.selectedAuthenticators.push(reader.int32());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TxExtension>): TxExtension {
    const message = createBaseTxExtension();
    message.selectedAuthenticators =
      object.selectedAuthenticators?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: TxExtensionAmino): TxExtension {
    return {
      selectedAuthenticators: Array.isArray(object?.selected_authenticators)
        ? object.selected_authenticators.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: TxExtension): TxExtensionAmino {
    const obj: any = {};
    if (message.selectedAuthenticators) {
      obj.selected_authenticators = message.selectedAuthenticators.map(
        (e) => e
      );
    } else {
      obj.selected_authenticators = [];
    }
    return obj;
  },
  fromAminoMsg(object: TxExtensionAminoMsg): TxExtension {
    return TxExtension.fromAmino(object.value);
  },
  toAminoMsg(message: TxExtension): TxExtensionAminoMsg {
    return {
      type: "osmosis/authenticator/tx-extension",
      value: TxExtension.toAmino(message),
    };
  },
  fromProtoMsg(message: TxExtensionProtoMsg): TxExtension {
    return TxExtension.decode(message.value);
  },
  toProto(message: TxExtension): Uint8Array {
    return TxExtension.encode(message).finish();
  },
  toProtoMsg(message: TxExtension): TxExtensionProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.TxExtension",
      value: TxExtension.encode(message).finish(),
    };
  },
};
