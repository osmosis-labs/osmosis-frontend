//@ts-nocheck
/* eslint-disable */
import { Timestamp } from "../../../google/protobuf/timestamp";
import { Long, toTimestamp, fromTimestamp } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * A TWAP record should be indexed in state by pool_id, (asset pair), timestamp
 * The asset pair assets should be lexicographically sorted.
 * Technically (pool_id, asset_0_denom, asset_1_denom, height) do not need to
 * appear in the struct however we view this as the wrong performance tradeoff
 * given SDK today. Would rather we optimize for readability and correctness,
 * than an optimal state storage format. The system bottleneck is elsewhere for
 * now.
 */
export interface TwapRecord {
  poolId: Long;
  /** Lexicographically smaller denom of the pair */
  asset0Denom: string;
  /** Lexicographically larger denom of the pair */
  asset1Denom: string;
  /** height this record corresponds to, for debugging purposes */
  height: Long;
  /**
   * This field should only exist until we have a global registry in the state
   * machine, mapping prior block heights within {TIME RANGE} to times.
   */
  time?: Date;
  /**
   * We store the last spot prices in the struct, so that we can interpolate
   * accumulator values for times between when accumulator records are stored.
   */
  p0LastSpotPrice: string;
  p1LastSpotPrice: string;
  p0ArithmeticTwapAccumulator: string;
  p1ArithmeticTwapAccumulator: string;
  geometricTwapAccumulator: string;
  /**
   * This field contains the time in which the last spot price error occured.
   * It is used to alert the caller if they are getting a potentially erroneous
   * TWAP, due to an unforeseen underlying error.
   */
  lastErrorTime?: Date;
}
export interface TwapRecordProtoMsg {
  typeUrl: "/osmosis.twap.v1beta1.TwapRecord";
  value: Uint8Array;
}
/**
 * A TWAP record should be indexed in state by pool_id, (asset pair), timestamp
 * The asset pair assets should be lexicographically sorted.
 * Technically (pool_id, asset_0_denom, asset_1_denom, height) do not need to
 * appear in the struct however we view this as the wrong performance tradeoff
 * given SDK today. Would rather we optimize for readability and correctness,
 * than an optimal state storage format. The system bottleneck is elsewhere for
 * now.
 */
export interface TwapRecordAmino {
  pool_id: string;
  /** Lexicographically smaller denom of the pair */
  asset0_denom: string;
  /** Lexicographically larger denom of the pair */
  asset1_denom: string;
  /** height this record corresponds to, for debugging purposes */
  height: string;
  /**
   * This field should only exist until we have a global registry in the state
   * machine, mapping prior block heights within {TIME RANGE} to times.
   */
  time?: Date;
  /**
   * We store the last spot prices in the struct, so that we can interpolate
   * accumulator values for times between when accumulator records are stored.
   */
  p0_last_spot_price: string;
  p1_last_spot_price: string;
  p0_arithmetic_twap_accumulator: string;
  p1_arithmetic_twap_accumulator: string;
  geometric_twap_accumulator: string;
  /**
   * This field contains the time in which the last spot price error occured.
   * It is used to alert the caller if they are getting a potentially erroneous
   * TWAP, due to an unforeseen underlying error.
   */
  last_error_time?: Date;
}
export interface TwapRecordAminoMsg {
  type: "osmosis/twap/twap-record";
  value: TwapRecordAmino;
}
/**
 * A TWAP record should be indexed in state by pool_id, (asset pair), timestamp
 * The asset pair assets should be lexicographically sorted.
 * Technically (pool_id, asset_0_denom, asset_1_denom, height) do not need to
 * appear in the struct however we view this as the wrong performance tradeoff
 * given SDK today. Would rather we optimize for readability and correctness,
 * than an optimal state storage format. The system bottleneck is elsewhere for
 * now.
 */
