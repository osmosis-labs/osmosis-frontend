//@ts-nocheck
/* eslint-disable */
import {
  Any,
  AnyProtoMsg,
  AnyAmino,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Long, isSet } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
import { toUtf8, fromUtf8 } from "@cosmjs/encoding";
/** AccessType permission types */
export enum AccessType {
  /** ACCESS_TYPE_UNSPECIFIED - AccessTypeUnspecified placeholder for empty value */
  ACCESS_TYPE_UNSPECIFIED = 0,
  /** ACCESS_TYPE_NOBODY - AccessTypeNobody forbidden */
  ACCESS_TYPE_NOBODY = 1,
  /**
   * ACCESS_TYPE_ONLY_ADDRESS - AccessTypeOnlyAddress restricted to a single address
   * Deprecated: use AccessTypeAnyOfAddresses instead
   */
  ACCESS_TYPE_ONLY_ADDRESS = 2,
  /** ACCESS_TYPE_EVERYBODY - AccessTypeEverybody unrestricted */
  ACCESS_TYPE_EVERYBODY = 3,
  /** ACCESS_TYPE_ANY_OF_ADDRESSES - AccessTypeAnyOfAddresses allow any of the addresses */
  ACCESS_TYPE_ANY_OF_ADDRESSES = 4,
  UNRECOGNIZED = -1,
}
export const AccessTypeSDKType = AccessType;
export const AccessTypeAmino = AccessType;
export function accessTypeFromJSON(object: any): AccessType {
  switch (object) {
    case 0:
    case "ACCESS_TYPE_UNSPECIFIED":
      return AccessType.ACCESS_TYPE_UNSPECIFIED;
    case 1:
    case "ACCESS_TYPE_NOBODY":
      return AccessType.ACCESS_TYPE_NOBODY;
    case 2:
    case "ACCESS_TYPE_ONLY_ADDRESS":
      return AccessType.ACCESS_TYPE_ONLY_ADDRESS;
    case 3:
    case "ACCESS_TYPE_EVERYBODY":
      return AccessType.ACCESS_TYPE_EVERYBODY;
    case 4:
    case "ACCESS_TYPE_ANY_OF_ADDRESSES":
      return AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES;
    case -1:
    case "UNRECOGNIZED":
    default:
      return AccessType.UNRECOGNIZED;
  }
}
export function accessTypeToJSON(object: AccessType): string {
  switch (object) {
    case AccessType.ACCESS_TYPE_UNSPECIFIED:
      return "ACCESS_TYPE_UNSPECIFIED";
    case AccessType.ACCESS_TYPE_NOBODY:
      return "ACCESS_TYPE_NOBODY";
    case AccessType.ACCESS_TYPE_ONLY_ADDRESS:
      return "ACCESS_TYPE_ONLY_ADDRESS";
    case AccessType.ACCESS_TYPE_EVERYBODY:
      return "ACCESS_TYPE_EVERYBODY";
    case AccessType.ACCESS_TYPE_ANY_OF_ADDRESSES:
      return "ACCESS_TYPE_ANY_OF_ADDRESSES";
    case AccessType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
/** ContractCodeHistoryOperationType actions that caused a code change */
export enum ContractCodeHistoryOperationType {
  /** CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED - ContractCodeHistoryOperationTypeUnspecified placeholder for empty value */
  CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED = 0,
  /** CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT - ContractCodeHistoryOperationTypeInit on chain contract instantiation */
  CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT = 1,
  /** CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE - ContractCodeHistoryOperationTypeMigrate code migration */
  CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE = 2,
  /** CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS - ContractCodeHistoryOperationTypeGenesis based on genesis data */
  CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS = 3,
  UNRECOGNIZED = -1,
}
export const ContractCodeHistoryOperationTypeSDKType =
  ContractCodeHistoryOperationType;
export const ContractCodeHistoryOperationTypeAmino =
  ContractCodeHistoryOperationType;
export function contractCodeHistoryOperationTypeFromJSON(
  object: any
): ContractCodeHistoryOperationType {
  switch (object) {
    case 0:
    case "CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED":
      return ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED;
    case 1:
    case "CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT":
      return ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT;
    case 2:
    case "CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE":
      return ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE;
    case 3:
    case "CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS":
      return ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ContractCodeHistoryOperationType.UNRECOGNIZED;
  }
}
export function contractCodeHistoryOperationTypeToJSON(
  object: ContractCodeHistoryOperationType
): string {
  switch (object) {
    case ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED:
      return "CONTRACT_CODE_HISTORY_OPERATION_TYPE_UNSPECIFIED";
    case ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT:
      return "CONTRACT_CODE_HISTORY_OPERATION_TYPE_INIT";
    case ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE:
      return "CONTRACT_CODE_HISTORY_OPERATION_TYPE_MIGRATE";
    case ContractCodeHistoryOperationType.CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS:
      return "CONTRACT_CODE_HISTORY_OPERATION_TYPE_GENESIS";
    case ContractCodeHistoryOperationType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
/** AccessTypeParam */
export interface AccessTypeParam {
  value: AccessType;
}
export interface AccessTypeParamProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.AccessTypeParam";
  value: Uint8Array;
}
/** AccessTypeParam */
export interface AccessTypeParamAmino {
  value: AccessType;
}
export interface AccessTypeParamAminoMsg {
  type: "wasm/AccessTypeParam";
  value: AccessTypeParamAmino;
}
/** AccessTypeParam */
export interface AccessTypeParamSDKType {
  value: AccessType;
}
/** AccessConfig access control type. */
export interface AccessConfig {
  permission: AccessType;
  /**
   * Address
   * Deprecated: replaced by addresses
   */
  address: string;
  addresses: string[];
}
export interface AccessConfigProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.AccessConfig";
  value: Uint8Array;
}
/** AccessConfig access control type. */
export interface AccessConfigAmino {
  permission: AccessType;
  /**
   * Address
   * Deprecated: replaced by addresses
   */
  address: string;
  addresses: string[];
}
export interface AccessConfigAminoMsg {
  type: "wasm/AccessConfig";
  value: AccessConfigAmino;
}
/** AccessConfig access control type. */
export interface AccessConfigSDKType {
  permission: AccessType;
  address: string;
  addresses: string[];
}
/** Params defines the set of wasm parameters. */
export interface Params {
  codeUploadAccess?: AccessConfig;
  instantiateDefaultPermission: AccessType;
}
export interface ParamsProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.Params";
  value: Uint8Array;
}
/** Params defines the set of wasm parameters. */
export interface ParamsAmino {
  code_upload_access?: AccessConfigAmino;
  instantiate_default_permission: AccessType;
}
export interface ParamsAminoMsg {
  type: "wasm/Params";
  value: ParamsAmino;
}
/** Params defines the set of wasm parameters. */
export interface ParamsSDKType {
  code_upload_access?: AccessConfigSDKType;
  instantiate_default_permission: AccessType;
}
/** CodeInfo is data for the uploaded contract WASM code */
export interface CodeInfo {
  /** CodeHash is the unique identifier created by wasmvm */
  codeHash: Uint8Array;
  /** Creator address who initially stored the code */
  creator: string;
  /** InstantiateConfig access control to apply on contract creation, optional */
  instantiateConfig?: AccessConfig;
}
export interface CodeInfoProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.CodeInfo";
  value: Uint8Array;
}
/** CodeInfo is data for the uploaded contract WASM code */
export interface CodeInfoAmino {
  /** CodeHash is the unique identifier created by wasmvm */
  code_hash: Uint8Array;
  /** Creator address who initially stored the code */
  creator: string;
  /** InstantiateConfig access control to apply on contract creation, optional */
  instantiate_config?: AccessConfigAmino;
}
export interface CodeInfoAminoMsg {
  type: "wasm/CodeInfo";
  value: CodeInfoAmino;
}
/** CodeInfo is data for the uploaded contract WASM code */
export interface CodeInfoSDKType {
  code_hash: Uint8Array;
  creator: string;
  instantiate_config?: AccessConfigSDKType;
}
/** ContractInfo stores a WASM contract instance */
export interface ContractInfo {
  /** CodeID is the reference to the stored Wasm code */
  codeId: Long;
  /** Creator address who initially instantiated the contract */
  creator: string;
  /** Admin is an optional address that can execute migrations */
  admin: string;
  /** Label is optional metadata to be stored with a contract instance. */
  label: string;
  /** Created Tx position when the contract was instantiated. */
  created?: AbsoluteTxPosition;
  ibcPortId: string;
  /**
   * Extension is an extension point to store custom metadata within the
   * persistence model.
   */
  extension?: Any | undefined;
}
export interface ContractInfoProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.ContractInfo";
  value: Uint8Array;
}
export type ContractInfoEncoded = Omit<ContractInfo, "extension"> & {
  /**
   * Extension is an extension point to store custom metadata within the
   * persistence model.
   */
  extension?: AnyProtoMsg | undefined;
};
/** ContractInfo stores a WASM contract instance */
export interface ContractInfoAmino {
  /** CodeID is the reference to the stored Wasm code */
  code_id: string;
  /** Creator address who initially instantiated the contract */
  creator: string;
  /** Admin is an optional address that can execute migrations */
  admin: string;
  /** Label is optional metadata to be stored with a contract instance. */
  label: string;
  /** Created Tx position when the contract was instantiated. */
  created?: AbsoluteTxPositionAmino;
  ibc_port_id: string;
  /**
   * Extension is an extension point to store custom metadata within the
   * persistence model.
   */
  extension?: AnyAmino;
}
export interface ContractInfoAminoMsg {
  type: "wasm/ContractInfo";
  value: ContractInfoAmino;
}
/** ContractInfo stores a WASM contract instance */
export interface ContractInfoSDKType {
  code_id: Long;
  creator: string;
  admin: string;
  label: string;
  created?: AbsoluteTxPositionSDKType;
  ibc_port_id: string;
  extension?: AnySDKType | undefined;
}
/** ContractCodeHistoryEntry metadata to a contract. */
export interface ContractCodeHistoryEntry {
  operation: ContractCodeHistoryOperationType;
  /** CodeID is the reference to the stored WASM code */
  codeId: Long;
  /** Updated Tx position when the operation was executed. */
  updated?: AbsoluteTxPosition;
  msg: Uint8Array;
}
export interface ContractCodeHistoryEntryProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.ContractCodeHistoryEntry";
  value: Uint8Array;
}
/** ContractCodeHistoryEntry metadata to a contract. */
export interface ContractCodeHistoryEntryAmino {
  operation: ContractCodeHistoryOperationType;
  /** CodeID is the reference to the stored WASM code */
  code_id: string;
  /** Updated Tx position when the operation was executed. */
  updated?: AbsoluteTxPositionAmino;
  msg: Uint8Array;
}
export interface ContractCodeHistoryEntryAminoMsg {
  type: "wasm/ContractCodeHistoryEntry";
  value: ContractCodeHistoryEntryAmino;
}
/** ContractCodeHistoryEntry metadata to a contract. */
export interface ContractCodeHistoryEntrySDKType {
  operation: ContractCodeHistoryOperationType;
  code_id: Long;
  updated?: AbsoluteTxPositionSDKType;
  msg: Uint8Array;
}
/**
 * AbsoluteTxPosition is a unique transaction position that allows for global
 * ordering of transactions.
 */
