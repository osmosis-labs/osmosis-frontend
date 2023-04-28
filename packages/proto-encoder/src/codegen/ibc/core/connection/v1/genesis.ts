import {
  IdentifiedConnection,
  IdentifiedConnectionAmino,
  IdentifiedConnectionSDKType,
  ConnectionPaths,
  ConnectionPathsAmino,
  ConnectionPathsSDKType,
  Params,
  ParamsAmino,
  ParamsSDKType,
} from "./connection";
import { Long } from "../../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** GenesisState defines the ibc connection submodule's genesis state. */
export interface GenesisState {
  connections: IdentifiedConnection[];
  clientConnectionPaths: ConnectionPaths[];
  /** the sequence for the next generated connection identifier */
  nextConnectionSequence: Long;
  params?: Params;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/ibc.core.connection.v1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the ibc connection submodule's genesis state. */
export interface GenesisStateAmino {
  connections: IdentifiedConnectionAmino[];
  client_connection_paths: ConnectionPathsAmino[];
  /** the sequence for the next generated connection identifier */
  next_connection_sequence: string;
  params?: ParamsAmino;
}
export interface GenesisStateAminoMsg {
  type: "cosmos-sdk/GenesisState";
  value: GenesisStateAmino;
}
/** GenesisState defines the ibc connection submodule's genesis state. */
export interface GenesisStateSDKType {
  connections: IdentifiedConnectionSDKType[];
  client_connection_paths: ConnectionPathsSDKType[];
  next_connection_sequence: Long;
  params?: ParamsSDKType;
}
function createBaseGenesisState(): GenesisState {
  return {
    connections: [],
    clientConnectionPaths: [],
    nextConnectionSequence: Long.UZERO,
    params: undefined,
  };
}
export const GenesisState = {
  typeUrl: "/ibc.core.connection.v1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.connections) {
      IdentifiedConnection.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.clientConnectionPaths) {
      ConnectionPaths.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (!message.nextConnectionSequence.isZero()) {
      writer.uint32(24).uint64(message.nextConnectionSequence);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(34).fork()).ldelim();
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
          message.connections.push(
            IdentifiedConnection.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.clientConnectionPaths.push(
            ConnectionPaths.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.nextConnectionSequence = reader.uint64() as Long;
          break;
        case 4:
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
    message.connections =
      object.connections?.map((e) => IdentifiedConnection.fromPartial(e)) || [];
    message.clientConnectionPaths =
      object.clientConnectionPaths?.map((e) =>
        ConnectionPaths.fromPartial(e)
      ) || [];
    message.nextConnectionSequence =
      object.nextConnectionSequence !== undefined &&
      object.nextConnectionSequence !== null
        ? Long.fromValue(object.nextConnectionSequence)
        : Long.UZERO;
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      connections: Array.isArray(object?.connections)
        ? object.connections.map((e: any) => IdentifiedConnection.fromAmino(e))
        : [],
      clientConnectionPaths: Array.isArray(object?.client_connection_paths)
        ? object.client_connection_paths.map((e: any) =>
            ConnectionPaths.fromAmino(e)
          )
        : [],
      nextConnectionSequence: Long.fromString(object.next_connection_sequence),
      params: object?.params ? Params.fromAmino(object.params) : undefined,
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    if (message.connections) {
      obj.connections = message.connections.map((e) =>
        e ? IdentifiedConnection.toAmino(e) : undefined
      );
    } else {
      obj.connections = [];
    }
    if (message.clientConnectionPaths) {
      obj.client_connection_paths = message.clientConnectionPaths.map((e) =>
        e ? ConnectionPaths.toAmino(e) : undefined
      );
    } else {
      obj.client_connection_paths = [];
    }
    obj.next_connection_sequence = message.nextConnectionSequence
      ? message.nextConnectionSequence.toString()
      : undefined;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "cosmos-sdk/GenesisState",
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
      typeUrl: "/ibc.core.connection.v1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
