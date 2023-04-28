//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../../helpers";
/** Deprecated: please use alternate in x/poolmanager */
/** @deprecated */
export interface QuerySpotPriceRequest {
  poolId: Long;
  baseAssetDenom: string;
  quoteAssetDenom: string;
}
export interface QuerySpotPriceRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v2.QuerySpotPriceRequest";
  value: Uint8Array;
}
/** Deprecated: please use alternate in x/poolmanager */
/** @deprecated */
export interface QuerySpotPriceRequestAmino {
  pool_id: string;
  base_asset_denom: string;
  quote_asset_denom: string;
}
export interface QuerySpotPriceRequestAminoMsg {
  type: "osmosis/gamm/v2/query-spot-price-request";
  value: QuerySpotPriceRequestAmino;
}
/** Deprecated: please use alternate in x/poolmanager */
/** @deprecated */
export interface QuerySpotPriceRequestSDKType {
  pool_id: Long;
  base_asset_denom: string;
  quote_asset_denom: string;
}
/** Depreacted: please use alternate in x/poolmanager */
/** @deprecated */
export interface QuerySpotPriceResponse {
  /** String of the Dec. Ex) 10.203uatom */
  spotPrice: string;
}
export interface QuerySpotPriceResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v2.QuerySpotPriceResponse";
  value: Uint8Array;
}
/** Depreacted: please use alternate in x/poolmanager */
/** @deprecated */
export interface QuerySpotPriceResponseAmino {
  /** String of the Dec. Ex) 10.203uatom */
  spot_price: string;
}
export interface QuerySpotPriceResponseAminoMsg {
  type: "osmosis/gamm/v2/query-spot-price-response";
  value: QuerySpotPriceResponseAmino;
}
/** Depreacted: please use alternate in x/poolmanager */
/** @deprecated */
export interface QuerySpotPriceResponseSDKType {
  spot_price: string;
}
function createBaseQuerySpotPriceRequest(): QuerySpotPriceRequest {
  return {
    poolId: Long.UZERO,
    baseAssetDenom: "",
    quoteAssetDenom: "",
  };
}
export const QuerySpotPriceRequest = {
  typeUrl: "/osmosis.gamm.v2.QuerySpotPriceRequest",
  encode(
    message: QuerySpotPriceRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.baseAssetDenom !== "") {
      writer.uint32(18).string(message.baseAssetDenom);
    }
    if (message.quoteAssetDenom !== "") {
      writer.uint32(26).string(message.quoteAssetDenom);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySpotPriceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySpotPriceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.baseAssetDenom = reader.string();
          break;
        case 3:
          message.quoteAssetDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QuerySpotPriceRequest>): QuerySpotPriceRequest {
    const message = createBaseQuerySpotPriceRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.baseAssetDenom = object.baseAssetDenom ?? "";
    message.quoteAssetDenom = object.quoteAssetDenom ?? "";
    return message;
  },
  fromAmino(object: QuerySpotPriceRequestAmino): QuerySpotPriceRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      baseAssetDenom: object.base_asset_denom,
      quoteAssetDenom: object.quote_asset_denom,
    };
  },
  toAmino(message: QuerySpotPriceRequest): QuerySpotPriceRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.base_asset_denom = message.baseAssetDenom;
    obj.quote_asset_denom = message.quoteAssetDenom;
    return obj;
  },
  fromAminoMsg(object: QuerySpotPriceRequestAminoMsg): QuerySpotPriceRequest {
    return QuerySpotPriceRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QuerySpotPriceRequest): QuerySpotPriceRequestAminoMsg {
    return {
      type: "osmosis/gamm/v2/query-spot-price-request",
      value: QuerySpotPriceRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QuerySpotPriceRequestProtoMsg): QuerySpotPriceRequest {
    return QuerySpotPriceRequest.decode(message.value);
  },
  toProto(message: QuerySpotPriceRequest): Uint8Array {
    return QuerySpotPriceRequest.encode(message).finish();
  },
  toProtoMsg(message: QuerySpotPriceRequest): QuerySpotPriceRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v2.QuerySpotPriceRequest",
      value: QuerySpotPriceRequest.encode(message).finish(),
    };
  },
};
function createBaseQuerySpotPriceResponse(): QuerySpotPriceResponse {
  return {
    spotPrice: "",
  };
}
export const QuerySpotPriceResponse = {
  typeUrl: "/osmosis.gamm.v2.QuerySpotPriceResponse",
  encode(
    message: QuerySpotPriceResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.spotPrice !== "") {
      writer.uint32(10).string(message.spotPrice);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySpotPriceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySpotPriceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.spotPrice = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QuerySpotPriceResponse>): QuerySpotPriceResponse {
    const message = createBaseQuerySpotPriceResponse();
    message.spotPrice = object.spotPrice ?? "";
    return message;
  },
  fromAmino(object: QuerySpotPriceResponseAmino): QuerySpotPriceResponse {
    return {
      spotPrice: object.spot_price,
    };
  },
  toAmino(message: QuerySpotPriceResponse): QuerySpotPriceResponseAmino {
    const obj: any = {};
    obj.spot_price = message.spotPrice;
    return obj;
  },
  fromAminoMsg(object: QuerySpotPriceResponseAminoMsg): QuerySpotPriceResponse {
    return QuerySpotPriceResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QuerySpotPriceResponse): QuerySpotPriceResponseAminoMsg {
    return {
      type: "osmosis/gamm/v2/query-spot-price-response",
      value: QuerySpotPriceResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySpotPriceResponseProtoMsg
  ): QuerySpotPriceResponse {
    return QuerySpotPriceResponse.decode(message.value);
  },
  toProto(message: QuerySpotPriceResponse): Uint8Array {
    return QuerySpotPriceResponse.encode(message).finish();
  },
  toProtoMsg(message: QuerySpotPriceResponse): QuerySpotPriceResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v2.QuerySpotPriceResponse",
      value: QuerySpotPriceResponse.encode(message).finish(),
    };
  },
};
