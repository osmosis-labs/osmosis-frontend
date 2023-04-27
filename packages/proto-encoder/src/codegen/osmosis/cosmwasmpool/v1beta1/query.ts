//@ts-nocheck
/* eslint-disable */
import { Params, ParamsAmino, ParamsSDKType } from "./genesis";
import * as _m0 from "protobufjs/minimal";
/** =============================== Params */
export interface ParamsRequest {}
export interface ParamsRequestProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsRequest";
  value: Uint8Array;
}
/** =============================== Params */
export interface ParamsRequestAmino {}
export interface ParamsRequestAminoMsg {
  type: "osmosis/cosmwasmpool/params-request";
  value: ParamsRequestAmino;
}
/** =============================== Params */
export interface ParamsRequestSDKType {}
export interface ParamsResponse {
  params?: Params;
}
export interface ParamsResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsResponse";
  value: Uint8Array;
}
export interface ParamsResponseAmino {
  params?: ParamsAmino;
}
export interface ParamsResponseAminoMsg {
  type: "osmosis/cosmwasmpool/params-response";
  value: ParamsResponseAmino;
}
export interface ParamsResponseSDKType {
  params?: ParamsSDKType;
}
function createBaseParamsRequest(): ParamsRequest {
  return {};
}
export const ParamsRequest = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsRequest",
  encode(
    _: ParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsRequest();
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
  fromPartial(_: Partial<ParamsRequest>): ParamsRequest {
    const message = createBaseParamsRequest();
    return message;
  },
  fromAmino(_: ParamsRequestAmino): ParamsRequest {
    return {};
  },
  toAmino(_: ParamsRequest): ParamsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: ParamsRequestAminoMsg): ParamsRequest {
    return ParamsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: ParamsRequest): ParamsRequestAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/params-request",
      value: ParamsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsRequestProtoMsg): ParamsRequest {
    return ParamsRequest.decode(message.value);
  },
  toProto(message: ParamsRequest): Uint8Array {
    return ParamsRequest.encode(message).finish();
  },
  toProtoMsg(message: ParamsRequest): ParamsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsRequest",
      value: ParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseParamsResponse(): ParamsResponse {
  return {
    params: undefined,
  };
}
export const ParamsResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsResponse",
  encode(
    message: ParamsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsResponse();
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
  fromPartial(object: Partial<ParamsResponse>): ParamsResponse {
    const message = createBaseParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(object: ParamsResponseAmino): ParamsResponse {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
    };
  },
  toAmino(message: ParamsResponse): ParamsResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsResponseAminoMsg): ParamsResponse {
    return ParamsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: ParamsResponse): ParamsResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/params-response",
      value: ParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsResponseProtoMsg): ParamsResponse {
    return ParamsResponse.decode(message.value);
  },
  toProto(message: ParamsResponse): Uint8Array {
    return ParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: ParamsResponse): ParamsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsResponse",
      value: ParamsResponse.encode(message).finish(),
    };
  },
};
