//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
/**
 * MigrationRecords contains all the links between balancer and concentrated
 * pools
 */
export interface MigrationRecords {
  balancerToConcentratedPoolLinks: BalancerToConcentratedPoolLink[];
}
export interface MigrationRecordsProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MigrationRecords";
  value: Uint8Array;
}
/**
 * MigrationRecords contains all the links between balancer and concentrated
 * pools
 */
export interface MigrationRecordsAmino {
  balancer_to_concentrated_pool_links?: BalancerToConcentratedPoolLinkAmino[];
}
export interface MigrationRecordsAminoMsg {
  type: "osmosis/gamm/migration-records";
  value: MigrationRecordsAmino;
}
/**
 * MigrationRecords contains all the links between balancer and concentrated
 * pools
 */
export interface MigrationRecordsSDKType {
  balancer_to_concentrated_pool_links: BalancerToConcentratedPoolLinkSDKType[];
}
/**
 * BalancerToConcentratedPoolLink defines a single link between a single
 * balancer pool and a single concentrated liquidity pool. This link is used to
 * allow a balancer pool to migrate to a single canonical full range
 * concentrated liquidity pool position
 * A balancer pool can be linked to a maximum of one cl pool, and a cl pool can
 * be linked to a maximum of one balancer pool.
 */
export interface BalancerToConcentratedPoolLink {
  balancerPoolId: bigint;
  clPoolId: bigint;
}
export interface BalancerToConcentratedPoolLinkProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.BalancerToConcentratedPoolLink";
  value: Uint8Array;
}
/**
 * BalancerToConcentratedPoolLink defines a single link between a single
 * balancer pool and a single concentrated liquidity pool. This link is used to
 * allow a balancer pool to migrate to a single canonical full range
 * concentrated liquidity pool position
 * A balancer pool can be linked to a maximum of one cl pool, and a cl pool can
 * be linked to a maximum of one balancer pool.
 */
export interface BalancerToConcentratedPoolLinkAmino {
  balancer_pool_id?: string;
  cl_pool_id?: string;
}
export interface BalancerToConcentratedPoolLinkAminoMsg {
  type: "osmosis/gamm/balancer-to-concentrated-pool-link";
  value: BalancerToConcentratedPoolLinkAmino;
}
/**
 * BalancerToConcentratedPoolLink defines a single link between a single
 * balancer pool and a single concentrated liquidity pool. This link is used to
 * allow a balancer pool to migrate to a single canonical full range
 * concentrated liquidity pool position
 * A balancer pool can be linked to a maximum of one cl pool, and a cl pool can
 * be linked to a maximum of one balancer pool.
 */
