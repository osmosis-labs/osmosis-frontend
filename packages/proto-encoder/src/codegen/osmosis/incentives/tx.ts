//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../google/protobuf/timestamp";
import { fromTimestamp, Long, toTimestamp } from "../../helpers";
import {
  QueryCondition,
  QueryConditionAmino,
  QueryConditionSDKType,
} from "../lockup/lock";
/** MsgCreateGauge creates a gague to distribute rewards to users */
export interface MsgCreateGauge {
  /**
   * is_perpetual shows if it's a perpetual or non-perpetual gauge
   * Non-perpetual gauges distribute their tokens equally per epoch while the
   * gauge is in the active period. Perpetual gauges distribute all their tokens
   * at a single time and only distribute their tokens again once the gauge is
   * refilled
   */
  isPerpetual: boolean;
  /** owner is the address of gauge creator */
  owner: string;
  /**
   * distribute_to show which lock the gauge should distribute to by time
   * duration or by timestamp
   */
  distributeTo?: QueryCondition;
  /** coins are coin(s) to be distributed by the gauge */
  coins: Coin[];
  /** start_time is the distribution start time */
  startTime?: Date;
  /**
   * num_epochs_paid_over is the number of epochs distribution will be completed
   * over
   */
  numEpochsPaidOver: Long;
}
export interface MsgCreateGaugeProtoMsg {
  typeUrl: "/osmosis.incentives.MsgCreateGauge";
  value: Uint8Array;
}
/** MsgCreateGauge creates a gague to distribute rewards to users */
export interface MsgCreateGaugeAmino {
  /**
   * is_perpetual shows if it's a perpetual or non-perpetual gauge
   * Non-perpetual gauges distribute their tokens equally per epoch while the
   * gauge is in the active period. Perpetual gauges distribute all their tokens
   * at a single time and only distribute their tokens again once the gauge is
   * refilled
   */
  is_perpetual: boolean;
  /** owner is the address of gauge creator */
  owner: string;
  /**
   * distribute_to show which lock the gauge should distribute to by time
   * duration or by timestamp
   */
  distribute_to?: QueryConditionAmino;
  /** coins are coin(s) to be distributed by the gauge */
  coins: CoinAmino[];
  /** start_time is the distribution start time */
  start_time?: Date;
  /**
   * num_epochs_paid_over is the number of epochs distribution will be completed
   * over
   */
  num_epochs_paid_over: string;
}
export interface MsgCreateGaugeAminoMsg {
  type: "osmosis/incentives/create-gauge";
  value: MsgCreateGaugeAmino;
}
/** MsgCreateGauge creates a gague to distribute rewards to users */
export interface MsgCreateGaugeSDKType {
  is_perpetual: boolean;
  owner: string;
  distribute_to?: QueryConditionSDKType;
  coins: CoinSDKType[];
  start_time?: Date;
  num_epochs_paid_over: Long;
}
export interface MsgCreateGaugeResponse {}
export interface MsgCreateGaugeResponseProtoMsg {
  typeUrl: "/osmosis.incentives.MsgCreateGaugeResponse";
  value: Uint8Array;
}
export interface MsgCreateGaugeResponseAmino {}
export interface MsgCreateGaugeResponseAminoMsg {
  type: "osmosis/incentives/create-gauge-response";
  value: MsgCreateGaugeResponseAmino;
}
export interface MsgCreateGaugeResponseSDKType {}
/** MsgAddToGauge adds coins to a previously created gauge */
export interface MsgAddToGauge {
  /** owner is the gauge owner's address */
  owner: string;
  /** gauge_id is the ID of gauge that rewards are getting added to */
  gaugeId: Long;
  /** rewards are the coin(s) to add to gauge */
  rewards: Coin[];
}
export interface MsgAddToGaugeProtoMsg {
  typeUrl: "/osmosis.incentives.MsgAddToGauge";
  value: Uint8Array;
}
/** MsgAddToGauge adds coins to a previously created gauge */
export interface MsgAddToGaugeAmino {
  /** owner is the gauge owner's address */
  owner: string;
  /** gauge_id is the ID of gauge that rewards are getting added to */
  gauge_id: string;
  /** rewards are the coin(s) to add to gauge */
  rewards: CoinAmino[];
}
export interface MsgAddToGaugeAminoMsg {
  type: "osmosis/incentives/add-to-gauge";
  value: MsgAddToGaugeAmino;
}
/** MsgAddToGauge adds coins to a previously created gauge */
export interface MsgAddToGaugeSDKType {
  owner: string;
  gauge_id: Long;
  rewards: CoinSDKType[];
}
export interface MsgAddToGaugeResponse {}
export interface MsgAddToGaugeResponseProtoMsg {
  typeUrl: "/osmosis.incentives.MsgAddToGaugeResponse";
  value: Uint8Array;
}
export interface MsgAddToGaugeResponseAmino {}
export interface MsgAddToGaugeResponseAminoMsg {
  type: "osmosis/incentives/add-to-gauge-response";
  value: MsgAddToGaugeResponseAmino;
}
export interface MsgAddToGaugeResponseSDKType {}
function createBaseMsgCreateGauge(): MsgCreateGauge {
  return {
    isPerpetual: false,
    owner: "",
    distributeTo: undefined,
    coins: [],
    startTime: undefined,
    numEpochsPaidOver: Long.UZERO,
  };
}
export const MsgCreateGauge = {
  typeUrl: "/osmosis.incentives.MsgCreateGauge",
  encode(
    message: MsgCreateGauge,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.isPerpetual === true) {
      writer.uint32(8).bool(message.isPerpetual);
    }
    if (message.owner !== "") {
      writer.uint32(18).string(message.owner);
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
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateGauge {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateGauge();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.isPerpetual = reader.bool();
          break;
        case 2:
          message.owner = reader.string();
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
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateGauge>): MsgCreateGauge {
    const message = createBaseMsgCreateGauge();
    message.isPerpetual = object.isPerpetual ?? false;
    message.owner = object.owner ?? "";
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
    return message;
  },
  fromAmino(object: MsgCreateGaugeAmino): MsgCreateGauge {
    return {
      isPerpetual: object.is_perpetual,
      owner: object.owner,
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
    };
  },
  toAmino(message: MsgCreateGauge): MsgCreateGaugeAmino {
    const obj: any = {};
    obj.is_perpetual = message.isPerpetual;
    obj.owner = message.owner;
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
    return obj;
  },
  fromAminoMsg(object: MsgCreateGaugeAminoMsg): MsgCreateGauge {
    return MsgCreateGauge.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateGauge): MsgCreateGaugeAminoMsg {
    return {
      type: "osmosis/incentives/create-gauge",
      value: MsgCreateGauge.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateGaugeProtoMsg): MsgCreateGauge {
    return MsgCreateGauge.decode(message.value);
  },
  toProto(message: MsgCreateGauge): Uint8Array {
    return MsgCreateGauge.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateGauge): MsgCreateGaugeProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.MsgCreateGauge",
      value: MsgCreateGauge.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateGaugeResponse(): MsgCreateGaugeResponse {
  return {};
}
export const MsgCreateGaugeResponse = {
  typeUrl: "/osmosis.incentives.MsgCreateGaugeResponse",
  encode(
    _: MsgCreateGaugeResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateGaugeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateGaugeResponse();
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
  fromPartial(_: Partial<MsgCreateGaugeResponse>): MsgCreateGaugeResponse {
    const message = createBaseMsgCreateGaugeResponse();
    return message;
  },
  fromAmino(_: MsgCreateGaugeResponseAmino): MsgCreateGaugeResponse {
    return {};
  },
  toAmino(_: MsgCreateGaugeResponse): MsgCreateGaugeResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgCreateGaugeResponseAminoMsg): MsgCreateGaugeResponse {
    return MsgCreateGaugeResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateGaugeResponse): MsgCreateGaugeResponseAminoMsg {
    return {
      type: "osmosis/incentives/create-gauge-response",
      value: MsgCreateGaugeResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateGaugeResponseProtoMsg
  ): MsgCreateGaugeResponse {
    return MsgCreateGaugeResponse.decode(message.value);
  },
  toProto(message: MsgCreateGaugeResponse): Uint8Array {
    return MsgCreateGaugeResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateGaugeResponse): MsgCreateGaugeResponseProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.MsgCreateGaugeResponse",
      value: MsgCreateGaugeResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgAddToGauge(): MsgAddToGauge {
  return {
    owner: "",
    gaugeId: Long.UZERO,
    rewards: [],
  };
}
export const MsgAddToGauge = {
  typeUrl: "/osmosis.incentives.MsgAddToGauge",
  encode(
    message: MsgAddToGauge,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (!message.gaugeId.isZero()) {
      writer.uint32(16).uint64(message.gaugeId);
    }
    for (const v of message.rewards) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgAddToGauge {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToGauge();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.gaugeId = reader.uint64() as Long;
          break;
        case 3:
          message.rewards.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgAddToGauge>): MsgAddToGauge {
    const message = createBaseMsgAddToGauge();
    message.owner = object.owner ?? "";
    message.gaugeId =
      object.gaugeId !== undefined && object.gaugeId !== null
        ? Long.fromValue(object.gaugeId)
        : Long.UZERO;
    message.rewards = object.rewards?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgAddToGaugeAmino): MsgAddToGauge {
    return {
      owner: object.owner,
      gaugeId: Long.fromString(object.gauge_id),
      rewards: Array.isArray(object?.rewards)
        ? object.rewards.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgAddToGauge): MsgAddToGaugeAmino {
    const obj: any = {};
    obj.owner = message.owner;
    obj.gauge_id = message.gaugeId ? message.gaugeId.toString() : undefined;
    if (message.rewards) {
      obj.rewards = message.rewards.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.rewards = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgAddToGaugeAminoMsg): MsgAddToGauge {
    return MsgAddToGauge.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAddToGauge): MsgAddToGaugeAminoMsg {
    return {
      type: "osmosis/incentives/add-to-gauge",
      value: MsgAddToGauge.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgAddToGaugeProtoMsg): MsgAddToGauge {
    return MsgAddToGauge.decode(message.value);
  },
  toProto(message: MsgAddToGauge): Uint8Array {
    return MsgAddToGauge.encode(message).finish();
  },
  toProtoMsg(message: MsgAddToGauge): MsgAddToGaugeProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.MsgAddToGauge",
      value: MsgAddToGauge.encode(message).finish(),
    };
  },
};
function createBaseMsgAddToGaugeResponse(): MsgAddToGaugeResponse {
  return {};
}
export const MsgAddToGaugeResponse = {
  typeUrl: "/osmosis.incentives.MsgAddToGaugeResponse",
  encode(
    _: MsgAddToGaugeResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAddToGaugeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToGaugeResponse();
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
  fromPartial(_: Partial<MsgAddToGaugeResponse>): MsgAddToGaugeResponse {
    const message = createBaseMsgAddToGaugeResponse();
    return message;
  },
  fromAmino(_: MsgAddToGaugeResponseAmino): MsgAddToGaugeResponse {
    return {};
  },
  toAmino(_: MsgAddToGaugeResponse): MsgAddToGaugeResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgAddToGaugeResponseAminoMsg): MsgAddToGaugeResponse {
    return MsgAddToGaugeResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgAddToGaugeResponse): MsgAddToGaugeResponseAminoMsg {
    return {
      type: "osmosis/incentives/add-to-gauge-response",
      value: MsgAddToGaugeResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgAddToGaugeResponseProtoMsg): MsgAddToGaugeResponse {
    return MsgAddToGaugeResponse.decode(message.value);
  },
  toProto(message: MsgAddToGaugeResponse): Uint8Array {
    return MsgAddToGaugeResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgAddToGaugeResponse): MsgAddToGaugeResponseProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.MsgAddToGaugeResponse",
      value: MsgAddToGaugeResponse.encode(message).finish(),
    };
  },
};
