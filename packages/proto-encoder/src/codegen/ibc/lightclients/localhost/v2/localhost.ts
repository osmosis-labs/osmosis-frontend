//@ts-nocheck
/* eslint-disable */
import {
  Height,
  HeightAmino,
  HeightSDKType,
} from "../../../core/client/v1/client";
import * as _m0 from "protobufjs/minimal";
/** ClientState defines the 09-localhost client state */
export interface ClientState {
  /** the latest block height */
  latestHeight?: Height;
}
export interface ClientStateProtoMsg {
  typeUrl: "/ibc.lightclients.localhost.v2.ClientState";
  value: Uint8Array;
}
/** ClientState defines the 09-localhost client state */
export interface ClientStateAmino {
  /** the latest block height */
  latest_height?: HeightAmino;
}
export interface ClientStateAminoMsg {
  type: "cosmos-sdk/ClientState";
  value: ClientStateAmino;
}
/** ClientState defines the 09-localhost client state */
export interface ClientStateSDKType {
  latest_height?: HeightSDKType;
}
function createBaseClientState(): ClientState {
  return {
    latestHeight: undefined,
  };
}
export const ClientState = {
  typeUrl: "/ibc.lightclients.localhost.v2.ClientState",
  encode(
    message: ClientState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.latestHeight !== undefined) {
      Height.encode(message.latestHeight, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ClientState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClientState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.latestHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ClientState>): ClientState {
    const message = createBaseClientState();
    message.latestHeight =
      object.latestHeight !== undefined && object.latestHeight !== null
        ? Height.fromPartial(object.latestHeight)
        : undefined;
    return message;
  },
  fromAmino(object: ClientStateAmino): ClientState {
    return {
      latestHeight: object?.latest_height
        ? Height.fromAmino(object.latest_height)
        : undefined,
    };
  },
  toAmino(message: ClientState): ClientStateAmino {
    const obj: any = {};
    obj.latest_height = message.latestHeight
      ? Height.toAmino(message.latestHeight)
      : {};
    return obj;
  },
  fromAminoMsg(object: ClientStateAminoMsg): ClientState {
    return ClientState.fromAmino(object.value);
  },
  toAminoMsg(message: ClientState): ClientStateAminoMsg {
    return {
      type: "cosmos-sdk/ClientState",
      value: ClientState.toAmino(message),
    };
  },
  fromProtoMsg(message: ClientStateProtoMsg): ClientState {
    return ClientState.decode(message.value);
  },
  toProto(message: ClientState): Uint8Array {
    return ClientState.encode(message).finish();
  },
  toProtoMsg(message: ClientState): ClientStateProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.localhost.v2.ClientState",
      value: ClientState.encode(message).finish(),
    };
  },
};
