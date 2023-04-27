//@ts-nocheck
/* eslint-disable */
import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../google/protobuf/duration";
import { Timestamp } from "../../google/protobuf/timestamp";
import { Long, toTimestamp, fromTimestamp } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * IncentiveRecord is the high-level struct we use to deal with an independent
 * incentive being distributed on a pool. Note that PoolId, Denom, and MinUptime
 * are included in the key so we avoid storing them in state, hence the
 * distinction between IncentiveRecord and IncentiveRecordBody.
 */
export interface IncentiveRecord {
  poolId: Long;
  /**
   * incentive_denom is the denom of the token being distributed as part of this
   * incentive record
   */
  incentiveDenom: string;
  /**
   * incentiveCreator is the address that created the incentive record. This
   * address does not have any special privileges – it is only kept to keep
   * incentive records created by different addresses separate.
   */
  incentiveCreatorAddr: string;
  /** incentive record body holds necessary */
  incentiveRecordBody?: IncentiveRecordBody;
  /**
   * min_uptime is the minimum uptime required for liquidity to qualify for this
   * incentive. It should be always be one of the supported uptimes in
   * types.SupportedUptimes
   */
  minUptime?: Duration;
}
export interface IncentiveRecordProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecord";
  value: Uint8Array;
}
/**
 * IncentiveRecord is the high-level struct we use to deal with an independent
 * incentive being distributed on a pool. Note that PoolId, Denom, and MinUptime
 * are included in the key so we avoid storing them in state, hence the
 * distinction between IncentiveRecord and IncentiveRecordBody.
 */
export interface IncentiveRecordAmino {
  pool_id: string;
  /**
   * incentive_denom is the denom of the token being distributed as part of this
   * incentive record
   */
  incentive_denom: string;
  /**
   * incentiveCreator is the address that created the incentive record. This
   * address does not have any special privileges – it is only kept to keep
   * incentive records created by different addresses separate.
   */
  incentive_creator_addr: string;
  /** incentive record body holds necessary */
  incentive_record_body?: IncentiveRecordBodyAmino;
  /**
   * min_uptime is the minimum uptime required for liquidity to qualify for this
   * incentive. It should be always be one of the supported uptimes in
   * types.SupportedUptimes
   */
  min_uptime?: DurationAmino;
}
export interface IncentiveRecordAminoMsg {
  type: "osmosis/concentratedliquidity/incentive-record";
  value: IncentiveRecordAmino;
}
/**
 * IncentiveRecord is the high-level struct we use to deal with an independent
 * incentive being distributed on a pool. Note that PoolId, Denom, and MinUptime
 * are included in the key so we avoid storing them in state, hence the
 * distinction between IncentiveRecord and IncentiveRecordBody.
 */
export interface IncentiveRecordSDKType {
  pool_id: Long;
  incentive_denom: string;
  incentive_creator_addr: string;
  incentive_record_body?: IncentiveRecordBodySDKType;
  min_uptime?: DurationSDKType;
}
/**
 * IncentiveRecordBody represents the body stored in state for each individual
 * record.
 */
export interface IncentiveRecordBody {
  /** remaining_amount is the total amount of incentives to be distributed */
  remainingAmount: string;
  /** emission_rate is the incentive emission rate per second */
  emissionRate: string;
  /** start_time is the time when the incentive starts distributing */
  startTime?: Date;
}
export interface IncentiveRecordBodyProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody";
  value: Uint8Array;
}
/**
 * IncentiveRecordBody represents the body stored in state for each individual
 * record.
 */
export interface IncentiveRecordBodyAmino {
  /** remaining_amount is the total amount of incentives to be distributed */
  remaining_amount: string;
  /** emission_rate is the incentive emission rate per second */
  emission_rate: string;
  /** start_time is the time when the incentive starts distributing */
  start_time?: Date;
}
export interface IncentiveRecordBodyAminoMsg {
  type: "osmosis/concentratedliquidity/incentive-record-body";
  value: IncentiveRecordBodyAmino;
}
/**
 * IncentiveRecordBody represents the body stored in state for each individual
 * record.
 */
