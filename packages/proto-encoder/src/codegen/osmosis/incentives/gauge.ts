//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../google/protobuf/duration";
import { Timestamp } from "../../google/protobuf/timestamp";
import { fromTimestamp, Long, toTimestamp } from "../../helpers";
import {
  QueryCondition,
  QueryConditionAmino,
  QueryConditionSDKType,
} from "../lockup/lock";
/**
 * Gauge is an object that stores and distributes yields to recipients who
 * satisfy certain conditions. Currently gauges support conditions around the
 * duration for which a given denom is locked.
 */
export interface Gauge {
  /** id is the unique ID of a Gauge */
  id: Long;
  /**
   * is_perpetual is a flag to show if it's a perpetual or non-perpetual gauge
   * Non-perpetual gauges distribute their tokens equally per epoch while the
   * gauge is in the active period. Perpetual gauges distribute all their tokens
   * at a single time and only distribute their tokens again once the gauge is
   * refilled, Intended for use with incentives that get refilled daily.
   */
  isPerpetual: boolean;
  /**
   * distribute_to is where the gauge rewards are distributed to.
   * This is queried via lock duration or by timestamp
   */
  distributeTo?: QueryCondition;
  /**
   * coins is the total amount of coins that have been in the gauge
   * Can distribute multiple coin denoms
   */
  coins: Coin[];
  /** start_time is the distribution start time */
  startTime?: Date;
  /**
   * num_epochs_paid_over is the number of total epochs distribution will be
   * completed over
   */
  numEpochsPaidOver: Long;
  /**
   * filled_epochs is the number of epochs distribution has been completed on
   * already
   */
  filledEpochs: Long;
  /** distributed_coins are coins that have been distributed already */
  distributedCoins: Coin[];
}
export interface GaugeProtoMsg {
  typeUrl: "/osmosis.incentives.Gauge";
  value: Uint8Array;
}
/**
 * Gauge is an object that stores and distributes yields to recipients who
 * satisfy certain conditions. Currently gauges support conditions around the
 * duration for which a given denom is locked.
 */
export interface GaugeAmino {
  /** id is the unique ID of a Gauge */
  id: string;
  /**
   * is_perpetual is a flag to show if it's a perpetual or non-perpetual gauge
   * Non-perpetual gauges distribute their tokens equally per epoch while the
   * gauge is in the active period. Perpetual gauges distribute all their tokens
   * at a single time and only distribute their tokens again once the gauge is
   * refilled, Intended for use with incentives that get refilled daily.
   */
  is_perpetual: boolean;
  /**
   * distribute_to is where the gauge rewards are distributed to.
   * This is queried via lock duration or by timestamp
   */
  distribute_to?: QueryConditionAmino;
  /**
   * coins is the total amount of coins that have been in the gauge
   * Can distribute multiple coin denoms
   */
  coins: CoinAmino[];
  /** start_time is the distribution start time */
  start_time?: Date;
  /**
   * num_epochs_paid_over is the number of total epochs distribution will be
   * completed over
   */
  num_epochs_paid_over: string;
  /**
   * filled_epochs is the number of epochs distribution has been completed on
   * already
   */
  filled_epochs: string;
  /** distributed_coins are coins that have been distributed already */
  distributed_coins: CoinAmino[];
}
export interface GaugeAminoMsg {
  type: "osmosis/incentives/gauge";
  value: GaugeAmino;
}
/**
 * Gauge is an object that stores and distributes yields to recipients who
 * satisfy certain conditions. Currently gauges support conditions around the
 * duration for which a given denom is locked.
 */
