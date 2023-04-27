//@ts-nocheck
/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
/**
 * Params defines the set of on-chain interchain accounts parameters.
 * The following parameters may be used to disable the host submodule.
 */
export interface Params {
  /** host_enabled enables or disables the host submodule. */
  hostEnabled: boolean;
  /** allow_messages defines a list of sdk message typeURLs allowed to be executed on a host chain. */
  allowMessages: string[];
}
export interface ParamsProtoMsg {
  typeUrl: "/ibc.applications.interchain_accounts.host.v1.Params";
  value: Uint8Array;
}
/**
 * Params defines the set of on-chain interchain accounts parameters.
 * The following parameters may be used to disable the host submodule.
 */
export interface ParamsAmino {
  /** host_enabled enables or disables the host submodule. */
  host_enabled: boolean;
  /** allow_messages defines a list of sdk message typeURLs allowed to be executed on a host chain. */
  allow_messages: string[];
}
export interface ParamsAminoMsg {
  type: "cosmos-sdk/Params";
  value: ParamsAmino;
}
/**
 * Params defines the set of on-chain interchain accounts parameters.
 * The following parameters may be used to disable the host submodule.
 */
export interface ParamsSDKType {
  host_enabled: boolean;
  allow_messages: string[];
}
function createBaseParams(): Params {
  return {
    hostEnabled: false,
    allowMessages: [],
  };
}
export const Params = {
  typeUrl: "/ibc.applications.interchain_accounts.host.v1.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.hostEnabled === true) {
      writer.uint32(8).bool(message.hostEnabled);
    }
    for (const v of message.allowMessages) {
      writer.uint32(18).string(v!);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.hostEnabled = reader.bool();
          break;
        case 2:
          message.allowMessages.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.hostEnabled = object.hostEnabled ?? false;
    message.allowMessages = object.allowMessages?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      hostEnabled: object.host_enabled,
      allowMessages: Array.isArray(object?.allow_messages)
        ? object.allow_messages.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.host_enabled = message.hostEnabled;
    if (message.allowMessages) {
      obj.allow_messages = message.allowMessages.map((e) => e);
    } else {
      obj.allow_messages = [];
    }
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "cosmos-sdk/Params",
      value: Params.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: "/ibc.applications.interchain_accounts.host.v1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
