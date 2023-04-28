//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Any, AnyAmino, AnySDKType } from "../../../google/protobuf/any";
import { Long } from "../../../helpers";
/**
 * BaseAccount defines a base account type. It contains all the necessary fields
 * for basic account functionality. Any custom account type should extend this
 * type for additional functionality (e.g. vesting).
 */
export interface BaseAccount {
  $typeUrl?: string;
  address: string;
  pubKey?: Any;
  accountNumber: Long;
  sequence: Long;
}
export interface BaseAccountProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.BaseAccount";
  value: Uint8Array;
}
/**
 * BaseAccount defines a base account type. It contains all the necessary fields
 * for basic account functionality. Any custom account type should extend this
 * type for additional functionality (e.g. vesting).
 */
export interface BaseAccountAmino {
  address: string;
  pub_key?: AnyAmino;
  account_number: string;
  sequence: string;
}
export interface BaseAccountAminoMsg {
  type: "cosmos-sdk/BaseAccount";
  value: BaseAccountAmino;
}
/**
 * BaseAccount defines a base account type. It contains all the necessary fields
 * for basic account functionality. Any custom account type should extend this
 * type for additional functionality (e.g. vesting).
 */
export interface BaseAccountSDKType {
  $typeUrl?: string;
  address: string;
  pub_key?: AnySDKType;
  account_number: Long;
  sequence: Long;
}
/** ModuleAccount defines an account for modules that holds coins on a pool. */
export interface ModuleAccount {
  $typeUrl?: string;
  baseAccount?: BaseAccount;
  name: string;
  permissions: string[];
}
export interface ModuleAccountProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.ModuleAccount";
  value: Uint8Array;
}
/** ModuleAccount defines an account for modules that holds coins on a pool. */
export interface ModuleAccountAmino {
  base_account?: BaseAccountAmino;
  name: string;
  permissions: string[];
}
export interface ModuleAccountAminoMsg {
  type: "cosmos-sdk/ModuleAccount";
  value: ModuleAccountAmino;
}
/** ModuleAccount defines an account for modules that holds coins on a pool. */
export interface ModuleAccountSDKType {
  $typeUrl?: string;
  base_account?: BaseAccountSDKType;
  name: string;
  permissions: string[];
}
/** Params defines the parameters for the auth module. */
export interface Params {
  maxMemoCharacters: Long;
  txSigLimit: Long;
  txSizeCostPerByte: Long;
  sigVerifyCostEd25519: Long;
  sigVerifyCostSecp256k1: Long;
}
export interface ParamsProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.Params";
  value: Uint8Array;
}
/** Params defines the parameters for the auth module. */
export interface ParamsAmino {
  max_memo_characters: string;
  tx_sig_limit: string;
  tx_size_cost_per_byte: string;
  sig_verify_cost_ed25519: string;
  sig_verify_cost_secp256k1: string;
}
export interface ParamsAminoMsg {
  type: "cosmos-sdk/Params";
  value: ParamsAmino;
}
/** Params defines the parameters for the auth module. */
export interface ParamsSDKType {
  max_memo_characters: Long;
  tx_sig_limit: Long;
  tx_size_cost_per_byte: Long;
  sig_verify_cost_ed25519: Long;
  sig_verify_cost_secp256k1: Long;
}
function createBaseBaseAccount(): BaseAccount {
  return {
    $typeUrl: "/cosmos.auth.v1beta1.BaseAccount",
    address: "",
    pubKey: undefined,
    accountNumber: Long.UZERO,
    sequence: Long.UZERO,
  };
}
export const BaseAccount = {
  typeUrl: "/cosmos.auth.v1beta1.BaseAccount",
  encode(
    message: BaseAccount,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.pubKey !== undefined) {
      Any.encode(message.pubKey, writer.uint32(18).fork()).ldelim();
    }
    if (!message.accountNumber.isZero()) {
      writer.uint32(24).uint64(message.accountNumber);
    }
    if (!message.sequence.isZero()) {
      writer.uint32(32).uint64(message.sequence);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): BaseAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBaseAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.pubKey = Any.decode(reader, reader.uint32());
          break;
        case 3:
          message.accountNumber = reader.uint64() as Long;
          break;
        case 4:
          message.sequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<BaseAccount>): BaseAccount {
    const message = createBaseBaseAccount();
    message.address = object.address ?? "";
    message.pubKey =
      object.pubKey !== undefined && object.pubKey !== null
        ? Any.fromPartial(object.pubKey)
        : undefined;
    message.accountNumber =
      object.accountNumber !== undefined && object.accountNumber !== null
        ? Long.fromValue(object.accountNumber)
        : Long.UZERO;
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? Long.fromValue(object.sequence)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: BaseAccountAmino): BaseAccount {
    return {
      address: object.address,
      pubKey: object?.pub_key ? Any.fromAmino(object.pub_key) : undefined,
      accountNumber: Long.fromString(object.account_number),
      sequence: Long.fromString(object.sequence),
    };
  },
  toAmino(message: BaseAccount): BaseAccountAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.pub_key = message.pubKey ? Any.toAmino(message.pubKey) : undefined;
    obj.account_number = message.accountNumber
      ? message.accountNumber.toString()
      : undefined;
    obj.sequence = message.sequence ? message.sequence.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: BaseAccountAminoMsg): BaseAccount {
    return BaseAccount.fromAmino(object.value);
  },
  toAminoMsg(message: BaseAccount): BaseAccountAminoMsg {
    return {
      type: "cosmos-sdk/BaseAccount",
      value: BaseAccount.toAmino(message),
    };
  },
  fromProtoMsg(message: BaseAccountProtoMsg): BaseAccount {
    return BaseAccount.decode(message.value);
  },
  toProto(message: BaseAccount): Uint8Array {
    return BaseAccount.encode(message).finish();
  },
  toProtoMsg(message: BaseAccount): BaseAccountProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.BaseAccount",
      value: BaseAccount.encode(message).finish(),
    };
  },
};
function createBaseModuleAccount(): ModuleAccount {
  return {
    $typeUrl: "/cosmos.auth.v1beta1.ModuleAccount",
    baseAccount: undefined,
    name: "",
    permissions: [],
  };
}
export const ModuleAccount = {
  typeUrl: "/cosmos.auth.v1beta1.ModuleAccount",
  encode(
    message: ModuleAccount,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.baseAccount !== undefined) {
      BaseAccount.encode(
        message.baseAccount,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    for (const v of message.permissions) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ModuleAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModuleAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseAccount = BaseAccount.decode(reader, reader.uint32());
          break;
        case 2:
          message.name = reader.string();
          break;
        case 3:
          message.permissions.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ModuleAccount>): ModuleAccount {
    const message = createBaseModuleAccount();
    message.baseAccount =
      object.baseAccount !== undefined && object.baseAccount !== null
        ? BaseAccount.fromPartial(object.baseAccount)
        : undefined;
    message.name = object.name ?? "";
    message.permissions = object.permissions?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ModuleAccountAmino): ModuleAccount {
    return {
      baseAccount: object?.base_account
        ? BaseAccount.fromAmino(object.base_account)
        : undefined,
      name: object.name,
      permissions: Array.isArray(object?.permissions)
        ? object.permissions.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: ModuleAccount): ModuleAccountAmino {
    const obj: any = {};
    obj.base_account = message.baseAccount
      ? BaseAccount.toAmino(message.baseAccount)
      : undefined;
    obj.name = message.name;
    if (message.permissions) {
      obj.permissions = message.permissions.map((e) => e);
    } else {
      obj.permissions = [];
    }
    return obj;
  },
  fromAminoMsg(object: ModuleAccountAminoMsg): ModuleAccount {
    return ModuleAccount.fromAmino(object.value);
  },
  toAminoMsg(message: ModuleAccount): ModuleAccountAminoMsg {
    return {
      type: "cosmos-sdk/ModuleAccount",
      value: ModuleAccount.toAmino(message),
    };
  },
  fromProtoMsg(message: ModuleAccountProtoMsg): ModuleAccount {
    return ModuleAccount.decode(message.value);
  },
  toProto(message: ModuleAccount): Uint8Array {
    return ModuleAccount.encode(message).finish();
  },
  toProtoMsg(message: ModuleAccount): ModuleAccountProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.ModuleAccount",
      value: ModuleAccount.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    maxMemoCharacters: Long.UZERO,
    txSigLimit: Long.UZERO,
    txSizeCostPerByte: Long.UZERO,
    sigVerifyCostEd25519: Long.UZERO,
    sigVerifyCostSecp256k1: Long.UZERO,
  };
}
export const Params = {
  typeUrl: "/cosmos.auth.v1beta1.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.maxMemoCharacters.isZero()) {
      writer.uint32(8).uint64(message.maxMemoCharacters);
    }
    if (!message.txSigLimit.isZero()) {
      writer.uint32(16).uint64(message.txSigLimit);
    }
    if (!message.txSizeCostPerByte.isZero()) {
      writer.uint32(24).uint64(message.txSizeCostPerByte);
    }
    if (!message.sigVerifyCostEd25519.isZero()) {
      writer.uint32(32).uint64(message.sigVerifyCostEd25519);
    }
    if (!message.sigVerifyCostSecp256k1.isZero()) {
      writer.uint32(40).uint64(message.sigVerifyCostSecp256k1);
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
          message.maxMemoCharacters = reader.uint64() as Long;
          break;
        case 2:
          message.txSigLimit = reader.uint64() as Long;
          break;
        case 3:
          message.txSizeCostPerByte = reader.uint64() as Long;
          break;
        case 4:
          message.sigVerifyCostEd25519 = reader.uint64() as Long;
          break;
        case 5:
          message.sigVerifyCostSecp256k1 = reader.uint64() as Long;
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
    message.maxMemoCharacters =
      object.maxMemoCharacters !== undefined &&
      object.maxMemoCharacters !== null
        ? Long.fromValue(object.maxMemoCharacters)
        : Long.UZERO;
    message.txSigLimit =
      object.txSigLimit !== undefined && object.txSigLimit !== null
        ? Long.fromValue(object.txSigLimit)
        : Long.UZERO;
    message.txSizeCostPerByte =
      object.txSizeCostPerByte !== undefined &&
      object.txSizeCostPerByte !== null
        ? Long.fromValue(object.txSizeCostPerByte)
        : Long.UZERO;
    message.sigVerifyCostEd25519 =
      object.sigVerifyCostEd25519 !== undefined &&
      object.sigVerifyCostEd25519 !== null
        ? Long.fromValue(object.sigVerifyCostEd25519)
        : Long.UZERO;
    message.sigVerifyCostSecp256k1 =
      object.sigVerifyCostSecp256k1 !== undefined &&
      object.sigVerifyCostSecp256k1 !== null
        ? Long.fromValue(object.sigVerifyCostSecp256k1)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      maxMemoCharacters: Long.fromString(object.max_memo_characters),
      txSigLimit: Long.fromString(object.tx_sig_limit),
      txSizeCostPerByte: Long.fromString(object.tx_size_cost_per_byte),
      sigVerifyCostEd25519: Long.fromString(object.sig_verify_cost_ed25519),
      sigVerifyCostSecp256k1: Long.fromString(object.sig_verify_cost_secp256k1),
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.max_memo_characters = message.maxMemoCharacters
      ? message.maxMemoCharacters.toString()
      : undefined;
    obj.tx_sig_limit = message.txSigLimit
      ? message.txSigLimit.toString()
      : undefined;
    obj.tx_size_cost_per_byte = message.txSizeCostPerByte
      ? message.txSizeCostPerByte.toString()
      : undefined;
    obj.sig_verify_cost_ed25519 = message.sigVerifyCostEd25519
      ? message.sigVerifyCostEd25519.toString()
      : undefined;
    obj.sig_verify_cost_secp256k1 = message.sigVerifyCostSecp256k1
      ? message.sigVerifyCostSecp256k1.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "cosmos-sdk/Params",
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
      typeUrl: "/cosmos.auth.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
