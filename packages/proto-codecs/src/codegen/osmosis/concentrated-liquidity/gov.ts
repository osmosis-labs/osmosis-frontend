//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../helpers";
/**
 * CreateConcentratedLiquidityPoolProposal is a gov Content type for creating a
 * concentrated liquidity pool. If a CreateConcentratedLiquidityPoolProposal
 * passes, pool is created via pool manager module account.
 */
export interface CreateConcentratedLiquidityPoolProposal {
  title: string;
  description: string;
  denom0: string;
  denom1: string;
  tickSpacing: Long;
  exponentAtPriceOne: string;
  spreadFactor: string;
}
export interface CreateConcentratedLiquidityPoolProposalProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.CreateConcentratedLiquidityPoolProposal";
  value: Uint8Array;
}
/**
 * CreateConcentratedLiquidityPoolProposal is a gov Content type for creating a
 * concentrated liquidity pool. If a CreateConcentratedLiquidityPoolProposal
 * passes, pool is created via pool manager module account.
 */
export interface CreateConcentratedLiquidityPoolProposalAmino {
  title: string;
  description: string;
  denom0: string;
  denom1: string;
  tick_spacing: string;
  exponent_at_price_one: string;
  spread_factor: string;
}
export interface CreateConcentratedLiquidityPoolProposalAminoMsg {
  type: "osmosis/concentratedliquidity/create-concentrated-liquidity-pool-proposal";
  value: CreateConcentratedLiquidityPoolProposalAmino;
}
/**
 * CreateConcentratedLiquidityPoolProposal is a gov Content type for creating a
 * concentrated liquidity pool. If a CreateConcentratedLiquidityPoolProposal
 * passes, pool is created via pool manager module account.
 */
export interface CreateConcentratedLiquidityPoolProposalSDKType {
  title: string;
  description: string;
  denom0: string;
  denom1: string;
  tick_spacing: Long;
  exponent_at_price_one: string;
  spread_factor: string;
}
/**
 * TickSpacingDecreaseProposal is a gov Content type for proposing a tick
 * spacing decrease for a pool. The proposal will fail if one of the pools do
 * not exist, or if the new tick spacing is not less than the current tick
 * spacing.
 */
export interface TickSpacingDecreaseProposal {
  title: string;
  description: string;
  poolIdToTickSpacingRecords: PoolIdToTickSpacingRecord[];
}
export interface TickSpacingDecreaseProposalProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickSpacingDecreaseProposal";
  value: Uint8Array;
}
/**
 * TickSpacingDecreaseProposal is a gov Content type for proposing a tick
 * spacing decrease for a pool. The proposal will fail if one of the pools do
 * not exist, or if the new tick spacing is not less than the current tick
 * spacing.
 */
export interface TickSpacingDecreaseProposalAmino {
  title: string;
  description: string;
  pool_id_to_tick_spacing_records: PoolIdToTickSpacingRecordAmino[];
}
export interface TickSpacingDecreaseProposalAminoMsg {
  type: "osmosis/concentratedliquidity/tick-spacing-decrease-proposal";
  value: TickSpacingDecreaseProposalAmino;
}
/**
 * TickSpacingDecreaseProposal is a gov Content type for proposing a tick
 * spacing decrease for a pool. The proposal will fail if one of the pools do
 * not exist, or if the new tick spacing is not less than the current tick
 * spacing.
 */
export interface TickSpacingDecreaseProposalSDKType {
  title: string;
  description: string;
  pool_id_to_tick_spacing_records: PoolIdToTickSpacingRecordSDKType[];
}
/**
 * PoolIdToTickSpacingRecord is a struct that contains a pool id to new tick
 * spacing pair.
 */
export interface PoolIdToTickSpacingRecord {
  poolId: Long;
  newTickSpacing: Long;
}
export interface PoolIdToTickSpacingRecordProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolIdToTickSpacingRecord";
  value: Uint8Array;
}
/**
 * PoolIdToTickSpacingRecord is a struct that contains a pool id to new tick
 * spacing pair.
 */
export interface PoolIdToTickSpacingRecordAmino {
  pool_id: string;
  new_tick_spacing: string;
}
export interface PoolIdToTickSpacingRecordAminoMsg {
  type: "osmosis/concentratedliquidity/pool-id-to-tick-spacing-record";
  value: PoolIdToTickSpacingRecordAmino;
}
/**
 * PoolIdToTickSpacingRecord is a struct that contains a pool id to new tick
 * spacing pair.
 */