export interface AbsoluteTxPosition {
  /** BlockHeight is the block the contract was created at */
  blockHeight: Long;
  /**
   * TxIndex is a monotonic counter within the block (actual transaction index,
   * or gas consumed)
   */
  txIndex: Long;
}
export interface AbsoluteTxPositionProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.AbsoluteTxPosition";
  value: Uint8Array;
}
/**
 * AbsoluteTxPosition is a unique transaction position that allows for global
 * ordering of transactions.
 */
export interface AbsoluteTxPositionAmino {
  /** BlockHeight is the block the contract was created at */
  block_height: string;
  /**
   * TxIndex is a monotonic counter within the block (actual transaction index,
   * or gas consumed)
   */
  tx_index: string;
}
export interface AbsoluteTxPositionAminoMsg {
  type: "wasm/AbsoluteTxPosition";
  value: AbsoluteTxPositionAmino;
}
/**
 * AbsoluteTxPosition is a unique transaction position that allows for global
 * ordering of transactions.
 */
export interface AbsoluteTxPositionSDKType {
  block_height: Long;
  tx_index: Long;
}
/** Model is a struct that holds a KV pair */
export interface Model {
  /** hex-encode key to read it better (this is often ascii) */
  key: Uint8Array;
  /** base64-encode raw value */
  value: Uint8Array;
}
export interface ModelProtoMsg {
  typeUrl: "/cosmwasm.wasm.v1.Model";
  value: Uint8Array;
}
/** Model is a struct that holds a KV pair */
export interface ModelAmino {
  /** hex-encode key to read it better (this is often ascii) */
  key: Uint8Array;
  /** base64-encode raw value */
  value: Uint8Array;
}
export interface ModelAminoMsg {
  type: "wasm/Model";
  value: ModelAmino;
}
/** Model is a struct that holds a KV pair */
export interface ModelSDKType {
  key: Uint8Array;
  value: Uint8Array;
}
function createBaseAccessTypeParam(): AccessTypeParam {
  return {
    value: 0,
  };
}
export const AccessTypeParam = {
  typeUrl: "/cosmwasm.wasm.v1.AccessTypeParam",
  encode(
    message: AccessTypeParam,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.value !== 0) {
      writer.uint32(8).int32(message.value);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): AccessTypeParam {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccessTypeParam();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.value = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AccessTypeParam>): AccessTypeParam {
    const message = createBaseAccessTypeParam();
    message.value = object.value ?? 0;
    return message;
  },
  fromAmino(object: AccessTypeParamAmino): AccessTypeParam {
    return {
      value: isSet(object.value) ? accessTypeFromJSON(object.value) : 0,
    };
  },
  toAmino(message: AccessTypeParam): AccessTypeParamAmino {
    const obj: any = {};
    obj.value = message.value;
    return obj;
  },
  fromAminoMsg(object: AccessTypeParamAminoMsg): AccessTypeParam {
    return AccessTypeParam.fromAmino(object.value);
  },
  toAminoMsg(message: AccessTypeParam): AccessTypeParamAminoMsg {
    return {
      type: "wasm/AccessTypeParam",
      value: AccessTypeParam.toAmino(message),
    };
  },
  fromProtoMsg(message: AccessTypeParamProtoMsg): AccessTypeParam {
    return AccessTypeParam.decode(message.value);
  },
  toProto(message: AccessTypeParam): Uint8Array {
    return AccessTypeParam.encode(message).finish();
  },
  toProtoMsg(message: AccessTypeParam): AccessTypeParamProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.AccessTypeParam",
      value: AccessTypeParam.encode(message).finish(),
    };
  },
};
function createBaseAccessConfig(): AccessConfig {
  return {
    permission: 0,
    address: "",
    addresses: [],
  };
}
export const AccessConfig = {
  typeUrl: "/cosmwasm.wasm.v1.AccessConfig",
  encode(
    message: AccessConfig,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.permission !== 0) {
      writer.uint32(8).int32(message.permission);
    }
    if (message.address !== "") {
      writer.uint32(18).string(message.address);
    }
    for (const v of message.addresses) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): AccessConfig {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccessConfig();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.permission = reader.int32() as any;
          break;
        case 2:
          message.address = reader.string();
          break;
        case 3:
          message.addresses.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AccessConfig>): AccessConfig {
    const message = createBaseAccessConfig();
    message.permission = object.permission ?? 0;
    message.address = object.address ?? "";
    message.addresses = object.addresses?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: AccessConfigAmino): AccessConfig {
    return {
      permission: isSet(object.permission)
        ? accessTypeFromJSON(object.permission)
        : 0,
      address: object.address,
      addresses: Array.isArray(object?.addresses)
        ? object.addresses.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: AccessConfig): AccessConfigAmino {
    const obj: any = {};
    obj.permission = message.permission;
    obj.address = message.address;
    if (message.addresses) {
      obj.addresses = message.addresses.map((e) => e);
    } else {
      obj.addresses = [];
    }
    return obj;
  },
  fromAminoMsg(object: AccessConfigAminoMsg): AccessConfig {
    return AccessConfig.fromAmino(object.value);
  },
  toAminoMsg(message: AccessConfig): AccessConfigAminoMsg {
    return {
      type: "wasm/AccessConfig",
      value: AccessConfig.toAmino(message),
    };
  },
  fromProtoMsg(message: AccessConfigProtoMsg): AccessConfig {
    return AccessConfig.decode(message.value);
  },
  toProto(message: AccessConfig): Uint8Array {
    return AccessConfig.encode(message).finish();
  },
  toProtoMsg(message: AccessConfig): AccessConfigProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.AccessConfig",
      value: AccessConfig.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    codeUploadAccess: undefined,
    instantiateDefaultPermission: 0,
  };
}
export const Params = {
  typeUrl: "/cosmwasm.wasm.v1.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.codeUploadAccess !== undefined) {
      AccessConfig.encode(
        message.codeUploadAccess,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.instantiateDefaultPermission !== 0) {
      writer.uint32(16).int32(message.instantiateDefaultPermission);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.codeUploadAccess = AccessConfig.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.instantiateDefaultPermission = reader.int32() as any;
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
    message.codeUploadAccess =
      object.codeUploadAccess !== undefined && object.codeUploadAccess !== null
        ? AccessConfig.fromPartial(object.codeUploadAccess)
        : undefined;
    message.instantiateDefaultPermission =
      object.instantiateDefaultPermission ?? 0;
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      codeUploadAccess: object?.code_upload_access
        ? AccessConfig.fromAmino(object.code_upload_access)
        : undefined,
      instantiateDefaultPermission: isSet(object.instantiate_default_permission)
        ? accessTypeFromJSON(object.instantiate_default_permission)
        : 0,
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.code_upload_access = message.codeUploadAccess
      ? AccessConfig.toAmino(message.codeUploadAccess)
      : undefined;
    obj.instantiate_default_permission = message.instantiateDefaultPermission;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "wasm/Params",
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
      typeUrl: "/cosmwasm.wasm.v1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseCodeInfo(): CodeInfo {
  return {
    codeHash: new Uint8Array(),
    creator: "",
    instantiateConfig: undefined,
  };
}
export const CodeInfo = {
  typeUrl: "/cosmwasm.wasm.v1.CodeInfo",
  encode(
    message: CodeInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.codeHash.length !== 0) {
      writer.uint32(10).bytes(message.codeHash);
    }
    if (message.creator !== "") {
      writer.uint32(18).string(message.creator);
    }
    if (message.instantiateConfig !== undefined) {
      AccessConfig.encode(
        message.instantiateConfig,
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): CodeInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCodeInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.codeHash = reader.bytes();
          break;
        case 2:
          message.creator = reader.string();
          break;
        case 5:
          message.instantiateConfig = AccessConfig.decode(
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
  fromPartial(object: Partial<CodeInfo>): CodeInfo {
    const message = createBaseCodeInfo();
    message.codeHash = object.codeHash ?? new Uint8Array();
    message.creator = object.creator ?? "";
    message.instantiateConfig =
      object.instantiateConfig !== undefined &&
      object.instantiateConfig !== null
        ? AccessConfig.fromPartial(object.instantiateConfig)
        : undefined;
    return message;
  },
  fromAmino(object: CodeInfoAmino): CodeInfo {
    return {
      codeHash: object.code_hash,
      creator: object.creator,
      instantiateConfig: object?.instantiate_config
        ? AccessConfig.fromAmino(object.instantiate_config)
        : undefined,
    };
  },
  toAmino(message: CodeInfo): CodeInfoAmino {
    const obj: any = {};
    obj.code_hash = message.codeHash;
    obj.creator = message.creator;
    obj.instantiate_config = message.instantiateConfig
      ? AccessConfig.toAmino(message.instantiateConfig)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: CodeInfoAminoMsg): CodeInfo {
    return CodeInfo.fromAmino(object.value);
  },
  toAminoMsg(message: CodeInfo): CodeInfoAminoMsg {
    return {
      type: "wasm/CodeInfo",
      value: CodeInfo.toAmino(message),
    };
  },
  fromProtoMsg(message: CodeInfoProtoMsg): CodeInfo {
    return CodeInfo.decode(message.value);
  },
  toProto(message: CodeInfo): Uint8Array {
    return CodeInfo.encode(message).finish();
  },
  toProtoMsg(message: CodeInfo): CodeInfoProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.CodeInfo",
      value: CodeInfo.encode(message).finish(),
    };
  },
};
function createBaseContractInfo(): ContractInfo {
  return {
    codeId: Long.UZERO,
    creator: "",
    admin: "",
    label: "",
    created: undefined,
    ibcPortId: "",
    extension: undefined,
  };
}
export const ContractInfo = {
  typeUrl: "/cosmwasm.wasm.v1.ContractInfo",
  encode(
    message: ContractInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.codeId.isZero()) {
      writer.uint32(8).uint64(message.codeId);
    }
    if (message.creator !== "") {
      writer.uint32(18).string(message.creator);
    }
    if (message.admin !== "") {
      writer.uint32(26).string(message.admin);
    }
    if (message.label !== "") {
      writer.uint32(34).string(message.label);
    }
    if (message.created !== undefined) {
      AbsoluteTxPosition.encode(
        message.created,
        writer.uint32(42).fork()
      ).ldelim();
    }
    if (message.ibcPortId !== "") {
      writer.uint32(50).string(message.ibcPortId);
    }
    if (message.extension !== undefined) {
      Any.encode(message.extension as Any, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ContractInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.codeId = reader.uint64() as Long;
          break;
        case 2:
          message.creator = reader.string();
          break;
        case 3:
          message.admin = reader.string();
          break;
        case 4:
          message.label = reader.string();
          break;
        case 5:
          message.created = AbsoluteTxPosition.decode(reader, reader.uint32());
          break;
        case 6:
          message.ibcPortId = reader.string();
          break;
        case 7:
          message.extension =
            Cosmwasm_wasmv1ContractInfoExtension_InterfaceDecoder(
              reader
            ) as Any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ContractInfo>): ContractInfo {
    const message = createBaseContractInfo();
    message.codeId =
      object.codeId !== undefined && object.codeId !== null
        ? Long.fromValue(object.codeId)
        : Long.UZERO;
    message.creator = object.creator ?? "";
    message.admin = object.admin ?? "";
    message.label = object.label ?? "";
    message.created =
      object.created !== undefined && object.created !== null
        ? AbsoluteTxPosition.fromPartial(object.created)
        : undefined;
    message.ibcPortId = object.ibcPortId ?? "";
    message.extension =
      object.extension !== undefined && object.extension !== null
        ? Any.fromPartial(object.extension)
        : undefined;
    return message;
  },
  fromAmino(object: ContractInfoAmino): ContractInfo {
    return {
      codeId: Long.fromString(object.code_id),
      creator: object.creator,
      admin: object.admin,
      label: object.label,
      created: object?.created
        ? AbsoluteTxPosition.fromAmino(object.created)
        : undefined,
      ibcPortId: object.ibc_port_id,
      extension: object?.extension
        ? Cosmwasm_wasmv1ContractInfoExtension_FromAmino(object.extension)
        : undefined,
    };
  },
  toAmino(message: ContractInfo): ContractInfoAmino {
    const obj: any = {};
    obj.code_id = message.codeId ? message.codeId.toString() : undefined;
    obj.creator = message.creator;
    obj.admin = message.admin;
    obj.label = message.label;
    obj.created = message.created
      ? AbsoluteTxPosition.toAmino(message.created)
      : undefined;
    obj.ibc_port_id = message.ibcPortId;
    obj.extension = message.extension
      ? Cosmwasm_wasmv1ContractInfoExtension_ToAmino(message.extension as Any)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ContractInfoAminoMsg): ContractInfo {
    return ContractInfo.fromAmino(object.value);
  },
  toAminoMsg(message: ContractInfo): ContractInfoAminoMsg {
    return {
      type: "wasm/ContractInfo",
      value: ContractInfo.toAmino(message),
    };
  },
  fromProtoMsg(message: ContractInfoProtoMsg): ContractInfo {
    return ContractInfo.decode(message.value);
  },
  toProto(message: ContractInfo): Uint8Array {
    return ContractInfo.encode(message).finish();
  },
  toProtoMsg(message: ContractInfo): ContractInfoProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.ContractInfo",
      value: ContractInfo.encode(message).finish(),
    };
  },
};
function createBaseContractCodeHistoryEntry(): ContractCodeHistoryEntry {
  return {
    operation: 0,
    codeId: Long.UZERO,
    updated: undefined,
    msg: new Uint8Array(),
  };
}
export const ContractCodeHistoryEntry = {
  typeUrl: "/cosmwasm.wasm.v1.ContractCodeHistoryEntry",
  encode(
    message: ContractCodeHistoryEntry,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.operation !== 0) {
      writer.uint32(8).int32(message.operation);
    }
    if (!message.codeId.isZero()) {
      writer.uint32(16).uint64(message.codeId);
    }
    if (message.updated !== undefined) {
      AbsoluteTxPosition.encode(
        message.updated,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.msg.length !== 0) {
      writer.uint32(34).bytes(message.msg);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ContractCodeHistoryEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractCodeHistoryEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.operation = reader.int32() as any;
          break;
        case 2:
          message.codeId = reader.uint64() as Long;
          break;
        case 3:
          message.updated = AbsoluteTxPosition.decode(reader, reader.uint32());
          break;
        case 4:
          message.msg = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<ContractCodeHistoryEntry>
  ): ContractCodeHistoryEntry {
    const message = createBaseContractCodeHistoryEntry();
    message.operation = object.operation ?? 0;
    message.codeId =
      object.codeId !== undefined && object.codeId !== null
        ? Long.fromValue(object.codeId)
        : Long.UZERO;
    message.updated =
      object.updated !== undefined && object.updated !== null
        ? AbsoluteTxPosition.fromPartial(object.updated)
        : undefined;
    message.msg = object.msg ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ContractCodeHistoryEntryAmino): ContractCodeHistoryEntry {
    return {
      operation: isSet(object.operation)
        ? contractCodeHistoryOperationTypeFromJSON(object.operation)
        : 0,
      codeId: Long.fromString(object.code_id),
      updated: object?.updated
        ? AbsoluteTxPosition.fromAmino(object.updated)
        : undefined,
      msg: toUtf8(JSON.stringify(object.msg)),
    };
  },
  toAmino(message: ContractCodeHistoryEntry): ContractCodeHistoryEntryAmino {
    const obj: any = {};
    obj.operation = message.operation;
    obj.code_id = message.codeId ? message.codeId.toString() : undefined;
    obj.updated = message.updated
      ? AbsoluteTxPosition.toAmino(message.updated)
      : undefined;
    obj.msg = message.msg ? JSON.parse(fromUtf8(message.msg)) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: ContractCodeHistoryEntryAminoMsg
  ): ContractCodeHistoryEntry {
    return ContractCodeHistoryEntry.fromAmino(object.value);
  },
  toAminoMsg(
    message: ContractCodeHistoryEntry
  ): ContractCodeHistoryEntryAminoMsg {
    return {
      type: "wasm/ContractCodeHistoryEntry",
      value: ContractCodeHistoryEntry.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ContractCodeHistoryEntryProtoMsg
  ): ContractCodeHistoryEntry {
    return ContractCodeHistoryEntry.decode(message.value);
  },
  toProto(message: ContractCodeHistoryEntry): Uint8Array {
    return ContractCodeHistoryEntry.encode(message).finish();
  },
  toProtoMsg(
    message: ContractCodeHistoryEntry
  ): ContractCodeHistoryEntryProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.ContractCodeHistoryEntry",
      value: ContractCodeHistoryEntry.encode(message).finish(),
    };
  },
};
function createBaseAbsoluteTxPosition(): AbsoluteTxPosition {
  return {
    blockHeight: Long.UZERO,
    txIndex: Long.UZERO,
  };
}
export const AbsoluteTxPosition = {
  typeUrl: "/cosmwasm.wasm.v1.AbsoluteTxPosition",
  encode(
    message: AbsoluteTxPosition,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.blockHeight.isZero()) {
      writer.uint32(8).uint64(message.blockHeight);
    }
    if (!message.txIndex.isZero()) {
      writer.uint32(16).uint64(message.txIndex);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): AbsoluteTxPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAbsoluteTxPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.blockHeight = reader.uint64() as Long;
          break;
        case 2:
          message.txIndex = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AbsoluteTxPosition>): AbsoluteTxPosition {
    const message = createBaseAbsoluteTxPosition();
    message.blockHeight =
      object.blockHeight !== undefined && object.blockHeight !== null
        ? Long.fromValue(object.blockHeight)
        : Long.UZERO;
    message.txIndex =
      object.txIndex !== undefined && object.txIndex !== null
        ? Long.fromValue(object.txIndex)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: AbsoluteTxPositionAmino): AbsoluteTxPosition {
    return {
      blockHeight: Long.fromString(object.block_height),
      txIndex: Long.fromString(object.tx_index),
    };
  },
  toAmino(message: AbsoluteTxPosition): AbsoluteTxPositionAmino {
    const obj: any = {};
    obj.block_height = message.blockHeight
      ? message.blockHeight.toString()
      : undefined;
    obj.tx_index = message.txIndex ? message.txIndex.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: AbsoluteTxPositionAminoMsg): AbsoluteTxPosition {
    return AbsoluteTxPosition.fromAmino(object.value);
  },
  toAminoMsg(message: AbsoluteTxPosition): AbsoluteTxPositionAminoMsg {
    return {
      type: "wasm/AbsoluteTxPosition",
      value: AbsoluteTxPosition.toAmino(message),
    };
  },
  fromProtoMsg(message: AbsoluteTxPositionProtoMsg): AbsoluteTxPosition {
    return AbsoluteTxPosition.decode(message.value);
  },
  toProto(message: AbsoluteTxPosition): Uint8Array {
    return AbsoluteTxPosition.encode(message).finish();
  },
  toProtoMsg(message: AbsoluteTxPosition): AbsoluteTxPositionProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.AbsoluteTxPosition",
      value: AbsoluteTxPosition.encode(message).finish(),
    };
  },
};
function createBaseModel(): Model {
  return {
    key: new Uint8Array(),
    value: new Uint8Array(),
  };
}
export const Model = {
  typeUrl: "/cosmwasm.wasm.v1.Model",
  encode(message: Model, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key.length !== 0) {
      writer.uint32(10).bytes(message.key);
    }
    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Model {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModel();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.bytes();
          break;
        case 2:
          message.value = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Model>): Model {
    const message = createBaseModel();
    message.key = object.key ?? new Uint8Array();
    message.value = object.value ?? new Uint8Array();
    return message;
  },
  fromAmino(object: ModelAmino): Model {
    return {
      key: object.key,
      value: object.value,
    };
  },
  toAmino(message: Model): ModelAmino {
    const obj: any = {};
    obj.key = message.key;
    obj.value = message.value;
    return obj;
  },
  fromAminoMsg(object: ModelAminoMsg): Model {
    return Model.fromAmino(object.value);
  },
  toAminoMsg(message: Model): ModelAminoMsg {
    return {
      type: "wasm/Model",
      value: Model.toAmino(message),
    };
  },
  fromProtoMsg(message: ModelProtoMsg): Model {
    return Model.decode(message.value);
  },
  toProto(message: Model): Uint8Array {
    return Model.encode(message).finish();
  },
  toProtoMsg(message: Model): ModelProtoMsg {
    return {
      typeUrl: "/cosmwasm.wasm.v1.Model",
      value: Model.encode(message).finish(),
    };
  },
};
export const Cosmwasm_wasmv1ContractInfoExtension_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    default:
      return data;
  }
};
export const Cosmwasm_wasmv1ContractInfoExtension_FromAmino = (
  content: AnyAmino
) => {
  return Any.fromAmino(content);
};
export const Cosmwasm_wasmv1ContractInfoExtension_ToAmino = (content: Any) => {
  return Any.toAmino(content);
};
