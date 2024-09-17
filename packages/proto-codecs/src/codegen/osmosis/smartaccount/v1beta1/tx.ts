//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import { base64FromBytes, bytesFromBase64 } from "../../../helpers";
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticator {
  sender: string;
  authenticatorType: string;
  data: Uint8Array;
}
export interface MsgAddAuthenticatorProtoMsg {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgAddAuthenticator";
  value: Uint8Array;
}
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticatorAmino {
  sender?: string;
  authenticator_type?: string;
  data?: string;
}
export interface MsgAddAuthenticatorAminoMsg {
  type: "osmosis/smartaccount/add-authenticator";
  value: MsgAddAuthenticatorAmino;
}
/** MsgAddAuthenticatorRequest defines the Msg/AddAuthenticator request type. */
export interface MsgAddAuthenticatorSDKType {
  sender: string;
  authenticator_type: string;
  data: Uint8Array;
}
/** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
export interface MsgAddAuthenticatorResponse {
  success: boolean;
}
export interface MsgAddAuthenticatorResponseProtoMsg {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgAddAuthenticatorResponse";
  value: Uint8Array;
}
/** MsgAddAuthenticatorResponse defines the Msg/AddAuthenticator response type. */
export interface MsgAddAuthenticatorResponseAmino {
  success?: boolean;
}
export interface MsgAddAuthenticatorResponseAminoMsg {
  type: "osmosis/smartaccount/add-authenticator-response";
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
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator";
  value: Uint8Array;
}
/**
 * MsgRemoveAuthenticatorRequest defines the Msg/RemoveAuthenticator request
 * type.
 */
export interface MsgRemoveAuthenticatorAmino {
  sender?: string;
  id?: string;
}
export interface MsgRemoveAuthenticatorAminoMsg {
  type: "osmosis/smartaccount/remove-authenticator";
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
  success: boolean;
}
export interface MsgRemoveAuthenticatorResponseProtoMsg {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticatorResponse";
  value: Uint8Array;
}
/**
 * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
 * type.
 */
export interface MsgRemoveAuthenticatorResponseAmino {
  success?: boolean;
}
export interface MsgRemoveAuthenticatorResponseAminoMsg {
  type: "osmosis/smartaccount/remove-authenticator-response";
  value: MsgRemoveAuthenticatorResponseAmino;
}
/**
 * MsgRemoveAuthenticatorResponse defines the Msg/RemoveAuthenticator response
 * type.
 */
export interface MsgRemoveAuthenticatorResponseSDKType {
  success: boolean;
}
export interface MsgSetActiveState {
  sender: string;
  active: boolean;
}
export interface MsgSetActiveStateProtoMsg {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgSetActiveState";
  value: Uint8Array;
}
export interface MsgSetActiveStateAmino {
  sender?: string;
  active?: boolean;
}
export interface MsgSetActiveStateAminoMsg {
  type: "osmosis/smartaccount/set-active-state";
  value: MsgSetActiveStateAmino;
}
export interface MsgSetActiveStateSDKType {
  sender: string;
  active: boolean;
}
export interface MsgSetActiveStateResponse {}
export interface MsgSetActiveStateResponseProtoMsg {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgSetActiveStateResponse";
  value: Uint8Array;
}
export interface MsgSetActiveStateResponseAmino {}
export interface MsgSetActiveStateResponseAminoMsg {
  type: "osmosis/smartaccount/set-active-state-response";
  value: MsgSetActiveStateResponseAmino;
}
export interface MsgSetActiveStateResponseSDKType {}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtension {
  /**
   * selected_authenticators holds the authenticator_id for the chosen
   * authenticator per message.
   */
  selectedAuthenticators: bigint[];
}
export interface TxExtensionProtoMsg {
  typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension";
  value: Uint8Array;
}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtensionAmino {
  /**
   * selected_authenticators holds the authenticator_id for the chosen
   * authenticator per message.
   */
  selected_authenticators?: string[];
}
export interface TxExtensionAminoMsg {
  type: "osmosis/smartaccount/tx-extension";
  value: TxExtensionAmino;
}
/**
 * TxExtension allows for additional authenticator-specific data in
 * transactions.
 */