export interface PoolIdToTickSpacingRecordSDKType {
  pool_id: Long;
  new_tick_spacing: Long;
}
function createBaseCreateConcentratedLiquidityPoolProposal(): CreateConcentratedLiquidityPoolProposal {
  return {
    title: "",
    description: "",
    denom0: "",
    denom1: "",
    tickSpacing: Long.UZERO,
    exponentAtPriceOne: "",
    spreadFactor: "",
  };
}
export const CreateConcentratedLiquidityPoolProposal = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.CreateConcentratedLiquidityPoolProposal",
  encode(
    message: CreateConcentratedLiquidityPoolProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.denom0 !== "") {
      writer.uint32(26).string(message.denom0);
    }
    if (message.denom1 !== "") {
      writer.uint32(34).string(message.denom1);
    }
    if (!message.tickSpacing.isZero()) {
      writer.uint32(40).uint64(message.tickSpacing);
    }
    if (message.exponentAtPriceOne !== "") {
      writer.uint32(50).string(message.exponentAtPriceOne);
    }
    if (message.spreadFactor !== "") {
      writer.uint32(58).string(message.spreadFactor);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): CreateConcentratedLiquidityPoolProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateConcentratedLiquidityPoolProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.denom0 = reader.string();
          break;
        case 4:
          message.denom1 = reader.string();
          break;
        case 5:
          message.tickSpacing = reader.uint64() as Long;
          break;
        case 6:
          message.exponentAtPriceOne = reader.string();
          break;
        case 7:
          message.spreadFactor = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<CreateConcentratedLiquidityPoolProposal>
  ): CreateConcentratedLiquidityPoolProposal {
    const message = createBaseCreateConcentratedLiquidityPoolProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.denom0 = object.denom0 ?? "";
    message.denom1 = object.denom1 ?? "";
    message.tickSpacing =
      object.tickSpacing !== undefined && object.tickSpacing !== null
        ? Long.fromValue(object.tickSpacing)
        : Long.UZERO;
    message.exponentAtPriceOne = object.exponentAtPriceOne ?? "";
    message.spreadFactor = object.spreadFactor ?? "";
    return message;
  },
  fromAmino(
    object: CreateConcentratedLiquidityPoolProposalAmino
  ): CreateConcentratedLiquidityPoolProposal {
    return {
      title: object.title,
      description: object.description,
      denom0: object.denom0,
      denom1: object.denom1,
      tickSpacing: Long.fromString(object.tick_spacing),
      exponentAtPriceOne: object.exponent_at_price_one,
      spreadFactor: object.spread_factor,
    };
  },
  toAmino(
    message: CreateConcentratedLiquidityPoolProposal
  ): CreateConcentratedLiquidityPoolProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    obj.denom0 = message.denom0;
    obj.denom1 = message.denom1;
    obj.tick_spacing = message.tickSpacing
      ? message.tickSpacing.toString()
      : undefined;
    obj.exponent_at_price_one = message.exponentAtPriceOne;
    obj.spread_factor = message.spreadFactor;
    return obj;
  },
  fromAminoMsg(
    object: CreateConcentratedLiquidityPoolProposalAminoMsg
  ): CreateConcentratedLiquidityPoolProposal {
    return CreateConcentratedLiquidityPoolProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: CreateConcentratedLiquidityPoolProposal
  ): CreateConcentratedLiquidityPoolProposalAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-concentrated-liquidity-pool-proposal",
      value: CreateConcentratedLiquidityPoolProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: CreateConcentratedLiquidityPoolProposalProtoMsg
  ): CreateConcentratedLiquidityPoolProposal {
    return CreateConcentratedLiquidityPoolProposal.decode(message.value);
  },
  toProto(message: CreateConcentratedLiquidityPoolProposal): Uint8Array {
    return CreateConcentratedLiquidityPoolProposal.encode(message).finish();
  },
  toProtoMsg(
    message: CreateConcentratedLiquidityPoolProposal
  ): CreateConcentratedLiquidityPoolProposalProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.CreateConcentratedLiquidityPoolProposal",
      value: CreateConcentratedLiquidityPoolProposal.encode(message).finish(),
    };
  },
};
function createBaseTickSpacingDecreaseProposal(): TickSpacingDecreaseProposal {
  return {
    title: "",
    description: "",
    poolIdToTickSpacingRecords: [],
  };
}
export const TickSpacingDecreaseProposal = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickSpacingDecreaseProposal",
  encode(
    message: TickSpacingDecreaseProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.poolIdToTickSpacingRecords) {
      PoolIdToTickSpacingRecord.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): TickSpacingDecreaseProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickSpacingDecreaseProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.poolIdToTickSpacingRecords.push(
            PoolIdToTickSpacingRecord.decode(reader, reader.uint32())
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
    object: Partial<TickSpacingDecreaseProposal>
  ): TickSpacingDecreaseProposal {
    const message = createBaseTickSpacingDecreaseProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.poolIdToTickSpacingRecords =
      object.poolIdToTickSpacingRecords?.map((e) =>
        PoolIdToTickSpacingRecord.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: TickSpacingDecreaseProposalAmino
  ): TickSpacingDecreaseProposal {
    return {
      title: object.title,
      description: object.description,
      poolIdToTickSpacingRecords: Array.isArray(
        object?.pool_id_to_tick_spacing_records
      )
        ? object.pool_id_to_tick_spacing_records.map((e: any) =>
            PoolIdToTickSpacingRecord.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: TickSpacingDecreaseProposal
  ): TickSpacingDecreaseProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.poolIdToTickSpacingRecords) {
      obj.pool_id_to_tick_spacing_records =
        message.poolIdToTickSpacingRecords.map((e) =>
          e ? PoolIdToTickSpacingRecord.toAmino(e) : undefined
        );
    } else {
      obj.pool_id_to_tick_spacing_records = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: TickSpacingDecreaseProposalAminoMsg
  ): TickSpacingDecreaseProposal {
    return TickSpacingDecreaseProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: TickSpacingDecreaseProposal
  ): TickSpacingDecreaseProposalAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/tick-spacing-decrease-proposal",
      value: TickSpacingDecreaseProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: TickSpacingDecreaseProposalProtoMsg
  ): TickSpacingDecreaseProposal {
    return TickSpacingDecreaseProposal.decode(message.value);
  },
  toProto(message: TickSpacingDecreaseProposal): Uint8Array {
    return TickSpacingDecreaseProposal.encode(message).finish();
  },
  toProtoMsg(
    message: TickSpacingDecreaseProposal
  ): TickSpacingDecreaseProposalProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.TickSpacingDecreaseProposal",
      value: TickSpacingDecreaseProposal.encode(message).finish(),
    };
  },
};
function createBasePoolIdToTickSpacingRecord(): PoolIdToTickSpacingRecord {
  return {
    poolId: Long.UZERO,
    newTickSpacing: Long.UZERO,
  };
}
export const PoolIdToTickSpacingRecord = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolIdToTickSpacingRecord",
  encode(
    message: PoolIdToTickSpacingRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (!message.newTickSpacing.isZero()) {
      writer.uint32(16).uint64(message.newTickSpacing);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): PoolIdToTickSpacingRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolIdToTickSpacingRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.newTickSpacing = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<PoolIdToTickSpacingRecord>
  ): PoolIdToTickSpacingRecord {
    const message = createBasePoolIdToTickSpacingRecord();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.newTickSpacing =
      object.newTickSpacing !== undefined && object.newTickSpacing !== null
        ? Long.fromValue(object.newTickSpacing)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: PoolIdToTickSpacingRecordAmino): PoolIdToTickSpacingRecord {
    return {
      poolId: Long.fromString(object.pool_id),
      newTickSpacing: Long.fromString(object.new_tick_spacing),
    };
  },
  toAmino(message: PoolIdToTickSpacingRecord): PoolIdToTickSpacingRecordAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.new_tick_spacing = message.newTickSpacing
      ? message.newTickSpacing.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: PoolIdToTickSpacingRecordAminoMsg
  ): PoolIdToTickSpacingRecord {
    return PoolIdToTickSpacingRecord.fromAmino(object.value);
  },
  toAminoMsg(
    message: PoolIdToTickSpacingRecord
  ): PoolIdToTickSpacingRecordAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/pool-id-to-tick-spacing-record",
      value: PoolIdToTickSpacingRecord.toAmino(message),
    };
  },
  fromProtoMsg(
    message: PoolIdToTickSpacingRecordProtoMsg
  ): PoolIdToTickSpacingRecord {
    return PoolIdToTickSpacingRecord.decode(message.value);
  },
  toProto(message: PoolIdToTickSpacingRecord): Uint8Array {
    return PoolIdToTickSpacingRecord.encode(message).finish();
  },
  toProtoMsg(
    message: PoolIdToTickSpacingRecord
  ): PoolIdToTickSpacingRecordProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.PoolIdToTickSpacingRecord",
      value: PoolIdToTickSpacingRecord.encode(message).finish(),
    };
  },
};