export interface IncentiveRecordBodySDKType {
  remaining_amount: string;
  emission_rate: string;
  start_time?: Date;
}
function createBaseIncentiveRecord(): IncentiveRecord {
  return {
    poolId: Long.UZERO,
    incentiveDenom: "",
    incentiveCreatorAddr: "",
    incentiveRecordBody: undefined,
    minUptime: undefined,
  };
}
export const IncentiveRecord = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecord",
  encode(
    message: IncentiveRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.incentiveDenom !== "") {
      writer.uint32(18).string(message.incentiveDenom);
    }
    if (message.incentiveCreatorAddr !== "") {
      writer.uint32(26).string(message.incentiveCreatorAddr);
    }
    if (message.incentiveRecordBody !== undefined) {
      IncentiveRecordBody.encode(
        message.incentiveRecordBody,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.minUptime !== undefined) {
      Duration.encode(message.minUptime, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): IncentiveRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIncentiveRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.incentiveDenom = reader.string();
          break;
        case 3:
          message.incentiveCreatorAddr = reader.string();
          break;
        case 4:
          message.incentiveRecordBody = IncentiveRecordBody.decode(
            reader,
            reader.uint32()
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
  fromPartial(object: Partial<IncentiveRecord>): IncentiveRecord {
    const message = createBaseIncentiveRecord();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.incentiveDenom = object.incentiveDenom ?? "";
    message.incentiveCreatorAddr = object.incentiveCreatorAddr ?? "";
    message.incentiveRecordBody =
      object.incentiveRecordBody !== undefined &&
      object.incentiveRecordBody !== null
        ? IncentiveRecordBody.fromPartial(object.incentiveRecordBody)
        : undefined;
    message.minUptime =
      object.minUptime !== undefined && object.minUptime !== null
        ? Duration.fromPartial(object.minUptime)
        : undefined;
    return message;
  },
  fromAmino(object: IncentiveRecordAmino): IncentiveRecord {
    return {
      poolId: Long.fromString(object.pool_id),
      incentiveDenom: object.incentive_denom,
      incentiveCreatorAddr: object.incentive_creator_addr,
      incentiveRecordBody: object?.incentive_record_body
        ? IncentiveRecordBody.fromAmino(object.incentive_record_body)
        : undefined,
      minUptime: object?.min_uptime
        ? Duration.fromAmino(object.min_uptime)
        : undefined,
    };
  },
  toAmino(message: IncentiveRecord): IncentiveRecordAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.incentive_denom = message.incentiveDenom;
    obj.incentive_creator_addr = message.incentiveCreatorAddr;
    obj.incentive_record_body = message.incentiveRecordBody
      ? IncentiveRecordBody.toAmino(message.incentiveRecordBody)
      : undefined;
    obj.min_uptime = message.minUptime
      ? Duration.toAmino(message.minUptime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: IncentiveRecordAminoMsg): IncentiveRecord {
    return IncentiveRecord.fromAmino(object.value);
  },
  toAminoMsg(message: IncentiveRecord): IncentiveRecordAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/incentive-record",
      value: IncentiveRecord.toAmino(message),
    };
  },
  fromProtoMsg(message: IncentiveRecordProtoMsg): IncentiveRecord {
    return IncentiveRecord.decode(message.value);
  },
  toProto(message: IncentiveRecord): Uint8Array {
    return IncentiveRecord.encode(message).finish();
  },
  toProtoMsg(message: IncentiveRecord): IncentiveRecordProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecord",
      value: IncentiveRecord.encode(message).finish(),
    };
  },
};
function createBaseIncentiveRecordBody(): IncentiveRecordBody {
  return {
    remainingAmount: "",
    emissionRate: "",
    startTime: undefined,
  };
}
export const IncentiveRecordBody = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody",
  encode(
    message: IncentiveRecordBody,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.remainingAmount !== "") {
      writer.uint32(10).string(message.remainingAmount);
    }
    if (message.emissionRate !== "") {
      writer.uint32(18).string(message.emissionRate);
    }
    if (message.startTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.startTime),
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): IncentiveRecordBody {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIncentiveRecordBody();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.remainingAmount = reader.string();
          break;
        case 2:
          message.emissionRate = reader.string();
          break;
        case 3:
          message.startTime = fromTimestamp(
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
  fromPartial(object: Partial<IncentiveRecordBody>): IncentiveRecordBody {
    const message = createBaseIncentiveRecordBody();
    message.remainingAmount = object.remainingAmount ?? "";
    message.emissionRate = object.emissionRate ?? "";
    message.startTime = object.startTime ?? undefined;
    return message;
  },
  fromAmino(object: IncentiveRecordBodyAmino): IncentiveRecordBody {
    return {
      remainingAmount: object.remaining_amount,
      emissionRate: object.emission_rate,
      startTime: object?.start_time
        ? Timestamp.fromAmino(object.start_time)
        : undefined,
    };
  },
  toAmino(message: IncentiveRecordBody): IncentiveRecordBodyAmino {
    const obj: any = {};
    obj.remaining_amount = message.remainingAmount;
    obj.emission_rate = message.emissionRate;
    obj.start_time = message.startTime
      ? Timestamp.toAmino(message.startTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: IncentiveRecordBodyAminoMsg): IncentiveRecordBody {
    return IncentiveRecordBody.fromAmino(object.value);
  },
  toAminoMsg(message: IncentiveRecordBody): IncentiveRecordBodyAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/incentive-record-body",
      value: IncentiveRecordBody.toAmino(message),
    };
  },
  fromProtoMsg(message: IncentiveRecordBodyProtoMsg): IncentiveRecordBody {
    return IncentiveRecordBody.decode(message.value);
  },
  toProto(message: IncentiveRecordBody): Uint8Array {
    return IncentiveRecordBody.encode(message).finish();
  },
  toProtoMsg(message: IncentiveRecordBody): IncentiveRecordBodyProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.IncentiveRecordBody",
      value: IncentiveRecordBody.encode(message).finish(),
    };
  },
};
