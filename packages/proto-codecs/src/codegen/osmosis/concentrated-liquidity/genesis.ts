//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../google/protobuf/any";
import { Long } from "../../helpers";
import {
  AccumulatorContent,
  AccumulatorContentAmino,
  AccumulatorContentSDKType,
} from "../accum/v1beta1/accum";
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
import { Position, PositionAmino, PositionSDKType } from "./position";
import { TickInfo, TickInfoAmino, TickInfoSDKType } from "./tickInfo";
/**
 * FullTick contains tick index and pool id along with other tick model
 * information.
 */
export interface FullTick {
  /** pool id associated with the tick. */
  poolId: Long;
  /** tick's index. */
  tickIndex: Long;
  /** tick's info. */
  info?: TickInfo;
}
export interface FullTickProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.FullTick";
  value: Uint8Array;
}
/**
 * FullTick contains tick index and pool id along with other tick model
 * information.
 */
export interface FullTickAmino {
  /** pool id associated with the tick. */
  pool_id: string;
  /** tick's index. */
  tick_index: string;
  /** tick's info. */
  info?: TickInfoAmino;
}
export interface FullTickAminoMsg {
  type: "osmosis/concentratedliquidity/full-tick";
  value: FullTickAmino;
}
/**
 * FullTick contains tick index and pool id along with other tick model
 * information.
 */
export interface FullTickSDKType {
  pool_id: Long;
  tick_index: Long;
  info?: TickInfoSDKType;
}
/**
 * PoolData represents a serialized pool along with its ticks
 * for genesis state.
 */
export interface PoolData {
  /** pool struct */
  pool?: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any) | undefined;
  /** pool's ticks */
  ticks: FullTick[];
  feeAccumulator?: AccumObject;
  incentivesAccumulators: AccumObject[];
  /** incentive records to be set */
  incentiveRecords: IncentiveRecord[];
}
export interface PoolDataProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolData";
  value: Uint8Array;
}
export type PoolDataEncoded = Omit<PoolData, "pool"> & {
  /** pool struct */ pool?:
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
    | undefined;
};
/**
 * PoolData represents a serialized pool along with its ticks
 * for genesis state.
 */
export interface PoolDataAmino {
  /** pool struct */
  pool?: AnyAmino;
  /** pool's ticks */
  ticks: FullTickAmino[];
  fee_accumulator?: AccumObjectAmino;
  incentives_accumulators: AccumObjectAmino[];
  /** incentive records to be set */
  incentive_records: IncentiveRecordAmino[];
}
export interface PoolDataAminoMsg {
  type: "osmosis/concentratedliquidity/pool-data";
  value: PoolDataAmino;
}
/**
 * PoolData represents a serialized pool along with its ticks
 * for genesis state.
 */
