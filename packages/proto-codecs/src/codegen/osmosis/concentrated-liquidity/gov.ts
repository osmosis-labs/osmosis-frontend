//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../binary";
/**
 * CreateConcentratedLiquidityPoolsProposal is a gov Content type for creating
 * concentrated liquidity pools. If a CreateConcentratedLiquidityPoolsProposal
 * passes, the pools are created via pool manager module account.
 */
export interface CreateConcentratedLiquidityPoolsProposal {
  title: string;
  description: string;
  poolRecords: PoolRecord[];
}
export interface CreateConcentratedLiquidityPoolsProposalProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.CreateConcentratedLiquidityPoolsProposal";
  value: Uint8Array;
}
/**
 * CreateConcentratedLiquidityPoolsProposal is a gov Content type for creating
 * concentrated liquidity pools. If a CreateConcentratedLiquidityPoolsProposal
 * passes, the pools are created via pool manager module account.
 */
export interface CreateConcentratedLiquidityPoolsProposalAmino {
  title: string;
  description: string;
  pool_records: PoolRecordAmino[];
}
export interface CreateConcentratedLiquidityPoolsProposalAminoMsg {
  type: "osmosis/concentratedliquidity/create-concentrated-liquidity-pools-proposal";
  value: CreateConcentratedLiquidityPoolsProposalAmino;
}
/**
 * CreateConcentratedLiquidityPoolsProposal is a gov Content type for creating
 * concentrated liquidity pools. If a CreateConcentratedLiquidityPoolsProposal
 * passes, the pools are created via pool manager module account.
 */
