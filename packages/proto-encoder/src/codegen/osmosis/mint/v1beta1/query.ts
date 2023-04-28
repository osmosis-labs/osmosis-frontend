import { Params, ParamsAmino, ParamsSDKType } from "./mint";
import * as _m0 from "protobufjs/minimal";
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.QueryParamsRequest";
  value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: "osmosis/mint/query-params-request";
  value: QueryParamsRequestAmino;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params defines the parameters of the module. */
  params?: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.QueryParamsResponse";
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params defines the parameters of the module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: "osmosis/mint/query-params-response";
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params?: ParamsSDKType;
}
/**
 * QueryEpochProvisionsRequest is the request type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsRequest {}
export interface QueryEpochProvisionsRequestProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.QueryEpochProvisionsRequest";
  value: Uint8Array;
}
/**
 * QueryEpochProvisionsRequest is the request type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsRequestAmino {}
export interface QueryEpochProvisionsRequestAminoMsg {
  type: "osmosis/mint/query-epoch-provisions-request";
  value: QueryEpochProvisionsRequestAmino;
}
/**
 * QueryEpochProvisionsRequest is the request type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsRequestSDKType {}
/**
 * QueryEpochProvisionsResponse is the response type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsResponse {
  /** epoch_provisions is the current minting per epoch provisions value. */
  epochProvisions: Uint8Array;
}
export interface QueryEpochProvisionsResponseProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.QueryEpochProvisionsResponse";
  value: Uint8Array;
}
/**
 * QueryEpochProvisionsResponse is the response type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsResponseAmino {
  /** epoch_provisions is the current minting per epoch provisions value. */
  epoch_provisions: Uint8Array;
}
export interface QueryEpochProvisionsResponseAminoMsg {
  type: "osmosis/mint/query-epoch-provisions-response";
  value: QueryEpochProvisionsResponseAmino;
}
/**
 * QueryEpochProvisionsResponse is the response type for the
 * Query/EpochProvisions RPC method.
 */
export interface QueryEpochProvisionsResponseSDKType {
  epoch_provisions: Uint8Array;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: "/osmosis.mint.v1beta1.QueryParamsRequest",
  encode(
    _: QueryParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsRequest();
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
  fromPartial(_: Partial<QueryParamsRequest>): QueryParamsRequest {
    const message = createBaseQueryParamsRequest();
    return message;
  },
  fromAmino(_: QueryParamsRequestAmino): QueryParamsRequest {
    return {};
  },
  toAmino(_: QueryParamsRequest): QueryParamsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryParamsRequestAminoMsg): QueryParamsRequest {
    return QueryParamsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryParamsRequest): QueryParamsRequestAminoMsg {
    return {
      type: "osmosis/mint/query-params-request",
      value: QueryParamsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryParamsRequestProtoMsg): QueryParamsRequest {
    return QueryParamsRequest.decode(message.value);
  },
  toProto(message: QueryParamsRequest): Uint8Array {
    return QueryParamsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsRequest): QueryParamsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.mint.v1beta1.QueryParamsRequest",
      value: QueryParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsResponse(): QueryParamsResponse {
  return {
    params: undefined,
  };
}
export const QueryParamsResponse = {
  typeUrl: "/osmosis.mint.v1beta1.QueryParamsResponse",
  encode(
    message: QueryParamsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsResponse();
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
  fromPartial(object: Partial<QueryParamsResponse>): QueryParamsResponse {
    const message = createBaseQueryParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(object: QueryParamsResponseAmino): QueryParamsResponse {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
    };
  },
  toAmino(message: QueryParamsResponse): QueryParamsResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryParamsResponseAminoMsg): QueryParamsResponse {
    return QueryParamsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryParamsResponse): QueryParamsResponseAminoMsg {
    return {
      type: "osmosis/mint/query-params-response",
      value: QueryParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryParamsResponseProtoMsg): QueryParamsResponse {
    return QueryParamsResponse.decode(message.value);
  },
  toProto(message: QueryParamsResponse): Uint8Array {
    return QueryParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsResponse): QueryParamsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.mint.v1beta1.QueryParamsResponse",
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochProvisionsRequest(): QueryEpochProvisionsRequest {
  return {};
}
export const QueryEpochProvisionsRequest = {
  typeUrl: "/osmosis.mint.v1beta1.QueryEpochProvisionsRequest",
  encode(
    _: QueryEpochProvisionsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryEpochProvisionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochProvisionsRequest();
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
    _: Partial<QueryEpochProvisionsRequest>
  ): QueryEpochProvisionsRequest {
    const message = createBaseQueryEpochProvisionsRequest();
    return message;
  },
  fromAmino(_: QueryEpochProvisionsRequestAmino): QueryEpochProvisionsRequest {
    return {};
  },
  toAmino(_: QueryEpochProvisionsRequest): QueryEpochProvisionsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryEpochProvisionsRequestAminoMsg
  ): QueryEpochProvisionsRequest {
    return QueryEpochProvisionsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryEpochProvisionsRequest
  ): QueryEpochProvisionsRequestAminoMsg {
    return {
      type: "osmosis/mint/query-epoch-provisions-request",
      value: QueryEpochProvisionsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryEpochProvisionsRequestProtoMsg
  ): QueryEpochProvisionsRequest {
    return QueryEpochProvisionsRequest.decode(message.value);
  },
  toProto(message: QueryEpochProvisionsRequest): Uint8Array {
    return QueryEpochProvisionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEpochProvisionsRequest
  ): QueryEpochProvisionsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.mint.v1beta1.QueryEpochProvisionsRequest",
      value: QueryEpochProvisionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochProvisionsResponse(): QueryEpochProvisionsResponse {
  return {
    epochProvisions: new Uint8Array(),
  };
}
export const QueryEpochProvisionsResponse = {
  typeUrl: "/osmosis.mint.v1beta1.QueryEpochProvisionsResponse",
  encode(
    message: QueryEpochProvisionsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.epochProvisions.length !== 0) {
      writer.uint32(10).bytes(message.epochProvisions);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryEpochProvisionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochProvisionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochProvisions = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryEpochProvisionsResponse>
  ): QueryEpochProvisionsResponse {
    const message = createBaseQueryEpochProvisionsResponse();
    message.epochProvisions = object.epochProvisions ?? new Uint8Array();
    return message;
  },
  fromAmino(
    object: QueryEpochProvisionsResponseAmino
  ): QueryEpochProvisionsResponse {
    return {
      epochProvisions: object.epoch_provisions,
    };
  },
  toAmino(
    message: QueryEpochProvisionsResponse
  ): QueryEpochProvisionsResponseAmino {
    const obj: any = {};
    obj.epoch_provisions = message.epochProvisions;
    return obj;
  },
  fromAminoMsg(
    object: QueryEpochProvisionsResponseAminoMsg
  ): QueryEpochProvisionsResponse {
    return QueryEpochProvisionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryEpochProvisionsResponse
  ): QueryEpochProvisionsResponseAminoMsg {
    return {
      type: "osmosis/mint/query-epoch-provisions-response",
      value: QueryEpochProvisionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryEpochProvisionsResponseProtoMsg
  ): QueryEpochProvisionsResponse {
    return QueryEpochProvisionsResponse.decode(message.value);
  },
  toProto(message: QueryEpochProvisionsResponse): Uint8Array {
    return QueryEpochProvisionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEpochProvisionsResponse
  ): QueryEpochProvisionsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.mint.v1beta1.QueryEpochProvisionsResponse",
      value: QueryEpochProvisionsResponse.encode(message).finish(),
    };
  },
};
