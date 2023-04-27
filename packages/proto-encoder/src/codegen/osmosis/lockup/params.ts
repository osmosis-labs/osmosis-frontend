//@ts-nocheck
/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
export interface Params {
  forceUnlockAllowedAddresses: string[];
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.lockup.Params";
  value: Uint8Array;
}
export interface ParamsAmino {
  force_unlock_allowed_addresses: string[];
}
export interface ParamsAminoMsg {
  type: "osmosis/lockup/params";
  value: ParamsAmino;
}
export interface ParamsSDKType {
  force_unlock_allowed_addresses: string[];
}
function createBaseParams(): Params {
  return {
    forceUnlockAllowedAddresses: [],
  };
}
export const Params = {
  typeUrl: "/osmosis.lockup.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.forceUnlockAllowedAddresses) {
      writer.uint32(10).string(v!);
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
          message.forceUnlockAllowedAddresses.push(reader.string());
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
    message.forceUnlockAllowedAddresses =
      object.forceUnlockAllowedAddresses?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      forceUnlockAllowedAddresses: Array.isArray(
        object?.force_unlock_allowed_addresses
      )
        ? object.force_unlock_allowed_addresses.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.forceUnlockAllowedAddresses) {
      obj.force_unlock_allowed_addresses =
        message.forceUnlockAllowedAddresses.map((e) => e);
    } else {
      obj.force_unlock_allowed_addresses = [];
    }
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/lockup/params",
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
      typeUrl: "/osmosis.lockup.Params",
      value: Params.encode(message).finish(),
    };
  },
};
