//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
export interface Params {
  /**
   * code_ide_whitelist contains the list of code ids that are allowed to be
   * instantiated.
   */
  codeIdWhitelist: bigint[];
  /**
   * pool_migration_limit is the maximum number of pools that can be migrated
   * at once via governance proposal. This is to have a constant bound on the
   * number of pools that can be migrated at once and remove the possibility
   * of an unlikely scenario of causing a chain halt due to a large migration.
   */
  poolMigrationLimit: bigint;
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
  code_id_whitelist: bigint[];
  pool_migration_limit: bigint;
}
function createBaseParams(): Params {
  return {
    codeIdWhitelist: [],
    poolMigrationLimit: BigInt(0),
  };
}
export const Params = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.Params",
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.codeIdWhitelist) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.poolMigrationLimit !== BigInt(0)) {
      writer.uint32(16).uint64(message.poolMigrationLimit);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.codeIdWhitelist.push(reader.uint64());
            }
          } else {
            message.codeIdWhitelist.push(reader.uint64());
          }
          break;
        case 2:
          message.poolMigrationLimit = reader.uint64();
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
      object.codeIdWhitelist?.map((e) => BigInt(e.toString())) || [];
    message.poolMigrationLimit =
      object.poolMigrationLimit !== undefined &&
      object.poolMigrationLimit !== null
        ? BigInt(object.poolMigrationLimit.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      codeIdWhitelist: Array.isArray(object?.code_id_whitelist)
        ? object.code_id_whitelist.map((e: any) => e)
        : [],
      poolMigrationLimit: BigInt(object.pool_migration_limit),
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
