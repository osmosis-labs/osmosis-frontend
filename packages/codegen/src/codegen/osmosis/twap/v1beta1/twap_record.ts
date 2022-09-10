import { Timestamp } from "../../../google/protobuf/timestamp";
import * as _m0 from "protobufjs/minimal";
import { toTimestamp, Long, fromTimestamp, isSet, fromJsonTimestamp, DeepPartial } from "@osmonauts/helpers";

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
  time: Date;

  /**
   * We store the last spot prices in the struct, so that we can interpolate
   * accumulator values for times between when accumulator records are stored.
   */
  p0LastSpotPrice: string;
  p1LastSpotPrice: string;
  p0ArithmeticTwapAccumulator: string;
  p1ArithmeticTwapAccumulator: string;

  /**
   * This field contains the time in which the last spot price error occured.
   * It is used to alert the caller if they are getting a potentially erroneous
   * TWAP, due to an unforeseen underlying error.
   */
  lastErrorTime: Date;
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
    lastErrorTime: undefined
  };
}

export const TwapRecord = {
  encode(message: TwapRecord, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
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
      Timestamp.encode(toTimestamp(message.time), writer.uint32(42).fork()).ldelim();
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

    if (message.lastErrorTime !== undefined) {
      Timestamp.encode(toTimestamp(message.lastErrorTime), writer.uint32(90).fork()).ldelim();
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
          message.poolId = (reader.uint64() as Long);
          break;

        case 2:
          message.asset0Denom = reader.string();
          break;

        case 3:
          message.asset1Denom = reader.string();
          break;

        case 4:
          message.height = (reader.int64() as Long);
          break;

        case 5:
          message.time = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
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

        case 11:
          message.lastErrorTime = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): TwapRecord {
    return {
      poolId: isSet(object.poolId) ? Long.fromString(object.poolId) : Long.UZERO,
      asset0Denom: isSet(object.asset0Denom) ? String(object.asset0Denom) : "",
      asset1Denom: isSet(object.asset1Denom) ? String(object.asset1Denom) : "",
      height: isSet(object.height) ? Long.fromString(object.height) : Long.ZERO,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      p0LastSpotPrice: isSet(object.p0LastSpotPrice) ? String(object.p0LastSpotPrice) : "",
      p1LastSpotPrice: isSet(object.p1LastSpotPrice) ? String(object.p1LastSpotPrice) : "",
      p0ArithmeticTwapAccumulator: isSet(object.p0ArithmeticTwapAccumulator) ? String(object.p0ArithmeticTwapAccumulator) : "",
      p1ArithmeticTwapAccumulator: isSet(object.p1ArithmeticTwapAccumulator) ? String(object.p1ArithmeticTwapAccumulator) : "",
      lastErrorTime: isSet(object.lastErrorTime) ? fromJsonTimestamp(object.lastErrorTime) : undefined
    };
  },

  toJSON(message: TwapRecord): unknown {
    const obj: any = {};
    message.poolId !== undefined && (obj.poolId = (message.poolId || Long.UZERO).toString());
    message.asset0Denom !== undefined && (obj.asset0Denom = message.asset0Denom);
    message.asset1Denom !== undefined && (obj.asset1Denom = message.asset1Denom);
    message.height !== undefined && (obj.height = (message.height || Long.ZERO).toString());
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.p0LastSpotPrice !== undefined && (obj.p0LastSpotPrice = message.p0LastSpotPrice);
    message.p1LastSpotPrice !== undefined && (obj.p1LastSpotPrice = message.p1LastSpotPrice);
    message.p0ArithmeticTwapAccumulator !== undefined && (obj.p0ArithmeticTwapAccumulator = message.p0ArithmeticTwapAccumulator);
    message.p1ArithmeticTwapAccumulator !== undefined && (obj.p1ArithmeticTwapAccumulator = message.p1ArithmeticTwapAccumulator);
    message.lastErrorTime !== undefined && (obj.lastErrorTime = message.lastErrorTime.toISOString());
    return obj;
  },

  fromPartial(object: DeepPartial<TwapRecord>): TwapRecord {
    const message = createBaseTwapRecord();
    message.poolId = object.poolId !== undefined && object.poolId !== null ? Long.fromValue(object.poolId) : Long.UZERO;
    message.asset0Denom = object.asset0Denom ?? "";
    message.asset1Denom = object.asset1Denom ?? "";
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.ZERO;
    message.time = object.time ?? undefined;
    message.p0LastSpotPrice = object.p0LastSpotPrice ?? "";
    message.p1LastSpotPrice = object.p1LastSpotPrice ?? "";
    message.p0ArithmeticTwapAccumulator = object.p0ArithmeticTwapAccumulator ?? "";
    message.p1ArithmeticTwapAccumulator = object.p1ArithmeticTwapAccumulator ?? "";
    message.lastErrorTime = object.lastErrorTime ?? undefined;
    return message;
  }

};