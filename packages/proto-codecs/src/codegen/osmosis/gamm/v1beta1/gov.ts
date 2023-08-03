//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  BalancerToConcentratedPoolLink,
  BalancerToConcentratedPoolLinkAmino,
  BalancerToConcentratedPoolLinkSDKType,
} from "./shared";
/**
 * ReplaceMigrationRecordsProposal is a gov Content type for updating the
 * migration records. If a ReplaceMigrationRecordsProposal passes, the
 * proposal’s records override the existing MigrationRecords set in the module.
 * Each record specifies a single connection between a single balancer pool and
 * a single concentrated pool.
 */
export interface ReplaceMigrationRecordsProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLink[];
}
export interface ReplaceMigrationRecordsProposalProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal";
  value: Uint8Array;
}
/**
 * ReplaceMigrationRecordsProposal is a gov Content type for updating the
 * migration records. If a ReplaceMigrationRecordsProposal passes, the
 * proposal’s records override the existing MigrationRecords set in the module.
 * Each record specifies a single connection between a single balancer pool and
 * a single concentrated pool.
 */
export interface ReplaceMigrationRecordsProposalAmino {
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkAmino[];
}
export interface ReplaceMigrationRecordsProposalAminoMsg {
  type: "osmosis/ReplaceMigrationRecordsProposal";
  value: ReplaceMigrationRecordsProposalAmino;
}
/**
 * ReplaceMigrationRecordsProposal is a gov Content type for updating the
 * migration records. If a ReplaceMigrationRecordsProposal passes, the
 * proposal’s records override the existing MigrationRecords set in the module.
 * Each record specifies a single connection between a single balancer pool and
 * a single concentrated pool.
 */
export interface ReplaceMigrationRecordsProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkSDKType[];
}
/**
 * For example: if the existing DistrRecords were:
 * [(Balancer 1, CL 5), (Balancer 2, CL 6), (Balancer 3, CL 7)]
 * And an UpdateMigrationRecordsProposal includes
 * [(Balancer 2, CL 0), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 * This would leave Balancer 1 record, delete Balancer 2 record,
 * Edit Balancer 3 record, and Add Balancer 4 record
 * The result MigrationRecords in state would be:
 * [(Balancer 1, CL 5), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 */
export interface UpdateMigrationRecordsProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLink[];
}
export interface UpdateMigrationRecordsProposalProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal";
  value: Uint8Array;
}
/**
 * For example: if the existing DistrRecords were:
 * [(Balancer 1, CL 5), (Balancer 2, CL 6), (Balancer 3, CL 7)]
 * And an UpdateMigrationRecordsProposal includes
 * [(Balancer 2, CL 0), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 * This would leave Balancer 1 record, delete Balancer 2 record,
 * Edit Balancer 3 record, and Add Balancer 4 record
 * The result MigrationRecords in state would be:
 * [(Balancer 1, CL 5), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 */
export interface UpdateMigrationRecordsProposalAmino {
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkAmino[];
}
export interface UpdateMigrationRecordsProposalAminoMsg {
  type: "osmosis/UpdateMigrationRecordsProposal";
  value: UpdateMigrationRecordsProposalAmino;
}
/**
 * For example: if the existing DistrRecords were:
 * [(Balancer 1, CL 5), (Balancer 2, CL 6), (Balancer 3, CL 7)]
 * And an UpdateMigrationRecordsProposal includes
 * [(Balancer 2, CL 0), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 * This would leave Balancer 1 record, delete Balancer 2 record,
 * Edit Balancer 3 record, and Add Balancer 4 record
 * The result MigrationRecords in state would be:
 * [(Balancer 1, CL 5), (Balancer 3, CL 4), (Balancer 4, CL 10)]
 */
export interface UpdateMigrationRecordsProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  records: BalancerToConcentratedPoolLinkSDKType[];
}
export interface PoolRecordWithCFMMLink {
  denom0: string;
  denom1: string;
  tickSpacing: bigint;
  exponentAtPriceOne: string;
  spreadFactor: string;
  balancerPoolId: bigint;
}
export interface PoolRecordWithCFMMLinkProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.PoolRecordWithCFMMLink";
  value: Uint8Array;
}
export interface PoolRecordWithCFMMLinkAmino {
  denom0: string;
  denom1: string;
  tick_spacing: string;
  exponent_at_price_one: string;
  spread_factor: string;
  balancer_pool_id: string;
}
export interface PoolRecordWithCFMMLinkAminoMsg {
  type: "osmosis/gamm/pool-record-with-cfmm-link";
  value: PoolRecordWithCFMMLinkAmino;
}
export interface PoolRecordWithCFMMLinkSDKType {
  denom0: string;
  denom1: string;
  tick_spacing: bigint;
  exponent_at_price_one: string;
  spread_factor: string;
  balancer_pool_id: bigint;
}
/**
 * CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal is a gov Content type
 * for creating concentrated liquidity pools and linking it to a CFMM pool.
 */
export interface CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  poolRecordsWithCfmmLink: PoolRecordWithCFMMLink[];
}
export interface CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal";
  value: Uint8Array;
}
/**
 * CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal is a gov Content type
 * for creating concentrated liquidity pools and linking it to a CFMM pool.
 */
export interface CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalAmino {
  title: string;
  description: string;
  pool_records_with_cfmm_link: PoolRecordWithCFMMLinkAmino[];
}
export interface CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalAminoMsg {
  type: "osmosis/CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal";
  value: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalAmino;
}
/**
 * CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal is a gov Content type
 * for creating concentrated liquidity pools and linking it to a CFMM pool.
 */