export interface PoolDataSDKType {
  pool?:
    | Pool1SDKType
    | CosmWasmPoolSDKType
    | Pool2SDKType
    | Pool3SDKType
    | AnySDKType
    | undefined;
  ticks: FullTickSDKType[];
  fee_accumulator?: AccumObjectSDKType;
  incentives_accumulators: AccumObjectSDKType[];
  incentive_records: IncentiveRecordSDKType[];
}
/** GenesisState defines the concentrated liquidity module's genesis state. */
export interface GenesisState {
  /** params are all the parameters of the module */
  params?: Params;
  /** pool data containining serialized pool struct and ticks. */
  poolData: PoolData[];
  positions: Position[];
  nextPositionId: Long;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the concentrated liquidity module's genesis state. */
export interface GenesisStateAmino {
  /** params are all the parameters of the module */
  params?: ParamsAmino;
  /** pool data containining serialized pool struct and ticks. */
  pool_data: PoolDataAmino[];
  positions: PositionAmino[];
  next_position_id: string;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/concentratedliquidity/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the concentrated liquidity module's genesis state. */
export interface GenesisStateSDKType {
  params?: ParamsSDKType;
  pool_data: PoolDataSDKType[];
  positions: PositionSDKType[];
  next_position_id: Long;
}
export interface AccumObject {
  /** Accumulator's name (pulled from AccumulatorContent) */
  name: string;
  accumContent?: AccumulatorContent;
}
export interface AccumObjectProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.AccumObject";
  value: Uint8Array;
}
export interface AccumObjectAmino {
  /** Accumulator's name (pulled from AccumulatorContent) */
  name: string;
  accum_content?: AccumulatorContentAmino;
}
export interface AccumObjectAminoMsg {
  type: "osmosis/concentratedliquidity/accum-object";
  value: AccumObjectAmino;
}
export interface AccumObjectSDKType {
  name: string;
  accum_content?: AccumulatorContentSDKType;
}
function createBaseFullTick(): FullTick {
  return {
    poolId: Long.UZERO,
    tickIndex: Long.ZERO,
    info: undefined,
  };
}
export const FullTick = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.FullTick",
  encode(
    message: FullTick,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (!message.tickIndex.isZero()) {
      writer.uint32(16).int64(message.tickIndex);
    }
    if (message.info !== undefined) {
      TickInfo.encode(message.info, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): FullTick {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFullTick();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.tickIndex = reader.int64() as Long;
          break;
        case 3:
          message.info = TickInfo.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FullTick>): FullTick {
    const message = createBaseFullTick();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tickIndex =
      object.tickIndex !== undefined && object.tickIndex !== null
        ? Long.fromValue(object.tickIndex)
        : Long.ZERO;
    message.info =
      object.info !== undefined && object.info !== null
        ? TickInfo.fromPartial(object.info)
        : undefined;
    return message;
  },
  fromAmino(object: FullTickAmino): FullTick {
    return {
      poolId: Long.fromString(object.pool_id),
      tickIndex: Long.fromString(object.tick_index),
      info: object?.info ? TickInfo.fromAmino(object.info) : undefined,
    };
  },
  toAmino(message: FullTick): FullTickAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.tick_index = message.tickIndex
      ? message.tickIndex.toString()
      : undefined;
    obj.info = message.info ? TickInfo.toAmino(message.info) : undefined;
    return obj;
  },
  fromAminoMsg(object: FullTickAminoMsg): FullTick {
    return FullTick.fromAmino(object.value);
  },
  toAminoMsg(message: FullTick): FullTickAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/full-tick",
      value: FullTick.toAmino(message),
    };
  },
  fromProtoMsg(message: FullTickProtoMsg): FullTick {
    return FullTick.decode(message.value);
  },
  toProto(message: FullTick): Uint8Array {
    return FullTick.encode(message).finish();
  },
  toProtoMsg(message: FullTick): FullTickProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.FullTick",
      value: FullTick.encode(message).finish(),
    };
  },
};
function createBasePoolData(): PoolData {
  return {
    pool: undefined,
    ticks: [],
    feeAccumulator: undefined,
    incentivesAccumulators: [],
    incentiveRecords: [],
  };
}
export const PoolData = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolData",
  encode(
    message: PoolData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pool !== undefined) {
      Any.encode(message.pool as Any, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.ticks) {
      FullTick.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.feeAccumulator !== undefined) {
      AccumObject.encode(
        message.feeAccumulator,
        writer.uint32(26).fork()
      ).ldelim();
    }
    for (const v of message.incentivesAccumulators) {
      AccumObject.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    for (const v of message.incentiveRecords) {
      IncentiveRecord.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PoolData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pool = PoolI_InterfaceDecoder(reader) as Any;
          break;
        case 2:
          message.ticks.push(FullTick.decode(reader, reader.uint32()));
          break;
        case 3:
          message.feeAccumulator = AccumObject.decode(reader, reader.uint32());
          break;
        case 4:
          message.incentivesAccumulators.push(
            AccumObject.decode(reader, reader.uint32())
          );
          break;
        case 5:
          message.incentiveRecords.push(
            IncentiveRecord.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PoolData>): PoolData {
    const message = createBasePoolData();
    message.pool =
      object.pool !== undefined && object.pool !== null
        ? Any.fromPartial(object.pool)
        : undefined;
    message.ticks = object.ticks?.map((e) => FullTick.fromPartial(e)) || [];
    message.feeAccumulator =
      object.feeAccumulator !== undefined && object.feeAccumulator !== null
        ? AccumObject.fromPartial(object.feeAccumulator)
        : undefined;
    message.incentivesAccumulators =
      object.incentivesAccumulators?.map((e) => AccumObject.fromPartial(e)) ||
      [];
    message.incentiveRecords =
      object.incentiveRecords?.map((e) => IncentiveRecord.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: PoolDataAmino): PoolData {
    return {
      pool: object?.pool ? PoolI_FromAmino(object.pool) : undefined,
      ticks: Array.isArray(object?.ticks)
        ? object.ticks.map((e: any) => FullTick.fromAmino(e))
        : [],
      feeAccumulator: object?.fee_accumulator
        ? AccumObject.fromAmino(object.fee_accumulator)
        : undefined,
      incentivesAccumulators: Array.isArray(object?.incentives_accumulators)
        ? object.incentives_accumulators.map((e: any) =>
            AccumObject.fromAmino(e)
          )
        : [],
      incentiveRecords: Array.isArray(object?.incentive_records)
        ? object.incentive_records.map((e: any) => IncentiveRecord.fromAmino(e))
        : [],
    };
  },
  toAmino(message: PoolData): PoolDataAmino {
    const obj: any = {};
    obj.pool = message.pool ? PoolI_ToAmino(message.pool as Any) : undefined;
    if (message.ticks) {
      obj.ticks = message.ticks.map((e) =>
        e ? FullTick.toAmino(e) : undefined
      );
    } else {
      obj.ticks = [];
    }
    obj.fee_accumulator = message.feeAccumulator
      ? AccumObject.toAmino(message.feeAccumulator)
      : undefined;
    if (message.incentivesAccumulators) {
      obj.incentives_accumulators = message.incentivesAccumulators.map((e) =>
        e ? AccumObject.toAmino(e) : undefined
      );
    } else {
      obj.incentives_accumulators = [];
    }
    if (message.incentiveRecords) {
      obj.incentive_records = message.incentiveRecords.map((e) =>
        e ? IncentiveRecord.toAmino(e) : undefined
      );
    } else {
      obj.incentive_records = [];
    }
    return obj;
  },
  fromAminoMsg(object: PoolDataAminoMsg): PoolData {
    return PoolData.fromAmino(object.value);
  },
  toAminoMsg(message: PoolData): PoolDataAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/pool-data",
      value: PoolData.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolDataProtoMsg): PoolData {
    return PoolData.decode(message.value);
  },
  toProto(message: PoolData): Uint8Array {
    return PoolData.encode(message).finish();
  },
  toProtoMsg(message: PoolData): PoolDataProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolData",
      value: PoolData.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
    poolData: [],
    positions: [],
    nextPositionId: Long.UZERO,
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.poolData) {
      PoolData.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.positions) {
      Position.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (!message.nextPositionId.isZero()) {
      writer.uint32(32).uint64(message.nextPositionId);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.poolData.push(PoolData.decode(reader, reader.uint32()));
          break;
        case 3:
          message.positions.push(Position.decode(reader, reader.uint32()));
          break;
        case 4:
          message.nextPositionId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.poolData =
      object.poolData?.map((e) => PoolData.fromPartial(e)) || [];
    message.positions =
      object.positions?.map((e) => Position.fromPartial(e)) || [];
    message.nextPositionId =
      object.nextPositionId !== undefined && object.nextPositionId !== null
        ? Long.fromValue(object.nextPositionId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      poolData: Array.isArray(object?.pool_data)
        ? object.pool_data.map((e: any) => PoolData.fromAmino(e))
        : [],
      positions: Array.isArray(object?.positions)
        ? object.positions.map((e: any) => Position.fromAmino(e))
        : [],
      nextPositionId: Long.fromString(object.next_position_id),
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    if (message.poolData) {
      obj.pool_data = message.poolData.map((e) =>
        e ? PoolData.toAmino(e) : undefined
      );
    } else {
      obj.pool_data = [];
    }
    if (message.positions) {
      obj.positions = message.positions.map((e) =>
        e ? Position.toAmino(e) : undefined
      );
    } else {
      obj.positions = [];
    }
    obj.next_position_id = message.nextPositionId
      ? message.nextPositionId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/genesis-state",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBaseAccumObject(): AccumObject {
  return {
    name: "",
    accumContent: undefined,
  };
}
export const AccumObject = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.AccumObject",
  encode(
    message: AccumObject,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.accumContent !== undefined) {
      AccumulatorContent.encode(
        message.accumContent,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): AccumObject {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccumObject();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.accumContent = AccumulatorContent.decode(
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
  fromPartial(object: Partial<AccumObject>): AccumObject {
    const message = createBaseAccumObject();
    message.name = object.name ?? "";
    message.accumContent =
      object.accumContent !== undefined && object.accumContent !== null
        ? AccumulatorContent.fromPartial(object.accumContent)
        : undefined;
    return message;
  },
  fromAmino(object: AccumObjectAmino): AccumObject {
    return {
      name: object.name,
      accumContent: object?.accum_content
        ? AccumulatorContent.fromAmino(object.accum_content)
        : undefined,
    };
  },
  toAmino(message: AccumObject): AccumObjectAmino {
    const obj: any = {};
    obj.name = message.name;
    obj.accum_content = message.accumContent
      ? AccumulatorContent.toAmino(message.accumContent)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: AccumObjectAminoMsg): AccumObject {
    return AccumObject.fromAmino(object.value);
  },
  toAminoMsg(message: AccumObject): AccumObjectAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/accum-object",
      value: AccumObject.toAmino(message),
    };
  },
  fromProtoMsg(message: AccumObjectProtoMsg): AccumObject {
    return AccumObject.decode(message.value);
  },
  toProto(message: AccumObject): Uint8Array {
    return AccumObject.encode(message).finish();
  },
  toProtoMsg(message: AccumObject): AccumObjectProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.AccumObject",
      value: AccumObject.encode(message).finish(),
    };
  },
};
export const PoolI_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): Pool1 | CosmWasmPool | Pool2 | Pool3 | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
