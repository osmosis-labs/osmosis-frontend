//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { fromTimestamp, Long, toTimestamp } from "../../../helpers";
/** ===================== MsgCreatePosition */
export interface MsgCreatePosition {
  poolId: Long;
  sender: string;
  lowerTick: Long;
  upperTick: Long;
  /**
   * tokens_provided is the amount of tokens provided for the position.
   * It must at a minimum be of length 1 (for a single sided position)
   * and at a maximum be of length 2 (for a position that straddles the current
   * tick).
   */
  tokensProvided: Coin[];
  tokenMinAmount0: string;
  tokenMinAmount1: string;
}
export interface MsgCreatePositionProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition";
  value: Uint8Array;
}
/** ===================== MsgCreatePosition */
export interface MsgCreatePositionAmino {
  pool_id: string;
  sender: string;
  lower_tick: string;
  upper_tick: string;
  /**
   * tokens_provided is the amount of tokens provided for the position.
   * It must at a minimum be of length 1 (for a single sided position)
   * and at a maximum be of length 2 (for a position that straddles the current
   * tick).
   */
  tokens_provided: CoinAmino[];
  token_min_amount0: string;
  token_min_amount1: string;
}
export interface MsgCreatePositionAminoMsg {
  type: "osmosis/concentratedliquidity/create-position";
  value: MsgCreatePositionAmino;
}
/** ===================== MsgCreatePosition */
export interface MsgCreatePositionSDKType {
  pool_id: Long;
  sender: string;
  lower_tick: Long;
  upper_tick: Long;
  tokens_provided: CoinSDKType[];
  token_min_amount0: string;
  token_min_amount1: string;
}
export interface MsgCreatePositionResponse {
  positionId: Long;
  amount0: string;
  amount1: string;
  joinTime?: Date;
  liquidityCreated: string;
  /**
   * the lower and upper tick are in the response because there are
   * instances in which multiple ticks represent the same price, so
   * we may move their provided tick to the canonical tick that represents
   * the same price.
   */
  lowerTick: Long;
  upperTick: Long;
}
export interface MsgCreatePositionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse";
  value: Uint8Array;
}
export interface MsgCreatePositionResponseAmino {
  position_id: string;
  amount0: string;
  amount1: string;
  join_time?: Date;
  liquidity_created: string;
  /**
   * the lower and upper tick are in the response because there are
   * instances in which multiple ticks represent the same price, so
   * we may move their provided tick to the canonical tick that represents
   * the same price.
   */
  lower_tick: string;
  upper_tick: string;
}
export interface MsgCreatePositionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/create-position-response";
  value: MsgCreatePositionResponseAmino;
}
export interface MsgCreatePositionResponseSDKType {
  position_id: Long;
  amount0: string;
  amount1: string;
  join_time?: Date;
  liquidity_created: string;
  lower_tick: Long;
  upper_tick: Long;
}
/** ===================== MsgAddToPosition */
export interface MsgAddToPosition {
  positionId: Long;
  sender: string;
  /** amount0 represents the amount of token0 willing to put in. */
  amount0: string;
  /** amount1 represents the amount of token1 willing to put in. */
  amount1: string;
  /**
   * token_min_amount0 represents the minimum amount of token0 desired from the
   * new position being created. Note that this field indicates the min amount0
   * corresponding to the total liquidity of the position, not just the
   * liquidity that is being added.
   */
  tokenMinAmount0: string;
  /**
   * token_min_amount1 represents the minimum amount of token1 desired from the
   * new position being created. Note that this field indicates the min amount1
   * corresponding to the total liquidity of the position, not just the
   * liquidity that is being added.
   */
  tokenMinAmount1: string;
}
export interface MsgAddToPositionProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition";
  value: Uint8Array;
}
/** ===================== MsgAddToPosition */
export interface MsgAddToPositionAmino {
  position_id: string;
  sender: string;
  /** amount0 represents the amount of token0 willing to put in. */
  amount0: string;
  /** amount1 represents the amount of token1 willing to put in. */
  amount1: string;
  /**
   * token_min_amount0 represents the minimum amount of token0 desired from the
   * new position being created. Note that this field indicates the min amount0
   * corresponding to the total liquidity of the position, not just the
   * liquidity that is being added.
   */
  token_min_amount0: string;
  /**
   * token_min_amount1 represents the minimum amount of token1 desired from the
   * new position being created. Note that this field indicates the min amount1
   * corresponding to the total liquidity of the position, not just the
   * liquidity that is being added.
   */
  token_min_amount1: string;
}
export interface MsgAddToPositionAminoMsg {
  type: "osmosis/concentratedliquidity/add-to-position";
  value: MsgAddToPositionAmino;
}
/** ===================== MsgAddToPosition */
export interface MsgAddToPositionSDKType {
  position_id: Long;
  sender: string;
  amount0: string;
  amount1: string;
  token_min_amount0: string;
  token_min_amount1: string;
}
export interface MsgAddToPositionResponse {
  positionId: Long;
  amount0: string;
  amount1: string;
}
export interface MsgAddToPositionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPositionResponse";
  value: Uint8Array;
}
export interface MsgAddToPositionResponseAmino {
  position_id: string;
  amount0: string;
  amount1: string;
}
export interface MsgAddToPositionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/add-to-position-response";
  value: MsgAddToPositionResponseAmino;
}
export interface MsgAddToPositionResponseSDKType {
  position_id: Long;
  amount0: string;
  amount1: string;
}
/** ===================== MsgWithdrawPosition */
export interface MsgWithdrawPosition {
  positionId: Long;
  sender: string;
  liquidityAmount: string;
}
export interface MsgWithdrawPositionProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition";
  value: Uint8Array;
}
/** ===================== MsgWithdrawPosition */
export interface MsgWithdrawPositionAmino {
  position_id: string;
  sender: string;
  liquidity_amount: string;
}
export interface MsgWithdrawPositionAminoMsg {
  type: "osmosis/concentratedliquidity/withdraw-position";
  value: MsgWithdrawPositionAmino;
}
/** ===================== MsgWithdrawPosition */
export interface MsgWithdrawPositionSDKType {
  position_id: Long;
  sender: string;
  liquidity_amount: string;
}
export interface MsgWithdrawPositionResponse {
  amount0: string;
  amount1: string;
}
export interface MsgWithdrawPositionResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse";
  value: Uint8Array;
}
export interface MsgWithdrawPositionResponseAmino {
  amount0: string;
  amount1: string;
}
export interface MsgWithdrawPositionResponseAminoMsg {
  type: "osmosis/concentratedliquidity/withdraw-position-response";
  value: MsgWithdrawPositionResponseAmino;
}
export interface MsgWithdrawPositionResponseSDKType {
  amount0: string;
  amount1: string;
}
/** ===================== MsgCollectSpreadRewards */
export interface MsgCollectSpreadRewards {
  positionIds: Long[];
  sender: string;
}
export interface MsgCollectSpreadRewardsProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards";
  value: Uint8Array;
}
/** ===================== MsgCollectSpreadRewards */
export interface MsgCollectSpreadRewardsAmino {
  position_ids: string[];
  sender: string;
}
export interface MsgCollectSpreadRewardsAminoMsg {
  type: "osmosis/concentratedliquidity/collect-spread-rewards";
  value: MsgCollectSpreadRewardsAmino;
}
/** ===================== MsgCollectSpreadRewards */
export interface MsgCollectSpreadRewardsSDKType {
  position_ids: Long[];
  sender: string;
}
export interface MsgCollectSpreadRewardsResponse {
  collectedSpreadRewards: Coin[];
}
export interface MsgCollectSpreadRewardsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewardsResponse";
  value: Uint8Array;
}
export interface MsgCollectSpreadRewardsResponseAmino {
  collected_spread_rewards: CoinAmino[];
}
export interface MsgCollectSpreadRewardsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/collect-spread-rewards-response";
  value: MsgCollectSpreadRewardsResponseAmino;
}
export interface MsgCollectSpreadRewardsResponseSDKType {
  collected_spread_rewards: CoinSDKType[];
}
/** ===================== MsgCollectIncentives */
export interface MsgCollectIncentives {
  positionIds: Long[];
  sender: string;
}
export interface MsgCollectIncentivesProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives";
  value: Uint8Array;
}
/** ===================== MsgCollectIncentives */
export interface MsgCollectIncentivesAmino {
  position_ids: string[];
  sender: string;
}
export interface MsgCollectIncentivesAminoMsg {
  type: "osmosis/concentratedliquidity/collect-incentives";
  value: MsgCollectIncentivesAmino;
}
/** ===================== MsgCollectIncentives */
export interface MsgCollectIncentivesSDKType {
  position_ids: Long[];
  sender: string;
}
export interface MsgCollectIncentivesResponse {
  collectedIncentives: Coin[];
  forfeitedIncentives: Coin[];
}
export interface MsgCollectIncentivesResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse";
  value: Uint8Array;
}
export interface MsgCollectIncentivesResponseAmino {
  collected_incentives: CoinAmino[];
  forfeited_incentives: CoinAmino[];
}
export interface MsgCollectIncentivesResponseAminoMsg {
  type: "osmosis/concentratedliquidity/collect-incentives-response";
  value: MsgCollectIncentivesResponseAmino;
}
export interface MsgCollectIncentivesResponseSDKType {
  collected_incentives: CoinSDKType[];
  forfeited_incentives: CoinSDKType[];
}
/** ===================== MsgFungifyChargedPositions */
export interface MsgFungifyChargedPositions {
  positionIds: Long[];
  sender: string;
}
export interface MsgFungifyChargedPositionsProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions";
  value: Uint8Array;
}
/** ===================== MsgFungifyChargedPositions */
export interface MsgFungifyChargedPositionsAmino {
  position_ids: string[];
  sender: string;
}
export interface MsgFungifyChargedPositionsAminoMsg {
  type: "osmosis/concentratedliquidity/fungify-charged-positions";
  value: MsgFungifyChargedPositionsAmino;
}
/** ===================== MsgFungifyChargedPositions */
export interface MsgFungifyChargedPositionsSDKType {
  position_ids: Long[];
  sender: string;
}
export interface MsgFungifyChargedPositionsResponse {
  newPositionId: Long;
}
export interface MsgFungifyChargedPositionsResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse";
  value: Uint8Array;
}
export interface MsgFungifyChargedPositionsResponseAmino {
  new_position_id: string;
}
export interface MsgFungifyChargedPositionsResponseAminoMsg {
  type: "osmosis/concentratedliquidity/fungify-charged-positions-response";
  value: MsgFungifyChargedPositionsResponseAmino;
}
export interface MsgFungifyChargedPositionsResponseSDKType {
  new_position_id: Long;
}
function createBaseMsgCreatePosition(): MsgCreatePosition {
  return {
    poolId: Long.UZERO,
    sender: "",
    lowerTick: Long.ZERO,
    upperTick: Long.ZERO,
    tokensProvided: [],
    tokenMinAmount0: "",
    tokenMinAmount1: "",
  };
}
export const MsgCreatePosition = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
  encode(
    message: MsgCreatePosition,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (!message.lowerTick.isZero()) {
      writer.uint32(24).int64(message.lowerTick);
    }
    if (!message.upperTick.isZero()) {
      writer.uint32(32).int64(message.upperTick);
    }
    for (const v of message.tokensProvided) {
      Coin.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.tokenMinAmount0 !== "") {
      writer.uint32(50).string(message.tokenMinAmount0);
    }
    if (message.tokenMinAmount1 !== "") {
      writer.uint32(58).string(message.tokenMinAmount1);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreatePosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.lowerTick = reader.int64() as Long;
          break;
        case 4:
          message.upperTick = reader.int64() as Long;
          break;
        case 5:
          message.tokensProvided.push(Coin.decode(reader, reader.uint32()));
          break;
        case 6:
          message.tokenMinAmount0 = reader.string();
          break;
        case 7:
          message.tokenMinAmount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreatePosition>): MsgCreatePosition {
    const message = createBaseMsgCreatePosition();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.sender = object.sender ?? "";
    message.lowerTick =
      object.lowerTick !== undefined && object.lowerTick !== null
        ? Long.fromValue(object.lowerTick)
        : Long.ZERO;
    message.upperTick =
      object.upperTick !== undefined && object.upperTick !== null
        ? Long.fromValue(object.upperTick)
        : Long.ZERO;
    message.tokensProvided =
      object.tokensProvided?.map((e) => Coin.fromPartial(e)) || [];
    message.tokenMinAmount0 = object.tokenMinAmount0 ?? "";
    message.tokenMinAmount1 = object.tokenMinAmount1 ?? "";
    return message;
  },
  fromAmino(object: MsgCreatePositionAmino): MsgCreatePosition {
    return {
      poolId: Long.fromString(object.pool_id),
      sender: object.sender,
      lowerTick: Long.fromString(object.lower_tick),
      upperTick: Long.fromString(object.upper_tick),
      tokensProvided: Array.isArray(object?.tokens_provided)
        ? object.tokens_provided.map((e: any) => Coin.fromAmino(e))
        : [],
      tokenMinAmount0: object.token_min_amount0,
      tokenMinAmount1: object.token_min_amount1,
    };
  },
  toAmino(message: MsgCreatePosition): MsgCreatePositionAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.sender = message.sender;
    obj.lower_tick = message.lowerTick
      ? message.lowerTick.toString()
      : undefined;
    obj.upper_tick = message.upperTick
      ? message.upperTick.toString()
      : undefined;
    if (message.tokensProvided) {
      obj.tokens_provided = message.tokensProvided.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.tokens_provided = [];
    }
    obj.token_min_amount0 = message.tokenMinAmount0;
    obj.token_min_amount1 = message.tokenMinAmount1;
    return obj;
  },
  fromAminoMsg(object: MsgCreatePositionAminoMsg): MsgCreatePosition {
    return MsgCreatePosition.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreatePosition): MsgCreatePositionAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-position",
      value: MsgCreatePosition.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreatePositionProtoMsg): MsgCreatePosition {
    return MsgCreatePosition.decode(message.value);
  },
  toProto(message: MsgCreatePosition): Uint8Array {
    return MsgCreatePosition.encode(message).finish();
  },
  toProtoMsg(message: MsgCreatePosition): MsgCreatePositionProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
      value: MsgCreatePosition.encode(message).finish(),
    };
  },
};
function createBaseMsgCreatePositionResponse(): MsgCreatePositionResponse {
  return {
    positionId: Long.UZERO,
    amount0: "",
    amount1: "",
    joinTime: undefined,
    liquidityCreated: "",
    lowerTick: Long.ZERO,
    upperTick: Long.ZERO,
  };
}
export const MsgCreatePositionResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse",
  encode(
    message: MsgCreatePositionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.amount0 !== "") {
      writer.uint32(18).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(26).string(message.amount1);
    }
    if (message.joinTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.joinTime),
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.liquidityCreated !== "") {
      writer.uint32(42).string(message.liquidityCreated);
    }
    if (!message.lowerTick.isZero()) {
      writer.uint32(48).int64(message.lowerTick);
    }
    if (!message.upperTick.isZero()) {
      writer.uint32(56).int64(message.upperTick);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreatePositionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreatePositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        case 2:
          message.amount0 = reader.string();
          break;
        case 3:
          message.amount1 = reader.string();
          break;
        case 4:
          message.joinTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.liquidityCreated = reader.string();
          break;
        case 6:
          message.lowerTick = reader.int64() as Long;
          break;
        case 7:
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
    object: Partial<MsgCreatePositionResponse>
  ): MsgCreatePositionResponse {
    const message = createBaseMsgCreatePositionResponse();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    message.joinTime = object.joinTime ?? undefined;
    message.liquidityCreated = object.liquidityCreated ?? "";
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
  fromAmino(object: MsgCreatePositionResponseAmino): MsgCreatePositionResponse {
    return {
      positionId: Long.fromString(object.position_id),
      amount0: object.amount0,
      amount1: object.amount1,
      joinTime: object?.join_time
        ? Timestamp.fromAmino(object.join_time)
        : undefined,
      liquidityCreated: object.liquidity_created,
      lowerTick: Long.fromString(object.lower_tick),
      upperTick: Long.fromString(object.upper_tick),
    };
  },
  toAmino(message: MsgCreatePositionResponse): MsgCreatePositionResponseAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    obj.amount0 = message.amount0;
    obj.amount1 = message.amount1;
    obj.join_time = message.joinTime
      ? Timestamp.toAmino(message.joinTime)
      : undefined;
    obj.liquidity_created = message.liquidityCreated;
    obj.lower_tick = message.lowerTick
      ? message.lowerTick.toString()
      : undefined;
    obj.upper_tick = message.upperTick
      ? message.upperTick.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreatePositionResponseAminoMsg
  ): MsgCreatePositionResponse {
    return MsgCreatePositionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreatePositionResponse
  ): MsgCreatePositionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-position-response",
      value: MsgCreatePositionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreatePositionResponseProtoMsg
  ): MsgCreatePositionResponse {
    return MsgCreatePositionResponse.decode(message.value);
  },
  toProto(message: MsgCreatePositionResponse): Uint8Array {
    return MsgCreatePositionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreatePositionResponse
  ): MsgCreatePositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCreatePositionResponse",
      value: MsgCreatePositionResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgAddToPosition(): MsgAddToPosition {
  return {
    positionId: Long.UZERO,
    sender: "",
    amount0: "",
    amount1: "",
    tokenMinAmount0: "",
    tokenMinAmount1: "",
  };
}
export const MsgAddToPosition = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
  encode(
    message: MsgAddToPosition,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.amount0 !== "") {
      writer.uint32(26).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(34).string(message.amount1);
    }
    if (message.tokenMinAmount0 !== "") {
      writer.uint32(42).string(message.tokenMinAmount0);
    }
    if (message.tokenMinAmount1 !== "") {
      writer.uint32(50).string(message.tokenMinAmount1);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddToPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.amount0 = reader.string();
          break;
        case 4:
          message.amount1 = reader.string();
          break;
        case 5:
          message.tokenMinAmount0 = reader.string();
          break;
        case 6:
          message.tokenMinAmount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAddToPosition>): MsgAddToPosition {
    const message = createBaseMsgAddToPosition();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    message.sender = object.sender ?? "";
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    message.tokenMinAmount0 = object.tokenMinAmount0 ?? "";
    message.tokenMinAmount1 = object.tokenMinAmount1 ?? "";
    return message;
  },
  fromAmino(object: MsgAddToPositionAmino): MsgAddToPosition {
    return {
      positionId: Long.fromString(object.position_id),
      sender: object.sender,
      amount0: object.amount0,
      amount1: object.amount1,
      tokenMinAmount0: object.token_min_amount0,
      tokenMinAmount1: object.token_min_amount1,
    };
  },
  toAmino(message: MsgAddToPosition): MsgAddToPositionAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    obj.sender = message.sender;
    obj.amount0 = message.amount0;
    obj.amount1 = message.amount1;
    obj.token_min_amount0 = message.tokenMinAmount0;
    obj.token_min_amount1 = message.tokenMinAmount1;
    return obj;
  },
  fromAminoMsg(object: MsgAddToPositionAminoMsg): MsgAddToPosition {
    return MsgAddToPosition.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAddToPosition): MsgAddToPositionAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/add-to-position",
      value: MsgAddToPosition.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgAddToPositionProtoMsg): MsgAddToPosition {
    return MsgAddToPosition.decode(message.value);
  },
  toProto(message: MsgAddToPosition): Uint8Array {
    return MsgAddToPosition.encode(message).finish();
  },
  toProtoMsg(message: MsgAddToPosition): MsgAddToPositionProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
      value: MsgAddToPosition.encode(message).finish(),
    };
  },
};
function createBaseMsgAddToPositionResponse(): MsgAddToPositionResponse {
  return {
    positionId: Long.UZERO,
    amount0: "",
    amount1: "",
  };
}
export const MsgAddToPositionResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPositionResponse",
  encode(
    message: MsgAddToPositionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.amount0 !== "") {
      writer.uint32(18).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(26).string(message.amount1);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAddToPositionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToPositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        case 2:
          message.amount0 = reader.string();
          break;
        case 3:
          message.amount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgAddToPositionResponse>
  ): MsgAddToPositionResponse {
    const message = createBaseMsgAddToPositionResponse();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    return message;
  },
  fromAmino(object: MsgAddToPositionResponseAmino): MsgAddToPositionResponse {
    return {
      positionId: Long.fromString(object.position_id),
      amount0: object.amount0,
      amount1: object.amount1,
    };
  },
  toAmino(message: MsgAddToPositionResponse): MsgAddToPositionResponseAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    obj.amount0 = message.amount0;
    obj.amount1 = message.amount1;
    return obj;
  },
  fromAminoMsg(
    object: MsgAddToPositionResponseAminoMsg
  ): MsgAddToPositionResponse {
    return MsgAddToPositionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgAddToPositionResponse
  ): MsgAddToPositionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/add-to-position-response",
      value: MsgAddToPositionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgAddToPositionResponseProtoMsg
  ): MsgAddToPositionResponse {
    return MsgAddToPositionResponse.decode(message.value);
  },
  toProto(message: MsgAddToPositionResponse): Uint8Array {
    return MsgAddToPositionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgAddToPositionResponse
  ): MsgAddToPositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgAddToPositionResponse",
      value: MsgAddToPositionResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawPosition(): MsgWithdrawPosition {
  return {
    positionId: Long.UZERO,
    sender: "",
    liquidityAmount: "",
  };
}
export const MsgWithdrawPosition = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
  encode(
    message: MsgWithdrawPosition,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.liquidityAmount !== "") {
      writer.uint32(26).string(message.liquidityAmount);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgWithdrawPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.liquidityAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgWithdrawPosition>): MsgWithdrawPosition {
    const message = createBaseMsgWithdrawPosition();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    message.sender = object.sender ?? "";
    message.liquidityAmount = object.liquidityAmount ?? "";
    return message;
  },
  fromAmino(object: MsgWithdrawPositionAmino): MsgWithdrawPosition {
    return {
      positionId: Long.fromString(object.position_id),
      sender: object.sender,
      liquidityAmount: object.liquidity_amount,
    };
  },
  toAmino(message: MsgWithdrawPosition): MsgWithdrawPositionAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    obj.sender = message.sender;
    obj.liquidity_amount = message.liquidityAmount;
    return obj;
  },
  fromAminoMsg(object: MsgWithdrawPositionAminoMsg): MsgWithdrawPosition {
    return MsgWithdrawPosition.fromAmino(object.value);
  },
  toAminoMsg(message: MsgWithdrawPosition): MsgWithdrawPositionAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/withdraw-position",
      value: MsgWithdrawPosition.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgWithdrawPositionProtoMsg): MsgWithdrawPosition {
    return MsgWithdrawPosition.decode(message.value);
  },
  toProto(message: MsgWithdrawPosition): Uint8Array {
    return MsgWithdrawPosition.encode(message).finish();
  },
  toProtoMsg(message: MsgWithdrawPosition): MsgWithdrawPositionProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
      value: MsgWithdrawPosition.encode(message).finish(),
    };
  },
};
function createBaseMsgWithdrawPositionResponse(): MsgWithdrawPositionResponse {
  return {
    amount0: "",
    amount1: "",
  };
}
export const MsgWithdrawPositionResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse",
  encode(
    message: MsgWithdrawPositionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.amount0 !== "") {
      writer.uint32(10).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(18).string(message.amount1);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgWithdrawPositionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgWithdrawPositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amount0 = reader.string();
          break;
        case 2:
          message.amount1 = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgWithdrawPositionResponse>
  ): MsgWithdrawPositionResponse {
    const message = createBaseMsgWithdrawPositionResponse();
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    return message;
  },
  fromAmino(
    object: MsgWithdrawPositionResponseAmino
  ): MsgWithdrawPositionResponse {
    return {
      amount0: object.amount0,
      amount1: object.amount1,
    };
  },
  toAmino(
    message: MsgWithdrawPositionResponse
  ): MsgWithdrawPositionResponseAmino {
    const obj: any = {};
    obj.amount0 = message.amount0;
    obj.amount1 = message.amount1;
    return obj;
  },
  fromAminoMsg(
    object: MsgWithdrawPositionResponseAminoMsg
  ): MsgWithdrawPositionResponse {
    return MsgWithdrawPositionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgWithdrawPositionResponse
  ): MsgWithdrawPositionResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/withdraw-position-response",
      value: MsgWithdrawPositionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgWithdrawPositionResponseProtoMsg
  ): MsgWithdrawPositionResponse {
    return MsgWithdrawPositionResponse.decode(message.value);
  },
  toProto(message: MsgWithdrawPositionResponse): Uint8Array {
    return MsgWithdrawPositionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgWithdrawPositionResponse
  ): MsgWithdrawPositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPositionResponse",
      value: MsgWithdrawPositionResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectSpreadRewards(): MsgCollectSpreadRewards {
  return {
    positionIds: [],
    sender: "",
  };
}
export const MsgCollectSpreadRewards = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
  encode(
    message: MsgCollectSpreadRewards,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.positionIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCollectSpreadRewards {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectSpreadRewards();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.positionIds.push(reader.uint64() as Long);
            }
          } else {
            message.positionIds.push(reader.uint64() as Long);
          }
          break;
        case 2:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCollectSpreadRewards>
  ): MsgCollectSpreadRewards {
    const message = createBaseMsgCollectSpreadRewards();
    message.positionIds =
      object.positionIds?.map((e) => Long.fromValue(e)) || [];
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(object: MsgCollectSpreadRewardsAmino): MsgCollectSpreadRewards {
    return {
      positionIds: Array.isArray(object?.position_ids)
        ? object.position_ids.map((e: any) => e)
        : [],
      sender: object.sender,
    };
  },
  toAmino(message: MsgCollectSpreadRewards): MsgCollectSpreadRewardsAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e);
    } else {
      obj.position_ids = [];
    }
    obj.sender = message.sender;
    return obj;
  },
  fromAminoMsg(
    object: MsgCollectSpreadRewardsAminoMsg
  ): MsgCollectSpreadRewards {
    return MsgCollectSpreadRewards.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCollectSpreadRewards
  ): MsgCollectSpreadRewardsAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-spread-rewards",
      value: MsgCollectSpreadRewards.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCollectSpreadRewardsProtoMsg
  ): MsgCollectSpreadRewards {
    return MsgCollectSpreadRewards.decode(message.value);
  },
  toProto(message: MsgCollectSpreadRewards): Uint8Array {
    return MsgCollectSpreadRewards.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCollectSpreadRewards
  ): MsgCollectSpreadRewardsProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
      value: MsgCollectSpreadRewards.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectSpreadRewardsResponse(): MsgCollectSpreadRewardsResponse {
  return {
    collectedSpreadRewards: [],
  };
}
export const MsgCollectSpreadRewardsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewardsResponse",
  encode(
    message: MsgCollectSpreadRewardsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.collectedSpreadRewards) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCollectSpreadRewardsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectSpreadRewardsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.collectedSpreadRewards.push(
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
    object: Partial<MsgCollectSpreadRewardsResponse>
  ): MsgCollectSpreadRewardsResponse {
    const message = createBaseMsgCollectSpreadRewardsResponse();
    message.collectedSpreadRewards =
      object.collectedSpreadRewards?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: MsgCollectSpreadRewardsResponseAmino
  ): MsgCollectSpreadRewardsResponse {
    return {
      collectedSpreadRewards: Array.isArray(object?.collected_spread_rewards)
        ? object.collected_spread_rewards.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: MsgCollectSpreadRewardsResponse
  ): MsgCollectSpreadRewardsResponseAmino {
    const obj: any = {};
    if (message.collectedSpreadRewards) {
      obj.collected_spread_rewards = message.collectedSpreadRewards.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.collected_spread_rewards = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgCollectSpreadRewardsResponseAminoMsg
  ): MsgCollectSpreadRewardsResponse {
    return MsgCollectSpreadRewardsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCollectSpreadRewardsResponse
  ): MsgCollectSpreadRewardsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-spread-rewards-response",
      value: MsgCollectSpreadRewardsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCollectSpreadRewardsResponseProtoMsg
  ): MsgCollectSpreadRewardsResponse {
    return MsgCollectSpreadRewardsResponse.decode(message.value);
  },
  toProto(message: MsgCollectSpreadRewardsResponse): Uint8Array {
    return MsgCollectSpreadRewardsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCollectSpreadRewardsResponse
  ): MsgCollectSpreadRewardsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewardsResponse",
      value: MsgCollectSpreadRewardsResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectIncentives(): MsgCollectIncentives {
  return {
    positionIds: [],
    sender: "",
  };
}
export const MsgCollectIncentives = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
  encode(
    message: MsgCollectIncentives,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.positionIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCollectIncentives {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectIncentives();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.positionIds.push(reader.uint64() as Long);
            }
          } else {
            message.positionIds.push(reader.uint64() as Long);
          }
          break;
        case 2:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCollectIncentives>): MsgCollectIncentives {
    const message = createBaseMsgCollectIncentives();
    message.positionIds =
      object.positionIds?.map((e) => Long.fromValue(e)) || [];
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(object: MsgCollectIncentivesAmino): MsgCollectIncentives {
    return {
      positionIds: Array.isArray(object?.position_ids)
        ? object.position_ids.map((e: any) => e)
        : [],
      sender: object.sender,
    };
  },
  toAmino(message: MsgCollectIncentives): MsgCollectIncentivesAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e);
    } else {
      obj.position_ids = [];
    }
    obj.sender = message.sender;
    return obj;
  },
  fromAminoMsg(object: MsgCollectIncentivesAminoMsg): MsgCollectIncentives {
    return MsgCollectIncentives.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCollectIncentives): MsgCollectIncentivesAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-incentives",
      value: MsgCollectIncentives.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCollectIncentivesProtoMsg): MsgCollectIncentives {
    return MsgCollectIncentives.decode(message.value);
  },
  toProto(message: MsgCollectIncentives): Uint8Array {
    return MsgCollectIncentives.encode(message).finish();
  },
  toProtoMsg(message: MsgCollectIncentives): MsgCollectIncentivesProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
      value: MsgCollectIncentives.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectIncentivesResponse(): MsgCollectIncentivesResponse {
  return {
    collectedIncentives: [],
    forfeitedIncentives: [],
  };
}
export const MsgCollectIncentivesResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse",
  encode(
    message: MsgCollectIncentivesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.collectedIncentives) {
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
  ): MsgCollectIncentivesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectIncentivesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.collectedIncentives.push(
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
    object: Partial<MsgCollectIncentivesResponse>
  ): MsgCollectIncentivesResponse {
    const message = createBaseMsgCollectIncentivesResponse();
    message.collectedIncentives =
      object.collectedIncentives?.map((e) => Coin.fromPartial(e)) || [];
    message.forfeitedIncentives =
      object.forfeitedIncentives?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: MsgCollectIncentivesResponseAmino
  ): MsgCollectIncentivesResponse {
    return {
      collectedIncentives: Array.isArray(object?.collected_incentives)
        ? object.collected_incentives.map((e: any) => Coin.fromAmino(e))
        : [],
      forfeitedIncentives: Array.isArray(object?.forfeited_incentives)
        ? object.forfeited_incentives.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: MsgCollectIncentivesResponse
  ): MsgCollectIncentivesResponseAmino {
    const obj: any = {};
    if (message.collectedIncentives) {
      obj.collected_incentives = message.collectedIncentives.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.collected_incentives = [];
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
    object: MsgCollectIncentivesResponseAminoMsg
  ): MsgCollectIncentivesResponse {
    return MsgCollectIncentivesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCollectIncentivesResponse
  ): MsgCollectIncentivesResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-incentives-response",
      value: MsgCollectIncentivesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCollectIncentivesResponseProtoMsg
  ): MsgCollectIncentivesResponse {
    return MsgCollectIncentivesResponse.decode(message.value);
  },
  toProto(message: MsgCollectIncentivesResponse): Uint8Array {
    return MsgCollectIncentivesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCollectIncentivesResponse
  ): MsgCollectIncentivesResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse",
      value: MsgCollectIncentivesResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgFungifyChargedPositions(): MsgFungifyChargedPositions {
  return {
    positionIds: [],
    sender: "",
  };
}
export const MsgFungifyChargedPositions = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions",
  encode(
    message: MsgFungifyChargedPositions,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.positionIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgFungifyChargedPositions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgFungifyChargedPositions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.positionIds.push(reader.uint64() as Long);
            }
          } else {
            message.positionIds.push(reader.uint64() as Long);
          }
          break;
        case 2:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgFungifyChargedPositions>
  ): MsgFungifyChargedPositions {
    const message = createBaseMsgFungifyChargedPositions();
    message.positionIds =
      object.positionIds?.map((e) => Long.fromValue(e)) || [];
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(
    object: MsgFungifyChargedPositionsAmino
  ): MsgFungifyChargedPositions {
    return {
      positionIds: Array.isArray(object?.position_ids)
        ? object.position_ids.map((e: any) => e)
        : [],
      sender: object.sender,
    };
  },
  toAmino(
    message: MsgFungifyChargedPositions
  ): MsgFungifyChargedPositionsAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e);
    } else {
      obj.position_ids = [];
    }
    obj.sender = message.sender;
    return obj;
  },
  fromAminoMsg(
    object: MsgFungifyChargedPositionsAminoMsg
  ): MsgFungifyChargedPositions {
    return MsgFungifyChargedPositions.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgFungifyChargedPositions
  ): MsgFungifyChargedPositionsAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/fungify-charged-positions",
      value: MsgFungifyChargedPositions.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgFungifyChargedPositionsProtoMsg
  ): MsgFungifyChargedPositions {
    return MsgFungifyChargedPositions.decode(message.value);
  },
  toProto(message: MsgFungifyChargedPositions): Uint8Array {
    return MsgFungifyChargedPositions.encode(message).finish();
  },
  toProtoMsg(
    message: MsgFungifyChargedPositions
  ): MsgFungifyChargedPositionsProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositions",
      value: MsgFungifyChargedPositions.encode(message).finish(),
    };
  },
};
function createBaseMsgFungifyChargedPositionsResponse(): MsgFungifyChargedPositionsResponse {
  return {
    newPositionId: Long.UZERO,
  };
}
export const MsgFungifyChargedPositionsResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse",
  encode(
    message: MsgFungifyChargedPositionsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.newPositionId.isZero()) {
      writer.uint32(8).uint64(message.newPositionId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgFungifyChargedPositionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgFungifyChargedPositionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newPositionId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgFungifyChargedPositionsResponse>
  ): MsgFungifyChargedPositionsResponse {
    const message = createBaseMsgFungifyChargedPositionsResponse();
    message.newPositionId =
      object.newPositionId !== undefined && object.newPositionId !== null
        ? Long.fromValue(object.newPositionId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgFungifyChargedPositionsResponseAmino
  ): MsgFungifyChargedPositionsResponse {
    return {
      newPositionId: Long.fromString(object.new_position_id),
    };
  },
  toAmino(
    message: MsgFungifyChargedPositionsResponse
  ): MsgFungifyChargedPositionsResponseAmino {
    const obj: any = {};
    obj.new_position_id = message.newPositionId
      ? message.newPositionId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgFungifyChargedPositionsResponseAminoMsg
  ): MsgFungifyChargedPositionsResponse {
    return MsgFungifyChargedPositionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgFungifyChargedPositionsResponse
  ): MsgFungifyChargedPositionsResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/fungify-charged-positions-response",
      value: MsgFungifyChargedPositionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgFungifyChargedPositionsResponseProtoMsg
  ): MsgFungifyChargedPositionsResponse {
    return MsgFungifyChargedPositionsResponse.decode(message.value);
  },
  toProto(message: MsgFungifyChargedPositionsResponse): Uint8Array {
    return MsgFungifyChargedPositionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgFungifyChargedPositionsResponse
  ): MsgFungifyChargedPositionsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgFungifyChargedPositionsResponse",
      value: MsgFungifyChargedPositionsResponse.encode(message).finish(),
    };
  },
};