export interface CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  pool_records_with_cfmm_link: PoolRecordWithCFMMLinkSDKType[];
}
function createBaseReplaceMigrationRecordsProposal(): ReplaceMigrationRecordsProposal {
  return {
    $typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal",
    title: "",
    description: "",
    records: [],
  };
}
export const ReplaceMigrationRecordsProposal = {
  typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal",
  encode(
    message: ReplaceMigrationRecordsProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.records) {
      BalancerToConcentratedPoolLink.encode(
        v!,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): ReplaceMigrationRecordsProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseReplaceMigrationRecordsProposal();
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
          message.records.push(
            BalancerToConcentratedPoolLink.decode(reader, reader.uint32())
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
    object: Partial<ReplaceMigrationRecordsProposal>
  ): ReplaceMigrationRecordsProposal {
    const message = createBaseReplaceMigrationRecordsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.records =
      object.records?.map((e) =>
        BalancerToConcentratedPoolLink.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: ReplaceMigrationRecordsProposalAmino
  ): ReplaceMigrationRecordsProposal {
    return {
      title: object.title,
      description: object.description,
      records: Array.isArray(object?.records)
        ? object.records.map((e: any) =>
            BalancerToConcentratedPoolLink.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: ReplaceMigrationRecordsProposal
  ): ReplaceMigrationRecordsProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.records) {
      obj.records = message.records.map((e) =>
        e ? BalancerToConcentratedPoolLink.toAmino(e) : undefined
      );
    } else {
      obj.records = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: ReplaceMigrationRecordsProposalAminoMsg
  ): ReplaceMigrationRecordsProposal {
    return ReplaceMigrationRecordsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: ReplaceMigrationRecordsProposal
  ): ReplaceMigrationRecordsProposalAminoMsg {
    return {
      type: "osmosis/ReplaceMigrationRecordsProposal",
      value: ReplaceMigrationRecordsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ReplaceMigrationRecordsProposalProtoMsg
  ): ReplaceMigrationRecordsProposal {
    return ReplaceMigrationRecordsProposal.decode(message.value);
  },
  toProto(message: ReplaceMigrationRecordsProposal): Uint8Array {
    return ReplaceMigrationRecordsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: ReplaceMigrationRecordsProposal
  ): ReplaceMigrationRecordsProposalProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.ReplaceMigrationRecordsProposal",
      value: ReplaceMigrationRecordsProposal.encode(message).finish(),
    };
  },
};
function createBaseUpdateMigrationRecordsProposal(): UpdateMigrationRecordsProposal {
  return {
    $typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal",
    title: "",
    description: "",
    records: [],
  };
}
export const UpdateMigrationRecordsProposal = {
  typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal",
  encode(
    message: UpdateMigrationRecordsProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.records) {
      BalancerToConcentratedPoolLink.encode(
        v!,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UpdateMigrationRecordsProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateMigrationRecordsProposal();
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
          message.records.push(
            BalancerToConcentratedPoolLink.decode(reader, reader.uint32())
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
    object: Partial<UpdateMigrationRecordsProposal>
  ): UpdateMigrationRecordsProposal {
    const message = createBaseUpdateMigrationRecordsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.records =
      object.records?.map((e) =>
        BalancerToConcentratedPoolLink.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: UpdateMigrationRecordsProposalAmino
  ): UpdateMigrationRecordsProposal {
    return {
      title: object.title,
      description: object.description,
      records: Array.isArray(object?.records)
        ? object.records.map((e: any) =>
            BalancerToConcentratedPoolLink.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: UpdateMigrationRecordsProposal
  ): UpdateMigrationRecordsProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.records) {
      obj.records = message.records.map((e) =>
        e ? BalancerToConcentratedPoolLink.toAmino(e) : undefined
      );
    } else {
      obj.records = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: UpdateMigrationRecordsProposalAminoMsg
  ): UpdateMigrationRecordsProposal {
    return UpdateMigrationRecordsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: UpdateMigrationRecordsProposal
  ): UpdateMigrationRecordsProposalAminoMsg {
    return {
      type: "osmosis/UpdateMigrationRecordsProposal",
      value: UpdateMigrationRecordsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UpdateMigrationRecordsProposalProtoMsg
  ): UpdateMigrationRecordsProposal {
    return UpdateMigrationRecordsProposal.decode(message.value);
  },
  toProto(message: UpdateMigrationRecordsProposal): Uint8Array {
    return UpdateMigrationRecordsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: UpdateMigrationRecordsProposal
  ): UpdateMigrationRecordsProposalProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.UpdateMigrationRecordsProposal",
      value: UpdateMigrationRecordsProposal.encode(message).finish(),
    };
  },
};
function createBasePoolRecordWithCFMMLink(): PoolRecordWithCFMMLink {
  return {
    denom0: "",
    denom1: "",
    tickSpacing: BigInt(0),
    exponentAtPriceOne: "",
    spreadFactor: "",
    balancerPoolId: BigInt(0),
  };
}
export const PoolRecordWithCFMMLink = {
  typeUrl: "/osmosis.gamm.v1beta1.PoolRecordWithCFMMLink",
  encode(
    message: PoolRecordWithCFMMLink,
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
    if (message.balancerPoolId !== BigInt(0)) {
      writer.uint32(48).uint64(message.balancerPoolId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): PoolRecordWithCFMMLink {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolRecordWithCFMMLink();
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
        case 6:
          message.balancerPoolId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PoolRecordWithCFMMLink>): PoolRecordWithCFMMLink {
    const message = createBasePoolRecordWithCFMMLink();
    message.denom0 = object.denom0 ?? "";
    message.denom1 = object.denom1 ?? "";
    message.tickSpacing =
      object.tickSpacing !== undefined && object.tickSpacing !== null
        ? BigInt(object.tickSpacing.toString())
        : BigInt(0);
    message.exponentAtPriceOne = object.exponentAtPriceOne ?? "";
    message.spreadFactor = object.spreadFactor ?? "";
    message.balancerPoolId =
      object.balancerPoolId !== undefined && object.balancerPoolId !== null
        ? BigInt(object.balancerPoolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: PoolRecordWithCFMMLinkAmino): PoolRecordWithCFMMLink {
    return {
      denom0: object.denom0,
      denom1: object.denom1,
      tickSpacing: BigInt(object.tick_spacing),
      exponentAtPriceOne: object.exponent_at_price_one,
      spreadFactor: object.spread_factor,
      balancerPoolId: BigInt(object.balancer_pool_id),
    };
  },
  toAmino(message: PoolRecordWithCFMMLink): PoolRecordWithCFMMLinkAmino {
    const obj: any = {};
    obj.denom0 = message.denom0;
    obj.denom1 = message.denom1;
    obj.tick_spacing = message.tickSpacing
      ? message.tickSpacing.toString()
      : undefined;
    obj.exponent_at_price_one = message.exponentAtPriceOne;
    obj.spread_factor = message.spreadFactor;
    obj.balancer_pool_id = message.balancerPoolId
      ? message.balancerPoolId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PoolRecordWithCFMMLinkAminoMsg): PoolRecordWithCFMMLink {
    return PoolRecordWithCFMMLink.fromAmino(object.value);
  },
  toAminoMsg(message: PoolRecordWithCFMMLink): PoolRecordWithCFMMLinkAminoMsg {
    return {
      type: "osmosis/gamm/pool-record-with-cfmm-link",
      value: PoolRecordWithCFMMLink.toAmino(message),
    };
  },
  fromProtoMsg(
    message: PoolRecordWithCFMMLinkProtoMsg
  ): PoolRecordWithCFMMLink {
    return PoolRecordWithCFMMLink.decode(message.value);
  },
  toProto(message: PoolRecordWithCFMMLink): Uint8Array {
    return PoolRecordWithCFMMLink.encode(message).finish();
  },
  toProtoMsg(message: PoolRecordWithCFMMLink): PoolRecordWithCFMMLinkProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.PoolRecordWithCFMMLink",
      value: PoolRecordWithCFMMLink.encode(message).finish(),
    };
  },
};
function createBaseCreateConcentratedLiquidityPoolsAndLinktoCFMMProposal(): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal {
  return {
    $typeUrl:
      "/osmosis.gamm.v1beta1.CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal",
    title: "",
    description: "",
    poolRecordsWithCfmmLink: [],
  };
}
export const CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal = {
  typeUrl:
    "/osmosis.gamm.v1beta1.CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal",
  encode(
    message: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.poolRecordsWithCfmmLink) {
      PoolRecordWithCFMMLink.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message =
      createBaseCreateConcentratedLiquidityPoolsAndLinktoCFMMProposal();
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
          message.poolRecordsWithCfmmLink.push(
            PoolRecordWithCFMMLink.decode(reader, reader.uint32())
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
    object: Partial<CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal>
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal {
    const message =
      createBaseCreateConcentratedLiquidityPoolsAndLinktoCFMMProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.poolRecordsWithCfmmLink =
      object.poolRecordsWithCfmmLink?.map((e) =>
        PoolRecordWithCFMMLink.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(
    object: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalAmino
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal {
    return {
      title: object.title,
      description: object.description,
      poolRecordsWithCfmmLink: Array.isArray(
        object?.pool_records_with_cfmm_link
      )
        ? object.pool_records_with_cfmm_link.map((e: any) =>
            PoolRecordWithCFMMLink.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(
    message: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.poolRecordsWithCfmmLink) {
      obj.pool_records_with_cfmm_link = message.poolRecordsWithCfmmLink.map(
        (e) => (e ? PoolRecordWithCFMMLink.toAmino(e) : undefined)
      );
    } else {
      obj.pool_records_with_cfmm_link = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalAminoMsg
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal {
    return CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalAminoMsg {
    return {
      type: "osmosis/CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal",
      value:
        CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalProtoMsg
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal {
    return CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal.decode(
      message.value
    );
  },
  toProto(
    message: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal
  ): Uint8Array {
    return CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal
  ): CreateConcentratedLiquidityPoolsAndLinktoCFMMProposalProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.v1beta1.CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal",
      value:
        CreateConcentratedLiquidityPoolsAndLinktoCFMMProposal.encode(
          message
        ).finish(),
    };
  },
};