export interface GaugeSDKType {
  id: Long;
  is_perpetual: boolean;
  distribute_to?: QueryConditionSDKType;
  coins: CoinSDKType[];
  start_time?: Date;
  num_epochs_paid_over: Long;
  filled_epochs: Long;
  distributed_coins: CoinSDKType[];
}
export interface LockableDurationsInfo {
  /** List of incentivised durations that gauges will pay out to */
  lockableDurations: Duration[];
}
export interface LockableDurationsInfoProtoMsg {
  typeUrl: "/osmosis.incentives.LockableDurationsInfo";
  value: Uint8Array;
}
export interface LockableDurationsInfoAmino {
  /** List of incentivised durations that gauges will pay out to */
  lockable_durations: DurationAmino[];
}
export interface LockableDurationsInfoAminoMsg {
  type: "osmosis/incentives/lockable-durations-info";
  value: LockableDurationsInfoAmino;
}
export interface LockableDurationsInfoSDKType {
  lockable_durations: DurationSDKType[];
}
function createBaseGauge(): Gauge {
  return {
    id: Long.UZERO,
    isPerpetual: false,
    distributeTo: undefined,
    coins: [],
    startTime: undefined,
    numEpochsPaidOver: Long.UZERO,
    filledEpochs: Long.UZERO,
    distributedCoins: [],
  };
}
export const Gauge = {
  typeUrl: "/osmosis.incentives.Gauge",
  encode(message: Gauge, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.id.isZero()) {
      writer.uint32(8).uint64(message.id);
    }
    if (message.isPerpetual === true) {
      writer.uint32(16).bool(message.isPerpetual);
    }
    if (message.distributeTo !== undefined) {
      QueryCondition.encode(
        message.distributeTo,
        writer.uint32(26).fork()
      ).ldelim();
    }
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(42).fork()
      ).ldelim();
    }
    if (!message.numEpochsPaidOver.isZero()) {
      writer.uint32(48).uint64(message.numEpochsPaidOver);
    }
    if (!message.filledEpochs.isZero()) {
      writer.uint32(56).uint64(message.filledEpochs);
    }
    for (const v of message.distributedCoins) {
      Coin.encode(v!, writer.uint32(66).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Gauge {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGauge();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.uint64() as Long;
          break;
        case 2:
          message.isPerpetual = reader.bool();
          break;
        case 3:
          message.distributeTo = QueryCondition.decode(reader, reader.uint32());
          break;
        case 4:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        case 5:
          message.startTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 6:
          message.numEpochsPaidOver = reader.uint64() as Long;
          break;
        case 7:
          message.filledEpochs = reader.uint64() as Long;
          break;
        case 8:
          message.distributedCoins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Gauge>): Gauge {
    const message = createBaseGauge();
    message.id =
      object.id !== undefined && object.id !== null
        ? Long.fromValue(object.id)
        : Long.UZERO;
    message.isPerpetual = object.isPerpetual ?? false;
    message.distributeTo =
      object.distributeTo !== undefined && object.distributeTo !== null
        ? QueryCondition.fromPartial(object.distributeTo)
        : undefined;
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    message.startTime = object.startTime ?? undefined;
    message.numEpochsPaidOver =
      object.numEpochsPaidOver !== undefined &&
      object.numEpochsPaidOver !== null
        ? Long.fromValue(object.numEpochsPaidOver)
        : Long.UZERO;
    message.filledEpochs =
      object.filledEpochs !== undefined && object.filledEpochs !== null
        ? Long.fromValue(object.filledEpochs)
        : Long.UZERO;
    message.distributedCoins =
      object.distributedCoins?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: GaugeAmino): Gauge {
    return {
      id: Long.fromString(object.id),
      isPerpetual: object.is_perpetual,
      distributeTo: object?.distribute_to
        ? QueryCondition.fromAmino(object.distribute_to)
        : undefined,
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromAmino(e))
        : [],
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
      numEpochsPaidOver: Long.fromString(object.num_epochs_paid_over),
      filledEpochs: Long.fromString(object.filled_epochs),
      distributedCoins: Array.isArray(object?.distributed_coins)
        ? object.distributed_coins.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: Gauge): GaugeAmino {
    const obj: any = {};
    obj.id = message.id ? message.id.toString() : undefined;
    obj.is_perpetual = message.isPerpetual;
    obj.distribute_to = message.distributeTo
      ? QueryCondition.toAmino(message.distributeTo)
      : undefined;
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = [];
    }
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    obj.num_epochs_paid_over = message.numEpochsPaidOver
      ? message.numEpochsPaidOver.toString()
      : undefined;
    obj.filled_epochs = message.filledEpochs
      ? message.filledEpochs.toString()
      : undefined;
    if (message.distributedCoins) {
      obj.distributed_coins = message.distributedCoins.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.distributed_coins = [];
    }
    return obj;
  },
  fromAminoMsg(object: GaugeAminoMsg): Gauge {
    return Gauge.fromAmino(object.value);
  },
  toAminoMsg(message: Gauge): GaugeAminoMsg {
    return {
      type: "osmosis/incentives/gauge",
      value: Gauge.toAmino(message),
    };
  },
  fromProtoMsg(message: GaugeProtoMsg): Gauge {
    return Gauge.decode(message.value);
  },
  toProto(message: Gauge): Uint8Array {
    return Gauge.encode(message).finish();
  },
  toProtoMsg(message: Gauge): GaugeProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.Gauge",
      value: Gauge.encode(message).finish(),
    };
  },
};
function createBaseLockableDurationsInfo(): LockableDurationsInfo {
  return {
    lockableDurations: [],
  };
}
export const LockableDurationsInfo = {
  typeUrl: "/osmosis.incentives.LockableDurationsInfo",
  encode(
    message: LockableDurationsInfo,
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
  ): LockableDurationsInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLockableDurationsInfo();
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
  fromPartial(object: Partial<LockableDurationsInfo>): LockableDurationsInfo {
    const message = createBaseLockableDurationsInfo();
    message.lockableDurations =
      object.lockableDurations?.map((e) => Duration.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: LockableDurationsInfoAmino): LockableDurationsInfo {
    return {
      lockableDurations: Array.isArray(object?.lockable_durations)
        ? object.lockable_durations.map((e: any) => Duration.fromAmino(e))
        : [],
    };
  },
  toAmino(message: LockableDurationsInfo): LockableDurationsInfoAmino {
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
  fromAminoMsg(object: LockableDurationsInfoAminoMsg): LockableDurationsInfo {
    return LockableDurationsInfo.fromAmino(object.value);
  },
  toAminoMsg(message: LockableDurationsInfo): LockableDurationsInfoAminoMsg {
    return {
      type: "osmosis/incentives/lockable-durations-info",
      value: LockableDurationsInfo.toAmino(message),
    };
  },
  fromProtoMsg(message: LockableDurationsInfoProtoMsg): LockableDurationsInfo {
    return LockableDurationsInfo.decode(message.value);
  },
  toProto(message: LockableDurationsInfo): Uint8Array {
    return LockableDurationsInfo.encode(message).finish();
  },
  toProtoMsg(message: LockableDurationsInfo): LockableDurationsInfoProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.LockableDurationsInfo",
      value: LockableDurationsInfo.encode(message).finish(),
    };
  },
};
