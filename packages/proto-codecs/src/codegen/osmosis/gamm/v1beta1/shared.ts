//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../../helpers";
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
  balancer_to_concentrated_pool_links: BalancerToConcentratedPoolLinkAmino[];
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
  balancerPoolId: Long;
  clPoolId: Long;
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
  balancer_pool_id: string;
  cl_pool_id: string;
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
  balancer_pool_id: Long;
  cl_pool_id: Long;
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.balancerToConcentratedPoolLinks) {
      BalancerToConcentratedPoolLink.encode(
        v!,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MigrationRecords {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
    return {
      balancerToConcentratedPoolLinks: Array.isArray(
        object?.balancer_to_concentrated_pool_links
      )
        ? object.balancer_to_concentrated_pool_links.map((e: any) =>
            BalancerToConcentratedPoolLink.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(message: MigrationRecords): MigrationRecordsAmino {
    const obj: any = {};
    if (message.balancerToConcentratedPoolLinks) {
      obj.balancer_to_concentrated_pool_links =
        message.balancerToConcentratedPoolLinks.map((e) =>
          e ? BalancerToConcentratedPoolLink.toAmino(e) : undefined
        );
    } else {
      obj.balancer_to_concentrated_pool_links = [];
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
    balancerPoolId: Long.UZERO,
    clPoolId: Long.UZERO,
  };
}
export const BalancerToConcentratedPoolLink = {
  typeUrl: "/osmosis.gamm.v1beta1.BalancerToConcentratedPoolLink",
  encode(
    message: BalancerToConcentratedPoolLink,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.balancerPoolId.isZero()) {
      writer.uint32(8).uint64(message.balancerPoolId);
    }
    if (!message.clPoolId.isZero()) {
      writer.uint32(16).uint64(message.clPoolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): BalancerToConcentratedPoolLink {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBalancerToConcentratedPoolLink();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balancerPoolId = reader.uint64() as Long;
          break;
        case 2:
          message.clPoolId = reader.uint64() as Long;
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
        ? Long.fromValue(object.balancerPoolId)
        : Long.UZERO;
    message.clPoolId =
      object.clPoolId !== undefined && object.clPoolId !== null
        ? Long.fromValue(object.clPoolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: BalancerToConcentratedPoolLinkAmino
  ): BalancerToConcentratedPoolLink {
    return {
      balancerPoolId: Long.fromString(object.balancer_pool_id),
      clPoolId: Long.fromString(object.cl_pool_id),
    };
  },
  toAmino(
    message: BalancerToConcentratedPoolLink
  ): BalancerToConcentratedPoolLinkAmino {
    const obj: any = {};
    obj.balancer_pool_id = message.balancerPoolId
      ? message.balancerPoolId.toString()
      : undefined;
    obj.cl_pool_id = message.clPoolId ? message.clPoolId.toString() : undefined;
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
