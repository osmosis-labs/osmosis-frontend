//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../google/protobuf/timestamp";
import { fromTimestamp, toTimestamp } from "../../helpers";
import {
  QueryCondition,
  QueryConditionAmino,
  QueryConditionSDKType,
} from "../lockup/lock";
/** MsgCreateGauge creates a gauge to distribute rewards to users */
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
  distributeTo: QueryCondition;
  /** coins are coin(s) to be distributed by the gauge */
  coins: Coin[];
  /** start_time is the distribution start time */
  startTime: Date;
  /**
   * num_epochs_paid_over is the number of epochs distribution will be completed
   * over
   */
  numEpochsPaidOver: bigint;
  /**
   * pool_id is the ID of the pool that the gauge is meant to be associated
   * with. if pool_id is set, then the "QueryCondition.LockQueryType" must be
   * "NoLock" with all other fields of the "QueryCondition.LockQueryType" struct
   * unset, including "QueryCondition.Denom". However, note that, internally,
   * the empty string in "QueryCondition.Denom" ends up being overwritten with
   * incentivestypes.NoLockExternalGaugeDenom(<pool-id>) so that the gauges
   * associated with a pool can be queried by this prefix if needed.
   */
  poolId: bigint;
}
export interface MsgCreateGaugeProtoMsg {
  typeUrl: "/osmosis.incentives.MsgCreateGauge";
  value: Uint8Array;
}
/** MsgCreateGauge creates a gauge to distribute rewards to users */
export interface MsgCreateGaugeAmino {
  /**
   * is_perpetual shows if it's a perpetual or non-perpetual gauge
   * Non-perpetual gauges distribute their tokens equally per epoch while the
   * gauge is in the active period. Perpetual gauges distribute all their tokens
   * at a single time and only distribute their tokens again once the gauge is
   * refilled
   */
  is_perpetual?: boolean;
  /** owner is the address of gauge creator */
  owner?: string;
  /**
   * distribute_to show which lock the gauge should distribute to by time
   * duration or by timestamp
   */
  distribute_to?: QueryConditionAmino;
  /** coins are coin(s) to be distributed by the gauge */
  coins?: CoinAmino[];
  /** start_time is the distribution start time */
  start_time?: string;
  /**
   * num_epochs_paid_over is the number of epochs distribution will be completed
   * over
   */
  num_epochs_paid_over?: string;
  /**
   * pool_id is the ID of the pool that the gauge is meant to be associated
   * with. if pool_id is set, then the "QueryCondition.LockQueryType" must be
   * "NoLock" with all other fields of the "QueryCondition.LockQueryType" struct
   * unset, including "QueryCondition.Denom". However, note that, internally,
   * the empty string in "QueryCondition.Denom" ends up being overwritten with
   * incentivestypes.NoLockExternalGaugeDenom(<pool-id>) so that the gauges
   * associated with a pool can be queried by this prefix if needed.
   */
  pool_id?: string;
}
export interface MsgCreateGaugeAminoMsg {
  type: "osmosis/incentives/create-gauge";
  value: MsgCreateGaugeAmino;
}
/** MsgCreateGauge creates a gauge to distribute rewards to users */
export interface MsgCreateGaugeSDKType {
  is_perpetual: boolean;
  owner: string;
  distribute_to: QueryConditionSDKType;
  coins: CoinSDKType[];
  start_time: Date;
  num_epochs_paid_over: bigint;
  pool_id: bigint;
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
  gaugeId: bigint;
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
  owner?: string;
  /** gauge_id is the ID of gauge that rewards are getting added to */
  gauge_id?: string;
  /** rewards are the coin(s) to add to gauge */
  rewards?: CoinAmino[];
}
export interface MsgAddToGaugeAminoMsg {
  type: "osmosis/incentives/add-to-gauge";
  value: MsgAddToGaugeAmino;
}
/** MsgAddToGauge adds coins to a previously created gauge */
export interface MsgAddToGaugeSDKType {
  owner: string;
  gauge_id: bigint;
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
/** MsgCreateGroup creates a group to distribute rewards to a group of pools */
export interface MsgCreateGroup {
  /** coins are the provided coins that the group will distribute */
  coins: Coin[];
  /**
   * num_epochs_paid_over is the number of epochs distribution will be completed
   * in. 0 means it's perpetual
   */
  numEpochsPaidOver: bigint;
  /** owner is the group owner's address */
  owner: string;
  /** pool_ids are the IDs of pools that the group is comprised of */
  poolIds: bigint[];
}
export interface MsgCreateGroupProtoMsg {
  typeUrl: "/osmosis.incentives.MsgCreateGroup";
  value: Uint8Array;
}
/** MsgCreateGroup creates a group to distribute rewards to a group of pools */
export interface MsgCreateGroupAmino {
  /** coins are the provided coins that the group will distribute */
  coins?: CoinAmino[];
  /**
   * num_epochs_paid_over is the number of epochs distribution will be completed
   * in. 0 means it's perpetual
   */
  num_epochs_paid_over?: string;
  /** owner is the group owner's address */
  owner?: string;
  /** pool_ids are the IDs of pools that the group is comprised of */
  pool_ids?: string[];
}
export interface MsgCreateGroupAminoMsg {
  type: "osmosis/incentives/create-group";
  value: MsgCreateGroupAmino;
}
/** MsgCreateGroup creates a group to distribute rewards to a group of pools */
export interface MsgCreateGroupSDKType {
  coins: CoinSDKType[];
  num_epochs_paid_over: bigint;
  owner: string;
  pool_ids: bigint[];
}
export interface MsgCreateGroupResponse {
  /** group_id is the ID of the group that is created from this msg */
  groupId: bigint;
}
export interface MsgCreateGroupResponseProtoMsg {
  typeUrl: "/osmosis.incentives.MsgCreateGroupResponse";
  value: Uint8Array;
}
export interface MsgCreateGroupResponseAmino {
  /** group_id is the ID of the group that is created from this msg */
  group_id?: string;
}
export interface MsgCreateGroupResponseAminoMsg {
  type: "osmosis/incentives/create-group-response";
  value: MsgCreateGroupResponseAmino;
}
export interface MsgCreateGroupResponseSDKType {
  group_id: bigint;
}
function createBaseMsgCreateGauge(): MsgCreateGauge {
  return {
    isPerpetual: false,
    owner: "",
    distributeTo: QueryCondition.fromPartial({}),
    coins: [],
    startTime: new Date(),
    numEpochsPaidOver: BigInt(0),
    poolId: BigInt(0),
  };
}
export const MsgCreateGauge = {
  typeUrl: "/osmosis.incentives.MsgCreateGauge",
  encode(
    message: MsgCreateGauge,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
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
    if (message.numEpochsPaidOver !== BigInt(0)) {
      writer.uint32(48).uint64(message.numEpochsPaidOver);
    }
    if (message.poolId !== BigInt(0)) {
      writer.uint32(56).uint64(message.poolId);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGauge {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
          message.numEpochsPaidOver = reader.uint64();
          break;
        case 7:
          message.poolId = reader.uint64();
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
        ? BigInt(object.numEpochsPaidOver.toString())
        : BigInt(0);
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgCreateGaugeAmino): MsgCreateGauge {
    const message = createBaseMsgCreateGauge();
    if (object.is_perpetual !== undefined && object.is_perpetual !== null) {
      message.isPerpetual = object.is_perpetual;
    }
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    }
    if (object.distribute_to !== undefined && object.distribute_to !== null) {
      message.distributeTo = QueryCondition.fromAmino(object.distribute_to);
    }
    message.coins = object.coins?.map((e) => Coin.fromAmino(e)) || [];
    if (object.start_time !== undefined && object.start_time !== null) {
      message.startTime = fromTimestamp(Timestamp.fromAmino(object.start_time));
    }
    if (
      object.num_epochs_paid_over !== undefined &&
      object.num_epochs_paid_over !== null
    ) {
      message.numEpochsPaidOver = BigInt(object.num_epochs_paid_over);
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.poolId = BigInt(object.pool_id);
    }
    return message;
  },
  toAmino(message: MsgCreateGauge): MsgCreateGaugeAmino {
    const obj: any = {};
    obj.is_perpetual =
      message.isPerpetual === false ? undefined : message.isPerpetual;
    obj.owner = message.owner === "" ? undefined : message.owner;
    obj.distribute_to = message.distributeTo
      ? QueryCondition.toAmino(message.distributeTo)
      : undefined;
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = message.coins;
    }
    obj.start_time = message.startTime
      ? Timestamp.toAmino(toTimestamp(message.startTime))
      : undefined;
    obj.num_epochs_paid_over =
      message.numEpochsPaidOver !== BigInt(0)
        ? (message.numEpochsPaidOver?.toString)()
        : undefined;
    obj.pool_id =
      message.poolId !== BigInt(0) ? (message.poolId?.toString)() : undefined;
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCreateGaugeResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    const message = createBaseMsgCreateGaugeResponse();
    return message;
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
    gaugeId: BigInt(0),
    rewards: [],
  };
}
export const MsgAddToGauge = {
  typeUrl: "/osmosis.incentives.MsgAddToGauge",
  encode(
    message: MsgAddToGauge,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.owner !== "") {
      writer.uint32(10).string(message.owner);
    }
    if (message.gaugeId !== BigInt(0)) {
      writer.uint32(16).uint64(message.gaugeId);
    }
    for (const v of message.rewards) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgAddToGauge {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToGauge();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owner = reader.string();
          break;
        case 2:
          message.gaugeId = reader.uint64();
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
        ? BigInt(object.gaugeId.toString())
        : BigInt(0);
    message.rewards = object.rewards?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgAddToGaugeAmino): MsgAddToGauge {
    const message = createBaseMsgAddToGauge();
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    }
    if (object.gauge_id !== undefined && object.gauge_id !== null) {
      message.gaugeId = BigInt(object.gauge_id);
    }
    message.rewards = object.rewards?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: MsgAddToGauge): MsgAddToGaugeAmino {
    const obj: any = {};
    obj.owner = message.owner === "" ? undefined : message.owner;
    obj.gauge_id =
      message.gaugeId !== BigInt(0) ? (message.gaugeId?.toString)() : undefined;
    if (message.rewards) {
      obj.rewards = message.rewards.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.rewards = message.rewards;
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgAddToGaugeResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    const message = createBaseMsgAddToGaugeResponse();
    return message;
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
function createBaseMsgCreateGroup(): MsgCreateGroup {
  return {
    coins: [],
    numEpochsPaidOver: BigInt(0),
    owner: "",
    poolIds: [],
  };
}
export const MsgCreateGroup = {
  typeUrl: "/osmosis.incentives.MsgCreateGroup",
  encode(
    message: MsgCreateGroup,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.numEpochsPaidOver !== BigInt(0)) {
      writer.uint32(16).uint64(message.numEpochsPaidOver);
    }
    if (message.owner !== "") {
      writer.uint32(26).string(message.owner);
    }
    writer.uint32(34).fork();
    for (const v of message.poolIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateGroup {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateGroup();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.numEpochsPaidOver = reader.uint64();
          break;
        case 3:
          message.owner = reader.string();
          break;
        case 4:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.poolIds.push(reader.uint64());
            }
          } else {
            message.poolIds.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateGroup>): MsgCreateGroup {
    const message = createBaseMsgCreateGroup();
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    message.numEpochsPaidOver =
      object.numEpochsPaidOver !== undefined &&
      object.numEpochsPaidOver !== null
        ? BigInt(object.numEpochsPaidOver.toString())
        : BigInt(0);
    message.owner = object.owner ?? "";
    message.poolIds = object.poolIds?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: MsgCreateGroupAmino): MsgCreateGroup {
    const message = createBaseMsgCreateGroup();
    message.coins = object.coins?.map((e) => Coin.fromAmino(e)) || [];
    if (
      object.num_epochs_paid_over !== undefined &&
      object.num_epochs_paid_over !== null
    ) {
      message.numEpochsPaidOver = BigInt(object.num_epochs_paid_over);
    }
    if (object.owner !== undefined && object.owner !== null) {
      message.owner = object.owner;
    }
    message.poolIds = object.pool_ids?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: MsgCreateGroup): MsgCreateGroupAmino {
    const obj: any = {};
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = message.coins;
    }
    obj.num_epochs_paid_over =
      message.numEpochsPaidOver !== BigInt(0)
        ? (message.numEpochsPaidOver?.toString)()
        : undefined;
    obj.owner = message.owner === "" ? undefined : message.owner;
    if (message.poolIds) {
      obj.pool_ids = message.poolIds.map((e) => e.toString());
    } else {
      obj.pool_ids = message.poolIds;
    }
    return obj;
  },
  fromAminoMsg(object: MsgCreateGroupAminoMsg): MsgCreateGroup {
    return MsgCreateGroup.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateGroup): MsgCreateGroupAminoMsg {
    return {
      type: "osmosis/incentives/create-group",
      value: MsgCreateGroup.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateGroupProtoMsg): MsgCreateGroup {
    return MsgCreateGroup.decode(message.value);
  },
  toProto(message: MsgCreateGroup): Uint8Array {
    return MsgCreateGroup.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateGroup): MsgCreateGroupProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.MsgCreateGroup",
      value: MsgCreateGroup.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateGroupResponse(): MsgCreateGroupResponse {
  return {
    groupId: BigInt(0),
  };
}
export const MsgCreateGroupResponse = {
  typeUrl: "/osmosis.incentives.MsgCreateGroupResponse",
  encode(
    message: MsgCreateGroupResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.groupId !== BigInt(0)) {
      writer.uint32(8).uint64(message.groupId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCreateGroupResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateGroupResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.groupId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateGroupResponse>): MsgCreateGroupResponse {
    const message = createBaseMsgCreateGroupResponse();
    message.groupId =
      object.groupId !== undefined && object.groupId !== null
        ? BigInt(object.groupId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: MsgCreateGroupResponseAmino): MsgCreateGroupResponse {
    const message = createBaseMsgCreateGroupResponse();
    if (object.group_id !== undefined && object.group_id !== null) {
      message.groupId = BigInt(object.group_id);
    }
    return message;
  },
  toAmino(message: MsgCreateGroupResponse): MsgCreateGroupResponseAmino {
    const obj: any = {};
    obj.group_id =
      message.groupId !== BigInt(0) ? (message.groupId?.toString)() : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgCreateGroupResponseAminoMsg): MsgCreateGroupResponse {
    return MsgCreateGroupResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateGroupResponse): MsgCreateGroupResponseAminoMsg {
    return {
      type: "osmosis/incentives/create-group-response",
      value: MsgCreateGroupResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateGroupResponseProtoMsg
  ): MsgCreateGroupResponse {
    return MsgCreateGroupResponse.decode(message.value);
  },
  toProto(message: MsgCreateGroupResponse): Uint8Array {
    return MsgCreateGroupResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateGroupResponse): MsgCreateGroupResponseProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.MsgCreateGroupResponse",
      value: MsgCreateGroupResponse.encode(message).finish(),
    };
  },
};