export interface CreateConcentratedLiquidityPoolsProposalSDKType {
  title: string;
  description: string;
  pool_records: PoolRecordSDKType[];
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
  poolId: bigint;
  newTickSpacing: bigint;
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
  pool_id: bigint;
  new_tick_spacing: bigint;
}
export interface PoolRecord {
  denom0: string;
  denom1: string;
  tickSpacing: bigint;
  exponentAtPriceOne: string;
  spreadFactor: string;
}
export interface PoolRecordProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolRecord";
  value: Uint8Array;
}
export interface PoolRecordAmino {
  denom0: string;
  denom1: string;
  tick_spacing: string;
  exponent_at_price_one: string;
  spread_factor: string;
}
export interface PoolRecordAminoMsg {
  type: "osmosis/concentratedliquidity/pool-record";
  value: PoolRecordAmino;
}
export interface PoolRecordSDKType {
  denom0: string;
  denom1: string;
  tick_spacing: bigint;
  exponent_at_price_one: string;
  spread_factor: string;
}
function createBaseCreateConcentratedLiquidityPoolsProposal(): CreateConcentratedLiquidityPoolsProposal {
  return {
    title: "",
    description: "",
    poolRecords: [],
  };
}
export const CreateConcentratedLiquidityPoolsProposal = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.CreateConcentratedLiquidityPoolsProposal",
  encode(
    message: CreateConcentratedLiquidityPoolsProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.poolRecords) {
      PoolRecord.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): CreateConcentratedLiquidityPoolsProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCreateConcentratedLiquidityPoolsProposal();
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
          message.poolRecords.push(PoolRecord.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<CreateConcentratedLiquidityPoolsProposal>
  ): CreateConcentratedLiquidityPoolsProposal {
    const message = createBaseCreateConcentratedLiquidityPoolsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.poolRecords =
      object.poolRecords?.map((e) => PoolRecord.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: CreateConcentratedLiquidityPoolsProposalAmino
  ): CreateConcentratedLiquidityPoolsProposal {
    return {
      title: object.title,
      description: object.description,
      poolRecords: Array.isArray(object?.pool_records)
        ? object.pool_records.map((e: any) => PoolRecord.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: CreateConcentratedLiquidityPoolsProposal
  ): CreateConcentratedLiquidityPoolsProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.poolRecords) {
      obj.pool_records = message.poolRecords.map((e) =>
        e ? PoolRecord.toAmino(e) : undefined
      );
    } else {
      obj.pool_records = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: CreateConcentratedLiquidityPoolsProposalAminoMsg
  ): CreateConcentratedLiquidityPoolsProposal {
    return CreateConcentratedLiquidityPoolsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: CreateConcentratedLiquidityPoolsProposal
  ): CreateConcentratedLiquidityPoolsProposalAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-concentrated-liquidity-pools-proposal",
      value: CreateConcentratedLiquidityPoolsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: CreateConcentratedLiquidityPoolsProposalProtoMsg
  ): CreateConcentratedLiquidityPoolsProposal {
    return CreateConcentratedLiquidityPoolsProposal.decode(message.value);
  },
  toProto(message: CreateConcentratedLiquidityPoolsProposal): Uint8Array {
    return CreateConcentratedLiquidityPoolsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: CreateConcentratedLiquidityPoolsProposal
  ): CreateConcentratedLiquidityPoolsProposalProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.CreateConcentratedLiquidityPoolsProposal",
      value: CreateConcentratedLiquidityPoolsProposal.encode(message).finish(),
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
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
    input: BinaryReader | Uint8Array,
    length?: number
  ): TickSpacingDecreaseProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    poolId: BigInt(0),
    newTickSpacing: BigInt(0),
  };
}
export const PoolIdToTickSpacingRecord = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolIdToTickSpacingRecord",
  encode(
    message: PoolIdToTickSpacingRecord,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.newTickSpacing !== BigInt(0)) {
      writer.uint32(16).uint64(message.newTickSpacing);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): PoolIdToTickSpacingRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolIdToTickSpacingRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
        case 2:
          message.newTickSpacing = reader.uint64();
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
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.newTickSpacing =
      object.newTickSpacing !== undefined && object.newTickSpacing !== null
        ? BigInt(object.newTickSpacing.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: PoolIdToTickSpacingRecordAmino): PoolIdToTickSpacingRecord {
    return {
      poolId: BigInt(object.pool_id),
      newTickSpacing: BigInt(object.new_tick_spacing),
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
function createBasePoolRecord(): PoolRecord {
  return {
    denom0: "",
    denom1: "",
    tickSpacing: BigInt(0),
    exponentAtPriceOne: "",
    spreadFactor: "",
  };
}
export const PoolRecord = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolRecord",
  encode(
    message: PoolRecord,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.denom0 !== "") {
      writer.uint32(10).string(message.denom0);
    }
    if (message.denom1 !== "") {
      writer.uint32(18).string(message.denom1);
    }
    if (message.tickSpacing !== BigInt(0)) {
      writer.uint32(24).uint64(message.tickSpacing);
    }
    if (message.exponentAtPriceOne !== "") {
      writer.uint32(34).string(message.exponentAtPriceOne);
    }
    if (message.spreadFactor !== "") {
      writer
        .uint32(42)
        .string(Decimal.fromUserInput(message.spreadFactor, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PoolRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom0 = reader.string();
          break;
        case 2:
          message.denom1 = reader.string();
          break;
        case 3:
          message.tickSpacing = reader.uint64();
          break;
        case 4:
          message.exponentAtPriceOne = reader.string();
          break;
        case 5:
          message.spreadFactor = Decimal.fromAtomics(
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
  fromPartial(object: Partial<PoolRecord>): PoolRecord {
    const message = createBasePoolRecord();
    message.denom0 = object.denom0 ?? "";
    message.denom1 = object.denom1 ?? "";
    message.tickSpacing =
      object.tickSpacing !== undefined && object.tickSpacing !== null
        ? BigInt(object.tickSpacing.toString())
        : BigInt(0);
    message.exponentAtPriceOne = object.exponentAtPriceOne ?? "";
    message.spreadFactor = object.spreadFactor ?? "";
    return message;
  },
  fromAmino(object: PoolRecordAmino): PoolRecord {
    return {
      denom0: object.denom0,
      denom1: object.denom1,
      tickSpacing: BigInt(object.tick_spacing),
      exponentAtPriceOne: object.exponent_at_price_one,
      spreadFactor: object.spread_factor,
    };
  },
  toAmino(message: PoolRecord): PoolRecordAmino {
    const obj: any = {};
    obj.denom0 = message.denom0;
    obj.denom1 = message.denom1;
    obj.tick_spacing = message.tickSpacing
      ? message.tickSpacing.toString()
      : undefined;
    obj.exponent_at_price_one = message.exponentAtPriceOne;
    obj.spread_factor = message.spreadFactor;
    return obj;
  },
  fromAminoMsg(object: PoolRecordAminoMsg): PoolRecord {
    return PoolRecord.fromAmino(object.value);
  },
  toAminoMsg(message: PoolRecord): PoolRecordAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/pool-record",
      value: PoolRecord.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolRecordProtoMsg): PoolRecord {
    return PoolRecord.decode(message.value);
  },
  toProto(message: PoolRecord): Uint8Array {
    return PoolRecord.encode(message).finish();
  },
  toProtoMsg(message: PoolRecord): PoolRecordProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.PoolRecord",
      value: PoolRecord.encode(message).finish(),
    };
  },
};
