//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../binary";
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from "../../cosmos/base/query/v1beta1/pagination";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
  DecCoin,
  DecCoinAmino,
  DecCoinSDKType,
} from "../../cosmos/base/v1beta1/coin";
import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../google/protobuf/any";
import {
  CosmWasmPool,
  CosmWasmPoolProtoMsg,
  CosmWasmPoolSDKType,
} from "../cosmwasmpool/v1beta1/model/pool";
import { Pool as Pool2 } from "../gamm/pool-models/balancer/balancerPool";
import { PoolProtoMsg as Pool2ProtoMsg } from "../gamm/pool-models/balancer/balancerPool";
import { PoolSDKType as Pool2SDKType } from "../gamm/pool-models/balancer/balancerPool";
import { Pool as Pool3 } from "../gamm/pool-models/stableswap/stableswap_pool";
import { PoolProtoMsg as Pool3ProtoMsg } from "../gamm/pool-models/stableswap/stableswap_pool";
import { PoolSDKType as Pool3SDKType } from "../gamm/pool-models/stableswap/stableswap_pool";
import {
  IncentiveRecord,
  IncentiveRecordAmino,
  IncentiveRecordSDKType,
} from "./incentive_record";
import { Params, ParamsAmino, ParamsSDKType } from "./params";
import { Pool as Pool1 } from "./pool";
import { PoolProtoMsg as Pool1ProtoMsg } from "./pool";
import { PoolSDKType as Pool1SDKType } from "./pool";
import {
  FullPositionBreakdown,
  FullPositionBreakdownAmino,
  FullPositionBreakdownSDKType,
  PositionWithPeriodLock,
  PositionWithPeriodLockAmino,
  PositionWithPeriodLockSDKType,
} from "./position";
import {
  UptimeTracker,
  UptimeTrackerAmino,
  UptimeTrackerSDKType,
} from "./tickInfo";
/** =============================== UserPositions */
export interface UserPositionsRequest {
  address: string;
  poolId: bigint;
  pagination: PageRequest;
}
export interface UserPositionsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsRequest";
  value: Uint8Array;
}
/** =============================== UserPositions */
export interface UserPositionsRequestAmino {
  address: string;
  pool_id: string;
  pagination?: PageRequestAmino;
}
export interface UserPositionsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/user-positions-request";
  value: UserPositionsRequestAmino;
}
/** =============================== UserPositions */
export interface UserPositionsRequestSDKType {
  address: string;
  pool_id: bigint;
  pagination: PageRequestSDKType;
}
export interface UserPositionsResponse {
  positions: FullPositionBreakdown[];
  pagination: PageResponse;
}
export interface UserPositionsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsResponse";
  value: Uint8Array;
}
export interface UserPositionsResponseAmino {
  positions: FullPositionBreakdownAmino[];
  pagination?: PageResponseAmino;
}
export interface UserPositionsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/user-positions-response";
  value: UserPositionsResponseAmino;
}
export interface UserPositionsResponseSDKType {
  positions: FullPositionBreakdownSDKType[];
  pagination: PageResponseSDKType;
}
/** =============================== PositionById */
export interface PositionByIdRequest {
  positionId: bigint;
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
  position_id: bigint;
}
export interface PositionByIdResponse {
  position: FullPositionBreakdown;
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
  position: FullPositionBreakdownSDKType;
}
/** =============================== Pools */
export interface PoolsRequest {
  /** pagination defines an optional pagination for the request. */
  pagination: PageRequest;
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
  pagination: PageRequestSDKType;
}
export interface PoolsResponse {
  pools: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any)[] | Any[];
  /** pagination defines the pagination in the response. */
  pagination: PageResponse;
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
  pagination: PageResponseSDKType;
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
  params: Params;
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
  params: ParamsSDKType;
}
export interface TickLiquidityNet {
  liquidityNet: string;
  tickIndex: bigint;
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
  tick_index: bigint;
}
export interface LiquidityDepthWithRange {
  liquidityAmount: string;
  lowerTick: bigint;
  upperTick: bigint;
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
  lower_tick: bigint;
  upper_tick: bigint;
}
/** =============================== LiquidityNetInDirection */
export interface LiquidityNetInDirectionRequest {
  poolId: bigint;
  tokenIn: string;
  startTick: bigint;
  useCurTick: boolean;
  boundTick: bigint;
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
  pool_id: bigint;
  token_in: string;
  start_tick: bigint;
  use_cur_tick: boolean;
  bound_tick: bigint;
  use_no_bound: boolean;
}
export interface LiquidityNetInDirectionResponse {
  liquidityDepths: TickLiquidityNet[];
  currentTick: bigint;
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
  current_tick: bigint;
  current_liquidity: string;
}
/** =============================== LiquidityPerTickRange */
export interface LiquidityPerTickRangeRequest {
  poolId: bigint;
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
  pool_id: bigint;
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
  positionId: bigint;
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
  position_id: bigint;
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
  positionId: bigint;
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
  position_id: bigint;
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
  poolId: bigint;
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
  pool_id: bigint;
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
  poolId: bigint;
  tickIndex: bigint;
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
  pool_id: bigint;
  tick_index: bigint;
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
/** ===================== QueryIncentiveRecords */
export interface IncentiveRecordsRequest {
  poolId: bigint;
  pagination: PageRequest;
}
export interface IncentiveRecordsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordsRequest";
  value: Uint8Array;
}
/** ===================== QueryIncentiveRecords */
export interface IncentiveRecordsRequestAmino {
  pool_id: string;
  pagination?: PageRequestAmino;
}
export interface IncentiveRecordsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/incentive-records-request";
  value: IncentiveRecordsRequestAmino;
}
/** ===================== QueryIncentiveRecords */
export interface IncentiveRecordsRequestSDKType {
  pool_id: bigint;
  pagination: PageRequestSDKType;
}
export interface IncentiveRecordsResponse {
  incentiveRecords: IncentiveRecord[];
  /** pagination defines the pagination in the response. */
  pagination: PageResponse;
}
export interface IncentiveRecordsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordsResponse";
  value: Uint8Array;
}
export interface IncentiveRecordsResponseAmino {
  incentive_records: IncentiveRecordAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface IncentiveRecordsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/incentive-records-response";
  value: IncentiveRecordsResponseAmino;
}
export interface IncentiveRecordsResponseSDKType {
  incentive_records: IncentiveRecordSDKType[];
  pagination: PageResponseSDKType;
}
/** =============================== CFMMPoolIdLinkFromConcentratedPoolId */
export interface CFMMPoolIdLinkFromConcentratedPoolIdRequest {
  concentratedPoolId: bigint;
}
export interface CFMMPoolIdLinkFromConcentratedPoolIdRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.CFMMPoolIdLinkFromConcentratedPoolIdRequest";
  value: Uint8Array;
}
/** =============================== CFMMPoolIdLinkFromConcentratedPoolId */
export interface CFMMPoolIdLinkFromConcentratedPoolIdRequestAmino {
  concentrated_pool_id: string;
}
export interface CFMMPoolIdLinkFromConcentratedPoolIdRequestAminoMsg {
  type: "osmosis/concentratedliquidity/cfmmpool-id-link-from-concentrated-pool-id-request";
  value: CFMMPoolIdLinkFromConcentratedPoolIdRequestAmino;
}
/** =============================== CFMMPoolIdLinkFromConcentratedPoolId */
export interface CFMMPoolIdLinkFromConcentratedPoolIdRequestSDKType {
  concentrated_pool_id: bigint;
}
export interface CFMMPoolIdLinkFromConcentratedPoolIdResponse {
  cfmmPoolId: bigint;
}
export interface CFMMPoolIdLinkFromConcentratedPoolIdResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.CFMMPoolIdLinkFromConcentratedPoolIdResponse";
  value: Uint8Array;
}
export interface CFMMPoolIdLinkFromConcentratedPoolIdResponseAmino {
  cfmm_pool_id: string;
}
export interface CFMMPoolIdLinkFromConcentratedPoolIdResponseAminoMsg {
  type: "osmosis/concentratedliquidity/cfmmpool-id-link-from-concentrated-pool-id-response";
  value: CFMMPoolIdLinkFromConcentratedPoolIdResponseAmino;
}
export interface CFMMPoolIdLinkFromConcentratedPoolIdResponseSDKType {
  cfmm_pool_id: bigint;
}
/** =============================== UserUnbondingPositions */
export interface UserUnbondingPositionsRequest {
  address: string;
}
export interface UserUnbondingPositionsRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserUnbondingPositionsRequest";
  value: Uint8Array;
}
/** =============================== UserUnbondingPositions */
export interface UserUnbondingPositionsRequestAmino {
  address: string;
}
export interface UserUnbondingPositionsRequestAminoMsg {
  type: "osmosis/concentratedliquidity/user-unbonding-positions-request";
  value: UserUnbondingPositionsRequestAmino;
}
/** =============================== UserUnbondingPositions */
export interface UserUnbondingPositionsRequestSDKType {
  address: string;
}
export interface UserUnbondingPositionsResponse {
  positionsWithPeriodLock: PositionWithPeriodLock[];
}
export interface UserUnbondingPositionsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserUnbondingPositionsResponse";
  value: Uint8Array;
}
export interface UserUnbondingPositionsResponseAmino {
  positions_with_period_lock: PositionWithPeriodLockAmino[];
}
export interface UserUnbondingPositionsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/user-unbonding-positions-response";
  value: UserUnbondingPositionsResponseAmino;
}
export interface UserUnbondingPositionsResponseSDKType {
  positions_with_period_lock: PositionWithPeriodLockSDKType[];
}
/** =============================== GetTotalLiquidity */
export interface GetTotalLiquidityRequest {}
export interface GetTotalLiquidityRequestProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.GetTotalLiquidityRequest";
  value: Uint8Array;
}
/** =============================== GetTotalLiquidity */
export interface GetTotalLiquidityRequestAmino {}
export interface GetTotalLiquidityRequestAminoMsg {
  type: "osmosis/concentratedliquidity/get-total-liquidity-request";
  value: GetTotalLiquidityRequestAmino;
}
/** =============================== GetTotalLiquidity */
export interface GetTotalLiquidityRequestSDKType {}
export interface GetTotalLiquidityResponse {
  totalLiquidity: Coin[];
}
export interface GetTotalLiquidityResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.GetTotalLiquidityResponse";
  value: Uint8Array;
}
export interface GetTotalLiquidityResponseAmino {
  total_liquidity: CoinAmino[];
}
export interface GetTotalLiquidityResponseAminoMsg {
  type: "osmosis/concentratedliquidity/get-total-liquidity-response";
  value: GetTotalLiquidityResponseAmino;
}
export interface GetTotalLiquidityResponseSDKType {
  total_liquidity: CoinSDKType[];
}
function createBaseUserPositionsRequest(): UserPositionsRequest {
  return {
    address: "",
    poolId: BigInt(0),
    pagination: PageRequest.fromPartial({}),
  };
}
export const UserPositionsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsRequest",
  encode(
    message: UserPositionsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.poolId !== BigInt(0)) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UserPositionsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserPositionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64();
          break;
        case 3:
          message.pagination = PageRequest.decode(reader, reader.uint32());
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
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: UserPositionsRequestAmino): UserPositionsRequest {
    return {
      address: object.address,
      poolId: BigInt(object.pool_id),
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: UserPositionsRequest): UserPositionsRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
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
    pagination: PageResponse.fromPartial({}),
  };
}
export const UserPositionsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UserPositionsResponse",
  encode(
    message: UserPositionsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.positions) {
      FullPositionBreakdown.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UserPositionsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
  fromPartial(object: Partial<UserPositionsResponse>): UserPositionsResponse {
    const message = createBaseUserPositionsResponse();
    message.positions =
      object.positions?.map((e) => FullPositionBreakdown.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: UserPositionsResponseAmino): UserPositionsResponse {
    return {
      positions: Array.isArray(object?.positions)
        ? object.positions.map((e: any) => FullPositionBreakdown.fromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
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
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
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
    positionId: BigInt(0),
  };
}
export const PositionByIdRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdRequest",
  encode(
    message: PositionByIdRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): PositionByIdRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionByIdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
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
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: PositionByIdRequestAmino): PositionByIdRequest {
    return {
      positionId: BigInt(object.position_id),
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
    position: FullPositionBreakdown.fromPartial({}),
  };
}
export const PositionByIdResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionByIdResponse",
  encode(
    message: PositionByIdResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.position !== undefined) {
      FullPositionBreakdown.encode(
        message.position,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): PositionByIdResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    pagination: PageRequest.fromPartial({}),
  };
}
export const PoolsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsRequest",
  encode(
    message: PoolsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PoolsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    pagination: PageResponse.fromPartial({}),
  };
}
export const PoolsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolsResponse",
  encode(
    message: PoolsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
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
  decode(input: BinaryReader | Uint8Array, length?: number): PoolsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ParamsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    params: Params.fromPartial({}),
  };
}
export const ParamsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ParamsResponse",
  encode(
    message: ParamsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ParamsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    tickIndex: BigInt(0),
  };
}
export const TickLiquidityNet = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickLiquidityNet",
  encode(
    message: TickLiquidityNet,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.liquidityNet !== "") {
      writer
        .uint32(10)
        .string(Decimal.fromUserInput(message.liquidityNet, 18).atomics);
    }
    if (message.tickIndex !== BigInt(0)) {
      writer.uint32(16).int64(message.tickIndex);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TickLiquidityNet {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickLiquidityNet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityNet = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        case 2:
          message.tickIndex = reader.int64();
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
        ? BigInt(object.tickIndex.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: TickLiquidityNetAmino): TickLiquidityNet {
    return {
      liquidityNet: object.liquidity_net,
      tickIndex: BigInt(object.tick_index),
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
    lowerTick: BigInt(0),
    upperTick: BigInt(0),
  };
}
export const LiquidityDepthWithRange = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.LiquidityDepthWithRange",
  encode(
    message: LiquidityDepthWithRange,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.liquidityAmount !== "") {
      writer
        .uint32(10)
        .string(Decimal.fromUserInput(message.liquidityAmount, 18).atomics);
    }
    if (message.lowerTick !== BigInt(0)) {
      writer.uint32(16).int64(message.lowerTick);
    }
    if (message.upperTick !== BigInt(0)) {
      writer.uint32(24).int64(message.upperTick);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): LiquidityDepthWithRange {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityDepthWithRange();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityAmount = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        case 2:
          message.lowerTick = reader.int64();
          break;
        case 3:
          message.upperTick = reader.int64();
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
        ? BigInt(object.lowerTick.toString())
        : BigInt(0);
    message.upperTick =
      object.upperTick !== undefined && object.upperTick !== null
        ? BigInt(object.upperTick.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: LiquidityDepthWithRangeAmino): LiquidityDepthWithRange {
    return {
      liquidityAmount: object.liquidity_amount,
      lowerTick: BigInt(object.lower_tick),
      upperTick: BigInt(object.upper_tick),
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
    poolId: BigInt(0),
    tokenIn: "",
    startTick: BigInt(0),
    useCurTick: false,
    boundTick: BigInt(0),
    useNoBound: false,
  };
}
export const LiquidityNetInDirectionRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionRequest",
  encode(
    message: LiquidityNetInDirectionRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.tokenIn !== "") {
      writer.uint32(18).string(message.tokenIn);
    }
    if (message.startTick !== BigInt(0)) {
      writer.uint32(24).int64(message.startTick);
    }
    if (message.useCurTick === true) {
      writer.uint32(32).bool(message.useCurTick);
    }
    if (message.boundTick !== BigInt(0)) {
      writer.uint32(40).int64(message.boundTick);
    }
    if (message.useNoBound === true) {
      writer.uint32(48).bool(message.useNoBound);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): LiquidityNetInDirectionRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityNetInDirectionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
        case 2:
          message.tokenIn = reader.string();
          break;
        case 3:
          message.startTick = reader.int64();
          break;
        case 4:
          message.useCurTick = reader.bool();
          break;
        case 5:
          message.boundTick = reader.int64();
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
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.tokenIn = object.tokenIn ?? "";
    message.startTick =
      object.startTick !== undefined && object.startTick !== null
        ? BigInt(object.startTick.toString())
        : BigInt(0);
    message.useCurTick = object.useCurTick ?? false;
    message.boundTick =
      object.boundTick !== undefined && object.boundTick !== null
        ? BigInt(object.boundTick.toString())
        : BigInt(0);
    message.useNoBound = object.useNoBound ?? false;
    return message;
  },
  fromAmino(
    object: LiquidityNetInDirectionRequestAmino
  ): LiquidityNetInDirectionRequest {
    return {
      poolId: BigInt(object.pool_id),
      tokenIn: object.token_in,
      startTick: BigInt(object.start_tick),
      useCurTick: object.use_cur_tick,
      boundTick: BigInt(object.bound_tick),
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
    currentTick: BigInt(0),
    currentLiquidity: "",
  };
}
export const LiquidityNetInDirectionResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.LiquidityNetInDirectionResponse",
  encode(
    message: LiquidityNetInDirectionResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.liquidityDepths) {
      TickLiquidityNet.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.currentTick !== BigInt(0)) {
      writer.uint32(16).int64(message.currentTick);
    }
    if (message.currentLiquidity !== "") {
      writer
        .uint32(26)
        .string(Decimal.fromUserInput(message.currentLiquidity, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): LiquidityNetInDirectionResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
          message.currentTick = reader.int64();
          break;
        case 3:
          message.currentLiquidity = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
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
        ? BigInt(object.currentTick.toString())
        : BigInt(0);
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
      currentTick: BigInt(object.current_tick),
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
    poolId: BigInt(0),
  };
}
export const LiquidityPerTickRangeRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.LiquidityPerTickRangeRequest",
  encode(
    message: LiquidityPerTickRangeRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): LiquidityPerTickRangeRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLiquidityPerTickRangeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
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
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: LiquidityPerTickRangeRequestAmino
  ): LiquidityPerTickRangeRequest {
    return {
      poolId: BigInt(object.pool_id),
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.liquidity) {
      LiquidityDepthWithRange.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): LiquidityPerTickRangeResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    positionId: BigInt(0),
  };
}
export const ClaimableSpreadRewardsRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.ClaimableSpreadRewardsRequest",
  encode(
    message: ClaimableSpreadRewardsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): ClaimableSpreadRewardsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimableSpreadRewardsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
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
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: ClaimableSpreadRewardsRequestAmino
  ): ClaimableSpreadRewardsRequest {
    return {
      positionId: BigInt(object.position_id),
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.claimableSpreadRewards) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): ClaimableSpreadRewardsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    positionId: BigInt(0),
  };
}
export const ClaimableIncentivesRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.ClaimableIncentivesRequest",
  encode(
    message: ClaimableIncentivesRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): ClaimableIncentivesRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClaimableIncentivesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
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
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: ClaimableIncentivesRequestAmino
  ): ClaimableIncentivesRequest {
    return {
      positionId: BigInt(object.position_id),
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.claimableIncentives) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.forfeitedIncentives) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): ClaimableIncentivesResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    poolId: BigInt(0),
  };
}
export const PoolAccumulatorRewardsRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.PoolAccumulatorRewardsRequest",
  encode(
    message: PoolAccumulatorRewardsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): PoolAccumulatorRewardsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolAccumulatorRewardsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
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
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: PoolAccumulatorRewardsRequestAmino
  ): PoolAccumulatorRewardsRequest {
    return {
      poolId: BigInt(object.pool_id),
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.spreadRewardGrowthGlobal) {
      DecCoin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.uptimeGrowthGlobal) {
      UptimeTracker.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): PoolAccumulatorRewardsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    poolId: BigInt(0),
    tickIndex: BigInt(0),
  };
}
export const TickAccumulatorTrackersRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.TickAccumulatorTrackersRequest",
  encode(
    message: TickAccumulatorTrackersRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.tickIndex !== BigInt(0)) {
      writer.uint32(16).int64(message.tickIndex);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): TickAccumulatorTrackersRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickAccumulatorTrackersRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
        case 2:
          message.tickIndex = reader.int64();
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
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.tickIndex =
      object.tickIndex !== undefined && object.tickIndex !== null
        ? BigInt(object.tickIndex.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: TickAccumulatorTrackersRequestAmino
  ): TickAccumulatorTrackersRequest {
    return {
      poolId: BigInt(object.pool_id),
      tickIndex: BigInt(object.tick_index),
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.spreadRewardGrowthOppositeDirectionOfLastTraversal) {
      DecCoin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.uptimeTrackers) {
      UptimeTracker.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): TickAccumulatorTrackersResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
function createBaseIncentiveRecordsRequest(): IncentiveRecordsRequest {
  return {
    poolId: BigInt(0),
    pagination: PageRequest.fromPartial({}),
  };
}
export const IncentiveRecordsRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordsRequest",
  encode(
    message: IncentiveRecordsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): IncentiveRecordsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIncentiveRecordsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
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
  fromPartial(
    object: Partial<IncentiveRecordsRequest>
  ): IncentiveRecordsRequest {
    const message = createBaseIncentiveRecordsRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: IncentiveRecordsRequestAmino): IncentiveRecordsRequest {
    return {
      poolId: BigInt(object.pool_id),
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: IncentiveRecordsRequest): IncentiveRecordsRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: IncentiveRecordsRequestAminoMsg
  ): IncentiveRecordsRequest {
    return IncentiveRecordsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: IncentiveRecordsRequest
  ): IncentiveRecordsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/incentive-records-request",
      value: IncentiveRecordsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: IncentiveRecordsRequestProtoMsg
  ): IncentiveRecordsRequest {
    return IncentiveRecordsRequest.decode(message.value);
  },
  toProto(message: IncentiveRecordsRequest): Uint8Array {
    return IncentiveRecordsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: IncentiveRecordsRequest
  ): IncentiveRecordsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordsRequest",
      value: IncentiveRecordsRequest.encode(message).finish(),
    };
  },
};
function createBaseIncentiveRecordsResponse(): IncentiveRecordsResponse {
  return {
    incentiveRecords: [],
    pagination: PageResponse.fromPartial({}),
  };
}
export const IncentiveRecordsResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordsResponse",
  encode(
    message: IncentiveRecordsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.incentiveRecords) {
      IncentiveRecord.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): IncentiveRecordsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIncentiveRecordsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.incentiveRecords.push(
            IncentiveRecord.decode(reader, reader.uint32())
          );
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
  fromPartial(
    object: Partial<IncentiveRecordsResponse>
  ): IncentiveRecordsResponse {
    const message = createBaseIncentiveRecordsResponse();
    message.incentiveRecords =
      object.incentiveRecords?.map((e) => IncentiveRecord.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: IncentiveRecordsResponseAmino): IncentiveRecordsResponse {
    return {
      incentiveRecords: Array.isArray(object?.incentive_records)
        ? object.incentive_records.map((e: any) => IncentiveRecord.fromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: IncentiveRecordsResponse): IncentiveRecordsResponseAmino {
    const obj: any = {};
    if (message.incentiveRecords) {
      obj.incentive_records = message.incentiveRecords.map((e) =>
        e ? IncentiveRecord.toAmino(e) : undefined
      );
    } else {
      obj.incentive_records = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: IncentiveRecordsResponseAminoMsg
  ): IncentiveRecordsResponse {
    return IncentiveRecordsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: IncentiveRecordsResponse
  ): IncentiveRecordsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/incentive-records-response",
      value: IncentiveRecordsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: IncentiveRecordsResponseProtoMsg
  ): IncentiveRecordsResponse {
    return IncentiveRecordsResponse.decode(message.value);
  },
  toProto(message: IncentiveRecordsResponse): Uint8Array {
    return IncentiveRecordsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: IncentiveRecordsResponse
  ): IncentiveRecordsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordsResponse",
      value: IncentiveRecordsResponse.encode(message).finish(),
    };
  },
};
function createBaseCFMMPoolIdLinkFromConcentratedPoolIdRequest(): CFMMPoolIdLinkFromConcentratedPoolIdRequest {
  return {
    concentratedPoolId: BigInt(0),
  };
}
export const CFMMPoolIdLinkFromConcentratedPoolIdRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.CFMMPoolIdLinkFromConcentratedPoolIdRequest",
  encode(
    message: CFMMPoolIdLinkFromConcentratedPoolIdRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.concentratedPoolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.concentratedPoolId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCFMMPoolIdLinkFromConcentratedPoolIdRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.concentratedPoolId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<CFMMPoolIdLinkFromConcentratedPoolIdRequest>
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequest {
    const message = createBaseCFMMPoolIdLinkFromConcentratedPoolIdRequest();
    message.concentratedPoolId =
      object.concentratedPoolId !== undefined &&
      object.concentratedPoolId !== null
        ? BigInt(object.concentratedPoolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: CFMMPoolIdLinkFromConcentratedPoolIdRequestAmino
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequest {
    return {
      concentratedPoolId: BigInt(object.concentrated_pool_id),
    };
  },
  toAmino(
    message: CFMMPoolIdLinkFromConcentratedPoolIdRequest
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequestAmino {
    const obj: any = {};
    obj.concentrated_pool_id = message.concentratedPoolId
      ? message.concentratedPoolId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: CFMMPoolIdLinkFromConcentratedPoolIdRequestAminoMsg
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequest {
    return CFMMPoolIdLinkFromConcentratedPoolIdRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: CFMMPoolIdLinkFromConcentratedPoolIdRequest
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/cfmmpool-id-link-from-concentrated-pool-id-request",
      value: CFMMPoolIdLinkFromConcentratedPoolIdRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: CFMMPoolIdLinkFromConcentratedPoolIdRequestProtoMsg
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequest {
    return CFMMPoolIdLinkFromConcentratedPoolIdRequest.decode(message.value);
  },
  toProto(message: CFMMPoolIdLinkFromConcentratedPoolIdRequest): Uint8Array {
    return CFMMPoolIdLinkFromConcentratedPoolIdRequest.encode(message).finish();
  },
  toProtoMsg(
    message: CFMMPoolIdLinkFromConcentratedPoolIdRequest
  ): CFMMPoolIdLinkFromConcentratedPoolIdRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.CFMMPoolIdLinkFromConcentratedPoolIdRequest",
      value:
        CFMMPoolIdLinkFromConcentratedPoolIdRequest.encode(message).finish(),
    };
  },
};
function createBaseCFMMPoolIdLinkFromConcentratedPoolIdResponse(): CFMMPoolIdLinkFromConcentratedPoolIdResponse {
  return {
    cfmmPoolId: BigInt(0),
  };
}
export const CFMMPoolIdLinkFromConcentratedPoolIdResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.CFMMPoolIdLinkFromConcentratedPoolIdResponse",
  encode(
    message: CFMMPoolIdLinkFromConcentratedPoolIdResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.cfmmPoolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.cfmmPoolId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCFMMPoolIdLinkFromConcentratedPoolIdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.cfmmPoolId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<CFMMPoolIdLinkFromConcentratedPoolIdResponse>
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponse {
    const message = createBaseCFMMPoolIdLinkFromConcentratedPoolIdResponse();
    message.cfmmPoolId =
      object.cfmmPoolId !== undefined && object.cfmmPoolId !== null
        ? BigInt(object.cfmmPoolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: CFMMPoolIdLinkFromConcentratedPoolIdResponseAmino
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponse {
    return {
      cfmmPoolId: BigInt(object.cfmm_pool_id),
    };
  },
  toAmino(
    message: CFMMPoolIdLinkFromConcentratedPoolIdResponse
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponseAmino {
    const obj: any = {};
    obj.cfmm_pool_id = message.cfmmPoolId
      ? message.cfmmPoolId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: CFMMPoolIdLinkFromConcentratedPoolIdResponseAminoMsg
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponse {
    return CFMMPoolIdLinkFromConcentratedPoolIdResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: CFMMPoolIdLinkFromConcentratedPoolIdResponse
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/cfmmpool-id-link-from-concentrated-pool-id-response",
      value: CFMMPoolIdLinkFromConcentratedPoolIdResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: CFMMPoolIdLinkFromConcentratedPoolIdResponseProtoMsg
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponse {
    return CFMMPoolIdLinkFromConcentratedPoolIdResponse.decode(message.value);
  },
  toProto(message: CFMMPoolIdLinkFromConcentratedPoolIdResponse): Uint8Array {
    return CFMMPoolIdLinkFromConcentratedPoolIdResponse.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: CFMMPoolIdLinkFromConcentratedPoolIdResponse
  ): CFMMPoolIdLinkFromConcentratedPoolIdResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.CFMMPoolIdLinkFromConcentratedPoolIdResponse",
      value:
        CFMMPoolIdLinkFromConcentratedPoolIdResponse.encode(message).finish(),
    };
  },
};
function createBaseUserUnbondingPositionsRequest(): UserUnbondingPositionsRequest {
  return {
    address: "",
  };
}
export const UserUnbondingPositionsRequest = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.UserUnbondingPositionsRequest",
  encode(
    message: UserUnbondingPositionsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UserUnbondingPositionsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserUnbondingPositionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<UserUnbondingPositionsRequest>
  ): UserUnbondingPositionsRequest {
    const message = createBaseUserUnbondingPositionsRequest();
    message.address = object.address ?? "";
    return message;
  },
  fromAmino(
    object: UserUnbondingPositionsRequestAmino
  ): UserUnbondingPositionsRequest {
    return {
      address: object.address,
    };
  },
  toAmino(
    message: UserUnbondingPositionsRequest
  ): UserUnbondingPositionsRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    return obj;
  },
  fromAminoMsg(
    object: UserUnbondingPositionsRequestAminoMsg
  ): UserUnbondingPositionsRequest {
    return UserUnbondingPositionsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: UserUnbondingPositionsRequest
  ): UserUnbondingPositionsRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/user-unbonding-positions-request",
      value: UserUnbondingPositionsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UserUnbondingPositionsRequestProtoMsg
  ): UserUnbondingPositionsRequest {
    return UserUnbondingPositionsRequest.decode(message.value);
  },
  toProto(message: UserUnbondingPositionsRequest): Uint8Array {
    return UserUnbondingPositionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: UserUnbondingPositionsRequest
  ): UserUnbondingPositionsRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.UserUnbondingPositionsRequest",
      value: UserUnbondingPositionsRequest.encode(message).finish(),
    };
  },
};
function createBaseUserUnbondingPositionsResponse(): UserUnbondingPositionsResponse {
  return {
    positionsWithPeriodLock: [],
  };
}
export const UserUnbondingPositionsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.UserUnbondingPositionsResponse",
  encode(
    message: UserUnbondingPositionsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.positionsWithPeriodLock) {
      PositionWithPeriodLock.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UserUnbondingPositionsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserUnbondingPositionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionsWithPeriodLock.push(
            PositionWithPeriodLock.decode(reader, reader.uint32())
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
    object: Partial<UserUnbondingPositionsResponse>
  ): UserUnbondingPositionsResponse {
    const message = createBaseUserUnbondingPositionsResponse();
    message.positionsWithPeriodLock =
      object.positionsWithPeriodLock?.map((e) =>
        PositionWithPeriodLock.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: UserUnbondingPositionsResponseAmino
  ): UserUnbondingPositionsResponse {
    return {
      positionsWithPeriodLock: Array.isArray(object?.positions_with_period_lock)
        ? object.positions_with_period_lock.map((e: any) =>
            PositionWithPeriodLock.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: UserUnbondingPositionsResponse
  ): UserUnbondingPositionsResponseAmino {
    const obj: any = {};
    if (message.positionsWithPeriodLock) {
      obj.positions_with_period_lock = message.positionsWithPeriodLock.map(
        (e) => (e ? PositionWithPeriodLock.toAmino(e) : undefined)
      );
    } else {
      obj.positions_with_period_lock = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: UserUnbondingPositionsResponseAminoMsg
  ): UserUnbondingPositionsResponse {
    return UserUnbondingPositionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: UserUnbondingPositionsResponse
  ): UserUnbondingPositionsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/user-unbonding-positions-response",
      value: UserUnbondingPositionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UserUnbondingPositionsResponseProtoMsg
  ): UserUnbondingPositionsResponse {
    return UserUnbondingPositionsResponse.decode(message.value);
  },
  toProto(message: UserUnbondingPositionsResponse): Uint8Array {
    return UserUnbondingPositionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: UserUnbondingPositionsResponse
  ): UserUnbondingPositionsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.UserUnbondingPositionsResponse",
      value: UserUnbondingPositionsResponse.encode(message).finish(),
    };
  },
};
function createBaseGetTotalLiquidityRequest(): GetTotalLiquidityRequest {
  return {};
}
export const GetTotalLiquidityRequest = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.GetTotalLiquidityRequest",
  encode(
    _: GetTotalLiquidityRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetTotalLiquidityRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTotalLiquidityRequest();
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
  fromPartial(_: Partial<GetTotalLiquidityRequest>): GetTotalLiquidityRequest {
    const message = createBaseGetTotalLiquidityRequest();
    return message;
  },
  fromAmino(_: GetTotalLiquidityRequestAmino): GetTotalLiquidityRequest {
    return {};
  },
  toAmino(_: GetTotalLiquidityRequest): GetTotalLiquidityRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: GetTotalLiquidityRequestAminoMsg
  ): GetTotalLiquidityRequest {
    return GetTotalLiquidityRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetTotalLiquidityRequest
  ): GetTotalLiquidityRequestAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/get-total-liquidity-request",
      value: GetTotalLiquidityRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetTotalLiquidityRequestProtoMsg
  ): GetTotalLiquidityRequest {
    return GetTotalLiquidityRequest.decode(message.value);
  },
  toProto(message: GetTotalLiquidityRequest): Uint8Array {
    return GetTotalLiquidityRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GetTotalLiquidityRequest
  ): GetTotalLiquidityRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.GetTotalLiquidityRequest",
      value: GetTotalLiquidityRequest.encode(message).finish(),
    };
  },
};
function createBaseGetTotalLiquidityResponse(): GetTotalLiquidityResponse {
  return {
    totalLiquidity: [],
  };
}
export const GetTotalLiquidityResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.GetTotalLiquidityResponse",
  encode(
    message: GetTotalLiquidityResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.totalLiquidity) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetTotalLiquidityResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTotalLiquidityResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.totalLiquidity.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<GetTotalLiquidityResponse>
  ): GetTotalLiquidityResponse {
    const message = createBaseGetTotalLiquidityResponse();
    message.totalLiquidity =
      object.totalLiquidity?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: GetTotalLiquidityResponseAmino): GetTotalLiquidityResponse {
    return {
      totalLiquidity: Array.isArray(object?.total_liquidity)
        ? object.total_liquidity.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: GetTotalLiquidityResponse): GetTotalLiquidityResponseAmino {
    const obj: any = {};
    if (message.totalLiquidity) {
      obj.total_liquidity = message.totalLiquidity.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.total_liquidity = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: GetTotalLiquidityResponseAminoMsg
  ): GetTotalLiquidityResponse {
    return GetTotalLiquidityResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetTotalLiquidityResponse
  ): GetTotalLiquidityResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/get-total-liquidity-response",
      value: GetTotalLiquidityResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetTotalLiquidityResponseProtoMsg
  ): GetTotalLiquidityResponse {
    return GetTotalLiquidityResponse.decode(message.value);
  },
  toProto(message: GetTotalLiquidityResponse): Uint8Array {
    return GetTotalLiquidityResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetTotalLiquidityResponse
  ): GetTotalLiquidityResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.GetTotalLiquidityResponse",
      value: GetTotalLiquidityResponse.encode(message).finish(),
    };
  },
};
export const PoolI_InterfaceDecoder = (
  input: BinaryReader | Uint8Array
): Pool1 | CosmWasmPool | Pool2 | Pool3 | Any => {
  const reader =
    input instanceof BinaryReader ? input : new BinaryReader(input);
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
