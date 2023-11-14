//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
import { Params, ParamsAmino, ParamsSDKType } from "./params";
/** GenesisState defines the authenticator module's genesis state. */
export interface GenesisState {
  /** GenesisState defines the authenticator module's genesis state. */
  params: Params;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.authenticator.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the authenticator module's genesis state. */
export interface GenesisStateAmino {
  /** GenesisState defines the authenticator module's genesis state. */
  params?: ParamsAmino;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/authenticator/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the authenticator module's genesis state. */
export interface GenesisStateSDKType {
  params: ParamsSDKType;
}
function createBaseGenesisState(): GenesisState {
  return {
    params: Params.fromPartial({}),
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.authenticator.GenesisState",
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
      type: "osmosis/authenticator/genesis-state",
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
      typeUrl: "/osmosis.authenticator.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
