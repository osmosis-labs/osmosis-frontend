import { Timestamp } from "../../../google/protobuf/timestamp";
import { Params, ParamsAmino, ParamsSDKType } from "./genesis";
import { Long, toTimestamp, fromTimestamp } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
export interface ArithmeticTwapRequest {
  poolId: Long;
  baseAsset: string;
  quoteAsset: string;
  startTime?: Date;
  endTime?: Date;
}
export interface ArithmeticTwapRequestProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapRequest";
  value: Uint8Array;
}
export interface ArithmeticTwapRequestAmino {
  pool_id: string;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
  end_time?: Date;
}
export interface ArithmeticTwapRequestAminoMsg {
  type: "osmosis/twap/arithmetic-twap-request";
  value: ArithmeticTwapRequestAmino;
}
export interface ArithmeticTwapRequestSDKType {
  pool_id: Long;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
  end_time?: Date;
}
export interface ArithmeticTwapResponse {
  arithmeticTwap: string;
}
export interface ArithmeticTwapResponseProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapResponse";
  value: Uint8Array;
}
export interface ArithmeticTwapResponseAmino {
  arithmetic_twap: string;
}
export interface ArithmeticTwapResponseAminoMsg {
  type: "osmosis/twap/arithmetic-twap-response";
  value: ArithmeticTwapResponseAmino;
}
export interface ArithmeticTwapResponseSDKType {
  arithmetic_twap: string;
}
export interface ArithmeticTwapToNowRequest {
  poolId: Long;
  baseAsset: string;
  quoteAsset: string;
  startTime?: Date;
}
export interface ArithmeticTwapToNowRequestProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapToNowRequest";
  value: Uint8Array;
}
export interface ArithmeticTwapToNowRequestAmino {
  pool_id: string;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
}
export interface ArithmeticTwapToNowRequestAminoMsg {
  type: "osmosis/twap/arithmetic-twap-to-now-request";
  value: ArithmeticTwapToNowRequestAmino;
}
export interface ArithmeticTwapToNowRequestSDKType {
  pool_id: Long;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
}
export interface ArithmeticTwapToNowResponse {
  arithmeticTwap: string;
}
export interface ArithmeticTwapToNowResponseProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapToNowResponse";
  value: Uint8Array;
}
export interface ArithmeticTwapToNowResponseAmino {
  arithmetic_twap: string;
}
export interface ArithmeticTwapToNowResponseAminoMsg {
  type: "osmosis/twap/arithmetic-twap-to-now-response";
  value: ArithmeticTwapToNowResponseAmino;
}
export interface ArithmeticTwapToNowResponseSDKType {
  arithmetic_twap: string;
}
export interface GeometricTwapRequest {
  poolId: Long;
  baseAsset: string;
  quoteAsset: string;
  startTime?: Date;
  endTime?: Date;
}
export interface GeometricTwapRequestProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapRequest";
  value: Uint8Array;
}
export interface GeometricTwapRequestAmino {
  pool_id: string;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
  end_time?: Date;
}
export interface GeometricTwapRequestAminoMsg {
  type: "osmosis/twap/geometric-twap-request";
  value: GeometricTwapRequestAmino;
}
export interface GeometricTwapRequestSDKType {
  pool_id: Long;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
  end_time?: Date;
}
export interface GeometricTwapResponse {
  geometricTwap: string;
}
export interface GeometricTwapResponseProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapResponse";
  value: Uint8Array;
}
export interface GeometricTwapResponseAmino {
  geometric_twap: string;
}
export interface GeometricTwapResponseAminoMsg {
  type: "osmosis/twap/geometric-twap-response";
  value: GeometricTwapResponseAmino;
}
export interface GeometricTwapResponseSDKType {
  geometric_twap: string;
}
export interface GeometricTwapToNowRequest {
  poolId: Long;
  baseAsset: string;
  quoteAsset: string;
  startTime?: Date;
}
export interface GeometricTwapToNowRequestProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapToNowRequest";
  value: Uint8Array;
}
export interface GeometricTwapToNowRequestAmino {
  pool_id: string;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
}
export interface GeometricTwapToNowRequestAminoMsg {
  type: "osmosis/twap/geometric-twap-to-now-request";
  value: GeometricTwapToNowRequestAmino;
}
export interface GeometricTwapToNowRequestSDKType {
  pool_id: Long;
  base_asset: string;
  quote_asset: string;
  start_time?: Date;
}
export interface GeometricTwapToNowResponse {
  geometricTwap: string;
}
export interface GeometricTwapToNowResponseProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapToNowResponse";
  value: Uint8Array;
}
export interface GeometricTwapToNowResponseAmino {
  geometric_twap: string;
}
export interface GeometricTwapToNowResponseAminoMsg {
  type: "osmosis/twap/geometric-twap-to-now-response";
  value: GeometricTwapToNowResponseAmino;
}
export interface GeometricTwapToNowResponseSDKType {
  geometric_twap: string;
}
export interface ParamsRequest {}
export interface ParamsRequestProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.ParamsRequest";
  value: Uint8Array;
}
export interface ParamsRequestAmino {}
export interface ParamsRequestAminoMsg {
  type: "osmosis/twap/params-request";
  value: ParamsRequestAmino;
}
export interface ParamsRequestSDKType {}
export interface ParamsResponse {
  params?: Params;
}
export interface ParamsResponseProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.ParamsResponse";
  value: Uint8Array;
}
export interface ParamsResponseAmino {
  params?: ParamsAmino;
}
export interface ParamsResponseAminoMsg {
  type: "osmosis/twap/params-response";
  value: ParamsResponseAmino;
}
export interface ParamsResponseSDKType {
  params?: ParamsSDKType;
}
function createBaseArithmeticTwapRequest(): ArithmeticTwapRequest {
  return {
    poolId: Long.UZERO,
    baseAsset: "",
    quoteAsset: "",
    startTime: undefined,
    endTime: undefined,
  };
}
export const ArithmeticTwapRequest = {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapRequest",
  encode(
    message: ArithmeticTwapRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.baseAsset !== "") {
      writer.uint32(18).string(message.baseAsset);
    }
    if (message.quoteAsset !== "") {
      writer.uint32(26).string(message.quoteAsset);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.endTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.endTime),
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ArithmeticTwapRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArithmeticTwapRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.baseAsset = reader.string();
          break;
        case 3:
          message.quoteAsset = reader.string();
          break;
        case 4:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.endTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ArithmeticTwapRequest>): ArithmeticTwapRequest {
    const message = createBaseArithmeticTwapRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.baseAsset = object.baseAsset ?? "";
    message.quoteAsset = object.quoteAsset ?? "";
    message.startTime = object.startTime ?? undefined;
    message.endTime = object.endTime ?? undefined;
    return message;
  },
  fromAmino(object: ArithmeticTwapRequestAmino): ArithmeticTwapRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      baseAsset: object.base_asset,
      quoteAsset: object.quote_asset,
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
      endTime: object?.end_time
        ? Timestamp.fromAmino(object.end_time)
        : undefined,
    };
  },
  toAmino(message: ArithmeticTwapRequest): ArithmeticTwapRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.base_asset = message.baseAsset;
    obj.quote_asset = message.quoteAsset;
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    obj.end_time = message.endTime
      ? Timestamp.toAmino(message.endTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ArithmeticTwapRequestAminoMsg): ArithmeticTwapRequest {
    return ArithmeticTwapRequest.fromAmino(object.value);
  },
  toAminoMsg(message: ArithmeticTwapRequest): ArithmeticTwapRequestAminoMsg {
    return {
      type: "osmosis/twap/arithmetic-twap-request",
      value: ArithmeticTwapRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: ArithmeticTwapRequestProtoMsg): ArithmeticTwapRequest {
    return ArithmeticTwapRequest.decode(message.value);
  },
  toProto(message: ArithmeticTwapRequest): Uint8Array {
    return ArithmeticTwapRequest.encode(message).finish();
  },
  toProtoMsg(message: ArithmeticTwapRequest): ArithmeticTwapRequestProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapRequest",
      value: ArithmeticTwapRequest.encode(message).finish(),
    };
  },
};
function createBaseArithmeticTwapResponse(): ArithmeticTwapResponse {
  return {
    arithmeticTwap: "",
  };
}
export const ArithmeticTwapResponse = {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapResponse",
  encode(
    message: ArithmeticTwapResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.arithmeticTwap !== "") {
      writer.uint32(10).string(message.arithmeticTwap);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ArithmeticTwapResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArithmeticTwapResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.arithmeticTwap = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ArithmeticTwapResponse>): ArithmeticTwapResponse {
    const message = createBaseArithmeticTwapResponse();
    message.arithmeticTwap = object.arithmeticTwap ?? "";
    return message;
  },
  fromAmino(object: ArithmeticTwapResponseAmino): ArithmeticTwapResponse {
    return {
      arithmeticTwap: object.arithmetic_twap,
    };
  },
  toAmino(message: ArithmeticTwapResponse): ArithmeticTwapResponseAmino {
    const obj: any = {};
    obj.arithmetic_twap = message.arithmeticTwap;
    return obj;
  },
  fromAminoMsg(object: ArithmeticTwapResponseAminoMsg): ArithmeticTwapResponse {
    return ArithmeticTwapResponse.fromAmino(object.value);
  },
  toAminoMsg(message: ArithmeticTwapResponse): ArithmeticTwapResponseAminoMsg {
    return {
      type: "osmosis/twap/arithmetic-twap-response",
      value: ArithmeticTwapResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ArithmeticTwapResponseProtoMsg
  ): ArithmeticTwapResponse {
    return ArithmeticTwapResponse.decode(message.value);
  },
  toProto(message: ArithmeticTwapResponse): Uint8Array {
    return ArithmeticTwapResponse.encode(message).finish();
  },
  toProtoMsg(message: ArithmeticTwapResponse): ArithmeticTwapResponseProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapResponse",
      value: ArithmeticTwapResponse.encode(message).finish(),
    };
  },
};
function createBaseArithmeticTwapToNowRequest(): ArithmeticTwapToNowRequest {
  return {
    poolId: Long.UZERO,
    baseAsset: "",
    quoteAsset: "",
    startTime: undefined,
  };
}
export const ArithmeticTwapToNowRequest = {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapToNowRequest",
  encode(
    message: ArithmeticTwapToNowRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.baseAsset !== "") {
      writer.uint32(18).string(message.baseAsset);
    }
    if (message.quoteAsset !== "") {
      writer.uint32(26).string(message.quoteAsset);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ArithmeticTwapToNowRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArithmeticTwapToNowRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.baseAsset = reader.string();
          break;
        case 3:
          message.quoteAsset = reader.string();
          break;
        case 4:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<ArithmeticTwapToNowRequest>
  ): ArithmeticTwapToNowRequest {
    const message = createBaseArithmeticTwapToNowRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.baseAsset = object.baseAsset ?? "";
    message.quoteAsset = object.quoteAsset ?? "";
    message.startTime = object.startTime ?? undefined;
    return message;
  },
  fromAmino(
    object: ArithmeticTwapToNowRequestAmino
  ): ArithmeticTwapToNowRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      baseAsset: object.base_asset,
      quoteAsset: object.quote_asset,
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
    };
  },
  toAmino(
    message: ArithmeticTwapToNowRequest
  ): ArithmeticTwapToNowRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.base_asset = message.baseAsset;
    obj.quote_asset = message.quoteAsset;
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: ArithmeticTwapToNowRequestAminoMsg
  ): ArithmeticTwapToNowRequest {
    return ArithmeticTwapToNowRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: ArithmeticTwapToNowRequest
  ): ArithmeticTwapToNowRequestAminoMsg {
    return {
      type: "osmosis/twap/arithmetic-twap-to-now-request",
      value: ArithmeticTwapToNowRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ArithmeticTwapToNowRequestProtoMsg
  ): ArithmeticTwapToNowRequest {
    return ArithmeticTwapToNowRequest.decode(message.value);
  },
  toProto(message: ArithmeticTwapToNowRequest): Uint8Array {
    return ArithmeticTwapToNowRequest.encode(message).finish();
  },
  toProtoMsg(
    message: ArithmeticTwapToNowRequest
  ): ArithmeticTwapToNowRequestProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapToNowRequest",
      value: ArithmeticTwapToNowRequest.encode(message).finish(),
    };
  },
};
function createBaseArithmeticTwapToNowResponse(): ArithmeticTwapToNowResponse {
  return {
    arithmeticTwap: "",
  };
}
export const ArithmeticTwapToNowResponse = {
  typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapToNowResponse",
  encode(
    message: ArithmeticTwapToNowResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.arithmeticTwap !== "") {
      writer.uint32(10).string(message.arithmeticTwap);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ArithmeticTwapToNowResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseArithmeticTwapToNowResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.arithmeticTwap = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<ArithmeticTwapToNowResponse>
  ): ArithmeticTwapToNowResponse {
    const message = createBaseArithmeticTwapToNowResponse();
    message.arithmeticTwap = object.arithmeticTwap ?? "";
    return message;
  },
  fromAmino(
    object: ArithmeticTwapToNowResponseAmino
  ): ArithmeticTwapToNowResponse {
    return {
      arithmeticTwap: object.arithmetic_twap,
    };
  },
  toAmino(
    message: ArithmeticTwapToNowResponse
  ): ArithmeticTwapToNowResponseAmino {
    const obj: any = {};
    obj.arithmetic_twap = message.arithmeticTwap;
    return obj;
  },
  fromAminoMsg(
    object: ArithmeticTwapToNowResponseAminoMsg
  ): ArithmeticTwapToNowResponse {
    return ArithmeticTwapToNowResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: ArithmeticTwapToNowResponse
  ): ArithmeticTwapToNowResponseAminoMsg {
    return {
      type: "osmosis/twap/arithmetic-twap-to-now-response",
      value: ArithmeticTwapToNowResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ArithmeticTwapToNowResponseProtoMsg
  ): ArithmeticTwapToNowResponse {
    return ArithmeticTwapToNowResponse.decode(message.value);
  },
  toProto(message: ArithmeticTwapToNowResponse): Uint8Array {
    return ArithmeticTwapToNowResponse.encode(message).finish();
  },
  toProtoMsg(
    message: ArithmeticTwapToNowResponse
  ): ArithmeticTwapToNowResponseProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.ArithmeticTwapToNowResponse",
      value: ArithmeticTwapToNowResponse.encode(message).finish(),
    };
  },
};
function createBaseGeometricTwapRequest(): GeometricTwapRequest {
  return {
    poolId: Long.UZERO,
    baseAsset: "",
    quoteAsset: "",
    startTime: undefined,
    endTime: undefined,
  };
}
export const GeometricTwapRequest = {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapRequest",
  encode(
    message: GeometricTwapRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.baseAsset !== "") {
      writer.uint32(18).string(message.baseAsset);
    }
    if (message.quoteAsset !== "") {
      writer.uint32(26).string(message.quoteAsset);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.endTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.endTime),
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GeometricTwapRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGeometricTwapRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.baseAsset = reader.string();
          break;
        case 3:
          message.quoteAsset = reader.string();
          break;
        case 4:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.endTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GeometricTwapRequest>): GeometricTwapRequest {
    const message = createBaseGeometricTwapRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.baseAsset = object.baseAsset ?? "";
    message.quoteAsset = object.quoteAsset ?? "";
    message.startTime = object.startTime ?? undefined;
    message.endTime = object.endTime ?? undefined;
    return message;
  },
  fromAmino(object: GeometricTwapRequestAmino): GeometricTwapRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      baseAsset: object.base_asset,
      quoteAsset: object.quote_asset,
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
      endTime: object?.end_time
        ? Timestamp.fromAmino(object.end_time)
        : undefined,
    };
  },
  toAmino(message: GeometricTwapRequest): GeometricTwapRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.base_asset = message.baseAsset;
    obj.quote_asset = message.quoteAsset;
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    obj.end_time = message.endTime
      ? Timestamp.toAmino(message.endTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GeometricTwapRequestAminoMsg): GeometricTwapRequest {
    return GeometricTwapRequest.fromAmino(object.value);
  },
  toAminoMsg(message: GeometricTwapRequest): GeometricTwapRequestAminoMsg {
    return {
      type: "osmosis/twap/geometric-twap-request",
      value: GeometricTwapRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: GeometricTwapRequestProtoMsg): GeometricTwapRequest {
    return GeometricTwapRequest.decode(message.value);
  },
  toProto(message: GeometricTwapRequest): Uint8Array {
    return GeometricTwapRequest.encode(message).finish();
  },
  toProtoMsg(message: GeometricTwapRequest): GeometricTwapRequestProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.GeometricTwapRequest",
      value: GeometricTwapRequest.encode(message).finish(),
    };
  },
};
function createBaseGeometricTwapResponse(): GeometricTwapResponse {
  return {
    geometricTwap: "",
  };
}
export const GeometricTwapResponse = {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapResponse",
  encode(
    message: GeometricTwapResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.geometricTwap !== "") {
      writer.uint32(10).string(message.geometricTwap);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GeometricTwapResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGeometricTwapResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.geometricTwap = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GeometricTwapResponse>): GeometricTwapResponse {
    const message = createBaseGeometricTwapResponse();
    message.geometricTwap = object.geometricTwap ?? "";
    return message;
  },
  fromAmino(object: GeometricTwapResponseAmino): GeometricTwapResponse {
    return {
      geometricTwap: object.geometric_twap,
    };
  },
  toAmino(message: GeometricTwapResponse): GeometricTwapResponseAmino {
    const obj: any = {};
    obj.geometric_twap = message.geometricTwap;
    return obj;
  },
  fromAminoMsg(object: GeometricTwapResponseAminoMsg): GeometricTwapResponse {
    return GeometricTwapResponse.fromAmino(object.value);
  },
  toAminoMsg(message: GeometricTwapResponse): GeometricTwapResponseAminoMsg {
    return {
      type: "osmosis/twap/geometric-twap-response",
      value: GeometricTwapResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: GeometricTwapResponseProtoMsg): GeometricTwapResponse {
    return GeometricTwapResponse.decode(message.value);
  },
  toProto(message: GeometricTwapResponse): Uint8Array {
    return GeometricTwapResponse.encode(message).finish();
  },
  toProtoMsg(message: GeometricTwapResponse): GeometricTwapResponseProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.GeometricTwapResponse",
      value: GeometricTwapResponse.encode(message).finish(),
    };
  },
};
function createBaseGeometricTwapToNowRequest(): GeometricTwapToNowRequest {
  return {
    poolId: Long.UZERO,
    baseAsset: "",
    quoteAsset: "",
    startTime: undefined,
  };
}
export const GeometricTwapToNowRequest = {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapToNowRequest",
  encode(
    message: GeometricTwapToNowRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.baseAsset !== "") {
      writer.uint32(18).string(message.baseAsset);
    }
    if (message.quoteAsset !== "") {
      writer.uint32(26).string(message.quoteAsset);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GeometricTwapToNowRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGeometricTwapToNowRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.baseAsset = reader.string();
          break;
        case 3:
          message.quoteAsset = reader.string();
          break;
        case 4:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<GeometricTwapToNowRequest>
  ): GeometricTwapToNowRequest {
    const message = createBaseGeometricTwapToNowRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.baseAsset = object.baseAsset ?? "";
    message.quoteAsset = object.quoteAsset ?? "";
    message.startTime = object.startTime ?? undefined;
    return message;
  },
  fromAmino(object: GeometricTwapToNowRequestAmino): GeometricTwapToNowRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      baseAsset: object.base_asset,
      quoteAsset: object.quote_asset,
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
    };
  },
  toAmino(message: GeometricTwapToNowRequest): GeometricTwapToNowRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.base_asset = message.baseAsset;
    obj.quote_asset = message.quoteAsset;
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: GeometricTwapToNowRequestAminoMsg
  ): GeometricTwapToNowRequest {
    return GeometricTwapToNowRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: GeometricTwapToNowRequest
  ): GeometricTwapToNowRequestAminoMsg {
    return {
      type: "osmosis/twap/geometric-twap-to-now-request",
      value: GeometricTwapToNowRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GeometricTwapToNowRequestProtoMsg
  ): GeometricTwapToNowRequest {
    return GeometricTwapToNowRequest.decode(message.value);
  },
  toProto(message: GeometricTwapToNowRequest): Uint8Array {
    return GeometricTwapToNowRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GeometricTwapToNowRequest
  ): GeometricTwapToNowRequestProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.GeometricTwapToNowRequest",
      value: GeometricTwapToNowRequest.encode(message).finish(),
    };
  },
};
function createBaseGeometricTwapToNowResponse(): GeometricTwapToNowResponse {
  return {
    geometricTwap: "",
  };
}
export const GeometricTwapToNowResponse = {
  typeUrl: "/osmosis.twap.v1beta1.GeometricTwapToNowResponse",
  encode(
    message: GeometricTwapToNowResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.geometricTwap !== "") {
      writer.uint32(10).string(message.geometricTwap);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GeometricTwapToNowResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGeometricTwapToNowResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.geometricTwap = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<GeometricTwapToNowResponse>
  ): GeometricTwapToNowResponse {
    const message = createBaseGeometricTwapToNowResponse();
    message.geometricTwap = object.geometricTwap ?? "";
    return message;
  },
  fromAmino(
    object: GeometricTwapToNowResponseAmino
  ): GeometricTwapToNowResponse {
    return {
      geometricTwap: object.geometric_twap,
    };
  },
  toAmino(
    message: GeometricTwapToNowResponse
  ): GeometricTwapToNowResponseAmino {
    const obj: any = {};
    obj.geometric_twap = message.geometricTwap;
    return obj;
  },
  fromAminoMsg(
    object: GeometricTwapToNowResponseAminoMsg
  ): GeometricTwapToNowResponse {
    return GeometricTwapToNowResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: GeometricTwapToNowResponse
  ): GeometricTwapToNowResponseAminoMsg {
    return {
      type: "osmosis/twap/geometric-twap-to-now-response",
      value: GeometricTwapToNowResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GeometricTwapToNowResponseProtoMsg
  ): GeometricTwapToNowResponse {
    return GeometricTwapToNowResponse.decode(message.value);
  },
  toProto(message: GeometricTwapToNowResponse): Uint8Array {
    return GeometricTwapToNowResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GeometricTwapToNowResponse
  ): GeometricTwapToNowResponseProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.GeometricTwapToNowResponse",
      value: GeometricTwapToNowResponse.encode(message).finish(),
    };
  },
};
function createBaseParamsRequest(): ParamsRequest {
  return {};
}
export const ParamsRequest = {
  typeUrl: "/osmosis.twap.v1beta1.ParamsRequest",
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
      type: "osmosis/twap/params-request",
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
      typeUrl: "/osmosis.twap.v1beta1.ParamsRequest",
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
  typeUrl: "/osmosis.twap.v1beta1.ParamsResponse",
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
      type: "osmosis/twap/params-response",
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
      typeUrl: "/osmosis.twap.v1beta1.ParamsResponse",
      value: ParamsResponse.encode(message).finish(),
    };
  },
};