export interface TwapRecordSDKType {
  pool_id: Long;
  asset0_denom: string;
  asset1_denom: string;
  height: Long;
  time?: Date;
  p0_last_spot_price: string;
  p1_last_spot_price: string;
  p0_arithmetic_twap_accumulator: string;
  p1_arithmetic_twap_accumulator: string;
  geometric_twap_accumulator: string;
  last_error_time?: Date;
}
function createBaseTwapRecord(): TwapRecord {
  return {
    poolId: Long.UZERO,
    asset0Denom: "",
    asset1Denom: "",
    height: Long.ZERO,
    time: undefined,
    p0LastSpotPrice: "",
    p1LastSpotPrice: "",
    p0ArithmeticTwapAccumulator: "",
    p1ArithmeticTwapAccumulator: "",
    geometricTwapAccumulator: "",
    lastErrorTime: undefined,
  };
}
export const TwapRecord = {
  typeUrl: "/osmosis.twap.v1beta1.TwapRecord",
  encode(
    message: TwapRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.asset0Denom !== "") {
      writer.uint32(18).string(message.asset0Denom);
    }
    if (message.asset1Denom !== "") {
      writer.uint32(26).string(message.asset1Denom);
    }
    if (!message.height.isZero()) {
      writer.uint32(32).int64(message.height);
    }
    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(42).fork()
      ).ldelim();
    }
    if (message.p0LastSpotPrice !== "") {
      writer.uint32(50).string(message.p0LastSpotPrice);
    }
    if (message.p1LastSpotPrice !== "") {
      writer.uint32(58).string(message.p1LastSpotPrice);
    }
    if (message.p0ArithmeticTwapAccumulator !== "") {
      writer.uint32(66).string(message.p0ArithmeticTwapAccumulator);
    }
    if (message.p1ArithmeticTwapAccumulator !== "") {
      writer.uint32(74).string(message.p1ArithmeticTwapAccumulator);
    }
    if (message.geometricTwapAccumulator !== "") {
      writer.uint32(82).string(message.geometricTwapAccumulator);
    }
    if (message.lastErrorTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastErrorTime),
        writer.uint32(90).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): TwapRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTwapRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.asset0Denom = reader.string();
          break;
        case 3:
          message.asset1Denom = reader.string();
          break;
        case 4:
          message.height = reader.int64() as Long;
          break;
        case 5:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 6:
          message.p0LastSpotPrice = reader.string();
          break;
        case 7:
          message.p1LastSpotPrice = reader.string();
          break;
        case 8:
          message.p0ArithmeticTwapAccumulator = reader.string();
          break;
        case 9:
          message.p1ArithmeticTwapAccumulator = reader.string();
          break;
        case 10:
          message.geometricTwapAccumulator = reader.string();
          break;
        case 11:
          message.lastErrorTime = fromTimestamp(
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
  fromPartial(object: Partial<TwapRecord>): TwapRecord {
    const message = createBaseTwapRecord();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.asset0Denom = object.asset0Denom ?? "";
    message.asset1Denom = object.asset1Denom ?? "";
    message.height =
      object.height !== undefined && object.height !== null
        ? Long.fromValue(object.height)
        : Long.ZERO;
    message.time = object.time ?? undefined;
    message.p0LastSpotPrice = object.p0LastSpotPrice ?? "";
    message.p1LastSpotPrice = object.p1LastSpotPrice ?? "";
    message.p0ArithmeticTwapAccumulator =
      object.p0ArithmeticTwapAccumulator ?? "";
    message.p1ArithmeticTwapAccumulator =
      object.p1ArithmeticTwapAccumulator ?? "";
    message.geometricTwapAccumulator = object.geometricTwapAccumulator ?? "";
    message.lastErrorTime = object.lastErrorTime ?? undefined;
    return message;
  },
  fromAmino(object: TwapRecordAmino): TwapRecord {
    return {
      poolId: Long.fromString(object.pool_id),
      asset0Denom: object.asset0_denom,
      asset1Denom: object.asset1_denom,
      height: Long.fromString(object.height),
      time: object?.time ? Timestamp.fromAmino(object.time) : undefined,
      p0LastSpotPrice: object.p0_last_spot_price,
      p1LastSpotPrice: object.p1_last_spot_price,
      p0ArithmeticTwapAccumulator: object.p0_arithmetic_twap_accumulator,
      p1ArithmeticTwapAccumulator: object.p1_arithmetic_twap_accumulator,
      geometricTwapAccumulator: object.geometric_twap_accumulator,
      lastErrorTime: object?.last_error_time
        ? Timestamp.fromAmino(object.last_error_time)
        : undefined,
    };
  },
  toAmino(message: TwapRecord): TwapRecordAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.asset0_denom = message.asset0Denom;
    obj.asset1_denom = message.asset1Denom;
    obj.height = message.height ? message.height.toString() : undefined;
    obj.time = message.time ? Timestamp.toAmino(message.time) : undefined;
    obj.p0_last_spot_price = message.p0LastSpotPrice;
    obj.p1_last_spot_price = message.p1LastSpotPrice;
    obj.p0_arithmetic_twap_accumulator = message.p0ArithmeticTwapAccumulator;
    obj.p1_arithmetic_twap_accumulator = message.p1ArithmeticTwapAccumulator;
    obj.geometric_twap_accumulator = message.geometricTwapAccumulator;
    obj.last_error_time = message.lastErrorTime
      ? Timestamp.toAmino(message.lastErrorTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: TwapRecordAminoMsg): TwapRecord {
    return TwapRecord.fromAmino(object.value);
  },
  toAminoMsg(message: TwapRecord): TwapRecordAminoMsg {
    return {
      type: "osmosis/twap/twap-record",
      value: TwapRecord.toAmino(message),
    };
  },
  fromProtoMsg(message: TwapRecordProtoMsg): TwapRecord {
    return TwapRecord.decode(message.value);
  },
  toProto(message: TwapRecord): Uint8Array {
    return TwapRecord.encode(message).finish();
  },
  toProtoMsg(message: TwapRecord): TwapRecordProtoMsg {
    return {
      typeUrl: "/osmosis.twap.v1beta1.TwapRecord",
      value: TwapRecord.encode(message).finish(),
    };
  },
};