export interface BalancerToConcentratedPoolLinkSDKType {
  balancer_pool_id: bigint;
  cl_pool_id: bigint;
}
function createBaseMigrationRecords(): MigrationRecords {
  return {
    balancerToConcentratedPoolLinks: [],
  };
}
export const MigrationRecords = {
  typeUrl: "/osmosis.gamm.v1beta1.MigrationRecords",
  encode(
    message: MigrationRecords,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.balancerToConcentratedPoolLinks) {
      BalancerToConcentratedPoolLink.encode(
        v!,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MigrationRecords {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMigrationRecords();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balancerToConcentratedPoolLinks.push(
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
  fromPartial(object: Partial<MigrationRecords>): MigrationRecords {
    const message = createBaseMigrationRecords();
    message.balancerToConcentratedPoolLinks =
      object.balancerToConcentratedPoolLinks?.map((e) =>
        BalancerToConcentratedPoolLink.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(object: MigrationRecordsAmino): MigrationRecords {
    const message = createBaseMigrationRecords();
    message.balancerToConcentratedPoolLinks =
      object.balancer_to_concentrated_pool_links?.map((e) =>
        BalancerToConcentratedPoolLink.fromAmino(e)
      ) || [];
    return message;
  },
  toAmino(message: MigrationRecords): MigrationRecordsAmino {
    const obj: any = {};
    if (message.balancerToConcentratedPoolLinks) {
      obj.balancer_to_concentrated_pool_links =
        message.balancerToConcentratedPoolLinks.map((e) =>
          e ? BalancerToConcentratedPoolLink.toAmino(e) : undefined
        );
    } else {
      obj.balancer_to_concentrated_pool_links =
        message.balancerToConcentratedPoolLinks;
    }
    return obj;
  },
  fromAminoMsg(object: MigrationRecordsAminoMsg): MigrationRecords {
    return MigrationRecords.fromAmino(object.value);
  },
  toAminoMsg(message: MigrationRecords): MigrationRecordsAminoMsg {
    return {
      type: "osmosis/gamm/migration-records",
      value: MigrationRecords.toAmino(message),
    };
  },
  fromProtoMsg(message: MigrationRecordsProtoMsg): MigrationRecords {
    return MigrationRecords.decode(message.value);
  },
  toProto(message: MigrationRecords): Uint8Array {
    return MigrationRecords.encode(message).finish();
  },
  toProtoMsg(message: MigrationRecords): MigrationRecordsProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MigrationRecords",
      value: MigrationRecords.encode(message).finish(),
    };
  },
};
function createBaseBalancerToConcentratedPoolLink(): BalancerToConcentratedPoolLink {
  return {
    balancerPoolId: BigInt(0),
    clPoolId: BigInt(0),
  };
}
export const BalancerToConcentratedPoolLink = {
  typeUrl: "/osmosis.gamm.v1beta1.BalancerToConcentratedPoolLink",
  encode(
    message: BalancerToConcentratedPoolLink,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.balancerPoolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.balancerPoolId);
    }
    if (message.clPoolId !== BigInt(0)) {
      writer.uint32(16).uint64(message.clPoolId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): BalancerToConcentratedPoolLink {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBalancerToConcentratedPoolLink();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balancerPoolId = reader.uint64();
          break;
        case 2:
          message.clPoolId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<BalancerToConcentratedPoolLink>
  ): BalancerToConcentratedPoolLink {
    const message = createBaseBalancerToConcentratedPoolLink();
    message.balancerPoolId =
      object.balancerPoolId !== undefined && object.balancerPoolId !== null
        ? BigInt(object.balancerPoolId.toString())
        : BigInt(0);
    message.clPoolId =
      object.clPoolId !== undefined && object.clPoolId !== null
        ? BigInt(object.clPoolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: BalancerToConcentratedPoolLinkAmino
  ): BalancerToConcentratedPoolLink {
    const message = createBaseBalancerToConcentratedPoolLink();
    if (
      object.balancer_pool_id !== undefined &&
      object.balancer_pool_id !== null
    ) {
      message.balancerPoolId = BigInt(object.balancer_pool_id);
    }
    if (object.cl_pool_id !== undefined && object.cl_pool_id !== null) {
      message.clPoolId = BigInt(object.cl_pool_id);
    }
    return message;
  },
  toAmino(
    message: BalancerToConcentratedPoolLink
  ): BalancerToConcentratedPoolLinkAmino {
    const obj: any = {};
    obj.balancer_pool_id =
      message.balancerPoolId !== BigInt(0)
        ? message.balancerPoolId.toString()
        : undefined;
    obj.cl_pool_id =
      message.clPoolId !== BigInt(0) ? message.clPoolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: BalancerToConcentratedPoolLinkAminoMsg
  ): BalancerToConcentratedPoolLink {
    return BalancerToConcentratedPoolLink.fromAmino(object.value);
  },
  toAminoMsg(
    message: BalancerToConcentratedPoolLink
  ): BalancerToConcentratedPoolLinkAminoMsg {
    return {
      type: "osmosis/gamm/balancer-to-concentrated-pool-link",
      value: BalancerToConcentratedPoolLink.toAmino(message),
    };
  },
  fromProtoMsg(
    message: BalancerToConcentratedPoolLinkProtoMsg
  ): BalancerToConcentratedPoolLink {
    return BalancerToConcentratedPoolLink.decode(message.value);
  },
  toProto(message: BalancerToConcentratedPoolLink): Uint8Array {
    return BalancerToConcentratedPoolLink.encode(message).finish();
  },
  toProtoMsg(
    message: BalancerToConcentratedPoolLink
  ): BalancerToConcentratedPoolLinkProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.BalancerToConcentratedPoolLink",
      value: BalancerToConcentratedPoolLink.encode(message).finish(),
    };
  },
};
