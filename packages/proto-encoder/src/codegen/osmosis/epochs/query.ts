//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../helpers";
import { EpochInfo, EpochInfoAmino, EpochInfoSDKType } from "./genesis";
export interface QueryEpochsInfoRequest {}
export interface QueryEpochsInfoRequestProtoMsg {
  typeUrl: "/osmosis.epochs.v1beta1.QueryEpochsInfoRequest";
  value: Uint8Array;
}
export interface QueryEpochsInfoRequestAmino {}
export interface QueryEpochsInfoRequestAminoMsg {
  type: "osmosis/epochs/query-epochs-info-request";
  value: QueryEpochsInfoRequestAmino;
}
export interface QueryEpochsInfoRequestSDKType {}
export interface QueryEpochsInfoResponse {
  epochs: EpochInfo[];
}
export interface QueryEpochsInfoResponseProtoMsg {
  typeUrl: "/osmosis.epochs.v1beta1.QueryEpochsInfoResponse";
  value: Uint8Array;
}
export interface QueryEpochsInfoResponseAmino {
  epochs: EpochInfoAmino[];
}
export interface QueryEpochsInfoResponseAminoMsg {
  type: "osmosis/epochs/query-epochs-info-response";
  value: QueryEpochsInfoResponseAmino;
}
export interface QueryEpochsInfoResponseSDKType {
  epochs: EpochInfoSDKType[];
}
export interface QueryCurrentEpochRequest {
  identifier: string;
}
export interface QueryCurrentEpochRequestProtoMsg {
  typeUrl: "/osmosis.epochs.v1beta1.QueryCurrentEpochRequest";
  value: Uint8Array;
}
export interface QueryCurrentEpochRequestAmino {
  identifier: string;
}
export interface QueryCurrentEpochRequestAminoMsg {
  type: "osmosis/epochs/query-current-epoch-request";
  value: QueryCurrentEpochRequestAmino;
}
export interface QueryCurrentEpochRequestSDKType {
  identifier: string;
}
export interface QueryCurrentEpochResponse {
  currentEpoch: Long;
}
export interface QueryCurrentEpochResponseProtoMsg {
  typeUrl: "/osmosis.epochs.v1beta1.QueryCurrentEpochResponse";
  value: Uint8Array;
}
export interface QueryCurrentEpochResponseAmino {
  current_epoch: string;
}
export interface QueryCurrentEpochResponseAminoMsg {
  type: "osmosis/epochs/query-current-epoch-response";
  value: QueryCurrentEpochResponseAmino;
}
export interface QueryCurrentEpochResponseSDKType {
  current_epoch: Long;
}
function createBaseQueryEpochsInfoRequest(): QueryEpochsInfoRequest {
  return {};
}
export const QueryEpochsInfoRequest = {
  typeUrl: "/osmosis.epochs.v1beta1.QueryEpochsInfoRequest",
  encode(
    _: QueryEpochsInfoRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryEpochsInfoRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochsInfoRequest();
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
  fromPartial(_: Partial<QueryEpochsInfoRequest>): QueryEpochsInfoRequest {
    const message = createBaseQueryEpochsInfoRequest();
    return message;
  },
  fromAmino(_: QueryEpochsInfoRequestAmino): QueryEpochsInfoRequest {
    return {};
  },
  toAmino(_: QueryEpochsInfoRequest): QueryEpochsInfoRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryEpochsInfoRequestAminoMsg): QueryEpochsInfoRequest {
    return QueryEpochsInfoRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryEpochsInfoRequest): QueryEpochsInfoRequestAminoMsg {
    return {
      type: "osmosis/epochs/query-epochs-info-request",
      value: QueryEpochsInfoRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryEpochsInfoRequestProtoMsg
  ): QueryEpochsInfoRequest {
    return QueryEpochsInfoRequest.decode(message.value);
  },
  toProto(message: QueryEpochsInfoRequest): Uint8Array {
    return QueryEpochsInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryEpochsInfoRequest): QueryEpochsInfoRequestProtoMsg {
    return {
      typeUrl: "/osmosis.epochs.v1beta1.QueryEpochsInfoRequest",
      value: QueryEpochsInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryEpochsInfoResponse(): QueryEpochsInfoResponse {
  return {
    epochs: [],
  };
}
export const QueryEpochsInfoResponse = {
  typeUrl: "/osmosis.epochs.v1beta1.QueryEpochsInfoResponse",
  encode(
    message: QueryEpochsInfoResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.epochs) {
      EpochInfo.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryEpochsInfoResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryEpochsInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochs.push(EpochInfo.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryEpochsInfoResponse>
  ): QueryEpochsInfoResponse {
    const message = createBaseQueryEpochsInfoResponse();
    message.epochs = object.epochs?.map((e) => EpochInfo.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: QueryEpochsInfoResponseAmino): QueryEpochsInfoResponse {
    return {
      epochs: Array.isArray(object?.epochs)
        ? object.epochs.map((e: any) => EpochInfo.fromAmino(e))
        : [],
    };
  },
  toAmino(message: QueryEpochsInfoResponse): QueryEpochsInfoResponseAmino {
    const obj: any = {};
    if (message.epochs) {
      obj.epochs = message.epochs.map((e) =>
        e ? EpochInfo.toAmino(e) : undefined
      );
    } else {
      obj.epochs = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryEpochsInfoResponseAminoMsg
  ): QueryEpochsInfoResponse {
    return QueryEpochsInfoResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryEpochsInfoResponse
  ): QueryEpochsInfoResponseAminoMsg {
    return {
      type: "osmosis/epochs/query-epochs-info-response",
      value: QueryEpochsInfoResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryEpochsInfoResponseProtoMsg
  ): QueryEpochsInfoResponse {
    return QueryEpochsInfoResponse.decode(message.value);
  },
  toProto(message: QueryEpochsInfoResponse): Uint8Array {
    return QueryEpochsInfoResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryEpochsInfoResponse
  ): QueryEpochsInfoResponseProtoMsg {
    return {
      typeUrl: "/osmosis.epochs.v1beta1.QueryEpochsInfoResponse",
      value: QueryEpochsInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryCurrentEpochRequest(): QueryCurrentEpochRequest {
  return {
    identifier: "",
  };
}
export const QueryCurrentEpochRequest = {
  typeUrl: "/osmosis.epochs.v1beta1.QueryCurrentEpochRequest",
  encode(
    message: QueryCurrentEpochRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.identifier !== "") {
      writer.uint32(10).string(message.identifier);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCurrentEpochRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCurrentEpochRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.identifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryCurrentEpochRequest>
  ): QueryCurrentEpochRequest {
    const message = createBaseQueryCurrentEpochRequest();
    message.identifier = object.identifier ?? "";
    return message;
  },
  fromAmino(object: QueryCurrentEpochRequestAmino): QueryCurrentEpochRequest {
    return {
      identifier: object.identifier,
    };
  },
  toAmino(message: QueryCurrentEpochRequest): QueryCurrentEpochRequestAmino {
    const obj: any = {};
    obj.identifier = message.identifier;
    return obj;
  },
  fromAminoMsg(
    object: QueryCurrentEpochRequestAminoMsg
  ): QueryCurrentEpochRequest {
    return QueryCurrentEpochRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCurrentEpochRequest
  ): QueryCurrentEpochRequestAminoMsg {
    return {
      type: "osmosis/epochs/query-current-epoch-request",
      value: QueryCurrentEpochRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCurrentEpochRequestProtoMsg
  ): QueryCurrentEpochRequest {
    return QueryCurrentEpochRequest.decode(message.value);
  },
  toProto(message: QueryCurrentEpochRequest): Uint8Array {
    return QueryCurrentEpochRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCurrentEpochRequest
  ): QueryCurrentEpochRequestProtoMsg {
    return {
      typeUrl: "/osmosis.epochs.v1beta1.QueryCurrentEpochRequest",
      value: QueryCurrentEpochRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryCurrentEpochResponse(): QueryCurrentEpochResponse {
  return {
    currentEpoch: Long.ZERO,
  };
}
export const QueryCurrentEpochResponse = {
  typeUrl: "/osmosis.epochs.v1beta1.QueryCurrentEpochResponse",
  encode(
    message: QueryCurrentEpochResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.currentEpoch.isZero()) {
      writer.uint32(8).int64(message.currentEpoch);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCurrentEpochResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCurrentEpochResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.currentEpoch = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryCurrentEpochResponse>
  ): QueryCurrentEpochResponse {
    const message = createBaseQueryCurrentEpochResponse();
    message.currentEpoch =
      object.currentEpoch !== undefined && object.currentEpoch !== null
        ? Long.fromValue(object.currentEpoch)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: QueryCurrentEpochResponseAmino): QueryCurrentEpochResponse {
    return {
      currentEpoch: Long.fromString(object.current_epoch),
    };
  },
  toAmino(message: QueryCurrentEpochResponse): QueryCurrentEpochResponseAmino {
    const obj: any = {};
    obj.current_epoch = message.currentEpoch
      ? message.currentEpoch.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryCurrentEpochResponseAminoMsg
  ): QueryCurrentEpochResponse {
    return QueryCurrentEpochResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCurrentEpochResponse
  ): QueryCurrentEpochResponseAminoMsg {
    return {
      type: "osmosis/epochs/query-current-epoch-response",
      value: QueryCurrentEpochResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCurrentEpochResponseProtoMsg
  ): QueryCurrentEpochResponse {
    return QueryCurrentEpochResponse.decode(message.value);
  },
  toProto(message: QueryCurrentEpochResponse): Uint8Array {
    return QueryCurrentEpochResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCurrentEpochResponse
  ): QueryCurrentEpochResponseProtoMsg {
    return {
      typeUrl: "/osmosis.epochs.v1beta1.QueryCurrentEpochResponse",
      value: QueryCurrentEpochResponse.encode(message).finish(),
    };
  },
};
