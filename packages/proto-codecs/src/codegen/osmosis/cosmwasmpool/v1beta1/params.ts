//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../../helpers";
export interface Params {
  /**
   * code_ide_whitelist contains the list of code ids that are allowed to be
   * instantiated.
   */
  codeIdWhitelist: Long[];
  /**
   * pool_migration_limit is the maximum number of pools that can be migrated
   * at once via governance proposal. This is to have a constant bound on the
   * number of pools that can be migrated at once and remove the possibility
   * of an unlikely scenario of causing a chain halt due to a large migration.
   */
  poolMigrationLimit: Long;
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.Params";
  value: Uint8Array;
}
export interface ParamsAmino {
  /**
   * code_ide_whitelist contains the list of code ids that are allowed to be
   * instantiated.
   */
  code_id_whitelist: string[];
  /**
   * pool_migration_limit is the maximum number of pools that can be migrated
   * at once via governance proposal. This is to have a constant bound on the
   * number of pools that can be migrated at once and remove the possibility
   * of an unlikely scenario of causing a chain halt due to a large migration.
   */
  pool_migration_limit: string;
}
export interface ParamsAminoMsg {
  type: "osmosis/cosmwasmpool/params";
  value: ParamsAmino;
}
export interface ParamsSDKType {
  code_id_whitelist: Long[];
  pool_migration_limit: Long;
}
function createBaseParams(): Params {
  return {
    codeIdWhitelist: [],
    poolMigrationLimit: Long.UZERO,
  };
}
export const Params = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.codeIdWhitelist) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (!message.poolMigrationLimit.isZero()) {
      writer.uint32(16).uint64(message.poolMigrationLimit);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.codeIdWhitelist.push(reader.uint64() as Long);
            }
          } else {
            message.codeIdWhitelist.push(reader.uint64() as Long);
          }
          break;
        case 2:
          message.poolMigrationLimit = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.codeIdWhitelist =
      object.codeIdWhitelist?.map((e) => Long.fromValue(e)) || [];
    message.poolMigrationLimit =
      object.poolMigrationLimit !== undefined &&
      object.poolMigrationLimit !== null
        ? Long.fromValue(object.poolMigrationLimit)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      codeIdWhitelist: Array.isArray(object?.code_id_whitelist)
        ? object.code_id_whitelist.map((e: any) => e)
        : [],
      poolMigrationLimit: Long.fromString(object.pool_migration_limit),
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.codeIdWhitelist) {
      obj.code_id_whitelist = message.codeIdWhitelist.map((e) => e);
    } else {
      obj.code_id_whitelist = [];
    }
    obj.pool_migration_limit = message.poolMigrationLimit
      ? message.poolMigrationLimit.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/params",
      value: Params.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
