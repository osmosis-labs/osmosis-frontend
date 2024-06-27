//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { fromTimestamp, toTimestamp } from "../../../helpers";
import {
  PeriodLock,
  PeriodLockAmino,
  PeriodLockSDKType,
} from "../../lockup/lock";
/**
 * Position contains position's id, address, pool id, lower tick, upper tick
 * join time, and liquidity.
 */
export interface Position {
  positionId: bigint;
  address: string;
  poolId: bigint;
  lowerTick: bigint;
  upperTick: bigint;
  joinTime: Date;
  liquidity: string;
}
export interface PositionProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.Position";
  value: Uint8Array;
}
/**
 * Position contains position's id, address, pool id, lower tick, upper tick
 * join time, and liquidity.
 */
export interface PositionAmino {
  position_id?: string;
  address?: string;
  pool_id?: string;
  lower_tick?: string;
  upper_tick?: string;
  join_time?: string;
  liquidity?: string;
}
export interface PositionAminoMsg {
  type: "osmosis/concentratedliquidity/position";
  value: PositionAmino;
}
/**
 * Position contains position's id, address, pool id, lower tick, upper tick
 * join time, and liquidity.
 */
export interface PositionSDKType {
  position_id: bigint;
  address: string;
  pool_id: bigint;
  lower_tick: bigint;
  upper_tick: bigint;
  join_time: Date;
  liquidity: string;
}
/**
 * FullPositionBreakdown returns:
 * - the position itself
 * - the amount the position translates in terms of asset0 and asset1
 * - the amount of claimable fees
 * - the amount of claimable incentives
 * - the amount of incentives that would be forfeited if the position was closed
 * now
 */
export interface FullPositionBreakdown {
  position: Position;
  asset0: Coin;
  asset1: Coin;
  claimableSpreadRewards: Coin[];
  claimableIncentives: Coin[];
  forfeitedIncentives: Coin[];
}
export interface FullPositionBreakdownProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.FullPositionBreakdown";
  value: Uint8Array;
}
/**
 * FullPositionBreakdown returns:
 * - the position itself
 * - the amount the position translates in terms of asset0 and asset1
 * - the amount of claimable fees
 * - the amount of claimable incentives
 * - the amount of incentives that would be forfeited if the position was closed
 * now
 */
export interface FullPositionBreakdownAmino {
  position?: PositionAmino;
  asset0?: CoinAmino;
  asset1?: CoinAmino;
  claimable_spread_rewards?: CoinAmino[];
  claimable_incentives?: CoinAmino[];
  forfeited_incentives?: CoinAmino[];
}
export interface FullPositionBreakdownAminoMsg {
  type: "osmosis/concentratedliquidity/full-position-breakdown";
  value: FullPositionBreakdownAmino;
}
/**
 * FullPositionBreakdown returns:
 * - the position itself
 * - the amount the position translates in terms of asset0 and asset1
 * - the amount of claimable fees
 * - the amount of claimable incentives
 * - the amount of incentives that would be forfeited if the position was closed
 * now
 */
