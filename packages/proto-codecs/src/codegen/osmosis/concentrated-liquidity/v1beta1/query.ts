//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from "../../../cosmos/base/query/v1beta1/pagination";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
  DecCoin,
  DecCoinAmino,
  DecCoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Long } from "../../../helpers";
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
import { Params, ParamsAmino, ParamsSDKType } from "./params";
import { Pool as Pool1 } from "./pool";
import { PoolProtoMsg as Pool1ProtoMsg } from "./pool";
import { PoolSDKType as Pool1SDKType } from "./pool";
import {
  FullPositionBreakdown,
  FullPositionBreakdownAmino,
  FullPositionBreakdownSDKType,
} from "./position";
import {
  UptimeTracker,
  UptimeTrackerAmino,
  UptimeTrackerSDKType,
} from "./tickInfo";
/** =============================== UserPositions */
export interface UserPositionsRequest {
  address: string;
  poolId: Long;
}
export interface UserPositionsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsRequest";
  value: Uint8Array;
}
/** =============================== UserPositions */
export interface UserPositionsRequestAmino {
  address: string;
  pool_id: string;
}
export interface UserPositionsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/user-positions-request";
  value: UserPositionsRequestAmino;
}
/** =============================== UserPositions */
export interface UserPositionsRequestSDKType {
  address: string;
  pool_id: Long;
}
export interface UserPositionsResponse {
  positions: FullPositionBreakdown[];
}
export interface UserPositionsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsResponse";
  value: Uint8Array;
}
export interface UserPositionsResponseAmino {
  positions: FullPositionBreakdownAmino[];
}
export interface UserPositionsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/user-positions-response";
  value: UserPositionsResponseAmino;
}
export interface UserPositionsResponseSDKType {
  positions: FullPositionBreakdownSDKType[];
}
/** =============================== PositionById */
export interface PositionByIdRequest {
  positionId: Long;
}
export interface PositionByIdRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdRequest";
  value: Uint8Array;
}
/** =============================== PositionById */
export interface PositionByIdRequestAmino {
  position_id: string;
}
export interface PositionByIdRequestAminoMsg {
  type: "osmosis/concentratedliquidity/position-by-id-request";
  value: PositionByIdRequestAmino;
}
/** =============================== PositionById */
export interface PositionByIdRequestSDKType {
  position_id: Long;
}
export interface PositionByIdResponse {
  position?: FullPositionBreakdown;
}
export interface PositionByIdResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdResponse";
  value: Uint8Array;
}
export interface PositionByIdResponseAmino {
  position?: FullPositionBreakdownAmino;
}
export interface PositionByIdResponseAminoMsg {
  type: "osmosis/concentratedliquidity/position-by-id-response";
  value: PositionByIdResponseAmino;
}
export interface PositionByIdResponseSDKType {
  position?: FullPositionBreakdownSDKType;
}
/** =============================== Pools */
export interface PoolsRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface PoolsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsRequest";
  value: Uint8Array;
}
/** =============================== Pools */
export interface PoolsRequestAmino {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface PoolsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/pools-request";
  value: PoolsRequestAmino;
}
/** =============================== Pools */
export interface PoolsRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface PoolsResponse {
  pools: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any)[] | Any[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface PoolsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsResponse";
  value: Uint8Array;
}
export type PoolsResponseEncoded = Omit<PoolsResponse, "pools"> & {
  pools: (
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
  )[];
};
export interface PoolsResponseAmino {
  pools: AnyAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface PoolsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/pools-response";
  value: PoolsResponseAmino;
}
export interface PoolsResponseSDKType {
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
export interface ParamsRequest {}
export interface ParamsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ParamsRequest";
  value: Uint8Array;
}
/** =============================== ModuleParams */
export interface ParamsRequestAmino {}
export interface ParamsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/params-request";
  value: ParamsRequestAmino;
}
/** =============================== ModuleParams */
export interface ParamsRequestSDKType {}
export interface ParamsResponse {
  params?: Params;
}
export interface ParamsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ParamsResponse";
  value: Uint8Array;
}
export interface ParamsResponseAmino {
  params?: ParamsAmino;
}
export interface ParamsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/params-response";
  value: ParamsResponseAmino;
}
export interface ParamsResponseSDKType {
  params?: ParamsSDKType;
}
export interface TickLiquidityNet {
  liquidityNet: string;
  tickIndex: Long;
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
  tick_index: Long;
}
export interface LiquidityDepthWithRange {
  liquidityAmount: string;
  lowerTick: Long;
  upperTick: Long;
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
  lower_tick: Long;
  upper_tick: Long;
}
/** =============================== LiquidityNetInDirection */
export interface LiquidityNetInDirectionRequest {
  poolId: Long;
  tokenIn: string;
  startTick: Long;
  useCurTick: boolean;
  boundTick: Long;
  useNoBound: boolean;
}
export interface LiquidityNetInDirectionRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionRequest";
  value: Uint8Array;
}
/** =============================== LiquidityNetInDirection */
export interface LiquidityNetInDirectionRequestAmino {
  pool_id: string;
  token_in: string;
  start_tick: string;
  use_cur_tick: boolean;
  bound_tick: string;
  use_no_bound: boolean;
}
export interface LiquidityNetInDirectionRequestAminoMsg {
  type: "osmosis/concentratedliquidity/liquidity-net-in-direction-request";
  value: LiquidityNetInDirectionRequestAmino;
}
/** =============================== LiquidityNetInDirection */
export interface LiquidityNetInDirectionRequestSDKType {
  pool_id: Long;
  token_in: string;
  start_tick: Long;
  use_cur_tick: boolean;
  bound_tick: Long;
  use_no_bound: boolean;
}
export interface LiquidityNetInDirectionResponse {
  liquidityDepths: TickLiquidityNet[];
  currentTick: Long;
  currentLiquidity: string;
}
export interface LiquidityNetInDirectionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionResponse";
  value: Uint8Array;
}
export interface LiquidityNetInDirectionResponseAmino {
  liquidity_depths: TickLiquidityNetAmino[];
  current_tick: string;
  current_liquidity: string;
}
export interface LiquidityNetInDirectionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/liquidity-net-in-direction-response";
  value: LiquidityNetInDirectionResponseAmino;
}
export interface LiquidityNetInDirectionResponseSDKType {
  liquidity_depths: TickLiquidityNetSDKType[];
  current_tick: Long;
  current_liquidity: string;
}
/** =============================== LiquidityPerTickRange */
export interface LiquidityPerTickRangeRequest {
  poolId: Long;
}
export interface LiquidityPerTickRangeRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityPerTickRangeRequest";
  value: Uint8Array;
}
/** =============================== LiquidityPerTickRange */
export interface LiquidityPerTickRangeRequestAmino {
  pool_id: string;
}
export interface LiquidityPerTickRangeRequestAminoMsg {
  type: "osmosis/concentratedliquidity/liquidity-per-tick-range-request";
  value: LiquidityPerTickRangeRequestAmino;
}
/** =============================== LiquidityPerTickRange */
export interface LiquidityPerTickRangeRequestSDKType {
  pool_id: Long;
}
export interface LiquidityPerTickRangeResponse {
  liquidity: LiquidityDepthWithRange[];
}
export interface LiquidityPerTickRangeResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityPerTickRangeResponse";
  value: Uint8Array;
}
export interface LiquidityPerTickRangeResponseAmino {
  liquidity: LiquidityDepthWithRangeAmino[];
}
export interface LiquidityPerTickRangeResponseAminoMsg {
  type: "osmosis/concentratedliquidity/liquidity-per-tick-range-response";
  value: LiquidityPerTickRangeResponseAmino;
}
export interface LiquidityPerTickRangeResponseSDKType {
  liquidity: LiquidityDepthWithRangeSDKType[];
}
/** ===================== QueryClaimableSpreadRewards */
export interface ClaimableSpreadRewardsRequest {
  positionId: Long;
}
export interface ClaimableSpreadRewardsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ClaimableSpreadRewardsRequest";
  value: Uint8Array;
}
/** ===================== QueryClaimableSpreadRewards */
export interface ClaimableSpreadRewardsRequestAmino {
  position_id: string;
}
export interface ClaimableSpreadRewardsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/claimable-spread-rewards-request";
  value: ClaimableSpreadRewardsRequestAmino;
}
/** ===================== QueryClaimableSpreadRewards */
export interface ClaimableSpreadRewardsRequestSDKType {
  position_id: Long;
}
export interface ClaimableSpreadRewardsResponse {
  claimableSpreadRewards: Coin[];
}
export interface ClaimableSpreadRewardsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ClaimableSpreadRewardsResponse";
  value: Uint8Array;
}
export interface ClaimableSpreadRewardsResponseAmino {
  claimable_spread_rewards: CoinAmino[];
}
export interface ClaimableSpreadRewardsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/claimable-spread-rewards-response";
  value: ClaimableSpreadRewardsResponseAmino;
}
export interface ClaimableSpreadRewardsResponseSDKType {
  claimable_spread_rewards: CoinSDKType[];
}
/** ===================== QueryClaimableIncentives */
export interface ClaimableIncentivesRequest {
  positionId: Long;
}
export interface ClaimableIncentivesRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ClaimableIncentivesRequest";
  value: Uint8Array;
}
/** ===================== QueryClaimableIncentives */
export interface ClaimableIncentivesRequestAmino {
  position_id: string;
}
export interface ClaimableIncentivesRequestAminoMsg {
  type: "osmosis/concentratedliquidity/claimable-incentives-request";
  value: ClaimableIncentivesRequestAmino;
}
/** ===================== QueryClaimableIncentives */
export interface ClaimableIncentivesRequestSDKType {
  position_id: Long;
}
export interface ClaimableIncentivesResponse {
  claimableIncentives: Coin[];
  forfeitedIncentives: Coin[];
}
export interface ClaimableIncentivesResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ClaimableIncentivesResponse";
  value: Uint8Array;
}
export interface ClaimableIncentivesResponseAmino {
  claimable_incentives: CoinAmino[];
  forfeited_incentives: CoinAmino[];
}
export interface ClaimableIncentivesResponseAminoMsg {
  type: "osmosis/concentratedliquidity/claimable-incentives-response";
  value: ClaimableIncentivesResponseAmino;
}
export interface ClaimableIncentivesResponseSDKType {
  claimable_incentives: CoinSDKType[];
  forfeited_incentives: CoinSDKType[];
}
/** ===================== QueryPoolAccumulatorRewards */
export interface PoolAccumulatorRewardsRequest {
  poolId: Long;
}
export interface PoolAccumulatorRewardsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolAccumulatorRewardsRequest";
  value: Uint8Array;
}
/** ===================== QueryPoolAccumulatorRewards */
export interface PoolAccumulatorRewardsRequestAmino {
  pool_id: string;
}
export interface PoolAccumulatorRewardsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/pool-accumulator-rewards-request";
  value: PoolAccumulatorRewardsRequestAmino;
}
/** ===================== QueryPoolAccumulatorRewards */
export interface PoolAccumulatorRewardsRequestSDKType {
  pool_id: Long;
}
export interface PoolAccumulatorRewardsResponse {
  spreadRewardGrowthGlobal: DecCoin[];
  uptimeGrowthGlobal: UptimeTracker[];
}
export interface PoolAccumulatorRewardsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolAccumulatorRewardsResponse";
  value: Uint8Array;
}
export interface PoolAccumulatorRewardsResponseAmino {
  spread_reward_growth_global: DecCoinAmino[];
  uptime_growth_global: UptimeTrackerAmino[];
}
export interface PoolAccumulatorRewardsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/pool-accumulator-rewards-response";
  value: PoolAccumulatorRewardsResponseAmino;
}
export interface PoolAccumulatorRewardsResponseSDKType {
  spread_reward_growth_global: DecCoinSDKType[];
  uptime_growth_global: UptimeTrackerSDKType[];
}
/** ===================== QueryTickAccumulatorTrackers */
export interface TickAccumulatorTrackersRequest {
  poolId: Long;
  tickIndex: Long;
}
export interface TickAccumulatorTrackersRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickAccumulatorTrackersRequest";
  value: Uint8Array;
}
/** ===================== QueryTickAccumulatorTrackers */
export interface TickAccumulatorTrackersRequestAmino {
  pool_id: string;
  tick_index: string;
}
export interface TickAccumulatorTrackersRequestAminoMsg {
  type: "osmosis/concentratedliquidity/tick-accumulator-trackers-request";
  value: TickAccumulatorTrackersRequestAmino;
}
/** ===================== QueryTickAccumulatorTrackers */
export interface TickAccumulatorTrackersRequestSDKType {
  pool_id: Long;
  tick_index: Long;
}
export interface TickAccumulatorTrackersResponse {
  spreadRewardGrowthOppositeDirectionOfLastTraversal: DecCoin[];
  uptimeTrackers: UptimeTracker[];
}
export interface TickAccumulatorTrackersResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickAccumulatorTrackersResponse";
  value: Uint8Array;
}
export interface TickAccumulatorTrackersResponseAmino {
  spread_reward_growth_opposite_direction_of_last_traversal: DecCoinAmino[];
  uptime_trackers: UptimeTrackerAmino[];
}
export interface TickAccumulatorTrackersResponseAminoMsg {
  type: "osmosis/concentratedliquidity/tick-accumulator-trackers-response";
  value: TickAccumulatorTrackersResponseAmino;
}
export interface TickAccumulatorTrackersResponseSDKType {
  spread_reward_growth_opposite_direction_of_last_traversal: DecCoinSDKType[];
  uptime_trackers: UptimeTrackerSDKType[];
}
function createBaseUserPositionsRequest(): UserPositionsRequest {
  return {
    address: "",
    poolId: Long.UZERO,
  };
}
export const UserPositionsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsRequest",
  encode(
    message: UserPositionsRequest,
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
  ): UserPositionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserPositionsRequest();
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
  fromPartial(object: Partial<UserPositionsRequest>): UserPositionsRequest {
    const message = createBaseUserPositionsRequest();
    message.address = object.address ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: UserPositionsRequestAmino): UserPositionsRequest {
    return {
      address: object.address,
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: UserPositionsRequest): UserPositionsRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: UserPositionsRequestAminoMsg): UserPositionsRequest {
    return UserPositionsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: UserPositionsRequest): UserPositionsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/user-positions-request",
      value: UserPositionsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: UserPositionsRequestProtoMsg): UserPositionsRequest {
    return UserPositionsRequest.decode(message.value);
  },
  toProto(message: UserPositionsRequest): Uint8Array {
    return UserPositionsRequest.encode(message).finish();
  },
  toProtoMsg(message: UserPositionsRequest): UserPositionsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsRequest",
      value: UserPositionsRequest.encode(message).finish(),
    };
  },
};
function createBaseUserPositionsResponse(): UserPositionsResponse {
  return {
    positions: [],
  };
}
export const UserPositionsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsResponse",
  encode(
    message: UserPositionsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.positions) {
      FullPositionBreakdown.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UserPositionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserPositionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positions.push(
            FullPositionBreakdown.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<UserPositionsResponse>): UserPositionsResponse {
    const message = createBaseUserPositionsResponse();
    message.positions =
      object.positions?.map((e) => FullPositionBreakdown.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: UserPositionsResponseAmino): UserPositionsResponse {
    return {
      positions: Array.isArray(object?.positions)
        ? object.positions.map((e: any) => FullPositionBreakdown.fromAmino(e))
        : [],
    };
  },
  toAmino(message: UserPositionsResponse): UserPositionsResponseAmino {
    const obj: any = {};
    if (message.positions) {
      obj.positions = message.positions.map((e) =>
        e ? FullPositionBreakdown.toAmino(e) : undefined
      );
    } else {
      obj.positions = [];
    }
    return obj;
  },
  fromAminoMsg(object: UserPositionsResponseAminoMsg): UserPositionsResponse {
    return UserPositionsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: UserPositionsResponse): UserPositionsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/user-positions-response",
      value: UserPositionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: UserPositionsResponseProtoMsg): UserPositionsResponse {
    return UserPositionsResponse.decode(message.value);
  },
  toProto(message: UserPositionsResponse): Uint8Array {
    return UserPositionsResponse.encode(message).finish();
  },
  toProtoMsg(message: UserPositionsResponse): UserPositionsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsResponse",
      value: UserPositionsResponse.encode(message).finish(),
    };
  },
};
function createBasePositionByIdRequest(): PositionByIdRequest {
  return {
    positionId: Long.UZERO,
  };
}
export const PositionByIdRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdRequest",
  encode(
    message: PositionByIdRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PositionByIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionByIdRequest();
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
  fromPartial(object: Partial<PositionByIdRequest>): PositionByIdRequest {
    const message = createBasePositionByIdRequest();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: PositionByIdRequestAmino): PositionByIdRequest {
    return {
      positionId: Long.fromString(object.position_id),
    };
  },
  toAmino(message: PositionByIdRequest): PositionByIdRequestAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PositionByIdRequestAminoMsg): PositionByIdRequest {
    return PositionByIdRequest.fromAmino(object.value);
  },
  toAminoMsg(message: PositionByIdRequest): PositionByIdRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/position-by-id-request",
      value: PositionByIdRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: PositionByIdRequestProtoMsg): PositionByIdRequest {
    return PositionByIdRequest.decode(message.value);
  },
  toProto(message: PositionByIdRequest): Uint8Array {
    return PositionByIdRequest.encode(message).finish();
  },
  toProtoMsg(message: PositionByIdRequest): PositionByIdRequestProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdRequest",
      value: PositionByIdRequest.encode(message).finish(),
    };
  },
};
function createBasePositionByIdResponse(): PositionByIdResponse {
  return {
    position: undefined,
  };
}
export const PositionByIdResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdResponse",
  encode(
    message: PositionByIdResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.position !== undefined) {
      FullPositionBreakdown.encode(
        message.position,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PositionByIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionByIdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = FullPositionBreakdown.decode(
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
  fromPartial(object: Partial<PositionByIdResponse>): PositionByIdResponse {
    const message = createBasePositionByIdResponse();
    message.position =
      object.position !== undefined && object.position !== null
        ? FullPositionBreakdown.fromPartial(object.position)
        : undefined;
    return message;
  },
  fromAmino(object: PositionByIdResponseAmino): PositionByIdResponse {
    return {
      position: object?.position
        ? FullPositionBreakdown.fromAmino(object.position)
        : undefined,
    };
  },
  toAmino(message: PositionByIdResponse): PositionByIdResponseAmino {
    const obj: any = {};
    obj.position = message.position
      ? FullPositionBreakdown.toAmino(message.position)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PositionByIdResponseAminoMsg): PositionByIdResponse {
    return PositionByIdResponse.fromAmino(object.value);
  },
  toAminoMsg(message: PositionByIdResponse): PositionByIdResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/position-by-id-response",
      value: PositionByIdResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: PositionByIdResponseProtoMsg): PositionByIdResponse {
    return PositionByIdResponse.decode(message.value);
  },
  toProto(message: PositionByIdResponse): Uint8Array {
    return PositionByIdResponse.encode(message).finish();
  },
  toProtoMsg(message: PositionByIdResponse): PositionByIdResponseProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdResponse",
      value: PositionByIdResponse.encode(message).finish(),
    };
  },
};
function createBasePoolsRequest(): PoolsRequest {
  return {
    pagination: undefined,
  };
}
export const PoolsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsRequest",
  encode(
    message: PoolsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PoolsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolsRequest();
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
  fromPartial(object: Partial<PoolsRequest>): PoolsRequest {
    const message = createBasePoolsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: PoolsRequestAmino): PoolsRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: PoolsRequest): PoolsRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PoolsRequestAminoMsg): PoolsRequest {
    return PoolsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: PoolsRequest): PoolsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/pools-request",
      value: PoolsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolsRequestProtoMsg): PoolsRequest {
    return PoolsRequest.decode(message.value);
  },
  toProto(message: PoolsRequest): Uint8Array {
    return PoolsRequest.encode(message).finish();
  },
  toProtoMsg(message: PoolsRequest): PoolsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsRequest",
      value: PoolsRequest.encode(message).finish(),
    };
  },
};
function createBasePoolsResponse(): PoolsResponse {
  return {
    pools: [],
    pagination: undefined,
  };
}
export const PoolsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsResponse",
  encode(
    message: PoolsResponse,
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
  decode(input: _m0.Reader | Uint8Array, length?: number): PoolsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolsResponse();
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
  fromPartial(object: Partial<PoolsResponse>): PoolsResponse {
    const message = createBasePoolsResponse();
    message.pools = object.pools?.map((e) => Any.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: PoolsResponseAmino): PoolsResponse {
    return {
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => PoolI_FromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: PoolsResponse): PoolsResponseAmino {
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
  fromAminoMsg(object: PoolsResponseAminoMsg): PoolsResponse {
    return PoolsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: PoolsResponse): PoolsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/pools-response",
      value: PoolsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolsResponseProtoMsg): PoolsResponse {
    return PoolsResponse.decode(message.value);
  },
  toProto(message: PoolsResponse): Uint8Array {
    return PoolsResponse.encode(message).finish();
  },
  toProtoMsg(message: PoolsResponse): PoolsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsResponse",
      value: PoolsResponse.encode(message).finish(),
    };
  },
};
function createBaseParamsRequest(): ParamsRequest {
  return {};
}
export const ParamsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ParamsRequest",
  encode(
    _: ParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
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
      type: "osmosis/concentratedliquidity/params-request",
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
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.ParamsRequest",
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
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ParamsResponse",
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
    const end = length === undefined ? reader.len : reader.pos + length;
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
      type: "osmosis/concentratedliquidity/params-response",
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
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.ParamsResponse",
      value: ParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseTickLiquidityNet(): TickLiquidityNet {
  return {
    liquidityNet: "",
    tickIndex: Long.ZERO,
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
    if (!message.tickIndex.isZero()) {
      writer.uint32(16).int64(message.tickIndex);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): TickLiquidityNet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickLiquidityNet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityNet = reader.string();
          break;
        case 2:
          message.tickIndex = reader.int64() as Long;
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
    message.tickIndex =
      object.tickIndex !== undefined && object.tickIndex !== null
        ? Long.fromValue(object.tickIndex)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: TickLiquidityNetAmino): TickLiquidityNet {
    return {
      liquidityNet: object.liquidity_net,
      tickIndex: Long.fromString(object.tick_index),
    };
  },
  toAmino(message: TickLiquidityNet): TickLiquidityNetAmino {
    const obj: any = {};
    obj.liquidity_net = message.liquidityNet;
    obj.tick_index = message.tickIndex
      ? message.tickIndex.toString()
      : undefined;
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
    lowerTick: Long.ZERO,
    upperTick: Long.ZERO,
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
    if (!message.lowerTick.isZero()) {
      writer.uint32(16).int64(message.lowerTick);
    }
    if (!message.upperTick.isZero()) {
      writer.uint32(24).int64(message.upperTick);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): LiquidityDepthWithRange {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityDepthWithRange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityAmount = reader.string();
          break;
        case 2:
          message.lowerTick = reader.int64() as Long;
          break;
        case 3:
          message.upperTick = reader.int64() as Long;
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
    message.lowerTick =
      object.lowerTick !== undefined && object.lowerTick !== null
        ? Long.fromValue(object.lowerTick)
        : Long.ZERO;
    message.upperTick =
      object.upperTick !== undefined && object.upperTick !== null
        ? Long.fromValue(object.upperTick)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: LiquidityDepthWithRangeAmino): LiquidityDepthWithRange {
    return {
      liquidityAmount: object.liquidity_amount,
      lowerTick: Long.fromString(object.lower_tick),
      upperTick: Long.fromString(object.upper_tick),
    };
  },
  toAmino(message: LiquidityDepthWithRange): LiquidityDepthWithRangeAmino {
    const obj: any = {};
    obj.liquidity_amount = message.liquidityAmount;
    obj.lower_tick = message.lowerTick
      ? message.lowerTick.toString()
      : undefined;
    obj.upper_tick = message.upperTick
      ? message.upperTick.toString()
      : undefined;
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
function createBaseLiquidityNetInDirectionRequest(): LiquidityNetInDirectionRequest {
  return {
    poolId: Long.UZERO,
    tokenIn: "",
    startTick: Long.ZERO,
    useCurTick: false,
    boundTick: Long.ZERO,
    useNoBound: false,
  };
}
export const LiquidityNetInDirectionRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionRequest",
  encode(
    message: LiquidityNetInDirectionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.tokenIn !== "") {
      writer.uint32(18).string(message.tokenIn);
    }
    if (!message.startTick.isZero()) {
      writer.uint32(24).int64(message.startTick);
    }
    if (message.useCurTick === true) {
      writer.uint32(32).bool(message.useCurTick);
    }
    if (!message.boundTick.isZero()) {
      writer.uint32(40).int64(message.boundTick);
    }
    if (message.useNoBound === true) {
      writer.uint32(48).bool(message.useNoBound);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): LiquidityNetInDirectionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityNetInDirectionRequest();
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
          message.startTick = reader.int64() as Long;
          break;
        case 4:
          message.useCurTick = reader.bool();
          break;
        case 5:
          message.boundTick = reader.int64() as Long;
          break;
        case 6:
          message.useNoBound = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<LiquidityNetInDirectionRequest>
  ): LiquidityNetInDirectionRequest {
    const message = createBaseLiquidityNetInDirectionRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokenIn = object.tokenIn ?? "";
    message.startTick =
      object.startTick !== undefined && object.startTick !== null
        ? Long.fromValue(object.startTick)
        : Long.ZERO;
    message.useCurTick = object.useCurTick ?? false;
    message.boundTick =
      object.boundTick !== undefined && object.boundTick !== null
        ? Long.fromValue(object.boundTick)
        : Long.ZERO;
    message.useNoBound = object.useNoBound ?? false;
    return message;
  },
  fromAmino(
    object: LiquidityNetInDirectionRequestAmino
  ): LiquidityNetInDirectionRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      tokenIn: object.token_in,
      startTick: Long.fromString(object.start_tick),
      useCurTick: object.use_cur_tick,
      boundTick: Long.fromString(object.bound_tick),
      useNoBound: object.use_no_bound,
    };
  },
  toAmino(
    message: LiquidityNetInDirectionRequest
  ): LiquidityNetInDirectionRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.token_in = message.tokenIn;
    obj.start_tick = message.startTick
      ? message.startTick.toString()
      : undefined;
    obj.use_cur_tick = message.useCurTick;
    obj.bound_tick = message.boundTick
      ? message.boundTick.toString()
      : undefined;
    obj.use_no_bound = message.useNoBound;
    return obj;
  },
  fromAminoMsg(
    object: LiquidityNetInDirectionRequestAminoMsg
  ): LiquidityNetInDirectionRequest {
    return LiquidityNetInDirectionRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: LiquidityNetInDirectionRequest
  ): LiquidityNetInDirectionRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/liquidity-net-in-direction-request",
      value: LiquidityNetInDirectionRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: LiquidityNetInDirectionRequestProtoMsg
  ): LiquidityNetInDirectionRequest {
    return LiquidityNetInDirectionRequest.decode(message.value);
  },
  toProto(message: LiquidityNetInDirectionRequest): Uint8Array {
    return LiquidityNetInDirectionRequest.encode(message).finish();
  },
  toProtoMsg(
    message: LiquidityNetInDirectionRequest
  ): LiquidityNetInDirectionRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionRequest",
      value: LiquidityNetInDirectionRequest.encode(message).finish(),
    };
  },
};
function createBaseLiquidityNetInDirectionResponse(): LiquidityNetInDirectionResponse {
  return {
    liquidityDepths: [],
    currentTick: Long.ZERO,
    currentLiquidity: "",
  };
}
export const LiquidityNetInDirectionResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionResponse",
  encode(
    message: LiquidityNetInDirectionResponse,
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
  ): LiquidityNetInDirectionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityNetInDirectionResponse();
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
    object: Partial<LiquidityNetInDirectionResponse>
  ): LiquidityNetInDirectionResponse {
    const message = createBaseLiquidityNetInDirectionResponse();
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
    object: LiquidityNetInDirectionResponseAmino
  ): LiquidityNetInDirectionResponse {
    return {
      liquidityDepths: Array.isArray(object?.liquidity_depths)
        ? object.liquidity_depths.map((e: any) => TickLiquidityNet.fromAmino(e))
        : [],
      currentTick: Long.fromString(object.current_tick),
      currentLiquidity: object.current_liquidity,
    };
  },
  toAmino(
    message: LiquidityNetInDirectionResponse
  ): LiquidityNetInDirectionResponseAmino {
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
    object: LiquidityNetInDirectionResponseAminoMsg
  ): LiquidityNetInDirectionResponse {
    return LiquidityNetInDirectionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: LiquidityNetInDirectionResponse
  ): LiquidityNetInDirectionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/liquidity-net-in-direction-response",
      value: LiquidityNetInDirectionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: LiquidityNetInDirectionResponseProtoMsg
  ): LiquidityNetInDirectionResponse {
    return LiquidityNetInDirectionResponse.decode(message.value);
  },
  toProto(message: LiquidityNetInDirectionResponse): Uint8Array {
    return LiquidityNetInDirectionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: LiquidityNetInDirectionResponse
  ): LiquidityNetInDirectionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionResponse",
      value: LiquidityNetInDirectionResponse.encode(message).finish(),
    };
  },
};
function createBaseLiquidityPerTickRangeRequest(): LiquidityPerTickRangeRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const LiquidityPerTickRangeRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.LiquidityPerTickRangeRequest",
  encode(
    message: LiquidityPerTickRangeRequest,
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
  ): LiquidityPerTickRangeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityPerTickRangeRequest();
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
    object: Partial<LiquidityPerTickRangeRequest>
  ): LiquidityPerTickRangeRequest {
    const message = createBaseLiquidityPerTickRangeRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: LiquidityPerTickRangeRequestAmino
  ): LiquidityPerTickRangeRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: LiquidityPerTickRangeRequest
  ): LiquidityPerTickRangeRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: LiquidityPerTickRangeRequestAminoMsg
  ): LiquidityPerTickRangeRequest {
    return LiquidityPerTickRangeRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: LiquidityPerTickRangeRequest
  ): LiquidityPerTickRangeRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/liquidity-per-tick-range-request",
      value: LiquidityPerTickRangeRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: LiquidityPerTickRangeRequestProtoMsg
  ): LiquidityPerTickRangeRequest {
    return LiquidityPerTickRangeRequest.decode(message.value);
  },
  toProto(message: LiquidityPerTickRangeRequest): Uint8Array {
    return LiquidityPerTickRangeRequest.encode(message).finish();
  },
  toProtoMsg(
    message: LiquidityPerTickRangeRequest
  ): LiquidityPerTickRangeRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.LiquidityPerTickRangeRequest",
      value: LiquidityPerTickRangeRequest.encode(message).finish(),
    };
  },
};
function createBaseLiquidityPerTickRangeResponse(): LiquidityPerTickRangeResponse {
  return {
    liquidity: [],
  };
}
export const LiquidityPerTickRangeResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.LiquidityPerTickRangeResponse",
  encode(
    message: LiquidityPerTickRangeResponse,
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
  ): LiquidityPerTickRangeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityPerTickRangeResponse();
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
    object: Partial<LiquidityPerTickRangeResponse>
  ): LiquidityPerTickRangeResponse {
    const message = createBaseLiquidityPerTickRangeResponse();
    message.liquidity =
      object.liquidity?.map((e) => LiquidityDepthWithRange.fromPartial(e)) ||
      [];
    return message;
  },
  fromAmino(
    object: LiquidityPerTickRangeResponseAmino
  ): LiquidityPerTickRangeResponse {
    return {
      liquidity: Array.isArray(object?.liquidity)
        ? object.liquidity.map((e: any) => LiquidityDepthWithRange.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: LiquidityPerTickRangeResponse
  ): LiquidityPerTickRangeResponseAmino {
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
    object: LiquidityPerTickRangeResponseAminoMsg
  ): LiquidityPerTickRangeResponse {
    return LiquidityPerTickRangeResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: LiquidityPerTickRangeResponse
  ): LiquidityPerTickRangeResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/liquidity-per-tick-range-response",
      value: LiquidityPerTickRangeResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: LiquidityPerTickRangeResponseProtoMsg
  ): LiquidityPerTickRangeResponse {
    return LiquidityPerTickRangeResponse.decode(message.value);
  },
  toProto(message: LiquidityPerTickRangeResponse): Uint8Array {
    return LiquidityPerTickRangeResponse.encode(message).finish();
  },
  toProtoMsg(
    message: LiquidityPerTickRangeResponse
  ): LiquidityPerTickRangeResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.LiquidityPerTickRangeResponse",
      value: LiquidityPerTickRangeResponse.encode(message).finish(),
    };
  },
};
function createBaseClaimableSpreadRewardsRequest(): ClaimableSpreadRewardsRequest {
  return {
    positionId: Long.UZERO,
  };
}
export const ClaimableSpreadRewardsRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.ClaimableSpreadRewardsRequest",
  encode(
    message: ClaimableSpreadRewardsRequest,
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
  ): ClaimableSpreadRewardsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimableSpreadRewardsRequest();
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
    object: Partial<ClaimableSpreadRewardsRequest>
  ): ClaimableSpreadRewardsRequest {
    const message = createBaseClaimableSpreadRewardsRequest();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: ClaimableSpreadRewardsRequestAmino
  ): ClaimableSpreadRewardsRequest {
    return {
      positionId: Long.fromString(object.position_id),
    };
  },
  toAmino(
    message: ClaimableSpreadRewardsRequest
  ): ClaimableSpreadRewardsRequestAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: ClaimableSpreadRewardsRequestAminoMsg
  ): ClaimableSpreadRewardsRequest {
    return ClaimableSpreadRewardsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: ClaimableSpreadRewardsRequest
  ): ClaimableSpreadRewardsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/claimable-spread-rewards-request",
      value: ClaimableSpreadRewardsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ClaimableSpreadRewardsRequestProtoMsg
  ): ClaimableSpreadRewardsRequest {
    return ClaimableSpreadRewardsRequest.decode(message.value);
  },
  toProto(message: ClaimableSpreadRewardsRequest): Uint8Array {
    return ClaimableSpreadRewardsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: ClaimableSpreadRewardsRequest
  ): ClaimableSpreadRewardsRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.ClaimableSpreadRewardsRequest",
      value: ClaimableSpreadRewardsRequest.encode(message).finish(),
    };
  },
};
function createBaseClaimableSpreadRewardsResponse(): ClaimableSpreadRewardsResponse {
  return {
    claimableSpreadRewards: [],
  };
}
export const ClaimableSpreadRewardsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.ClaimableSpreadRewardsResponse",
  encode(
    message: ClaimableSpreadRewardsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.claimableSpreadRewards) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ClaimableSpreadRewardsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimableSpreadRewardsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimableSpreadRewards.push(
            Coin.decode(reader, reader.uint32())
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
    object: Partial<ClaimableSpreadRewardsResponse>
  ): ClaimableSpreadRewardsResponse {
    const message = createBaseClaimableSpreadRewardsResponse();
    message.claimableSpreadRewards =
      object.claimableSpreadRewards?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: ClaimableSpreadRewardsResponseAmino
  ): ClaimableSpreadRewardsResponse {
    return {
      claimableSpreadRewards: Array.isArray(object?.claimable_spread_rewards)
        ? object.claimable_spread_rewards.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: ClaimableSpreadRewardsResponse
  ): ClaimableSpreadRewardsResponseAmino {
    const obj: any = {};
    if (message.claimableSpreadRewards) {
      obj.claimable_spread_rewards = message.claimableSpreadRewards.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.claimable_spread_rewards = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: ClaimableSpreadRewardsResponseAminoMsg
  ): ClaimableSpreadRewardsResponse {
    return ClaimableSpreadRewardsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: ClaimableSpreadRewardsResponse
  ): ClaimableSpreadRewardsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/claimable-spread-rewards-response",
      value: ClaimableSpreadRewardsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ClaimableSpreadRewardsResponseProtoMsg
  ): ClaimableSpreadRewardsResponse {
    return ClaimableSpreadRewardsResponse.decode(message.value);
  },
  toProto(message: ClaimableSpreadRewardsResponse): Uint8Array {
    return ClaimableSpreadRewardsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: ClaimableSpreadRewardsResponse
  ): ClaimableSpreadRewardsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.ClaimableSpreadRewardsResponse",
      value: ClaimableSpreadRewardsResponse.encode(message).finish(),
    };
  },
};
function createBaseClaimableIncentivesRequest(): ClaimableIncentivesRequest {
  return {
    positionId: Long.UZERO,
  };
}
export const ClaimableIncentivesRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ClaimableIncentivesRequest",
  encode(
    message: ClaimableIncentivesRequest,
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
  ): ClaimableIncentivesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimableIncentivesRequest();
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
    object: Partial<ClaimableIncentivesRequest>
  ): ClaimableIncentivesRequest {
    const message = createBaseClaimableIncentivesRequest();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: ClaimableIncentivesRequestAmino
  ): ClaimableIncentivesRequest {
    return {
      positionId: Long.fromString(object.position_id),
    };
  },
  toAmino(
    message: ClaimableIncentivesRequest
  ): ClaimableIncentivesRequestAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: ClaimableIncentivesRequestAminoMsg
  ): ClaimableIncentivesRequest {
    return ClaimableIncentivesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: ClaimableIncentivesRequest
  ): ClaimableIncentivesRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/claimable-incentives-request",
      value: ClaimableIncentivesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ClaimableIncentivesRequestProtoMsg
  ): ClaimableIncentivesRequest {
    return ClaimableIncentivesRequest.decode(message.value);
  },
  toProto(message: ClaimableIncentivesRequest): Uint8Array {
    return ClaimableIncentivesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: ClaimableIncentivesRequest
  ): ClaimableIncentivesRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.ClaimableIncentivesRequest",
      value: ClaimableIncentivesRequest.encode(message).finish(),
    };
  },
};
function createBaseClaimableIncentivesResponse(): ClaimableIncentivesResponse {
  return {
    claimableIncentives: [],
    forfeitedIncentives: [],
  };
}
export const ClaimableIncentivesResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ClaimableIncentivesResponse",
  encode(
    message: ClaimableIncentivesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.claimableIncentives) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.forfeitedIncentives) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ClaimableIncentivesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimableIncentivesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.claimableIncentives.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.forfeitedIncentives.push(
            Coin.decode(reader, reader.uint32())
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
    object: Partial<ClaimableIncentivesResponse>
  ): ClaimableIncentivesResponse {
    const message = createBaseClaimableIncentivesResponse();
    message.claimableIncentives =
      object.claimableIncentives?.map((e) => Coin.fromPartial(e)) || [];
    message.forfeitedIncentives =
      object.forfeitedIncentives?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: ClaimableIncentivesResponseAmino
  ): ClaimableIncentivesResponse {
    return {
      claimableIncentives: Array.isArray(object?.claimable_incentives)
        ? object.claimable_incentives.map((e: any) => Coin.fromAmino(e))
        : [],
      forfeitedIncentives: Array.isArray(object?.forfeited_incentives)
        ? object.forfeited_incentives.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: ClaimableIncentivesResponse
  ): ClaimableIncentivesResponseAmino {
    const obj: any = {};
    if (message.claimableIncentives) {
      obj.claimable_incentives = message.claimableIncentives.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.claimable_incentives = [];
    }
    if (message.forfeitedIncentives) {
      obj.forfeited_incentives = message.forfeitedIncentives.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.forfeited_incentives = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: ClaimableIncentivesResponseAminoMsg
  ): ClaimableIncentivesResponse {
    return ClaimableIncentivesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: ClaimableIncentivesResponse
  ): ClaimableIncentivesResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/claimable-incentives-response",
      value: ClaimableIncentivesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ClaimableIncentivesResponseProtoMsg
  ): ClaimableIncentivesResponse {
    return ClaimableIncentivesResponse.decode(message.value);
  },
  toProto(message: ClaimableIncentivesResponse): Uint8Array {
    return ClaimableIncentivesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: ClaimableIncentivesResponse
  ): ClaimableIncentivesResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.ClaimableIncentivesResponse",
      value: ClaimableIncentivesResponse.encode(message).finish(),
    };
  },
};
function createBasePoolAccumulatorRewardsRequest(): PoolAccumulatorRewardsRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const PoolAccumulatorRewardsRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.PoolAccumulatorRewardsRequest",
  encode(
    message: PoolAccumulatorRewardsRequest,
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
  ): PoolAccumulatorRewardsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolAccumulatorRewardsRequest();
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
    object: Partial<PoolAccumulatorRewardsRequest>
  ): PoolAccumulatorRewardsRequest {
    const message = createBasePoolAccumulatorRewardsRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: PoolAccumulatorRewardsRequestAmino
  ): PoolAccumulatorRewardsRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: PoolAccumulatorRewardsRequest
  ): PoolAccumulatorRewardsRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: PoolAccumulatorRewardsRequestAminoMsg
  ): PoolAccumulatorRewardsRequest {
    return PoolAccumulatorRewardsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: PoolAccumulatorRewardsRequest
  ): PoolAccumulatorRewardsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/pool-accumulator-rewards-request",
      value: PoolAccumulatorRewardsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: PoolAccumulatorRewardsRequestProtoMsg
  ): PoolAccumulatorRewardsRequest {
    return PoolAccumulatorRewardsRequest.decode(message.value);
  },
  toProto(message: PoolAccumulatorRewardsRequest): Uint8Array {
    return PoolAccumulatorRewardsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: PoolAccumulatorRewardsRequest
  ): PoolAccumulatorRewardsRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.PoolAccumulatorRewardsRequest",
      value: PoolAccumulatorRewardsRequest.encode(message).finish(),
    };
  },
};
function createBasePoolAccumulatorRewardsResponse(): PoolAccumulatorRewardsResponse {
  return {
    spreadRewardGrowthGlobal: [],
    uptimeGrowthGlobal: [],
  };
}
export const PoolAccumulatorRewardsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.PoolAccumulatorRewardsResponse",
  encode(
    message: PoolAccumulatorRewardsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.spreadRewardGrowthGlobal) {
      DecCoin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.uptimeGrowthGlobal) {
      UptimeTracker.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PoolAccumulatorRewardsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolAccumulatorRewardsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.spreadRewardGrowthGlobal.push(
            DecCoin.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.uptimeGrowthGlobal.push(
            UptimeTracker.decode(reader, reader.uint32())
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
    object: Partial<PoolAccumulatorRewardsResponse>
  ): PoolAccumulatorRewardsResponse {
    const message = createBasePoolAccumulatorRewardsResponse();
    message.spreadRewardGrowthGlobal =
      object.spreadRewardGrowthGlobal?.map((e) => DecCoin.fromPartial(e)) || [];
    message.uptimeGrowthGlobal =
      object.uptimeGrowthGlobal?.map((e) => UptimeTracker.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: PoolAccumulatorRewardsResponseAmino
  ): PoolAccumulatorRewardsResponse {
    return {
      spreadRewardGrowthGlobal: Array.isArray(
        object?.spread_reward_growth_global
      )
        ? object.spread_reward_growth_global.map((e: any) =>
            DecCoin.fromAmino(e)
          )
        : [],
      uptimeGrowthGlobal: Array.isArray(object?.uptime_growth_global)
        ? object.uptime_growth_global.map((e: any) =>
            UptimeTracker.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: PoolAccumulatorRewardsResponse
  ): PoolAccumulatorRewardsResponseAmino {
    const obj: any = {};
    if (message.spreadRewardGrowthGlobal) {
      obj.spread_reward_growth_global = message.spreadRewardGrowthGlobal.map(
        (e) => (e ? DecCoin.toAmino(e) : undefined)
      );
    } else {
      obj.spread_reward_growth_global = [];
    }
    if (message.uptimeGrowthGlobal) {
      obj.uptime_growth_global = message.uptimeGrowthGlobal.map((e) =>
        e ? UptimeTracker.toAmino(e) : undefined
      );
    } else {
      obj.uptime_growth_global = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: PoolAccumulatorRewardsResponseAminoMsg
  ): PoolAccumulatorRewardsResponse {
    return PoolAccumulatorRewardsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: PoolAccumulatorRewardsResponse
  ): PoolAccumulatorRewardsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/pool-accumulator-rewards-response",
      value: PoolAccumulatorRewardsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: PoolAccumulatorRewardsResponseProtoMsg
  ): PoolAccumulatorRewardsResponse {
    return PoolAccumulatorRewardsResponse.decode(message.value);
  },
  toProto(message: PoolAccumulatorRewardsResponse): Uint8Array {
    return PoolAccumulatorRewardsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: PoolAccumulatorRewardsResponse
  ): PoolAccumulatorRewardsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.PoolAccumulatorRewardsResponse",
      value: PoolAccumulatorRewardsResponse.encode(message).finish(),
    };
  },
};
function createBaseTickAccumulatorTrackersRequest(): TickAccumulatorTrackersRequest {
  return {
    poolId: Long.UZERO,
    tickIndex: Long.ZERO,
  };
}
export const TickAccumulatorTrackersRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.TickAccumulatorTrackersRequest",
  encode(
    message: TickAccumulatorTrackersRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (!message.tickIndex.isZero()) {
      writer.uint32(16).int64(message.tickIndex);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): TickAccumulatorTrackersRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickAccumulatorTrackersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.tickIndex = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<TickAccumulatorTrackersRequest>
  ): TickAccumulatorTrackersRequest {
    const message = createBaseTickAccumulatorTrackersRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tickIndex =
      object.tickIndex !== undefined && object.tickIndex !== null
        ? Long.fromValue(object.tickIndex)
        : Long.ZERO;
    return message;
  },
  fromAmino(
    object: TickAccumulatorTrackersRequestAmino
  ): TickAccumulatorTrackersRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      tickIndex: Long.fromString(object.tick_index),
    };
  },
  toAmino(
    message: TickAccumulatorTrackersRequest
  ): TickAccumulatorTrackersRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.tick_index = message.tickIndex
      ? message.tickIndex.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: TickAccumulatorTrackersRequestAminoMsg
  ): TickAccumulatorTrackersRequest {
    return TickAccumulatorTrackersRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: TickAccumulatorTrackersRequest
  ): TickAccumulatorTrackersRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/tick-accumulator-trackers-request",
      value: TickAccumulatorTrackersRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: TickAccumulatorTrackersRequestProtoMsg
  ): TickAccumulatorTrackersRequest {
    return TickAccumulatorTrackersRequest.decode(message.value);
  },
  toProto(message: TickAccumulatorTrackersRequest): Uint8Array {
    return TickAccumulatorTrackersRequest.encode(message).finish();
  },
  toProtoMsg(
    message: TickAccumulatorTrackersRequest
  ): TickAccumulatorTrackersRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.TickAccumulatorTrackersRequest",
      value: TickAccumulatorTrackersRequest.encode(message).finish(),
    };
  },
};
function createBaseTickAccumulatorTrackersResponse(): TickAccumulatorTrackersResponse {
  return {
    spreadRewardGrowthOppositeDirectionOfLastTraversal: [],
    uptimeTrackers: [],
  };
}
export const TickAccumulatorTrackersResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.TickAccumulatorTrackersResponse",
  encode(
    message: TickAccumulatorTrackersResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.spreadRewardGrowthOppositeDirectionOfLastTraversal) {
      DecCoin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.uptimeTrackers) {
      UptimeTracker.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): TickAccumulatorTrackersResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickAccumulatorTrackersResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.spreadRewardGrowthOppositeDirectionOfLastTraversal.push(
            DecCoin.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.uptimeTrackers.push(
            UptimeTracker.decode(reader, reader.uint32())
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
    object: Partial<TickAccumulatorTrackersResponse>
  ): TickAccumulatorTrackersResponse {
    const message = createBaseTickAccumulatorTrackersResponse();
    message.spreadRewardGrowthOppositeDirectionOfLastTraversal =
      object.spreadRewardGrowthOppositeDirectionOfLastTraversal?.map((e) =>
        DecCoin.fromPartial(e)
      ) || [];
    message.uptimeTrackers =
      object.uptimeTrackers?.map((e) => UptimeTracker.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: TickAccumulatorTrackersResponseAmino
  ): TickAccumulatorTrackersResponse {
    return {
      spreadRewardGrowthOppositeDirectionOfLastTraversal: Array.isArray(
        object?.spread_reward_growth_opposite_direction_of_last_traversal
      )
        ? object.spread_reward_growth_opposite_direction_of_last_traversal.map(
            (e: any) => DecCoin.fromAmino(e)
          )
        : [],
      uptimeTrackers: Array.isArray(object?.uptime_trackers)
        ? object.uptime_trackers.map((e: any) => UptimeTracker.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: TickAccumulatorTrackersResponse
  ): TickAccumulatorTrackersResponseAmino {
    const obj: any = {};
    if (message.spreadRewardGrowthOppositeDirectionOfLastTraversal) {
      obj.spread_reward_growth_opposite_direction_of_last_traversal =
        message.spreadRewardGrowthOppositeDirectionOfLastTraversal.map((e) =>
          e ? DecCoin.toAmino(e) : undefined
        );
    } else {
      obj.spread_reward_growth_opposite_direction_of_last_traversal = [];
    }
    if (message.uptimeTrackers) {
      obj.uptime_trackers = message.uptimeTrackers.map((e) =>
        e ? UptimeTracker.toAmino(e) : undefined
      );
    } else {
      obj.uptime_trackers = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: TickAccumulatorTrackersResponseAminoMsg
  ): TickAccumulatorTrackersResponse {
    return TickAccumulatorTrackersResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: TickAccumulatorTrackersResponse
  ): TickAccumulatorTrackersResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/tick-accumulator-trackers-response",
      value: TickAccumulatorTrackersResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: TickAccumulatorTrackersResponseProtoMsg
  ): TickAccumulatorTrackersResponse {
    return TickAccumulatorTrackersResponse.decode(message.value);
  },
  toProto(message: TickAccumulatorTrackersResponse): Uint8Array {
    return TickAccumulatorTrackersResponse.encode(message).finish();
  },
  toProtoMsg(
    message: TickAccumulatorTrackersResponse
  ): TickAccumulatorTrackersResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.TickAccumulatorTrackersResponse",
      value: TickAccumulatorTrackersResponse.encode(message).finish(),
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
