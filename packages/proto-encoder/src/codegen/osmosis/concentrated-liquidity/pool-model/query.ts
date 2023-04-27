//@ts-nocheck
/* eslint-disable */
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from "../../../cosmos/base/query/v1beta1/pagination";
import {
  PositionWithUnderlyingAssetBreakdown,
  PositionWithUnderlyingAssetBreakdownAmino,
  PositionWithUnderlyingAssetBreakdownSDKType,
} from "../position";
import {
  Any,
  AnyProtoMsg,
  AnyAmino,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Params, ParamsAmino, ParamsSDKType } from "../params";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import { Pool as Pool1 } from "../pool";
import { PoolProtoMsg as Pool1ProtoMsg } from "../pool";
import { PoolSDKType as Pool1SDKType } from "../pool";
import {
  CosmWasmPool,
  CosmWasmPoolProtoMsg,
  CosmWasmPoolSDKType,
} from "../../cosmwasmpool/v1beta1/model/pool";
import { Pool as Pool2 } from "../../gamm/pool-models/balancer/balancerPool";
import { PoolProtoMsg as Pool2ProtoMsg } from "../../gamm/pool-models/balancer/balancerPool";
import { PoolSDKType as Pool2SDKType } from "../../gamm/pool-models/balancer/balancerPool";
import { Pool as Pool3 } from "../../gamm/pool-models/stableswap/stableswap_pool";
import { PoolProtoMsg as Pool3ProtoMsg } from "../../gamm/pool-models/stableswap/stableswap_pool";
import { PoolSDKType as Pool3SDKType } from "../../gamm/pool-models/stableswap/stableswap_pool";
import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** =============================== UserPositions */
export interface QueryUserPositionsRequest {
  address: string;
  poolId: Long;
}
export interface QueryUserPositionsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryUserPositionsRequest";
  value: Uint8Array;
}
/** =============================== UserPositions */
export interface QueryUserPositionsRequestAmino {
  address: string;
  pool_id: string;
}
export interface QueryUserPositionsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/query-user-positions-request";
  value: QueryUserPositionsRequestAmino;
}
/** =============================== UserPositions */
export interface QueryUserPositionsRequestSDKType {
  address: string;
  pool_id: Long;
}
export interface QueryUserPositionsResponse {
  positions: PositionWithUnderlyingAssetBreakdown[];
}
export interface QueryUserPositionsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryUserPositionsResponse";
  value: Uint8Array;
}
export interface QueryUserPositionsResponseAmino {
  positions: PositionWithUnderlyingAssetBreakdownAmino[];
}
export interface QueryUserPositionsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/query-user-positions-response";
  value: QueryUserPositionsResponseAmino;
}
export interface QueryUserPositionsResponseSDKType {
  positions: PositionWithUnderlyingAssetBreakdownSDKType[];
}
/** =============================== PositionById */
export interface QueryPositionByIdRequest {
  positionId: Long;
}
export interface QueryPositionByIdRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPositionByIdRequest";
  value: Uint8Array;
}
/** =============================== PositionById */
export interface QueryPositionByIdRequestAmino {
  position_id: string;
}
export interface QueryPositionByIdRequestAminoMsg {
  type: "osmosis/concentratedliquidity/query-position-by-id-request";
  value: QueryPositionByIdRequestAmino;
}
/** =============================== PositionById */
export interface QueryPositionByIdRequestSDKType {
  position_id: Long;
}
export interface QueryPositionByIdResponse {
  position?: PositionWithUnderlyingAssetBreakdown;
}
export interface QueryPositionByIdResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPositionByIdResponse";
  value: Uint8Array;
}
export interface QueryPositionByIdResponseAmino {
  position?: PositionWithUnderlyingAssetBreakdownAmino;
}
export interface QueryPositionByIdResponseAminoMsg {
  type: "osmosis/concentratedliquidity/query-position-by-id-response";
  value: QueryPositionByIdResponseAmino;
}
export interface QueryPositionByIdResponseSDKType {
  position?: PositionWithUnderlyingAssetBreakdownSDKType;
}
/** =============================== Pools */
export interface QueryPoolsRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryPoolsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPoolsRequest";
  value: Uint8Array;
}
/** =============================== Pools */
export interface QueryPoolsRequestAmino {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryPoolsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/query-pools-request";
  value: QueryPoolsRequestAmino;
}
/** =============================== Pools */
export interface QueryPoolsRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface QueryPoolsResponse {
  pools: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any)[] | Any[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryPoolsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPoolsResponse";
  value: Uint8Array;
}
export type QueryPoolsResponseEncoded = Omit<QueryPoolsResponse, "pools"> & {
  pools: (
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
  )[];
};
export interface QueryPoolsResponseAmino {
  pools: AnyAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryPoolsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/query-pools-response";
  value: QueryPoolsResponseAmino;
}
export interface QueryPoolsResponseSDKType {
  pools: (
    | Pool1SDKType
    | CosmWasmPoolSDKType
    | Pool2SDKType
    | Pool3SDKType
    | AnySDKType
  )[];
  pagination?: PageResponseSDKType;
}
/** =============================== ModuleParams */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryParamsRequest";
  value: Uint8Array;
}
/** =============================== ModuleParams */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/query-params-request";
  value: QueryParamsRequestAmino;
}
/** =============================== ModuleParams */
export interface QueryParamsRequestSDKType {}
export interface QueryParamsResponse {
  params?: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryParamsResponse";
  value: Uint8Array;
}
export interface QueryParamsResponseAmino {
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/query-params-response";
  value: QueryParamsResponseAmino;
}
export interface QueryParamsResponseSDKType {
  params?: ParamsSDKType;
}
export interface TickLiquidityNet {
  liquidityNet: string;
  tickIndex: string;
}
export interface TickLiquidityNetProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickLiquidityNet";
  value: Uint8Array;
}
export interface TickLiquidityNetAmino {
  liquidity_net: string;
  tick_index: string;
}
export interface TickLiquidityNetAminoMsg {
  type: "osmosis/concentratedliquidity/tick-liquidity-net";
  value: TickLiquidityNetAmino;
}
export interface TickLiquidityNetSDKType {
  liquidity_net: string;
  tick_index: string;
}
export interface LiquidityDepthWithRange {
  liquidityAmount: string;
  lowerTick: string;
  upperTick: string;
}
export interface LiquidityDepthWithRangeProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityDepthWithRange";
  value: Uint8Array;
}
export interface LiquidityDepthWithRangeAmino {
  liquidity_amount: string;
  lower_tick: string;
  upper_tick: string;
}
export interface LiquidityDepthWithRangeAminoMsg {
  type: "osmosis/concentratedliquidity/liquidity-depth-with-range";
  value: LiquidityDepthWithRangeAmino;
}
export interface LiquidityDepthWithRangeSDKType {
  liquidity_amount: string;
  lower_tick: string;
  upper_tick: string;
}
/** =============================== LiquidityNetInDirection */
export interface QueryLiquidityNetInDirectionRequest {
  poolId: Long;
  tokenIn: string;
  startTick: string;
  boundTick: string;
}
export interface QueryLiquidityNetInDirectionRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryLiquidityNetInDirectionRequest";
  value: Uint8Array;
}
/** =============================== LiquidityNetInDirection */
export interface QueryLiquidityNetInDirectionRequestAmino {
  pool_id: string;
  token_in: string;
  start_tick: string;
  bound_tick: string;
}
export interface QueryLiquidityNetInDirectionRequestAminoMsg {
  type: "osmosis/concentratedliquidity/query-liquidity-net-in-direction-request";
  value: QueryLiquidityNetInDirectionRequestAmino;
}
/** =============================== LiquidityNetInDirection */
export interface QueryLiquidityNetInDirectionRequestSDKType {
  pool_id: Long;
  token_in: string;
  start_tick: string;
  bound_tick: string;
}
export interface QueryLiquidityNetInDirectionResponse {
  liquidityDepths: TickLiquidityNet[];
  currentTick: Long;
  currentLiquidity: string;
}
export interface QueryLiquidityNetInDirectionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryLiquidityNetInDirectionResponse";
  value: Uint8Array;
}
export interface QueryLiquidityNetInDirectionResponseAmino {
  liquidity_depths: TickLiquidityNetAmino[];
  current_tick: string;
  current_liquidity: string;
}
export interface QueryLiquidityNetInDirectionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/query-liquidity-net-in-direction-response";
  value: QueryLiquidityNetInDirectionResponseAmino;
}
export interface QueryLiquidityNetInDirectionResponseSDKType {
  liquidity_depths: TickLiquidityNetSDKType[];
  current_tick: Long;
  current_liquidity: string;
}
/** =============================== TotalLiquidityForRange */
export interface QueryTotalLiquidityForRangeRequest {
  poolId: Long;
}
export interface QueryTotalLiquidityForRangeRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryTotalLiquidityForRangeRequest";
  value: Uint8Array;
}
/** =============================== TotalLiquidityForRange */
export interface QueryTotalLiquidityForRangeRequestAmino {
  pool_id: string;
}
export interface QueryTotalLiquidityForRangeRequestAminoMsg {
  type: "osmosis/concentratedliquidity/query-total-liquidity-for-range-request";
  value: QueryTotalLiquidityForRangeRequestAmino;
}
/** =============================== TotalLiquidityForRange */
export interface QueryTotalLiquidityForRangeRequestSDKType {
  pool_id: Long;
}
export interface QueryTotalLiquidityForRangeResponse {
  liquidity: LiquidityDepthWithRange[];
}
export interface QueryTotalLiquidityForRangeResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryTotalLiquidityForRangeResponse";
  value: Uint8Array;
}
export interface QueryTotalLiquidityForRangeResponseAmino {
  liquidity: LiquidityDepthWithRangeAmino[];
}
export interface QueryTotalLiquidityForRangeResponseAminoMsg {
  type: "osmosis/concentratedliquidity/query-total-liquidity-for-range-response";
  value: QueryTotalLiquidityForRangeResponseAmino;
}
export interface QueryTotalLiquidityForRangeResponseSDKType {
  liquidity: LiquidityDepthWithRangeSDKType[];
}
/** ===================== MsgQueryClaimableFees */
export interface QueryClaimableFeesRequest {
  positionId: Long;
}
export interface QueryClaimableFeesRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryClaimableFeesRequest";
  value: Uint8Array;
}
/** ===================== MsgQueryClaimableFees */
export interface QueryClaimableFeesRequestAmino {
  position_id: string;
}
export interface QueryClaimableFeesRequestAminoMsg {
  type: "osmosis/concentratedliquidity/query-claimable-fees-request";
  value: QueryClaimableFeesRequestAmino;
}
/** ===================== MsgQueryClaimableFees */
export interface QueryClaimableFeesRequestSDKType {
  position_id: Long;
}
export interface QueryClaimableFeesResponse {
  claimableFees: Coin[];
}
export interface QueryClaimableFeesResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryClaimableFeesResponse";
  value: Uint8Array;
}
export interface QueryClaimableFeesResponseAmino {
  claimable_fees: CoinAmino[];
}
export interface QueryClaimableFeesResponseAminoMsg {
  type: "osmosis/concentratedliquidity/query-claimable-fees-response";
  value: QueryClaimableFeesResponseAmino;
}
export interface QueryClaimableFeesResponseSDKType {
  claimable_fees: CoinSDKType[];
}
function createBaseQueryUserPositionsRequest(): QueryUserPositionsRequest {
  return {
    address: "",
    poolId: Long.UZERO,
  };
}
export const QueryUserPositionsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryUserPositionsRequest",
  encode(
    message: QueryUserPositionsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryUserPositionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserPositionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryUserPositionsRequest>
  ): QueryUserPositionsRequest {
    const message = createBaseQueryUserPositionsRequest();
    message.address = object.address ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryUserPositionsRequestAmino): QueryUserPositionsRequest {
    return {
      address: object.address,
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: QueryUserPositionsRequest): QueryUserPositionsRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryUserPositionsRequestAminoMsg
  ): QueryUserPositionsRequest {
    return QueryUserPositionsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryUserPositionsRequest
  ): QueryUserPositionsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-user-positions-request",
      value: QueryUserPositionsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryUserPositionsRequestProtoMsg
  ): QueryUserPositionsRequest {
    return QueryUserPositionsRequest.decode(message.value);
  },
  toProto(message: QueryUserPositionsRequest): Uint8Array {
    return QueryUserPositionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserPositionsRequest
  ): QueryUserPositionsRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryUserPositionsRequest",
      value: QueryUserPositionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryUserPositionsResponse(): QueryUserPositionsResponse {
  return {
    positions: [],
  };
}
export const QueryUserPositionsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryUserPositionsResponse",
  encode(
    message: QueryUserPositionsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.positions) {
      PositionWithUnderlyingAssetBreakdown.encode(
        v!,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryUserPositionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryUserPositionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positions.push(
            PositionWithUnderlyingAssetBreakdown.decode(reader, reader.uint32())
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
    object: Partial<QueryUserPositionsResponse>
  ): QueryUserPositionsResponse {
    const message = createBaseQueryUserPositionsResponse();
    message.positions =
      object.positions?.map((e) =>
        PositionWithUnderlyingAssetBreakdown.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: QueryUserPositionsResponseAmino
  ): QueryUserPositionsResponse {
    return {
      positions: Array.isArray(object?.positions)
        ? object.positions.map((e: any) =>
            PositionWithUnderlyingAssetBreakdown.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: QueryUserPositionsResponse
  ): QueryUserPositionsResponseAmino {
    const obj: any = {};
    if (message.positions) {
      obj.positions = message.positions.map((e) =>
        e ? PositionWithUnderlyingAssetBreakdown.toAmino(e) : undefined
      );
    } else {
      obj.positions = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryUserPositionsResponseAminoMsg
  ): QueryUserPositionsResponse {
    return QueryUserPositionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryUserPositionsResponse
  ): QueryUserPositionsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-user-positions-response",
      value: QueryUserPositionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryUserPositionsResponseProtoMsg
  ): QueryUserPositionsResponse {
    return QueryUserPositionsResponse.decode(message.value);
  },
  toProto(message: QueryUserPositionsResponse): Uint8Array {
    return QueryUserPositionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryUserPositionsResponse
  ): QueryUserPositionsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryUserPositionsResponse",
      value: QueryUserPositionsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryPositionByIdRequest(): QueryPositionByIdRequest {
  return {
    positionId: Long.UZERO,
  };
}
export const QueryPositionByIdRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPositionByIdRequest",
  encode(
    message: QueryPositionByIdRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryPositionByIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPositionByIdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryPositionByIdRequest>
  ): QueryPositionByIdRequest {
    const message = createBaseQueryPositionByIdRequest();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryPositionByIdRequestAmino): QueryPositionByIdRequest {
    return {
      positionId: Long.fromString(object.position_id),
    };
  },
  toAmino(message: QueryPositionByIdRequest): QueryPositionByIdRequestAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryPositionByIdRequestAminoMsg
  ): QueryPositionByIdRequest {
    return QueryPositionByIdRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryPositionByIdRequest
  ): QueryPositionByIdRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-position-by-id-request",
      value: QueryPositionByIdRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryPositionByIdRequestProtoMsg
  ): QueryPositionByIdRequest {
    return QueryPositionByIdRequest.decode(message.value);
  },
  toProto(message: QueryPositionByIdRequest): Uint8Array {
    return QueryPositionByIdRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryPositionByIdRequest
  ): QueryPositionByIdRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryPositionByIdRequest",
      value: QueryPositionByIdRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPositionByIdResponse(): QueryPositionByIdResponse {
  return {
    position: undefined,
  };
}
export const QueryPositionByIdResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPositionByIdResponse",
  encode(
    message: QueryPositionByIdResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.position !== undefined) {
      PositionWithUnderlyingAssetBreakdown.encode(
        message.position,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryPositionByIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPositionByIdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = PositionWithUnderlyingAssetBreakdown.decode(
            reader,
            reader.uint32()
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
    object: Partial<QueryPositionByIdResponse>
  ): QueryPositionByIdResponse {
    const message = createBaseQueryPositionByIdResponse();
    message.position =
      object.position !== undefined && object.position !== null
        ? PositionWithUnderlyingAssetBreakdown.fromPartial(object.position)
        : undefined;
    return message;
  },
  fromAmino(object: QueryPositionByIdResponseAmino): QueryPositionByIdResponse {
    return {
      position: object?.position
        ? PositionWithUnderlyingAssetBreakdown.fromAmino(object.position)
        : undefined,
    };
  },
  toAmino(message: QueryPositionByIdResponse): QueryPositionByIdResponseAmino {
    const obj: any = {};
    obj.position = message.position
      ? PositionWithUnderlyingAssetBreakdown.toAmino(message.position)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryPositionByIdResponseAminoMsg
  ): QueryPositionByIdResponse {
    return QueryPositionByIdResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryPositionByIdResponse
  ): QueryPositionByIdResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-position-by-id-response",
      value: QueryPositionByIdResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryPositionByIdResponseProtoMsg
  ): QueryPositionByIdResponse {
    return QueryPositionByIdResponse.decode(message.value);
  },
  toProto(message: QueryPositionByIdResponse): Uint8Array {
    return QueryPositionByIdResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryPositionByIdResponse
  ): QueryPositionByIdResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryPositionByIdResponse",
      value: QueryPositionByIdResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolsRequest(): QueryPoolsRequest {
  return {
    pagination: undefined,
  };
}
export const QueryPoolsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPoolsRequest",
  encode(
    message: QueryPoolsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryPoolsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryPoolsRequest>): QueryPoolsRequest {
    const message = createBaseQueryPoolsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryPoolsRequestAmino): QueryPoolsRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryPoolsRequest): QueryPoolsRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolsRequestAminoMsg): QueryPoolsRequest {
    return QueryPoolsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolsRequest): QueryPoolsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-pools-request",
      value: QueryPoolsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolsRequestProtoMsg): QueryPoolsRequest {
    return QueryPoolsRequest.decode(message.value);
  },
  toProto(message: QueryPoolsRequest): Uint8Array {
    return QueryPoolsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolsRequest): QueryPoolsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPoolsRequest",
      value: QueryPoolsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolsResponse(): QueryPoolsResponse {
  return {
    pools: [],
    pagination: undefined,
  };
}
export const QueryPoolsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPoolsResponse",
  encode(
    message: QueryPoolsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.pools) {
      Any.encode(v! as Any, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryPoolsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pools.push(PoolI_InterfaceDecoder(reader) as Any);
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryPoolsResponse>): QueryPoolsResponse {
    const message = createBaseQueryPoolsResponse();
    message.pools = object.pools?.map((e) => Any.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryPoolsResponseAmino): QueryPoolsResponse {
    return {
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => PoolI_FromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryPoolsResponse): QueryPoolsResponseAmino {
    const obj: any = {};
    if (message.pools) {
      obj.pools = message.pools.map((e) =>
        e ? PoolI_ToAmino(e as Any) : undefined
      );
    } else {
      obj.pools = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolsResponseAminoMsg): QueryPoolsResponse {
    return QueryPoolsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolsResponse): QueryPoolsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-pools-response",
      value: QueryPoolsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolsResponseProtoMsg): QueryPoolsResponse {
    return QueryPoolsResponse.decode(message.value);
  },
  toProto(message: QueryPoolsResponse): Uint8Array {
    return QueryPoolsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolsResponse): QueryPoolsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryPoolsResponse",
      value: QueryPoolsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryParamsRequest",
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
      type: "osmosis/concentratedliquidity/query-params-request",
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
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryParamsRequest",
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
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryParamsResponse",
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
      type: "osmosis/concentratedliquidity/query-params-response",
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
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryParamsResponse",
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseTickLiquidityNet(): TickLiquidityNet {
  return {
    liquidityNet: "",
    tickIndex: "",
  };
}
export const TickLiquidityNet = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickLiquidityNet",
  encode(
    message: TickLiquidityNet,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.liquidityNet !== "") {
      writer.uint32(10).string(message.liquidityNet);
    }
    if (message.tickIndex !== "") {
      writer.uint32(18).string(message.tickIndex);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): TickLiquidityNet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickLiquidityNet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityNet = reader.string();
          break;
        case 2:
          message.tickIndex = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TickLiquidityNet>): TickLiquidityNet {
    const message = createBaseTickLiquidityNet();
    message.liquidityNet = object.liquidityNet ?? "";
    message.tickIndex = object.tickIndex ?? "";
    return message;
  },
  fromAmino(object: TickLiquidityNetAmino): TickLiquidityNet {
    return {
      liquidityNet: object.liquidity_net,
      tickIndex: object.tick_index,
    };
  },
  toAmino(message: TickLiquidityNet): TickLiquidityNetAmino {
    const obj: any = {};
    obj.liquidity_net = message.liquidityNet;
    obj.tick_index = message.tickIndex;
    return obj;
  },
  fromAminoMsg(object: TickLiquidityNetAminoMsg): TickLiquidityNet {
    return TickLiquidityNet.fromAmino(object.value);
  },
  toAminoMsg(message: TickLiquidityNet): TickLiquidityNetAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/tick-liquidity-net",
      value: TickLiquidityNet.toAmino(message),
    };
  },
  fromProtoMsg(message: TickLiquidityNetProtoMsg): TickLiquidityNet {
    return TickLiquidityNet.decode(message.value);
  },
  toProto(message: TickLiquidityNet): Uint8Array {
    return TickLiquidityNet.encode(message).finish();
  },
  toProtoMsg(message: TickLiquidityNet): TickLiquidityNetProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickLiquidityNet",
      value: TickLiquidityNet.encode(message).finish(),
    };
  },
};
function createBaseLiquidityDepthWithRange(): LiquidityDepthWithRange {
  return {
    liquidityAmount: "",
    lowerTick: "",
    upperTick: "",
  };
}
export const LiquidityDepthWithRange = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityDepthWithRange",
  encode(
    message: LiquidityDepthWithRange,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.liquidityAmount !== "") {
      writer.uint32(10).string(message.liquidityAmount);
    }
    if (message.lowerTick !== "") {
      writer.uint32(18).string(message.lowerTick);
    }
    if (message.upperTick !== "") {
      writer.uint32(26).string(message.upperTick);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): LiquidityDepthWithRange {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityDepthWithRange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityAmount = reader.string();
          break;
        case 2:
          message.lowerTick = reader.string();
          break;
        case 3:
          message.upperTick = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<LiquidityDepthWithRange>
  ): LiquidityDepthWithRange {
    const message = createBaseLiquidityDepthWithRange();
    message.liquidityAmount = object.liquidityAmount ?? "";
    message.lowerTick = object.lowerTick ?? "";
    message.upperTick = object.upperTick ?? "";
    return message;
  },
  fromAmino(object: LiquidityDepthWithRangeAmino): LiquidityDepthWithRange {
    return {
      liquidityAmount: object.liquidity_amount,
      lowerTick: object.lower_tick,
      upperTick: object.upper_tick,
    };
  },
  toAmino(message: LiquidityDepthWithRange): LiquidityDepthWithRangeAmino {
    const obj: any = {};
    obj.liquidity_amount = message.liquidityAmount;
    obj.lower_tick = message.lowerTick;
    obj.upper_tick = message.upperTick;
    return obj;
  },
  fromAminoMsg(
    object: LiquidityDepthWithRangeAminoMsg
  ): LiquidityDepthWithRange {
    return LiquidityDepthWithRange.fromAmino(object.value);
  },
  toAminoMsg(
    message: LiquidityDepthWithRange
  ): LiquidityDepthWithRangeAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/liquidity-depth-with-range",
      value: LiquidityDepthWithRange.toAmino(message),
    };
  },
  fromProtoMsg(
    message: LiquidityDepthWithRangeProtoMsg
  ): LiquidityDepthWithRange {
    return LiquidityDepthWithRange.decode(message.value);
  },
  toProto(message: LiquidityDepthWithRange): Uint8Array {
    return LiquidityDepthWithRange.encode(message).finish();
  },
  toProtoMsg(
    message: LiquidityDepthWithRange
  ): LiquidityDepthWithRangeProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityDepthWithRange",
      value: LiquidityDepthWithRange.encode(message).finish(),
    };
  },
};
function createBaseQueryLiquidityNetInDirectionRequest(): QueryLiquidityNetInDirectionRequest {
  return {
    poolId: Long.UZERO,
    tokenIn: "",
    startTick: undefined,
    boundTick: undefined,
  };
}
export const QueryLiquidityNetInDirectionRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.QueryLiquidityNetInDirectionRequest",
  encode(
    message: QueryLiquidityNetInDirectionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.tokenIn !== "") {
      writer.uint32(18).string(message.tokenIn);
    }
    if (message.startTick !== undefined) {
      writer.uint32(26).string(message.startTick);
    }
    if (message.boundTick !== undefined) {
      writer.uint32(34).string(message.boundTick);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryLiquidityNetInDirectionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLiquidityNetInDirectionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.tokenIn = reader.string();
          break;
        case 3:
          message.startTick = reader.string();
          break;
        case 4:
          message.boundTick = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryLiquidityNetInDirectionRequest>
  ): QueryLiquidityNetInDirectionRequest {
    const message = createBaseQueryLiquidityNetInDirectionRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokenIn = object.tokenIn ?? "";
    message.startTick = object.startTick ?? undefined;
    message.boundTick = object.boundTick ?? undefined;
    return message;
  },
  fromAmino(
    object: QueryLiquidityNetInDirectionRequestAmino
  ): QueryLiquidityNetInDirectionRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      tokenIn: object.token_in,
      startTick: object?.start_tick,
      boundTick: object?.bound_tick,
    };
  },
  toAmino(
    message: QueryLiquidityNetInDirectionRequest
  ): QueryLiquidityNetInDirectionRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.token_in = message.tokenIn;
    obj.start_tick = message.startTick;
    obj.bound_tick = message.boundTick;
    return obj;
  },
  fromAminoMsg(
    object: QueryLiquidityNetInDirectionRequestAminoMsg
  ): QueryLiquidityNetInDirectionRequest {
    return QueryLiquidityNetInDirectionRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryLiquidityNetInDirectionRequest
  ): QueryLiquidityNetInDirectionRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-liquidity-net-in-direction-request",
      value: QueryLiquidityNetInDirectionRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryLiquidityNetInDirectionRequestProtoMsg
  ): QueryLiquidityNetInDirectionRequest {
    return QueryLiquidityNetInDirectionRequest.decode(message.value);
  },
  toProto(message: QueryLiquidityNetInDirectionRequest): Uint8Array {
    return QueryLiquidityNetInDirectionRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryLiquidityNetInDirectionRequest
  ): QueryLiquidityNetInDirectionRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryLiquidityNetInDirectionRequest",
      value: QueryLiquidityNetInDirectionRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryLiquidityNetInDirectionResponse(): QueryLiquidityNetInDirectionResponse {
  return {
    liquidityDepths: [],
    currentTick: Long.ZERO,
    currentLiquidity: "",
  };
}
export const QueryLiquidityNetInDirectionResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.QueryLiquidityNetInDirectionResponse",
  encode(
    message: QueryLiquidityNetInDirectionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.liquidityDepths) {
      TickLiquidityNet.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (!message.currentTick.isZero()) {
      writer.uint32(16).int64(message.currentTick);
    }
    if (message.currentLiquidity !== "") {
      writer.uint32(26).string(message.currentLiquidity);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryLiquidityNetInDirectionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLiquidityNetInDirectionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityDepths.push(
            TickLiquidityNet.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.currentTick = reader.int64() as Long;
          break;
        case 3:
          message.currentLiquidity = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryLiquidityNetInDirectionResponse>
  ): QueryLiquidityNetInDirectionResponse {
    const message = createBaseQueryLiquidityNetInDirectionResponse();
    message.liquidityDepths =
      object.liquidityDepths?.map((e) => TickLiquidityNet.fromPartial(e)) || [];
    message.currentTick =
      object.currentTick !== undefined && object.currentTick !== null
        ? Long.fromValue(object.currentTick)
        : Long.ZERO;
    message.currentLiquidity = object.currentLiquidity ?? "";
    return message;
  },
  fromAmino(
    object: QueryLiquidityNetInDirectionResponseAmino
  ): QueryLiquidityNetInDirectionResponse {
    return {
      liquidityDepths: Array.isArray(object?.liquidity_depths)
        ? object.liquidity_depths.map((e: any) => TickLiquidityNet.fromAmino(e))
        : [],
      currentTick: Long.fromString(object.current_tick),
      currentLiquidity: object.current_liquidity,
    };
  },
  toAmino(
    message: QueryLiquidityNetInDirectionResponse
  ): QueryLiquidityNetInDirectionResponseAmino {
    const obj: any = {};
    if (message.liquidityDepths) {
      obj.liquidity_depths = message.liquidityDepths.map((e) =>
        e ? TickLiquidityNet.toAmino(e) : undefined
      );
    } else {
      obj.liquidity_depths = [];
    }
    obj.current_tick = message.currentTick
      ? message.currentTick.toString()
      : undefined;
    obj.current_liquidity = message.currentLiquidity;
    return obj;
  },
  fromAminoMsg(
    object: QueryLiquidityNetInDirectionResponseAminoMsg
  ): QueryLiquidityNetInDirectionResponse {
    return QueryLiquidityNetInDirectionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryLiquidityNetInDirectionResponse
  ): QueryLiquidityNetInDirectionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-liquidity-net-in-direction-response",
      value: QueryLiquidityNetInDirectionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryLiquidityNetInDirectionResponseProtoMsg
  ): QueryLiquidityNetInDirectionResponse {
    return QueryLiquidityNetInDirectionResponse.decode(message.value);
  },
  toProto(message: QueryLiquidityNetInDirectionResponse): Uint8Array {
    return QueryLiquidityNetInDirectionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryLiquidityNetInDirectionResponse
  ): QueryLiquidityNetInDirectionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryLiquidityNetInDirectionResponse",
      value: QueryLiquidityNetInDirectionResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalLiquidityForRangeRequest(): QueryTotalLiquidityForRangeRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const QueryTotalLiquidityForRangeRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.QueryTotalLiquidityForRangeRequest",
  encode(
    message: QueryTotalLiquidityForRangeRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalLiquidityForRangeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalLiquidityForRangeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryTotalLiquidityForRangeRequest>
  ): QueryTotalLiquidityForRangeRequest {
    const message = createBaseQueryTotalLiquidityForRangeRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: QueryTotalLiquidityForRangeRequestAmino
  ): QueryTotalLiquidityForRangeRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: QueryTotalLiquidityForRangeRequest
  ): QueryTotalLiquidityForRangeRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalLiquidityForRangeRequestAminoMsg
  ): QueryTotalLiquidityForRangeRequest {
    return QueryTotalLiquidityForRangeRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalLiquidityForRangeRequest
  ): QueryTotalLiquidityForRangeRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-total-liquidity-for-range-request",
      value: QueryTotalLiquidityForRangeRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalLiquidityForRangeRequestProtoMsg
  ): QueryTotalLiquidityForRangeRequest {
    return QueryTotalLiquidityForRangeRequest.decode(message.value);
  },
  toProto(message: QueryTotalLiquidityForRangeRequest): Uint8Array {
    return QueryTotalLiquidityForRangeRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalLiquidityForRangeRequest
  ): QueryTotalLiquidityForRangeRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryTotalLiquidityForRangeRequest",
      value: QueryTotalLiquidityForRangeRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalLiquidityForRangeResponse(): QueryTotalLiquidityForRangeResponse {
  return {
    liquidity: [],
  };
}
export const QueryTotalLiquidityForRangeResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.QueryTotalLiquidityForRangeResponse",
  encode(
    message: QueryTotalLiquidityForRangeResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.liquidity) {
      LiquidityDepthWithRange.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalLiquidityForRangeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalLiquidityForRangeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidity.push(
            LiquidityDepthWithRange.decode(reader, reader.uint32())
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
    object: Partial<QueryTotalLiquidityForRangeResponse>
  ): QueryTotalLiquidityForRangeResponse {
    const message = createBaseQueryTotalLiquidityForRangeResponse();
    message.liquidity =
      object.liquidity?.map((e) => LiquidityDepthWithRange.fromPartial(e)) ||
      [];
    return message;
  },
  fromAmino(
    object: QueryTotalLiquidityForRangeResponseAmino
  ): QueryTotalLiquidityForRangeResponse {
    return {
      liquidity: Array.isArray(object?.liquidity)
        ? object.liquidity.map((e: any) => LiquidityDepthWithRange.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryTotalLiquidityForRangeResponse
  ): QueryTotalLiquidityForRangeResponseAmino {
    const obj: any = {};
    if (message.liquidity) {
      obj.liquidity = message.liquidity.map((e) =>
        e ? LiquidityDepthWithRange.toAmino(e) : undefined
      );
    } else {
      obj.liquidity = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalLiquidityForRangeResponseAminoMsg
  ): QueryTotalLiquidityForRangeResponse {
    return QueryTotalLiquidityForRangeResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalLiquidityForRangeResponse
  ): QueryTotalLiquidityForRangeResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-total-liquidity-for-range-response",
      value: QueryTotalLiquidityForRangeResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalLiquidityForRangeResponseProtoMsg
  ): QueryTotalLiquidityForRangeResponse {
    return QueryTotalLiquidityForRangeResponse.decode(message.value);
  },
  toProto(message: QueryTotalLiquidityForRangeResponse): Uint8Array {
    return QueryTotalLiquidityForRangeResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalLiquidityForRangeResponse
  ): QueryTotalLiquidityForRangeResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryTotalLiquidityForRangeResponse",
      value: QueryTotalLiquidityForRangeResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimableFeesRequest(): QueryClaimableFeesRequest {
  return {
    positionId: Long.UZERO,
  };
}
export const QueryClaimableFeesRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryClaimableFeesRequest",
  encode(
    message: QueryClaimableFeesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryClaimableFeesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimableFeesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryClaimableFeesRequest>
  ): QueryClaimableFeesRequest {
    const message = createBaseQueryClaimableFeesRequest();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryClaimableFeesRequestAmino): QueryClaimableFeesRequest {
    return {
      positionId: Long.fromString(object.position_id),
    };
  },
  toAmino(message: QueryClaimableFeesRequest): QueryClaimableFeesRequestAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryClaimableFeesRequestAminoMsg
  ): QueryClaimableFeesRequest {
    return QueryClaimableFeesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryClaimableFeesRequest
  ): QueryClaimableFeesRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-claimable-fees-request",
      value: QueryClaimableFeesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryClaimableFeesRequestProtoMsg
  ): QueryClaimableFeesRequest {
    return QueryClaimableFeesRequest.decode(message.value);
  },
  toProto(message: QueryClaimableFeesRequest): Uint8Array {
    return QueryClaimableFeesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimableFeesRequest
  ): QueryClaimableFeesRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryClaimableFeesRequest",
      value: QueryClaimableFeesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryClaimableFeesResponse(): QueryClaimableFeesResponse {
  return {
    claimableFees: [],
  };
}
export const QueryClaimableFeesResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.QueryClaimableFeesResponse",
  encode(
    message: QueryClaimableFeesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.claimableFees) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryClaimableFeesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClaimableFeesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimableFees.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryClaimableFeesResponse>
  ): QueryClaimableFeesResponse {
    const message = createBaseQueryClaimableFeesResponse();
    message.claimableFees =
      object.claimableFees?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryClaimableFeesResponseAmino
  ): QueryClaimableFeesResponse {
    return {
      claimableFees: Array.isArray(object?.claimable_fees)
        ? object.claimable_fees.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryClaimableFeesResponse
  ): QueryClaimableFeesResponseAmino {
    const obj: any = {};
    if (message.claimableFees) {
      obj.claimable_fees = message.claimableFees.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.claimable_fees = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryClaimableFeesResponseAminoMsg
  ): QueryClaimableFeesResponse {
    return QueryClaimableFeesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryClaimableFeesResponse
  ): QueryClaimableFeesResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/query-claimable-fees-response",
      value: QueryClaimableFeesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryClaimableFeesResponseProtoMsg
  ): QueryClaimableFeesResponse {
    return QueryClaimableFeesResponse.decode(message.value);
  },
  toProto(message: QueryClaimableFeesResponse): Uint8Array {
    return QueryClaimableFeesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClaimableFeesResponse
  ): QueryClaimableFeesResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.QueryClaimableFeesResponse",
      value: QueryClaimableFeesResponse.encode(message).finish(),
    };
  },
};
export const PoolI_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): Pool1 | CosmWasmPool | Pool2 | Pool3 | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/osmosis.concentratedliquidity.v1beta1.Pool":
      return Pool1.decode(data.value);
    case "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool":
      return CosmWasmPool.decode(data.value);
    case "/osmosis.gamm.v1beta1.Pool":
      return Pool2.decode(data.value);
    case "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool":
      return Pool3.decode(data.value);
    default:
      return data;
  }
};
export const PoolI_FromAmino = (content: AnyAmino) => {
  switch (content.type) {
    case "osmosis/concentratedliquidity/pool":
      return Any.fromPartial({
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.Pool",
        value: Pool1.encode(
          Pool1.fromPartial(Pool1.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/cosmwasmpool/cosm-wasm-pool":
      return Any.fromPartial({
        typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
        value: CosmWasmPool.encode(
          CosmWasmPool.fromPartial(CosmWasmPool.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/gamm/BalancerPool":
      return Any.fromPartial({
        typeUrl: "/osmosis.gamm.v1beta1.Pool",
        value: Pool2.encode(
          Pool2.fromPartial(Pool2.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/gamm/StableswapPool":
      return Any.fromPartial({
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool",
        value: Pool3.encode(
          Pool3.fromPartial(Pool3.fromAmino(content.value))
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const PoolI_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/osmosis.concentratedliquidity.v1beta1.Pool":
      return {
        type: "osmosis/concentratedliquidity/pool",
        value: Pool1.toAmino(Pool1.decode(content.value)),
      };
    case "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool":
      return {
        type: "osmosis/cosmwasmpool/cosm-wasm-pool",
        value: CosmWasmPool.toAmino(CosmWasmPool.decode(content.value)),
      };
    case "/osmosis.gamm.v1beta1.Pool":
      return {
        type: "osmosis/gamm/BalancerPool",
        value: Pool2.toAmino(Pool2.decode(content.value)),
      };
    case "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool":
      return {
        type: "osmosis/gamm/StableswapPool",
        value: Pool3.toAmino(Pool3.decode(content.value)),
      };
    default:
      return Any.toAmino(content);
  }
};
