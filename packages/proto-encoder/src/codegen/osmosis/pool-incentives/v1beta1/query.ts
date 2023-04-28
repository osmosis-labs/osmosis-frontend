//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../../google/protobuf/duration";
import { Long } from "../../../helpers";
import { Gauge, GaugeAmino, GaugeSDKType } from "../../incentives/gauge";
import {
  DistrInfo,
  DistrInfoAmino,
  DistrInfoSDKType,
  Params,
  ParamsAmino,
  ParamsSDKType,
} from "./incentives";
export interface QueryGaugeIdsRequest {
  poolId: Long;
}
export interface QueryGaugeIdsRequestProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryGaugeIdsRequest";
  value: Uint8Array;
}
export interface QueryGaugeIdsRequestAmino {
  pool_id: string;
}
export interface QueryGaugeIdsRequestAminoMsg {
  type: "osmosis/poolincentives/query-gauge-ids-request";
  value: QueryGaugeIdsRequestAmino;
}
export interface QueryGaugeIdsRequestSDKType {
  pool_id: Long;
}
export interface QueryGaugeIdsResponse {
  gaugeIdsWithDuration: QueryGaugeIdsResponse_GaugeIdWithDuration[];
}
export interface QueryGaugeIdsResponseProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryGaugeIdsResponse";
  value: Uint8Array;
}
export interface QueryGaugeIdsResponseAmino {
  gauge_ids_with_duration: QueryGaugeIdsResponse_GaugeIdWithDurationAmino[];
}
export interface QueryGaugeIdsResponseAminoMsg {
  type: "osmosis/poolincentives/query-gauge-ids-response";
  value: QueryGaugeIdsResponseAmino;
}
export interface QueryGaugeIdsResponseSDKType {
  gauge_ids_with_duration: QueryGaugeIdsResponse_GaugeIdWithDurationSDKType[];
}
export interface QueryGaugeIdsResponse_GaugeIdWithDuration {
  gaugeId: Long;
  duration?: Duration;
  gaugeIncentivePercentage: string;
}
export interface QueryGaugeIdsResponse_GaugeIdWithDurationProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.GaugeIdWithDuration";
  value: Uint8Array;
}
export interface QueryGaugeIdsResponse_GaugeIdWithDurationAmino {
  gauge_id: string;
  duration?: DurationAmino;
  gauge_incentive_percentage: string;
}
export interface QueryGaugeIdsResponse_GaugeIdWithDurationAminoMsg {
  type: "osmosis/poolincentives/gauge-id-with-duration";
  value: QueryGaugeIdsResponse_GaugeIdWithDurationAmino;
}
export interface QueryGaugeIdsResponse_GaugeIdWithDurationSDKType {
  gauge_id: Long;
  duration?: DurationSDKType;
  gauge_incentive_percentage: string;
}
export interface QueryDistrInfoRequest {}
export interface QueryDistrInfoRequestProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryDistrInfoRequest";
  value: Uint8Array;
}
export interface QueryDistrInfoRequestAmino {}
export interface QueryDistrInfoRequestAminoMsg {
  type: "osmosis/poolincentives/query-distr-info-request";
  value: QueryDistrInfoRequestAmino;
}
export interface QueryDistrInfoRequestSDKType {}
export interface QueryDistrInfoResponse {
  distrInfo?: DistrInfo;
}
export interface QueryDistrInfoResponseProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryDistrInfoResponse";
  value: Uint8Array;
}
export interface QueryDistrInfoResponseAmino {
  distr_info?: DistrInfoAmino;
}
export interface QueryDistrInfoResponseAminoMsg {
  type: "osmosis/poolincentives/query-distr-info-response";
  value: QueryDistrInfoResponseAmino;
}
export interface QueryDistrInfoResponseSDKType {
  distr_info?: DistrInfoSDKType;
}
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryParamsRequest";
  value: Uint8Array;
}
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: "osmosis/poolincentives/query-params-request";
  value: QueryParamsRequestAmino;
}
export interface QueryParamsRequestSDKType {}
export interface QueryParamsResponse {
  params?: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryParamsResponse";
  value: Uint8Array;
}
export interface QueryParamsResponseAmino {
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: "osmosis/poolincentives/query-params-response";
  value: QueryParamsResponseAmino;
}
export interface QueryParamsResponseSDKType {
  params?: ParamsSDKType;
}
export interface QueryLockableDurationsRequest {}
export interface QueryLockableDurationsRequestProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryLockableDurationsRequest";
  value: Uint8Array;
}
export interface QueryLockableDurationsRequestAmino {}
export interface QueryLockableDurationsRequestAminoMsg {
  type: "osmosis/poolincentives/query-lockable-durations-request";
  value: QueryLockableDurationsRequestAmino;
}
export interface QueryLockableDurationsRequestSDKType {}
export interface QueryLockableDurationsResponse {
  lockableDurations: Duration[];
}
export interface QueryLockableDurationsResponseProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryLockableDurationsResponse";
  value: Uint8Array;
}
export interface QueryLockableDurationsResponseAmino {
  lockable_durations: DurationAmino[];
}
export interface QueryLockableDurationsResponseAminoMsg {
  type: "osmosis/poolincentives/query-lockable-durations-response";
  value: QueryLockableDurationsResponseAmino;
}
export interface QueryLockableDurationsResponseSDKType {
  lockable_durations: DurationSDKType[];
}
export interface QueryIncentivizedPoolsRequest {}
export interface QueryIncentivizedPoolsRequestProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryIncentivizedPoolsRequest";
  value: Uint8Array;
}
export interface QueryIncentivizedPoolsRequestAmino {}
export interface QueryIncentivizedPoolsRequestAminoMsg {
  type: "osmosis/poolincentives/query-incentivized-pools-request";
  value: QueryIncentivizedPoolsRequestAmino;
}
export interface QueryIncentivizedPoolsRequestSDKType {}
export interface IncentivizedPool {
  poolId: Long;
  lockableDuration?: Duration;
  gaugeId: Long;
}
export interface IncentivizedPoolProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.IncentivizedPool";
  value: Uint8Array;
}
export interface IncentivizedPoolAmino {
  pool_id: string;
  lockable_duration?: DurationAmino;
  gauge_id: string;
}
export interface IncentivizedPoolAminoMsg {
  type: "osmosis/poolincentives/incentivized-pool";
  value: IncentivizedPoolAmino;
}
export interface IncentivizedPoolSDKType {
  pool_id: Long;
  lockable_duration?: DurationSDKType;
  gauge_id: Long;
}
export interface QueryIncentivizedPoolsResponse {
  incentivizedPools: IncentivizedPool[];
}
export interface QueryIncentivizedPoolsResponseProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryIncentivizedPoolsResponse";
  value: Uint8Array;
}
export interface QueryIncentivizedPoolsResponseAmino {
  incentivized_pools: IncentivizedPoolAmino[];
}
export interface QueryIncentivizedPoolsResponseAminoMsg {
  type: "osmosis/poolincentives/query-incentivized-pools-response";
  value: QueryIncentivizedPoolsResponseAmino;
}
export interface QueryIncentivizedPoolsResponseSDKType {
  incentivized_pools: IncentivizedPoolSDKType[];
}
export interface QueryExternalIncentiveGaugesRequest {}
export interface QueryExternalIncentiveGaugesRequestProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryExternalIncentiveGaugesRequest";
  value: Uint8Array;
}
export interface QueryExternalIncentiveGaugesRequestAmino {}
export interface QueryExternalIncentiveGaugesRequestAminoMsg {
  type: "osmosis/poolincentives/query-external-incentive-gauges-request";
  value: QueryExternalIncentiveGaugesRequestAmino;
}
export interface QueryExternalIncentiveGaugesRequestSDKType {}
export interface QueryExternalIncentiveGaugesResponse {
  data: Gauge[];
}
export interface QueryExternalIncentiveGaugesResponseProtoMsg {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryExternalIncentiveGaugesResponse";
  value: Uint8Array;
}
export interface QueryExternalIncentiveGaugesResponseAmino {
  data: GaugeAmino[];
}
export interface QueryExternalIncentiveGaugesResponseAminoMsg {
  type: "osmosis/poolincentives/query-external-incentive-gauges-response";
  value: QueryExternalIncentiveGaugesResponseAmino;
}
export interface QueryExternalIncentiveGaugesResponseSDKType {
  data: GaugeSDKType[];
}
function createBaseQueryGaugeIdsRequest(): QueryGaugeIdsRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const QueryGaugeIdsRequest = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryGaugeIdsRequest",
  encode(
    message: QueryGaugeIdsRequest,
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
  ): QueryGaugeIdsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGaugeIdsRequest();
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
  fromPartial(object: Partial<QueryGaugeIdsRequest>): QueryGaugeIdsRequest {
    const message = createBaseQueryGaugeIdsRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryGaugeIdsRequestAmino): QueryGaugeIdsRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: QueryGaugeIdsRequest): QueryGaugeIdsRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryGaugeIdsRequestAminoMsg): QueryGaugeIdsRequest {
    return QueryGaugeIdsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryGaugeIdsRequest): QueryGaugeIdsRequestAminoMsg {
    return {
      type: "osmosis/poolincentives/query-gauge-ids-request",
      value: QueryGaugeIdsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryGaugeIdsRequestProtoMsg): QueryGaugeIdsRequest {
    return QueryGaugeIdsRequest.decode(message.value);
  },
  toProto(message: QueryGaugeIdsRequest): Uint8Array {
    return QueryGaugeIdsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryGaugeIdsRequest): QueryGaugeIdsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryGaugeIdsRequest",
      value: QueryGaugeIdsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGaugeIdsResponse(): QueryGaugeIdsResponse {
  return {
    gaugeIdsWithDuration: [],
  };
}
export const QueryGaugeIdsResponse = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryGaugeIdsResponse",
  encode(
    message: QueryGaugeIdsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.gaugeIdsWithDuration) {
      QueryGaugeIdsResponse_GaugeIdWithDuration.encode(
        v!,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGaugeIdsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGaugeIdsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.gaugeIdsWithDuration.push(
            QueryGaugeIdsResponse_GaugeIdWithDuration.decode(
              reader,
              reader.uint32()
            )
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryGaugeIdsResponse>): QueryGaugeIdsResponse {
    const message = createBaseQueryGaugeIdsResponse();
    message.gaugeIdsWithDuration =
      object.gaugeIdsWithDuration?.map((e) =>
        QueryGaugeIdsResponse_GaugeIdWithDuration.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(object: QueryGaugeIdsResponseAmino): QueryGaugeIdsResponse {
    return {
      gaugeIdsWithDuration: Array.isArray(object?.gauge_ids_with_duration)
        ? object.gauge_ids_with_duration.map((e: any) =>
            QueryGaugeIdsResponse_GaugeIdWithDuration.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(message: QueryGaugeIdsResponse): QueryGaugeIdsResponseAmino {
    const obj: any = {};
    if (message.gaugeIdsWithDuration) {
      obj.gauge_ids_with_duration = message.gaugeIdsWithDuration.map((e) =>
        e ? QueryGaugeIdsResponse_GaugeIdWithDuration.toAmino(e) : undefined
      );
    } else {
      obj.gauge_ids_with_duration = [];
    }
    return obj;
  },
  fromAminoMsg(object: QueryGaugeIdsResponseAminoMsg): QueryGaugeIdsResponse {
    return QueryGaugeIdsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryGaugeIdsResponse): QueryGaugeIdsResponseAminoMsg {
    return {
      type: "osmosis/poolincentives/query-gauge-ids-response",
      value: QueryGaugeIdsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryGaugeIdsResponseProtoMsg): QueryGaugeIdsResponse {
    return QueryGaugeIdsResponse.decode(message.value);
  },
  toProto(message: QueryGaugeIdsResponse): Uint8Array {
    return QueryGaugeIdsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryGaugeIdsResponse): QueryGaugeIdsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryGaugeIdsResponse",
      value: QueryGaugeIdsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGaugeIdsResponse_GaugeIdWithDuration(): QueryGaugeIdsResponse_GaugeIdWithDuration {
  return {
    gaugeId: Long.UZERO,
    duration: undefined,
    gaugeIncentivePercentage: "",
  };
}
export const QueryGaugeIdsResponse_GaugeIdWithDuration = {
  typeUrl: "/osmosis.poolincentives.v1beta1.GaugeIdWithDuration",
  encode(
    message: QueryGaugeIdsResponse_GaugeIdWithDuration,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.gaugeId.isZero()) {
      writer.uint32(8).uint64(message.gaugeId);
    }
    if (message.duration !== undefined) {
      Duration.encode(message.duration, writer.uint32(18).fork()).ldelim();
    }
    if (message.gaugeIncentivePercentage !== "") {
      writer.uint32(26).string(message.gaugeIncentivePercentage);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGaugeIdsResponse_GaugeIdWithDuration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGaugeIdsResponse_GaugeIdWithDuration();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.gaugeId = reader.uint64() as Long;
          break;
        case 2:
          message.duration = Duration.decode(reader, reader.uint32());
          break;
        case 3:
          message.gaugeIncentivePercentage = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGaugeIdsResponse_GaugeIdWithDuration>
  ): QueryGaugeIdsResponse_GaugeIdWithDuration {
    const message = createBaseQueryGaugeIdsResponse_GaugeIdWithDuration();
    message.gaugeId =
      object.gaugeId !== undefined && object.gaugeId !== null
        ? Long.fromValue(object.gaugeId)
        : Long.UZERO;
    message.duration =
      object.duration !== undefined && object.duration !== null
        ? Duration.fromPartial(object.duration)
        : undefined;
    message.gaugeIncentivePercentage = object.gaugeIncentivePercentage ?? "";
    return message;
  },
  fromAmino(
    object: QueryGaugeIdsResponse_GaugeIdWithDurationAmino
  ): QueryGaugeIdsResponse_GaugeIdWithDuration {
    return {
      gaugeId: Long.fromString(object.gauge_id),
      duration: object?.duration
        ? Duration.fromAmino(object.duration)
        : undefined,
      gaugeIncentivePercentage: object.gauge_incentive_percentage,
    };
  },
  toAmino(
    message: QueryGaugeIdsResponse_GaugeIdWithDuration
  ): QueryGaugeIdsResponse_GaugeIdWithDurationAmino {
    const obj: any = {};
    obj.gauge_id = message.gaugeId ? message.gaugeId.toString() : undefined;
    obj.duration = message.duration
      ? Duration.toAmino(message.duration)
      : undefined;
    obj.gauge_incentive_percentage = message.gaugeIncentivePercentage;
    return obj;
  },
  fromAminoMsg(
    object: QueryGaugeIdsResponse_GaugeIdWithDurationAminoMsg
  ): QueryGaugeIdsResponse_GaugeIdWithDuration {
    return QueryGaugeIdsResponse_GaugeIdWithDuration.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGaugeIdsResponse_GaugeIdWithDuration
  ): QueryGaugeIdsResponse_GaugeIdWithDurationAminoMsg {
    return {
      type: "osmosis/poolincentives/gauge-id-with-duration",
      value: QueryGaugeIdsResponse_GaugeIdWithDuration.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGaugeIdsResponse_GaugeIdWithDurationProtoMsg
  ): QueryGaugeIdsResponse_GaugeIdWithDuration {
    return QueryGaugeIdsResponse_GaugeIdWithDuration.decode(message.value);
  },
  toProto(message: QueryGaugeIdsResponse_GaugeIdWithDuration): Uint8Array {
    return QueryGaugeIdsResponse_GaugeIdWithDuration.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGaugeIdsResponse_GaugeIdWithDuration
  ): QueryGaugeIdsResponse_GaugeIdWithDurationProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.GaugeIdWithDuration",
      value: QueryGaugeIdsResponse_GaugeIdWithDuration.encode(message).finish(),
    };
  },
};
function createBaseQueryDistrInfoRequest(): QueryDistrInfoRequest {
  return {};
}
export const QueryDistrInfoRequest = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryDistrInfoRequest",
  encode(
    _: QueryDistrInfoRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryDistrInfoRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDistrInfoRequest();
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
  fromPartial(_: Partial<QueryDistrInfoRequest>): QueryDistrInfoRequest {
    const message = createBaseQueryDistrInfoRequest();
    return message;
  },
  fromAmino(_: QueryDistrInfoRequestAmino): QueryDistrInfoRequest {
    return {};
  },
  toAmino(_: QueryDistrInfoRequest): QueryDistrInfoRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryDistrInfoRequestAminoMsg): QueryDistrInfoRequest {
    return QueryDistrInfoRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryDistrInfoRequest): QueryDistrInfoRequestAminoMsg {
    return {
      type: "osmosis/poolincentives/query-distr-info-request",
      value: QueryDistrInfoRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryDistrInfoRequestProtoMsg): QueryDistrInfoRequest {
    return QueryDistrInfoRequest.decode(message.value);
  },
  toProto(message: QueryDistrInfoRequest): Uint8Array {
    return QueryDistrInfoRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryDistrInfoRequest): QueryDistrInfoRequestProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryDistrInfoRequest",
      value: QueryDistrInfoRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDistrInfoResponse(): QueryDistrInfoResponse {
  return {
    distrInfo: undefined,
  };
}
export const QueryDistrInfoResponse = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryDistrInfoResponse",
  encode(
    message: QueryDistrInfoResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.distrInfo !== undefined) {
      DistrInfo.encode(message.distrInfo, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryDistrInfoResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDistrInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distrInfo = DistrInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryDistrInfoResponse>): QueryDistrInfoResponse {
    const message = createBaseQueryDistrInfoResponse();
    message.distrInfo =
      object.distrInfo !== undefined && object.distrInfo !== null
        ? DistrInfo.fromPartial(object.distrInfo)
        : undefined;
    return message;
  },
  fromAmino(object: QueryDistrInfoResponseAmino): QueryDistrInfoResponse {
    return {
      distrInfo: object?.distr_info
        ? DistrInfo.fromAmino(object.distr_info)
        : undefined,
    };
  },
  toAmino(message: QueryDistrInfoResponse): QueryDistrInfoResponseAmino {
    const obj: any = {};
    obj.distr_info = message.distrInfo
      ? DistrInfo.toAmino(message.distrInfo)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryDistrInfoResponseAminoMsg): QueryDistrInfoResponse {
    return QueryDistrInfoResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryDistrInfoResponse): QueryDistrInfoResponseAminoMsg {
    return {
      type: "osmosis/poolincentives/query-distr-info-response",
      value: QueryDistrInfoResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryDistrInfoResponseProtoMsg
  ): QueryDistrInfoResponse {
    return QueryDistrInfoResponse.decode(message.value);
  },
  toProto(message: QueryDistrInfoResponse): Uint8Array {
    return QueryDistrInfoResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryDistrInfoResponse): QueryDistrInfoResponseProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryDistrInfoResponse",
      value: QueryDistrInfoResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryParamsRequest",
  encode(
    _: QueryParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
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
      type: "osmosis/poolincentives/query-params-request",
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
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryParamsRequest",
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
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryParamsResponse",
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
    const end = length === undefined ? reader.len : reader.pos + length;
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
      type: "osmosis/poolincentives/query-params-response",
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
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryParamsResponse",
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryLockableDurationsRequest(): QueryLockableDurationsRequest {
  return {};
}
export const QueryLockableDurationsRequest = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryLockableDurationsRequest",
  encode(
    _: QueryLockableDurationsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryLockableDurationsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLockableDurationsRequest();
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
    _: Partial<QueryLockableDurationsRequest>
  ): QueryLockableDurationsRequest {
    const message = createBaseQueryLockableDurationsRequest();
    return message;
  },
  fromAmino(
    _: QueryLockableDurationsRequestAmino
  ): QueryLockableDurationsRequest {
    return {};
  },
  toAmino(
    _: QueryLockableDurationsRequest
  ): QueryLockableDurationsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryLockableDurationsRequestAminoMsg
  ): QueryLockableDurationsRequest {
    return QueryLockableDurationsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryLockableDurationsRequest
  ): QueryLockableDurationsRequestAminoMsg {
    return {
      type: "osmosis/poolincentives/query-lockable-durations-request",
      value: QueryLockableDurationsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryLockableDurationsRequestProtoMsg
  ): QueryLockableDurationsRequest {
    return QueryLockableDurationsRequest.decode(message.value);
  },
  toProto(message: QueryLockableDurationsRequest): Uint8Array {
    return QueryLockableDurationsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryLockableDurationsRequest
  ): QueryLockableDurationsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryLockableDurationsRequest",
      value: QueryLockableDurationsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryLockableDurationsResponse(): QueryLockableDurationsResponse {
  return {
    lockableDurations: [],
  };
}
export const QueryLockableDurationsResponse = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryLockableDurationsResponse",
  encode(
    message: QueryLockableDurationsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.lockableDurations) {
      Duration.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryLockableDurationsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryLockableDurationsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lockableDurations.push(
            Duration.decode(reader, reader.uint32())
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
    object: Partial<QueryLockableDurationsResponse>
  ): QueryLockableDurationsResponse {
    const message = createBaseQueryLockableDurationsResponse();
    message.lockableDurations =
      object.lockableDurations?.map((e) => Duration.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryLockableDurationsResponseAmino
  ): QueryLockableDurationsResponse {
    return {
      lockableDurations: Array.isArray(object?.lockable_durations)
        ? object.lockable_durations.map((e: any) => Duration.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryLockableDurationsResponse
  ): QueryLockableDurationsResponseAmino {
    const obj: any = {};
    if (message.lockableDurations) {
      obj.lockable_durations = message.lockableDurations.map((e) =>
        e ? Duration.toAmino(e) : undefined
      );
    } else {
      obj.lockable_durations = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryLockableDurationsResponseAminoMsg
  ): QueryLockableDurationsResponse {
    return QueryLockableDurationsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryLockableDurationsResponse
  ): QueryLockableDurationsResponseAminoMsg {
    return {
      type: "osmosis/poolincentives/query-lockable-durations-response",
      value: QueryLockableDurationsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryLockableDurationsResponseProtoMsg
  ): QueryLockableDurationsResponse {
    return QueryLockableDurationsResponse.decode(message.value);
  },
  toProto(message: QueryLockableDurationsResponse): Uint8Array {
    return QueryLockableDurationsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryLockableDurationsResponse
  ): QueryLockableDurationsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryLockableDurationsResponse",
      value: QueryLockableDurationsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryIncentivizedPoolsRequest(): QueryIncentivizedPoolsRequest {
  return {};
}
export const QueryIncentivizedPoolsRequest = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryIncentivizedPoolsRequest",
  encode(
    _: QueryIncentivizedPoolsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryIncentivizedPoolsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryIncentivizedPoolsRequest();
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
    _: Partial<QueryIncentivizedPoolsRequest>
  ): QueryIncentivizedPoolsRequest {
    const message = createBaseQueryIncentivizedPoolsRequest();
    return message;
  },
  fromAmino(
    _: QueryIncentivizedPoolsRequestAmino
  ): QueryIncentivizedPoolsRequest {
    return {};
  },
  toAmino(
    _: QueryIncentivizedPoolsRequest
  ): QueryIncentivizedPoolsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryIncentivizedPoolsRequestAminoMsg
  ): QueryIncentivizedPoolsRequest {
    return QueryIncentivizedPoolsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryIncentivizedPoolsRequest
  ): QueryIncentivizedPoolsRequestAminoMsg {
    return {
      type: "osmosis/poolincentives/query-incentivized-pools-request",
      value: QueryIncentivizedPoolsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryIncentivizedPoolsRequestProtoMsg
  ): QueryIncentivizedPoolsRequest {
    return QueryIncentivizedPoolsRequest.decode(message.value);
  },
  toProto(message: QueryIncentivizedPoolsRequest): Uint8Array {
    return QueryIncentivizedPoolsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryIncentivizedPoolsRequest
  ): QueryIncentivizedPoolsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryIncentivizedPoolsRequest",
      value: QueryIncentivizedPoolsRequest.encode(message).finish(),
    };
  },
};
function createBaseIncentivizedPool(): IncentivizedPool {
  return {
    poolId: Long.UZERO,
    lockableDuration: undefined,
    gaugeId: Long.UZERO,
  };
}
export const IncentivizedPool = {
  typeUrl: "/osmosis.poolincentives.v1beta1.IncentivizedPool",
  encode(
    message: IncentivizedPool,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.lockableDuration !== undefined) {
      Duration.encode(
        message.lockableDuration,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (!message.gaugeId.isZero()) {
      writer.uint32(24).uint64(message.gaugeId);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): IncentivizedPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIncentivizedPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.lockableDuration = Duration.decode(reader, reader.uint32());
          break;
        case 3:
          message.gaugeId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<IncentivizedPool>): IncentivizedPool {
    const message = createBaseIncentivizedPool();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.lockableDuration =
      object.lockableDuration !== undefined && object.lockableDuration !== null
        ? Duration.fromPartial(object.lockableDuration)
        : undefined;
    message.gaugeId =
      object.gaugeId !== undefined && object.gaugeId !== null
        ? Long.fromValue(object.gaugeId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: IncentivizedPoolAmino): IncentivizedPool {
    return {
      poolId: Long.fromString(object.pool_id),
      lockableDuration: object?.lockable_duration
        ? Duration.fromAmino(object.lockable_duration)
        : undefined,
      gaugeId: Long.fromString(object.gauge_id),
    };
  },
  toAmino(message: IncentivizedPool): IncentivizedPoolAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.lockable_duration = message.lockableDuration
      ? Duration.toAmino(message.lockableDuration)
      : undefined;
    obj.gauge_id = message.gaugeId ? message.gaugeId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: IncentivizedPoolAminoMsg): IncentivizedPool {
    return IncentivizedPool.fromAmino(object.value);
  },
  toAminoMsg(message: IncentivizedPool): IncentivizedPoolAminoMsg {
    return {
      type: "osmosis/poolincentives/incentivized-pool",
      value: IncentivizedPool.toAmino(message),
    };
  },
  fromProtoMsg(message: IncentivizedPoolProtoMsg): IncentivizedPool {
    return IncentivizedPool.decode(message.value);
  },
  toProto(message: IncentivizedPool): Uint8Array {
    return IncentivizedPool.encode(message).finish();
  },
  toProtoMsg(message: IncentivizedPool): IncentivizedPoolProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.IncentivizedPool",
      value: IncentivizedPool.encode(message).finish(),
    };
  },
};
function createBaseQueryIncentivizedPoolsResponse(): QueryIncentivizedPoolsResponse {
  return {
    incentivizedPools: [],
  };
}
export const QueryIncentivizedPoolsResponse = {
  typeUrl: "/osmosis.poolincentives.v1beta1.QueryIncentivizedPoolsResponse",
  encode(
    message: QueryIncentivizedPoolsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.incentivizedPools) {
      IncentivizedPool.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryIncentivizedPoolsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryIncentivizedPoolsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.incentivizedPools.push(
            IncentivizedPool.decode(reader, reader.uint32())
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
    object: Partial<QueryIncentivizedPoolsResponse>
  ): QueryIncentivizedPoolsResponse {
    const message = createBaseQueryIncentivizedPoolsResponse();
    message.incentivizedPools =
      object.incentivizedPools?.map((e) => IncentivizedPool.fromPartial(e)) ||
      [];
    return message;
  },
  fromAmino(
    object: QueryIncentivizedPoolsResponseAmino
  ): QueryIncentivizedPoolsResponse {
    return {
      incentivizedPools: Array.isArray(object?.incentivized_pools)
        ? object.incentivized_pools.map((e: any) =>
            IncentivizedPool.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: QueryIncentivizedPoolsResponse
  ): QueryIncentivizedPoolsResponseAmino {
    const obj: any = {};
    if (message.incentivizedPools) {
      obj.incentivized_pools = message.incentivizedPools.map((e) =>
        e ? IncentivizedPool.toAmino(e) : undefined
      );
    } else {
      obj.incentivized_pools = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryIncentivizedPoolsResponseAminoMsg
  ): QueryIncentivizedPoolsResponse {
    return QueryIncentivizedPoolsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryIncentivizedPoolsResponse
  ): QueryIncentivizedPoolsResponseAminoMsg {
    return {
      type: "osmosis/poolincentives/query-incentivized-pools-response",
      value: QueryIncentivizedPoolsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryIncentivizedPoolsResponseProtoMsg
  ): QueryIncentivizedPoolsResponse {
    return QueryIncentivizedPoolsResponse.decode(message.value);
  },
  toProto(message: QueryIncentivizedPoolsResponse): Uint8Array {
    return QueryIncentivizedPoolsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryIncentivizedPoolsResponse
  ): QueryIncentivizedPoolsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.poolincentives.v1beta1.QueryIncentivizedPoolsResponse",
      value: QueryIncentivizedPoolsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryExternalIncentiveGaugesRequest(): QueryExternalIncentiveGaugesRequest {
  return {};
}
export const QueryExternalIncentiveGaugesRequest = {
  typeUrl:
    "/osmosis.poolincentives.v1beta1.QueryExternalIncentiveGaugesRequest",
  encode(
    _: QueryExternalIncentiveGaugesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryExternalIncentiveGaugesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryExternalIncentiveGaugesRequest();
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
    _: Partial<QueryExternalIncentiveGaugesRequest>
  ): QueryExternalIncentiveGaugesRequest {
    const message = createBaseQueryExternalIncentiveGaugesRequest();
    return message;
  },
  fromAmino(
    _: QueryExternalIncentiveGaugesRequestAmino
  ): QueryExternalIncentiveGaugesRequest {
    return {};
  },
  toAmino(
    _: QueryExternalIncentiveGaugesRequest
  ): QueryExternalIncentiveGaugesRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryExternalIncentiveGaugesRequestAminoMsg
  ): QueryExternalIncentiveGaugesRequest {
    return QueryExternalIncentiveGaugesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryExternalIncentiveGaugesRequest
  ): QueryExternalIncentiveGaugesRequestAminoMsg {
    return {
      type: "osmosis/poolincentives/query-external-incentive-gauges-request",
      value: QueryExternalIncentiveGaugesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryExternalIncentiveGaugesRequestProtoMsg
  ): QueryExternalIncentiveGaugesRequest {
    return QueryExternalIncentiveGaugesRequest.decode(message.value);
  },
  toProto(message: QueryExternalIncentiveGaugesRequest): Uint8Array {
    return QueryExternalIncentiveGaugesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryExternalIncentiveGaugesRequest
  ): QueryExternalIncentiveGaugesRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.poolincentives.v1beta1.QueryExternalIncentiveGaugesRequest",
      value: QueryExternalIncentiveGaugesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryExternalIncentiveGaugesResponse(): QueryExternalIncentiveGaugesResponse {
  return {
    data: [],
  };
}
export const QueryExternalIncentiveGaugesResponse = {
  typeUrl:
    "/osmosis.poolincentives.v1beta1.QueryExternalIncentiveGaugesResponse",
  encode(
    message: QueryExternalIncentiveGaugesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.data) {
      Gauge.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryExternalIncentiveGaugesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryExternalIncentiveGaugesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.data.push(Gauge.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryExternalIncentiveGaugesResponse>
  ): QueryExternalIncentiveGaugesResponse {
    const message = createBaseQueryExternalIncentiveGaugesResponse();
    message.data = object.data?.map((e) => Gauge.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryExternalIncentiveGaugesResponseAmino
  ): QueryExternalIncentiveGaugesResponse {
    return {
      data: Array.isArray(object?.data)
        ? object.data.map((e: any) => Gauge.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryExternalIncentiveGaugesResponse
  ): QueryExternalIncentiveGaugesResponseAmino {
    const obj: any = {};
    if (message.data) {
      obj.data = message.data.map((e) => (e ? Gauge.toAmino(e) : undefined));
    } else {
      obj.data = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryExternalIncentiveGaugesResponseAminoMsg
  ): QueryExternalIncentiveGaugesResponse {
    return QueryExternalIncentiveGaugesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryExternalIncentiveGaugesResponse
  ): QueryExternalIncentiveGaugesResponseAminoMsg {
    return {
      type: "osmosis/poolincentives/query-external-incentive-gauges-response",
      value: QueryExternalIncentiveGaugesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryExternalIncentiveGaugesResponseProtoMsg
  ): QueryExternalIncentiveGaugesResponse {
    return QueryExternalIncentiveGaugesResponse.decode(message.value);
  },
  toProto(message: QueryExternalIncentiveGaugesResponse): Uint8Array {
    return QueryExternalIncentiveGaugesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryExternalIncentiveGaugesResponse
  ): QueryExternalIncentiveGaugesResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.poolincentives.v1beta1.QueryExternalIncentiveGaugesResponse",
      value: QueryExternalIncentiveGaugesResponse.encode(message).finish(),
    };
  },
};