export interface FullPositionBreakdownSDKType {
  position: PositionSDKType;
  asset0: CoinSDKType;
  asset1: CoinSDKType;
  claimable_spread_rewards: CoinSDKType[];
  claimable_incentives: CoinSDKType[];
  forfeited_incentives: CoinSDKType[];
}
export interface PositionWithPeriodLock {
  position: Position;
  locks: PeriodLock;
}
export interface PositionWithPeriodLockProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionWithPeriodLock";
  value: Uint8Array;
}
export interface PositionWithPeriodLockAmino {
  position?: PositionAmino;
  locks?: PeriodLockAmino;
}
export interface PositionWithPeriodLockAminoMsg {
  type: "osmosis/concentratedliquidity/position-with-period-lock";
  value: PositionWithPeriodLockAmino;
}
export interface PositionWithPeriodLockSDKType {
  position: PositionSDKType;
  locks: PeriodLockSDKType;
}
function createBasePosition(): Position {
  return {
    positionId: BigInt(0),
    address: "",
    poolId: BigInt(0),
    lowerTick: BigInt(0),
    upperTick: BigInt(0),
    joinTime: new Date(),
    liquidity: "",
  };
}
export const Position = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.Position",
  encode(
    message: Position,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.positionId !== BigInt(0)) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    if (message.poolId !== BigInt(0)) {
      writer.uint32(24).uint64(message.poolId);
    }
    if (message.lowerTick !== BigInt(0)) {
      writer.uint32(32).int64(message.lowerTick);
    }
    if (message.upperTick !== BigInt(0)) {
      writer.uint32(40).int64(message.upperTick);
    }
    if (message.joinTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.joinTime),
        writer.uint32(50).fork()
      ).ldelim();
    }
    if (message.liquidity !== "") {
      writer
        .uint32(58)
        .string(Decimal.fromUserInput(message.liquidity, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Position {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64();
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.poolId = reader.uint64();
          break;
        case 4:
          message.lowerTick = reader.int64();
          break;
        case 5:
          message.upperTick = reader.int64();
          break;
        case 6:
          message.joinTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 7:
          message.liquidity = Decimal.fromAtomics(
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
  fromPartial(object: Partial<Position>): Position {
    const message = createBasePosition();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    message.address = object.address ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.lowerTick =
      object.lowerTick !== undefined && object.lowerTick !== null
        ? BigInt(object.lowerTick.toString())
        : BigInt(0);
    message.upperTick =
      object.upperTick !== undefined && object.upperTick !== null
        ? BigInt(object.upperTick.toString())
        : BigInt(0);
    message.joinTime = object.joinTime ?? undefined;
    message.liquidity = object.liquidity ?? "";
    return message;
  },
  fromAmino(object: PositionAmino): Position {
    const message = createBasePosition();
    if (object.position_id !== undefined && object.position_id !== null) {
      message.positionId = BigInt(object.position_id);
    }
    if (object.address !== undefined && object.address !== null) {
      message.address = object.address;
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.poolId = BigInt(object.pool_id);
    }
    if (object.lower_tick !== undefined && object.lower_tick !== null) {
      message.lowerTick = BigInt(object.lower_tick);
    }
    if (object.upper_tick !== undefined && object.upper_tick !== null) {
      message.upperTick = BigInt(object.upper_tick);
    }
    if (object.join_time !== undefined && object.join_time !== null) {
      message.joinTime = fromTimestamp(Timestamp.fromAmino(object.join_time));
    }
    if (object.liquidity !== undefined && object.liquidity !== null) {
      message.liquidity = object.liquidity;
    }
    return message;
  },
  toAmino(message: Position): PositionAmino {
    const obj: any = {};
    obj.position_id =
      message.positionId !== BigInt(0)
        ? message.positionId.toString()
        : undefined;
    obj.address = message.address === "" ? undefined : message.address;
    obj.pool_id =
      message.poolId !== BigInt(0) ? message.poolId.toString() : undefined;
    obj.lower_tick =
      message.lowerTick !== BigInt(0)
        ? message.lowerTick.toString()
        : undefined;
    obj.upper_tick =
      message.upperTick !== BigInt(0)
        ? message.upperTick.toString()
        : undefined;
    obj.join_time = message.joinTime
      ? Timestamp.toAmino(toTimestamp(message.joinTime))
      : undefined;
    obj.liquidity = message.liquidity === "" ? undefined : message.liquidity;
    return obj;
  },
  fromAminoMsg(object: PositionAminoMsg): Position {
    return Position.fromAmino(object.value);
  },
  toAminoMsg(message: Position): PositionAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/position",
      value: Position.toAmino(message),
    };
  },
  fromProtoMsg(message: PositionProtoMsg): Position {
    return Position.decode(message.value);
  },
  toProto(message: Position): Uint8Array {
    return Position.encode(message).finish();
  },
  toProtoMsg(message: Position): PositionProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.Position",
      value: Position.encode(message).finish(),
    };
  },
};
function createBaseFullPositionBreakdown(): FullPositionBreakdown {
  return {
    position: Position.fromPartial({}),
    asset0: Coin.fromPartial({}),
    asset1: Coin.fromPartial({}),
    claimableSpreadRewards: [],
    claimableIncentives: [],
    forfeitedIncentives: [],
  };
}
export const FullPositionBreakdown = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.FullPositionBreakdown",
  encode(
    message: FullPositionBreakdown,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.position !== undefined) {
      Position.encode(message.position, writer.uint32(10).fork()).ldelim();
    }
    if (message.asset0 !== undefined) {
      Coin.encode(message.asset0, writer.uint32(18).fork()).ldelim();
    }
    if (message.asset1 !== undefined) {
      Coin.encode(message.asset1, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.claimableSpreadRewards) {
      Coin.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.claimableIncentives) {
      Coin.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.forfeitedIncentives) {
      Coin.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): FullPositionBreakdown {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFullPositionBreakdown();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = Position.decode(reader, reader.uint32());
          break;
        case 2:
          message.asset0 = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.asset1 = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.claimableSpreadRewards.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.claimableIncentives.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        case 6:
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
  fromPartial(object: Partial<FullPositionBreakdown>): FullPositionBreakdown {
    const message = createBaseFullPositionBreakdown();
    message.position =
      object.position !== undefined && object.position !== null
        ? Position.fromPartial(object.position)
        : undefined;
    message.asset0 =
      object.asset0 !== undefined && object.asset0 !== null
        ? Coin.fromPartial(object.asset0)
        : undefined;
    message.asset1 =
      object.asset1 !== undefined && object.asset1 !== null
        ? Coin.fromPartial(object.asset1)
        : undefined;
    message.claimableSpreadRewards =
      object.claimableSpreadRewards?.map((e) => Coin.fromPartial(e)) || [];
    message.claimableIncentives =
      object.claimableIncentives?.map((e) => Coin.fromPartial(e)) || [];
    message.forfeitedIncentives =
      object.forfeitedIncentives?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: FullPositionBreakdownAmino): FullPositionBreakdown {
    const message = createBaseFullPositionBreakdown();
    if (object.position !== undefined && object.position !== null) {
      message.position = Position.fromAmino(object.position);
    }
    if (object.asset0 !== undefined && object.asset0 !== null) {
      message.asset0 = Coin.fromAmino(object.asset0);
    }
    if (object.asset1 !== undefined && object.asset1 !== null) {
      message.asset1 = Coin.fromAmino(object.asset1);
    }
    message.claimableSpreadRewards =
      object.claimable_spread_rewards?.map((e) => Coin.fromAmino(e)) || [];
    message.claimableIncentives =
      object.claimable_incentives?.map((e) => Coin.fromAmino(e)) || [];
    message.forfeitedIncentives =
      object.forfeited_incentives?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: FullPositionBreakdown): FullPositionBreakdownAmino {
    const obj: any = {};
    obj.position = message.position
      ? Position.toAmino(message.position)
      : undefined;
    obj.asset0 = message.asset0 ? Coin.toAmino(message.asset0) : undefined;
    obj.asset1 = message.asset1 ? Coin.toAmino(message.asset1) : undefined;
    if (message.claimableSpreadRewards) {
      obj.claimable_spread_rewards = message.claimableSpreadRewards.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.claimable_spread_rewards = message.claimableSpreadRewards;
    }
    if (message.claimableIncentives) {
      obj.claimable_incentives = message.claimableIncentives.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.claimable_incentives = message.claimableIncentives;
    }
    if (message.forfeitedIncentives) {
      obj.forfeited_incentives = message.forfeitedIncentives.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.forfeited_incentives = message.forfeitedIncentives;
    }
    return obj;
  },
  fromAminoMsg(object: FullPositionBreakdownAminoMsg): FullPositionBreakdown {
    return FullPositionBreakdown.fromAmino(object.value);
  },
  toAminoMsg(message: FullPositionBreakdown): FullPositionBreakdownAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/full-position-breakdown",
      value: FullPositionBreakdown.toAmino(message),
    };
  },
  fromProtoMsg(message: FullPositionBreakdownProtoMsg): FullPositionBreakdown {
    return FullPositionBreakdown.decode(message.value);
  },
  toProto(message: FullPositionBreakdown): Uint8Array {
    return FullPositionBreakdown.encode(message).finish();
  },
  toProtoMsg(message: FullPositionBreakdown): FullPositionBreakdownProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.FullPositionBreakdown",
      value: FullPositionBreakdown.encode(message).finish(),
    };
  },
};
function createBasePositionWithPeriodLock(): PositionWithPeriodLock {
  return {
    position: Position.fromPartial({}),
    locks: PeriodLock.fromPartial({}),
  };
}
export const PositionWithPeriodLock = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionWithPeriodLock",
  encode(
    message: PositionWithPeriodLock,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.position !== undefined) {
      Position.encode(message.position, writer.uint32(10).fork()).ldelim();
    }
    if (message.locks !== undefined) {
      PeriodLock.encode(message.locks, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): PositionWithPeriodLock {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePositionWithPeriodLock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.position = Position.decode(reader, reader.uint32());
          break;
        case 2:
          message.locks = PeriodLock.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PositionWithPeriodLock>): PositionWithPeriodLock {
    const message = createBasePositionWithPeriodLock();
    message.position =
      object.position !== undefined && object.position !== null
        ? Position.fromPartial(object.position)
        : undefined;
    message.locks =
      object.locks !== undefined && object.locks !== null
        ? PeriodLock.fromPartial(object.locks)
        : undefined;
    return message;
  },
  fromAmino(object: PositionWithPeriodLockAmino): PositionWithPeriodLock {
    const message = createBasePositionWithPeriodLock();
    if (object.position !== undefined && object.position !== null) {
      message.position = Position.fromAmino(object.position);
    }
    if (object.locks !== undefined && object.locks !== null) {
      message.locks = PeriodLock.fromAmino(object.locks);
    }
    return message;
  },
  toAmino(message: PositionWithPeriodLock): PositionWithPeriodLockAmino {
    const obj: any = {};
    obj.position = message.position
      ? Position.toAmino(message.position)
      : undefined;
    obj.locks = message.locks ? PeriodLock.toAmino(message.locks) : undefined;
    return obj;
  },
  fromAminoMsg(object: PositionWithPeriodLockAminoMsg): PositionWithPeriodLock {
    return PositionWithPeriodLock.fromAmino(object.value);
  },
  toAminoMsg(message: PositionWithPeriodLock): PositionWithPeriodLockAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/position-with-period-lock",
      value: PositionWithPeriodLock.toAmino(message),
    };
  },
  fromProtoMsg(
    message: PositionWithPeriodLockProtoMsg
  ): PositionWithPeriodLock {
    return PositionWithPeriodLock.decode(message.value);
  },
  toProto(message: PositionWithPeriodLock): Uint8Array {
    return PositionWithPeriodLock.encode(message).finish();
  },
  toProtoMsg(message: PositionWithPeriodLock): PositionWithPeriodLockProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.PositionWithPeriodLock",
      value: PositionWithPeriodLock.encode(message).finish(),
    };
  },
};
