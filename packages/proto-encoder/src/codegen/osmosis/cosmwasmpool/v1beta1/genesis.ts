//@ts-nocheck
import * as _m0 from "protobufjs/minimal";
/** Params holds parameters for the cosmwasmpool module */
export interface Params {}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.Params";
  value: Uint8Array;
}
/** Params holds parameters for the cosmwasmpool module */
export interface ParamsAmino {}
export interface ParamsAminoMsg {
  type: "osmosis/cosmwasmpool/params";
  value: ParamsAmino;
}
/** Params holds parameters for the cosmwasmpool module */
export interface ParamsSDKType {}
/** GenesisState defines the cosmwasmpool module's genesis state. */
export interface GenesisState {
  /** params is the container of cosmwasmpool parameters. */
  params?: Params;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the cosmwasmpool module's genesis state. */
export interface GenesisStateAmino {
  /** params is the container of cosmwasmpool parameters. */
  params?: ParamsAmino;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/cosmwasmpool/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the cosmwasmpool module's genesis state. */
export interface GenesisStateSDKType {
  params?: ParamsSDKType;
}
function createBaseParams(): Params {
  return {};
}
export const Params = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.Params",
  encode(_: Params, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
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
  fromPartial(_: Partial<Params>): Params {
    const message = createBaseParams();
    return message;
  },
  fromAmino(_: ParamsAmino): Params {
    return {};
  },
  toAmino(_: Params): ParamsAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/params",
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
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GenesisState",
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
    const end = length === undefined ? reader.len : reader.pos + length;
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
      type: "osmosis/cosmwasmpool/genesis-state",
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
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
