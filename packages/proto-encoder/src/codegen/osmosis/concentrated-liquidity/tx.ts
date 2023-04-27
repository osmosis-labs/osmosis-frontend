//@ts-nocheck
/* eslint-disable */
import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../google/protobuf/timestamp";
import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../google/protobuf/duration";
import { Long, toTimestamp, fromTimestamp } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
/** ===================== MsgCreatePosition */
export interface MsgCreatePosition {
  poolId: Long;
  sender: string;
  lowerTick: Long;
  upperTick: Long;
  tokenDesired0?: Coin;
  tokenDesired1?: Coin;
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
  token_desired0?: CoinAmino;
  token_desired1?: CoinAmino;
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
  token_desired0?: CoinSDKType;
  token_desired1?: CoinSDKType;
  token_min_amount0: string;
  token_min_amount1: string;
}
export interface MsgCreatePositionResponse {
  positionId: Long;
  amount0: string;
  amount1: string;
  joinTime?: Date;
  liquidityCreated: string;
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
/** ===================== MsgCollectFees */
export interface MsgCollectFees {
  positionIds: Long[];
  sender: string;
}
export interface MsgCollectFeesProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectFees";
  value: Uint8Array;
}
/** ===================== MsgCollectFees */
export interface MsgCollectFeesAmino {
  position_ids: string[];
  sender: string;
}
export interface MsgCollectFeesAminoMsg {
  type: "osmosis/concentratedliquidity/collect-fees";
  value: MsgCollectFeesAmino;
}
/** ===================== MsgCollectFees */
export interface MsgCollectFeesSDKType {
  position_ids: Long[];
  sender: string;
}
export interface MsgCollectFeesResponse {
  collectedFees: Coin[];
}
export interface MsgCollectFeesResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse";
  value: Uint8Array;
}
export interface MsgCollectFeesResponseAmino {
  collected_fees: CoinAmino[];
}
export interface MsgCollectFeesResponseAminoMsg {
  type: "osmosis/concentratedliquidity/collect-fees-response";
  value: MsgCollectFeesResponseAmino;
}
export interface MsgCollectFeesResponseSDKType {
  collected_fees: CoinSDKType[];
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
}
export interface MsgCollectIncentivesResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentivesResponse";
  value: Uint8Array;
}
export interface MsgCollectIncentivesResponseAmino {
  collected_incentives: CoinAmino[];
}
export interface MsgCollectIncentivesResponseAminoMsg {
  type: "osmosis/concentratedliquidity/collect-incentives-response";
  value: MsgCollectIncentivesResponseAmino;
}
export interface MsgCollectIncentivesResponseSDKType {
  collected_incentives: CoinSDKType[];
}
/** ===================== MsgCreateIncentive */
export interface MsgCreateIncentive {
  poolId: Long;
  sender: string;
  incentiveDenom: string;
  incentiveAmount: string;
  emissionRate: string;
  startTime?: Date;
  minUptime?: Duration;
}
export interface MsgCreateIncentiveProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive";
  value: Uint8Array;
}
/** ===================== MsgCreateIncentive */
export interface MsgCreateIncentiveAmino {
  pool_id: string;
  sender: string;
  incentive_denom: string;
  incentive_amount: string;
  emission_rate: string;
  start_time?: Date;
  min_uptime?: DurationAmino;
}
export interface MsgCreateIncentiveAminoMsg {
  type: "osmosis/concentratedliquidity/create-incentive";
  value: MsgCreateIncentiveAmino;
}
/** ===================== MsgCreateIncentive */
export interface MsgCreateIncentiveSDKType {
  pool_id: Long;
  sender: string;
  incentive_denom: string;
  incentive_amount: string;
  emission_rate: string;
  start_time?: Date;
  min_uptime?: DurationSDKType;
}
export interface MsgCreateIncentiveResponse {
  incentiveDenom: string;
  incentiveAmount: string;
  emissionRate: string;
  startTime?: Date;
  minUptime?: Duration;
}
export interface MsgCreateIncentiveResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateIncentiveResponse";
  value: Uint8Array;
}
export interface MsgCreateIncentiveResponseAmino {
  incentive_denom: string;
  incentive_amount: string;
  emission_rate: string;
  start_time?: Date;
  min_uptime?: DurationAmino;
}
export interface MsgCreateIncentiveResponseAminoMsg {
  type: "osmosis/concentratedliquidity/create-incentive-response";
  value: MsgCreateIncentiveResponseAmino;
}
export interface MsgCreateIncentiveResponseSDKType {
  incentive_denom: string;
  incentive_amount: string;
  emission_rate: string;
  start_time?: Date;
  min_uptime?: DurationSDKType;
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
    tokenDesired0: undefined,
    tokenDesired1: undefined,
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
    if (message.tokenDesired0 !== undefined) {
      Coin.encode(message.tokenDesired0, writer.uint32(42).fork()).ldelim();
    }
    if (message.tokenDesired1 !== undefined) {
      Coin.encode(message.tokenDesired1, writer.uint32(50).fork()).ldelim();
    }
    if (message.tokenMinAmount0 !== "") {
      writer.uint32(58).string(message.tokenMinAmount0);
    }
    if (message.tokenMinAmount1 !== "") {
      writer.uint32(66).string(message.tokenMinAmount1);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreatePosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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
          message.tokenDesired0 = Coin.decode(reader, reader.uint32());
          break;
        case 6:
          message.tokenDesired1 = Coin.decode(reader, reader.uint32());
          break;
        case 7:
          message.tokenMinAmount0 = reader.string();
          break;
        case 8:
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
    message.tokenDesired0 =
      object.tokenDesired0 !== undefined && object.tokenDesired0 !== null
        ? Coin.fromPartial(object.tokenDesired0)
        : undefined;
    message.tokenDesired1 =
      object.tokenDesired1 !== undefined && object.tokenDesired1 !== null
        ? Coin.fromPartial(object.tokenDesired1)
        : undefined;
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
      tokenDesired0: object?.token_desired0
        ? Coin.fromAmino(object.token_desired0)
        : undefined,
      tokenDesired1: object?.token_desired1
        ? Coin.fromAmino(object.token_desired1)
        : undefined,
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
    obj.token_desired0 = message.tokenDesired0
      ? Coin.toAmino(message.tokenDesired0)
      : undefined;
    obj.token_desired1 = message.tokenDesired1
      ? Coin.toAmino(message.tokenDesired1)
      : undefined;
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
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreatePositionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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
    let end = length === undefined ? reader.len : reader.pos + length;
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
    let end = length === undefined ? reader.len : reader.pos + length;
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
function createBaseMsgCollectFees(): MsgCollectFees {
  return {
    positionIds: [],
    sender: "",
  };
}
export const MsgCollectFees = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectFees",
  encode(
    message: MsgCollectFees,
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
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCollectFees {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectFees();
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
  fromPartial(object: Partial<MsgCollectFees>): MsgCollectFees {
    const message = createBaseMsgCollectFees();
    message.positionIds =
      object.positionIds?.map((e) => Long.fromValue(e)) || [];
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(object: MsgCollectFeesAmino): MsgCollectFees {
    return {
      positionIds: Array.isArray(object?.position_ids)
        ? object.position_ids.map((e: any) => e)
        : [],
      sender: object.sender,
    };
  },
  toAmino(message: MsgCollectFees): MsgCollectFeesAmino {
    const obj: any = {};
    if (message.positionIds) {
      obj.position_ids = message.positionIds.map((e) => e);
    } else {
      obj.position_ids = [];
    }
    obj.sender = message.sender;
    return obj;
  },
  fromAminoMsg(object: MsgCollectFeesAminoMsg): MsgCollectFees {
    return MsgCollectFees.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCollectFees): MsgCollectFeesAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-fees",
      value: MsgCollectFees.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCollectFeesProtoMsg): MsgCollectFees {
    return MsgCollectFees.decode(message.value);
  },
  toProto(message: MsgCollectFees): Uint8Array {
    return MsgCollectFees.encode(message).finish();
  },
  toProtoMsg(message: MsgCollectFees): MsgCollectFeesProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectFees",
      value: MsgCollectFees.encode(message).finish(),
    };
  },
};
function createBaseMsgCollectFeesResponse(): MsgCollectFeesResponse {
  return {
    collectedFees: [],
  };
}
export const MsgCollectFeesResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse",
  encode(
    message: MsgCollectFeesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.collectedFees) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCollectFeesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectFeesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.collectedFees.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCollectFeesResponse>): MsgCollectFeesResponse {
    const message = createBaseMsgCollectFeesResponse();
    message.collectedFees =
      object.collectedFees?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgCollectFeesResponseAmino): MsgCollectFeesResponse {
    return {
      collectedFees: Array.isArray(object?.collected_fees)
        ? object.collected_fees.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgCollectFeesResponse): MsgCollectFeesResponseAmino {
    const obj: any = {};
    if (message.collectedFees) {
      obj.collected_fees = message.collectedFees.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.collected_fees = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgCollectFeesResponseAminoMsg): MsgCollectFeesResponse {
    return MsgCollectFeesResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCollectFeesResponse): MsgCollectFeesResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/collect-fees-response",
      value: MsgCollectFeesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCollectFeesResponseProtoMsg
  ): MsgCollectFeesResponse {
    return MsgCollectFeesResponse.decode(message.value);
  },
  toProto(message: MsgCollectFeesResponse): Uint8Array {
    return MsgCollectFeesResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCollectFeesResponse): MsgCollectFeesResponseProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCollectFeesResponse",
      value: MsgCollectFeesResponse.encode(message).finish(),
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
    let end = length === undefined ? reader.len : reader.pos + length;
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
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCollectIncentivesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCollectIncentivesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.collectedIncentives.push(
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
    return message;
  },
  fromAmino(
    object: MsgCollectIncentivesResponseAmino
  ): MsgCollectIncentivesResponse {
    return {
      collectedIncentives: Array.isArray(object?.collected_incentives)
        ? object.collected_incentives.map((e: any) => Coin.fromAmino(e))
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
function createBaseMsgCreateIncentive(): MsgCreateIncentive {
  return {
    poolId: Long.UZERO,
    sender: "",
    incentiveDenom: "",
    incentiveAmount: "",
    emissionRate: "",
    startTime: undefined,
    minUptime: undefined,
  };
}
export const MsgCreateIncentive = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive",
  encode(
    message: MsgCreateIncentive,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.incentiveDenom !== "") {
      writer.uint32(26).string(message.incentiveDenom);
    }
    if (message.incentiveAmount !== "") {
      writer.uint32(34).string(message.incentiveAmount);
    }
    if (message.emissionRate !== "") {
      writer.uint32(42).string(message.emissionRate);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(50).fork()
      ).ldelim();
    }
    if (message.minUptime !== undefined) {
      Duration.encode(message.minUptime, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateIncentive {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateIncentive();
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
          message.incentiveDenom = reader.string();
          break;
        case 4:
          message.incentiveAmount = reader.string();
          break;
        case 5:
          message.emissionRate = reader.string();
          break;
        case 6:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 7:
          message.minUptime = Duration.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateIncentive>): MsgCreateIncentive {
    const message = createBaseMsgCreateIncentive();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.sender = object.sender ?? "";
    message.incentiveDenom = object.incentiveDenom ?? "";
    message.incentiveAmount = object.incentiveAmount ?? "";
    message.emissionRate = object.emissionRate ?? "";
    message.startTime = object.startTime ?? undefined;
    message.minUptime =
      object.minUptime !== undefined && object.minUptime !== null
        ? Duration.fromPartial(object.minUptime)
        : undefined;
    return message;
  },
  fromAmino(object: MsgCreateIncentiveAmino): MsgCreateIncentive {
    return {
      poolId: Long.fromString(object.pool_id),
      sender: object.sender,
      incentiveDenom: object.incentive_denom,
      incentiveAmount: object.incentive_amount,
      emissionRate: object.emission_rate,
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
      minUptime: object?.min_uptime
        ? Duration.fromAmino(object.min_uptime)
        : undefined,
    };
  },
  toAmino(message: MsgCreateIncentive): MsgCreateIncentiveAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.sender = message.sender;
    obj.incentive_denom = message.incentiveDenom;
    obj.incentive_amount = message.incentiveAmount;
    obj.emission_rate = message.emissionRate;
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    obj.min_uptime = message.minUptime
      ? Duration.toAmino(message.minUptime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateIncentiveAminoMsg): MsgCreateIncentive {
    return MsgCreateIncentive.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateIncentive): MsgCreateIncentiveAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-incentive",
      value: MsgCreateIncentive.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateIncentiveProtoMsg): MsgCreateIncentive {
    return MsgCreateIncentive.decode(message.value);
  },
  toProto(message: MsgCreateIncentive): Uint8Array {
    return MsgCreateIncentive.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateIncentive): MsgCreateIncentiveProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateIncentive",
      value: MsgCreateIncentive.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateIncentiveResponse(): MsgCreateIncentiveResponse {
  return {
    incentiveDenom: "",
    incentiveAmount: "",
    emissionRate: "",
    startTime: undefined,
    minUptime: undefined,
  };
}
export const MsgCreateIncentiveResponse = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateIncentiveResponse",
  encode(
    message: MsgCreateIncentiveResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.incentiveDenom !== "") {
      writer.uint32(10).string(message.incentiveDenom);
    }
    if (message.incentiveAmount !== "") {
      writer.uint32(18).string(message.incentiveAmount);
    }
    if (message.emissionRate !== "") {
      writer.uint32(26).string(message.emissionRate);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.minUptime !== undefined) {
      Duration.encode(message.minUptime, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateIncentiveResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateIncentiveResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.incentiveDenom = reader.string();
          break;
        case 2:
          message.incentiveAmount = reader.string();
          break;
        case 3:
          message.emissionRate = reader.string();
          break;
        case 4:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.minUptime = Duration.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreateIncentiveResponse>
  ): MsgCreateIncentiveResponse {
    const message = createBaseMsgCreateIncentiveResponse();
    message.incentiveDenom = object.incentiveDenom ?? "";
    message.incentiveAmount = object.incentiveAmount ?? "";
    message.emissionRate = object.emissionRate ?? "";
    message.startTime = object.startTime ?? undefined;
    message.minUptime =
      object.minUptime !== undefined && object.minUptime !== null
        ? Duration.fromPartial(object.minUptime)
        : undefined;
    return message;
  },
  fromAmino(
    object: MsgCreateIncentiveResponseAmino
  ): MsgCreateIncentiveResponse {
    return {
      incentiveDenom: object.incentive_denom,
      incentiveAmount: object.incentive_amount,
      emissionRate: object.emission_rate,
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
      minUptime: object?.min_uptime
        ? Duration.fromAmino(object.min_uptime)
        : undefined,
    };
  },
  toAmino(
    message: MsgCreateIncentiveResponse
  ): MsgCreateIncentiveResponseAmino {
    const obj: any = {};
    obj.incentive_denom = message.incentiveDenom;
    obj.incentive_amount = message.incentiveAmount;
    obj.emission_rate = message.emissionRate;
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    obj.min_uptime = message.minUptime
      ? Duration.toAmino(message.minUptime)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateIncentiveResponseAminoMsg
  ): MsgCreateIncentiveResponse {
    return MsgCreateIncentiveResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateIncentiveResponse
  ): MsgCreateIncentiveResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-incentive-response",
      value: MsgCreateIncentiveResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateIncentiveResponseProtoMsg
  ): MsgCreateIncentiveResponse {
    return MsgCreateIncentiveResponse.decode(message.value);
  },
  toProto(message: MsgCreateIncentiveResponse): Uint8Array {
    return MsgCreateIncentiveResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateIncentiveResponse
  ): MsgCreateIncentiveResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCreateIncentiveResponse",
      value: MsgCreateIncentiveResponse.encode(message).finish(),
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
    let end = length === undefined ? reader.len : reader.pos + length;
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
    let end = length === undefined ? reader.len : reader.pos + length;
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
