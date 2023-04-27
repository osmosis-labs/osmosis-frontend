//@ts-nocheck
/* eslint-disable */
import { Params, ParamsAmino, ParamsSDKType } from "./params";
import * as _m0 from "protobufjs/minimal";
/** GenesisState defines the ibc-rate-limit module's genesis state. */
export interface GenesisState {
  /** params are all the parameters of the module */
  params?: Params;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.ibcratelimit.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the ibc-rate-limit module's genesis state. */
export interface GenesisStateAmino {
  /** params are all the parameters of the module */
  params?: ParamsAmino;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/ibcratelimit/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the ibc-rate-limit module's genesis state. */
export interface GenesisStateSDKType {
  params?: ParamsSDKType;
}
function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.ibcratelimit.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
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
          message.params = Params.decode(reader, reader.uint32());
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
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/ibcratelimit/genesis-state",
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
      typeUrl: "/osmosis.ibcratelimit.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