export interface TxExtensionSDKType {
  selected_authenticators: bigint[];
}
function createBaseMsgAddAuthenticator(): MsgAddAuthenticator {
  return {
    sender: "",
    authenticatorType: "",
    data: new Uint8Array(),
  };
}
export const MsgAddAuthenticator = {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgAddAuthenticator",
  encode(
    message: MsgAddAuthenticator,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.authenticatorType !== "") {
      writer.uint32(18).string(message.authenticatorType);
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
          message.authenticatorType = reader.string();
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
    message.authenticatorType = object.authenticatorType ?? "";
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromAmino(object: MsgAddAuthenticatorAmino): MsgAddAuthenticator {
    const message = createBaseMsgAddAuthenticator();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (
      object.authenticator_type !== undefined &&
      object.authenticator_type !== null
    ) {
      message.authenticatorType = object.authenticator_type;
    }
    if (object.data !== undefined && object.data !== null) {
      message.data = bytesFromBase64(object.data);
    }
    return message;
  },
  toAmino(message: MsgAddAuthenticator): MsgAddAuthenticatorAmino {
    const obj: any = {};
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.authenticator_type =
      message.authenticatorType === "" ? undefined : message.authenticatorType;
    obj.data = message.data ? base64FromBytes(message.data) : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgAddAuthenticatorAminoMsg): MsgAddAuthenticator {
    return MsgAddAuthenticator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAddAuthenticator): MsgAddAuthenticatorAminoMsg {
    return {
      type: "osmosis/smartaccount/add-authenticator",
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
      typeUrl: "/osmosis.smartaccount.v1beta1.MsgAddAuthenticator",
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
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgAddAuthenticatorResponse",
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
    const message = createBaseMsgAddAuthenticatorResponse();
    if (object.success !== undefined && object.success !== null) {
      message.success = object.success;
    }
    return message;
  },
  toAmino(
    message: MsgAddAuthenticatorResponse
  ): MsgAddAuthenticatorResponseAmino {
    const obj: any = {};
    obj.success = message.success === false ? undefined : message.success;
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
      type: "osmosis/smartaccount/add-authenticator-response",
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
      typeUrl: "/osmosis.smartaccount.v1beta1.MsgAddAuthenticatorResponse",
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
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator",
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
    const message = createBaseMsgRemoveAuthenticator();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.id !== undefined && object.id !== null) {
      message.id = BigInt(object.id);
    }
    return message;
  },
  toAmino(message: MsgRemoveAuthenticator): MsgRemoveAuthenticatorAmino {
    const obj: any = {};
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.id = message.id !== BigInt(0) ? (message.id?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgRemoveAuthenticatorAminoMsg): MsgRemoveAuthenticator {
    return MsgRemoveAuthenticator.fromAmino(object.value);
  },
  toAminoMsg(message: MsgRemoveAuthenticator): MsgRemoveAuthenticatorAminoMsg {
    return {
      type: "osmosis/smartaccount/remove-authenticator",
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
      typeUrl: "/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator",
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
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticatorResponse",
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
    const message = createBaseMsgRemoveAuthenticatorResponse();
    if (object.success !== undefined && object.success !== null) {
      message.success = object.success;
    }
    return message;
  },
  toAmino(
    message: MsgRemoveAuthenticatorResponse
  ): MsgRemoveAuthenticatorResponseAmino {
    const obj: any = {};
    obj.success = message.success === false ? undefined : message.success;
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
      type: "osmosis/smartaccount/remove-authenticator-response",
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
      typeUrl: "/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticatorResponse",
      value: MsgRemoveAuthenticatorResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetActiveState(): MsgSetActiveState {
  return {
    sender: "",
    active: false,
  };
}
export const MsgSetActiveState = {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgSetActiveState",
  encode(
    message: MsgSetActiveState,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.active === true) {
      writer.uint32(16).bool(message.active);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgSetActiveState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetActiveState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.active = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetActiveState>): MsgSetActiveState {
    const message = createBaseMsgSetActiveState();
    message.sender = object.sender ?? "";
    message.active = object.active ?? false;
    return message;
  },
  fromAmino(object: MsgSetActiveStateAmino): MsgSetActiveState {
    const message = createBaseMsgSetActiveState();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.active !== undefined && object.active !== null) {
      message.active = object.active;
    }
    return message;
  },
  toAmino(message: MsgSetActiveState): MsgSetActiveStateAmino {
    const obj: any = {};
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.active = message.active === false ? undefined : message.active;
    return obj;
  },
  fromAminoMsg(object: MsgSetActiveStateAminoMsg): MsgSetActiveState {
    return MsgSetActiveState.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetActiveState): MsgSetActiveStateAminoMsg {
    return {
      type: "osmosis/smartaccount/set-active-state",
      value: MsgSetActiveState.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSetActiveStateProtoMsg): MsgSetActiveState {
    return MsgSetActiveState.decode(message.value);
  },
  toProto(message: MsgSetActiveState): Uint8Array {
    return MsgSetActiveState.encode(message).finish();
  },
  toProtoMsg(message: MsgSetActiveState): MsgSetActiveStateProtoMsg {
    return {
      typeUrl: "/osmosis.smartaccount.v1beta1.MsgSetActiveState",
      value: MsgSetActiveState.encode(message).finish(),
    };
  },
};
function createBaseMsgSetActiveStateResponse(): MsgSetActiveStateResponse {
  return {};
}
export const MsgSetActiveStateResponse = {
  typeUrl: "/osmosis.smartaccount.v1beta1.MsgSetActiveStateResponse",
  encode(
    _: MsgSetActiveStateResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSetActiveStateResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetActiveStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgSetActiveStateResponse>
  ): MsgSetActiveStateResponse {
    const message = createBaseMsgSetActiveStateResponse();
    return message;
  },
  fromAmino(_: MsgSetActiveStateResponseAmino): MsgSetActiveStateResponse {
    const message = createBaseMsgSetActiveStateResponse();
    return message;
  },
  toAmino(_: MsgSetActiveStateResponse): MsgSetActiveStateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetActiveStateResponseAminoMsg
  ): MsgSetActiveStateResponse {
    return MsgSetActiveStateResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetActiveStateResponse
  ): MsgSetActiveStateResponseAminoMsg {
    return {
      type: "osmosis/smartaccount/set-active-state-response",
      value: MsgSetActiveStateResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetActiveStateResponseProtoMsg
  ): MsgSetActiveStateResponse {
    return MsgSetActiveStateResponse.decode(message.value);
  },
  toProto(message: MsgSetActiveStateResponse): Uint8Array {
    return MsgSetActiveStateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetActiveStateResponse
  ): MsgSetActiveStateResponseProtoMsg {
    return {
      typeUrl: "/osmosis.smartaccount.v1beta1.MsgSetActiveStateResponse",
      value: MsgSetActiveStateResponse.encode(message).finish(),
    };
  },
};
function createBaseTxExtension(): TxExtension {
  return {
    selectedAuthenticators: [],
  };
}
export const TxExtension = {
  typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension",
  encode(
    message: TxExtension,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.selectedAuthenticators) {
      writer.uint64(v);
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
              message.selectedAuthenticators.push(reader.uint64());
            }
          } else {
            message.selectedAuthenticators.push(reader.uint64());
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
      object.selectedAuthenticators?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: TxExtensionAmino): TxExtension {
    const message = createBaseTxExtension();
    message.selectedAuthenticators =
      object.selected_authenticators?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: TxExtension): TxExtensionAmino {
    const obj: any = {};
    if (message.selectedAuthenticators) {
      obj.selected_authenticators = message.selectedAuthenticators.map((e) =>
        e.toString()
      );
    } else {
      obj.selected_authenticators = message.selectedAuthenticators;
    }
    return obj;
  },
  fromAminoMsg(object: TxExtensionAminoMsg): TxExtension {
    return TxExtension.fromAmino(object.value);
  },
  toAminoMsg(message: TxExtension): TxExtensionAminoMsg {
    return {
      type: "osmosis/smartaccount/tx-extension",
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
      typeUrl: "/osmosis.smartaccount.v1beta1.TxExtension",
      value: TxExtension.encode(message).finish(),
    };
  },
};
