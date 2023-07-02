//@ts-nocheck
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../../helpers";
/**
 * UploadCosmWasmPoolCodeAndWhiteListProposal is a gov Content type for
 * uploading coswasm pool code and adding it to internal whitelist. Only the
 * code ids created by this message are eligible for being x/cosmwasmpool pools.
 */
export interface UploadCosmWasmPoolCodeAndWhiteListProposal {
  title: string;
  description: string;
  /** WASMByteCode can be raw or gzip compressed */
  wasmByteCode: Uint8Array;
}
export interface UploadCosmWasmPoolCodeAndWhiteListProposalProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.UploadCosmWasmPoolCodeAndWhiteListProposal";
  value: Uint8Array;
}
/**
 * UploadCosmWasmPoolCodeAndWhiteListProposal is a gov Content type for
 * uploading coswasm pool code and adding it to internal whitelist. Only the
 * code ids created by this message are eligible for being x/cosmwasmpool pools.
 */
export interface UploadCosmWasmPoolCodeAndWhiteListProposalAmino {
  title: string;
  description: string;
  /** WASMByteCode can be raw or gzip compressed */
  wasm_byte_code: string;
}
export interface UploadCosmWasmPoolCodeAndWhiteListProposalAminoMsg {
  type: "osmosis/cosmwasmpool/upload-cosm-wasm-pool-code-and-white-list-proposal";
  value: UploadCosmWasmPoolCodeAndWhiteListProposalAmino;
}
/**
 * UploadCosmWasmPoolCodeAndWhiteListProposal is a gov Content type for
 * uploading coswasm pool code and adding it to internal whitelist. Only the
 * code ids created by this message are eligible for being x/cosmwasmpool pools.
 */
export interface UploadCosmWasmPoolCodeAndWhiteListProposalSDKType {
  title: string;
  description: string;
  wasm_byte_code: Uint8Array;
}
/**
 * MigratePoolContractsProposal is a gov Content type for
 * migrating  given pools to the new contract code and adding to internal
 * whitelist if needed. It has two options to perform the migration:
 *
 * 1. If the codeID is non-zero, it will migrate the pool contracts to a given
 * codeID assuming that it has already been uploaded. uploadByteCode must be
 * empty in such a case. Fails if codeID does not exist. Fails if uploadByteCode
 * is not empty.
 *
 * 2. If the codeID is zero, it will upload the given uploadByteCode and use the
 * new resulting code id to migrate the pool to. Errors if uploadByteCode is
 * empty or invalid.
 *
 * In both cases, if one of the pools specified by the given poolID does not
 * exist, the proposal fails.
 *
 * The reason for having poolIDs be a slice of ids is to account for the
 * potential need for emergency migration of all old code ids associated with
 * particular pools to new code ids, or simply having the flexibility of
 * migrating multiple older pool contracts to a new one at once when there is a
 * release.
 *
 * poolD count to be submitted at once is gated by a governance paramets (20 at
 * launch). The proposal fails if more. Note that 20 was chosen arbitrarily to
 * have a constant bound on the number of pools migrated at once. This size will
 * be configured by a module parameter so it can be changed by a constant.
 */
export interface MigratePoolContractsProposal {
  title: string;
  description: string;
  /**
   * pool_ids are the pool ids of the contracts to be migrated
   * either to the new_code_id that is already uploaded to chain or to
   * the given wasm_byte_code.
   */
  poolIds: Long[];
  /**
   * new_code_id is the code id of the contract code to migrate to.
   * Assumes that the code is already uploaded to chain. Only one of
   * new_code_id and wasm_byte_code should be set.
   */
  newCodeId: Long;
  /**
   * WASMByteCode can be raw or gzip compressed. Assumes that the code id
   * has not been uploaded yet so uploads the given code and migrates to it.
   * Only one of new_code_id and wasm_byte_code should be set.
   */
  wasmByteCode: Uint8Array;
  /** MigrateMsg migrate message to be used for migrating the pool contracts. */
  migrateMsg: Uint8Array;
}
export interface MigratePoolContractsProposalProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.MigratePoolContractsProposal";
  value: Uint8Array;
}
/**
 * MigratePoolContractsProposal is a gov Content type for
 * migrating  given pools to the new contract code and adding to internal
 * whitelist if needed. It has two options to perform the migration:
 *
 * 1. If the codeID is non-zero, it will migrate the pool contracts to a given
 * codeID assuming that it has already been uploaded. uploadByteCode must be
 * empty in such a case. Fails if codeID does not exist. Fails if uploadByteCode
 * is not empty.
 *
 * 2. If the codeID is zero, it will upload the given uploadByteCode and use the
 * new resulting code id to migrate the pool to. Errors if uploadByteCode is
 * empty or invalid.
 *
 * In both cases, if one of the pools specified by the given poolID does not
 * exist, the proposal fails.
 *
 * The reason for having poolIDs be a slice of ids is to account for the
 * potential need for emergency migration of all old code ids associated with
 * particular pools to new code ids, or simply having the flexibility of
 * migrating multiple older pool contracts to a new one at once when there is a
 * release.
 *
 * poolD count to be submitted at once is gated by a governance paramets (20 at
 * launch). The proposal fails if more. Note that 20 was chosen arbitrarily to
 * have a constant bound on the number of pools migrated at once. This size will
 * be configured by a module parameter so it can be changed by a constant.
 */
