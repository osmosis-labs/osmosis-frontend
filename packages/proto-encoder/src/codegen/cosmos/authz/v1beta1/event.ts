//@ts-nocheck
/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
/** EventGrant is emitted on Msg/Grant */
export interface EventGrant {
  /** Msg type URL for which an autorization is granted */
  msgTypeUrl: string;
  /** Granter account address */
  granter: string;
  /** Grantee account address */
  grantee: string;
}
export interface EventGrantProtoMsg {
  typeUrl: "/cosmos.authz.v1beta1.EventGrant";
  value: Uint8Array;
}
/** EventGrant is emitted on Msg/Grant */
export interface EventGrantAmino {
  /** Msg type URL for which an autorization is granted */
  msg_type_url: string;
  /** Granter account address */
  granter: string;
  /** Grantee account address */
  grantee: string;
}
export interface EventGrantAminoMsg {
  type: "cosmos-sdk/EventGrant";
  value: EventGrantAmino;
}
/** EventGrant is emitted on Msg/Grant */
export interface EventGrantSDKType {
  msg_type_url: string;
  granter: string;
  grantee: string;
}
/** EventRevoke is emitted on Msg/Revoke */
export interface EventRevoke {
  /** Msg type URL for which an autorization is revoked */
  msgTypeUrl: string;
  /** Granter account address */
  granter: string;
  /** Grantee account address */
  grantee: string;
}
export interface EventRevokeProtoMsg {
  typeUrl: "/cosmos.authz.v1beta1.EventRevoke";
  value: Uint8Array;
}
/** EventRevoke is emitted on Msg/Revoke */
export interface EventRevokeAmino {
  /** Msg type URL for which an autorization is revoked */
  msg_type_url: string;
  /** Granter account address */
  granter: string;
  /** Grantee account address */
  grantee: string;
}
export interface EventRevokeAminoMsg {
  type: "cosmos-sdk/EventRevoke";
  value: EventRevokeAmino;
}
/** EventRevoke is emitted on Msg/Revoke */
export interface EventRevokeSDKType {
  msg_type_url: string;
  granter: string;
  grantee: string;
}
function createBaseEventGrant(): EventGrant {
  return {
    msgTypeUrl: "",
    granter: "",
    grantee: "",
  };
}
export const EventGrant = {
  typeUrl: "/cosmos.authz.v1beta1.EventGrant",
  encode(
    message: EventGrant,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.msgTypeUrl !== "") {
      writer.uint32(18).string(message.msgTypeUrl);
    }
    if (message.granter !== "") {
      writer.uint32(26).string(message.granter);
    }
    if (message.grantee !== "") {
      writer.uint32(34).string(message.grantee);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): EventGrant {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventGrant();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.msgTypeUrl = reader.string();
          break;
        case 3:
          message.granter = reader.string();
          break;
        case 4:
          message.grantee = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventGrant>): EventGrant {
    const message = createBaseEventGrant();
    message.msgTypeUrl = object.msgTypeUrl ?? "";
    message.granter = object.granter ?? "";
    message.grantee = object.grantee ?? "";
    return message;
  },
  fromAmino(object: EventGrantAmino): EventGrant {
    return {
      msgTypeUrl: object.msg_type_url,
      granter: object.granter,
      grantee: object.grantee,
    };
  },
  toAmino(message: EventGrant): EventGrantAmino {
    const obj: any = {};
    obj.msg_type_url = message.msgTypeUrl;
    obj.granter = message.granter;
    obj.grantee = message.grantee;
    return obj;
  },
  fromAminoMsg(object: EventGrantAminoMsg): EventGrant {
    return EventGrant.fromAmino(object.value);
  },
  toAminoMsg(message: EventGrant): EventGrantAminoMsg {
    return {
      type: "cosmos-sdk/EventGrant",
      value: EventGrant.toAmino(message),
    };
  },
  fromProtoMsg(message: EventGrantProtoMsg): EventGrant {
    return EventGrant.decode(message.value);
  },
  toProto(message: EventGrant): Uint8Array {
    return EventGrant.encode(message).finish();
  },
  toProtoMsg(message: EventGrant): EventGrantProtoMsg {
    return {
      typeUrl: "/cosmos.authz.v1beta1.EventGrant",
      value: EventGrant.encode(message).finish(),
    };
  },
};
function createBaseEventRevoke(): EventRevoke {
  return {
    msgTypeUrl: "",
    granter: "",
    grantee: "",
  };
}
export const EventRevoke = {
  typeUrl: "/cosmos.authz.v1beta1.EventRevoke",
  encode(
    message: EventRevoke,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.msgTypeUrl !== "") {
      writer.uint32(18).string(message.msgTypeUrl);
    }
    if (message.granter !== "") {
      writer.uint32(26).string(message.granter);
    }
    if (message.grantee !== "") {
      writer.uint32(34).string(message.grantee);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): EventRevoke {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventRevoke();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.msgTypeUrl = reader.string();
          break;
        case 3:
          message.granter = reader.string();
          break;
        case 4:
          message.grantee = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EventRevoke>): EventRevoke {
    const message = createBaseEventRevoke();
    message.msgTypeUrl = object.msgTypeUrl ?? "";
    message.granter = object.granter ?? "";
    message.grantee = object.grantee ?? "";
    return message;
  },
  fromAmino(object: EventRevokeAmino): EventRevoke {
    return {
      msgTypeUrl: object.msg_type_url,
      granter: object.granter,
      grantee: object.grantee,
    };
  },
  toAmino(message: EventRevoke): EventRevokeAmino {
    const obj: any = {};
    obj.msg_type_url = message.msgTypeUrl;
    obj.granter = message.granter;
    obj.grantee = message.grantee;
    return obj;
  },
  fromAminoMsg(object: EventRevokeAminoMsg): EventRevoke {
    return EventRevoke.fromAmino(object.value);
  },
  toAminoMsg(message: EventRevoke): EventRevokeAminoMsg {
    return {
      type: "cosmos-sdk/EventRevoke",
      value: EventRevoke.toAmino(message),
    };
  },
  fromProtoMsg(message: EventRevokeProtoMsg): EventRevoke {
    return EventRevoke.decode(message.value);
  },
  toProto(message: EventRevoke): Uint8Array {
    return EventRevoke.encode(message).finish();
  },
  toProtoMsg(message: EventRevoke): EventRevokeProtoMsg {
    return {
      typeUrl: "/cosmos.authz.v1beta1.EventRevoke",
      value: EventRevoke.encode(message).finish(),
    };
  },
};