export interface MigratePoolContractsProposalAmino {
  title: string;
  description: string;
  /**
   * pool_ids are the pool ids of the contracts to be migrated
   * either to the new_code_id that is already uploaded to chain or to
   * the given wasm_byte_code.
   */
  pool_ids: string[];
  /**
   * new_code_id is the code id of the contract code to migrate to.
   * Assumes that the code is already uploaded to chain. Only one of
   * new_code_id and wasm_byte_code should be set.
   */
  new_code_id: string;
  /**
   * WASMByteCode can be raw or gzip compressed. Assumes that the code id
   * has not been uploaded yet so uploads the given code and migrates to it.
   * Only one of new_code_id and wasm_byte_code should be set.
   */
  wasm_byte_code: string;
  /** MigrateMsg migrate message to be used for migrating the pool contracts. */
  migrate_msg: Uint8Array;
}
export interface MigratePoolContractsProposalAminoMsg {
  type: "osmosis/cosmwasmpool/migrate-pool-contracts-proposal";
  value: MigratePoolContractsProposalAmino;
}
/**
 * MigratePoolContractsProposal is a gov Content type for
 * migrating  given pools to the new contract code and adding to internal
 * whitelist if needed. It has two options to perform the migration:
 *
 * 1. If the codeID is non-zero, it will migrate the pool contracts to a given
 * codeID assuming that it has already been uploaded. uploadByteCode must be
 * empty in such a case. Fails if codeID does not exist. Fails if uploadByteCode
 * is not empty.
 *
 * 2. If the codeID is zero, it will upload the given uploadByteCode and use the
 * new resulting code id to migrate the pool to. Errors if uploadByteCode is
 * empty or invalid.
 *
 * In both cases, if one of the pools specified by the given poolID does not
 * exist, the proposal fails.
 *
 * The reason for having poolIDs be a slice of ids is to account for the
 * potential need for emergency migration of all old code ids associated with
 * particular pools to new code ids, or simply having the flexibility of
 * migrating multiple older pool contracts to a new one at once when there is a
 * release.
 *
 * poolD count to be submitted at once is gated by a governance paramets (20 at
 * launch). The proposal fails if more. Note that 20 was chosen arbitrarily to
 * have a constant bound on the number of pools migrated at once. This size will
 * be configured by a module parameter so it can be changed by a constant.
 */
export interface MigratePoolContractsProposalSDKType {
  title: string;
  description: string;
  pool_ids: Long[];
  new_code_id: Long;
  wasm_byte_code: Uint8Array;
  migrate_msg: Uint8Array;
}
function createBaseUploadCosmWasmPoolCodeAndWhiteListProposal(): UploadCosmWasmPoolCodeAndWhiteListProposal {
  return {
    title: "",
    description: "",
    wasmByteCode: new Uint8Array(),
  };
}
export const UploadCosmWasmPoolCodeAndWhiteListProposal = {
  typeUrl:
    "/osmosis.cosmwasmpool.v1beta1.UploadCosmWasmPoolCodeAndWhiteListProposal",
  encode(
    message: UploadCosmWasmPoolCodeAndWhiteListProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.wasmByteCode.length !== 0) {
      writer.uint32(26).bytes(message.wasmByteCode);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UploadCosmWasmPoolCodeAndWhiteListProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUploadCosmWasmPoolCodeAndWhiteListProposal();
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
          message.wasmByteCode = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<UploadCosmWasmPoolCodeAndWhiteListProposal>
  ): UploadCosmWasmPoolCodeAndWhiteListProposal {
    const message = createBaseUploadCosmWasmPoolCodeAndWhiteListProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.wasmByteCode = object.wasmByteCode ?? new Uint8Array();
    return message;
  },
  fromAmino(
    object: UploadCosmWasmPoolCodeAndWhiteListProposalAmino
  ): UploadCosmWasmPoolCodeAndWhiteListProposal {
    return {
      title: object.title,
      description: object.description,
      wasmByteCode: fromBase64(object.wasm_byte_code),
    };
  },
  toAmino(
    message: UploadCosmWasmPoolCodeAndWhiteListProposal
  ): UploadCosmWasmPoolCodeAndWhiteListProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    obj.wasm_byte_code = message.wasmByteCode
      ? toBase64(message.wasmByteCode)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: UploadCosmWasmPoolCodeAndWhiteListProposalAminoMsg
  ): UploadCosmWasmPoolCodeAndWhiteListProposal {
    return UploadCosmWasmPoolCodeAndWhiteListProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: UploadCosmWasmPoolCodeAndWhiteListProposal
  ): UploadCosmWasmPoolCodeAndWhiteListProposalAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/upload-cosm-wasm-pool-code-and-white-list-proposal",
      value: UploadCosmWasmPoolCodeAndWhiteListProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UploadCosmWasmPoolCodeAndWhiteListProposalProtoMsg
  ): UploadCosmWasmPoolCodeAndWhiteListProposal {
    return UploadCosmWasmPoolCodeAndWhiteListProposal.decode(message.value);
  },
  toProto(message: UploadCosmWasmPoolCodeAndWhiteListProposal): Uint8Array {
    return UploadCosmWasmPoolCodeAndWhiteListProposal.encode(message).finish();
  },
  toProtoMsg(
    message: UploadCosmWasmPoolCodeAndWhiteListProposal
  ): UploadCosmWasmPoolCodeAndWhiteListProposalProtoMsg {
    return {
      typeUrl:
        "/osmosis.cosmwasmpool.v1beta1.UploadCosmWasmPoolCodeAndWhiteListProposal",
      value:
        UploadCosmWasmPoolCodeAndWhiteListProposal.encode(message).finish(),
    };
  },
};
function createBaseMigratePoolContractsProposal(): MigratePoolContractsProposal {
  return {
    title: "",
    description: "",
    poolIds: [],
    newCodeId: Long.UZERO,
    wasmByteCode: new Uint8Array(),
    migrateMsg: new Uint8Array(),
  };
}
export const MigratePoolContractsProposal = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.MigratePoolContractsProposal",
  encode(
    message: MigratePoolContractsProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    writer.uint32(26).fork();
    for (const v of message.poolIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (!message.newCodeId.isZero()) {
      writer.uint32(32).uint64(message.newCodeId);
    }
    if (message.wasmByteCode.length !== 0) {
      writer.uint32(42).bytes(message.wasmByteCode);
    }
    if (message.migrateMsg.length !== 0) {
      writer.uint32(50).bytes(message.migrateMsg);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MigratePoolContractsProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMigratePoolContractsProposal();
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
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.poolIds.push(reader.uint64() as Long);
            }
          } else {
            message.poolIds.push(reader.uint64() as Long);
          }
          break;
        case 4:
          message.newCodeId = reader.uint64() as Long;
          break;
        case 5:
          message.wasmByteCode = reader.bytes();
          break;
        case 6:
          message.migrateMsg = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MigratePoolContractsProposal>
  ): MigratePoolContractsProposal {
    const message = createBaseMigratePoolContractsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.poolIds = object.poolIds?.map((e) => Long.fromValue(e)) || [];
    message.newCodeId =
      object.newCodeId !== undefined && object.newCodeId !== null
        ? Long.fromValue(object.newCodeId)
        : Long.UZERO;
    message.wasmByteCode = object.wasmByteCode ?? new Uint8Array();
    message.migrateMsg = object.migrateMsg ?? new Uint8Array();
    return message;
  },
  fromAmino(
    object: MigratePoolContractsProposalAmino
  ): MigratePoolContractsProposal {
    return {
      title: object.title,
      description: object.description,
      poolIds: Array.isArray(object?.pool_ids)
        ? object.pool_ids.map((e: any) => e)
        : [],
      newCodeId: Long.fromString(object.new_code_id),
      wasmByteCode: fromBase64(object.wasm_byte_code),
      migrateMsg: object.migrate_msg,
    };
  },
  toAmino(
    message: MigratePoolContractsProposal
  ): MigratePoolContractsProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    if (message.poolIds) {
      obj.pool_ids = message.poolIds.map((e) => e);
    } else {
      obj.pool_ids = [];
    }
    obj.new_code_id = message.newCodeId
      ? message.newCodeId.toString()
      : undefined;
    obj.wasm_byte_code = message.wasmByteCode
      ? toBase64(message.wasmByteCode)
      : undefined;
    obj.migrate_msg = message.migrateMsg;
    return obj;
  },
  fromAminoMsg(
    object: MigratePoolContractsProposalAminoMsg
  ): MigratePoolContractsProposal {
    return MigratePoolContractsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: MigratePoolContractsProposal
  ): MigratePoolContractsProposalAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/migrate-pool-contracts-proposal",
      value: MigratePoolContractsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MigratePoolContractsProposalProtoMsg
  ): MigratePoolContractsProposal {
    return MigratePoolContractsProposal.decode(message.value);
  },
  toProto(message: MigratePoolContractsProposal): Uint8Array {
    return MigratePoolContractsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: MigratePoolContractsProposal
  ): MigratePoolContractsProposalProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.MigratePoolContractsProposal",
      value: MigratePoolContractsProposal.encode(message).finish(),
    };
  },
};
