//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import { isSet, Long } from "../../helpers";
/**
 * SuperfluidAssetType indicates whether the superfluid asset is
 * a native token itself or the lp share of a pool.
 */
export enum SuperfluidAssetType {
  SuperfluidAssetTypeNative = 0,
  SuperfluidAssetTypeLPShare = 1,
  UNRECOGNIZED = -1,
}
export const SuperfluidAssetTypeSDKType = SuperfluidAssetType;
export const SuperfluidAssetTypeAmino = SuperfluidAssetType;
export function superfluidAssetTypeFromJSON(object: any): SuperfluidAssetType {
  switch (object) {
    case 0:
    case "SuperfluidAssetTypeNative":
      return SuperfluidAssetType.SuperfluidAssetTypeNative;
    case 1:
    case "SuperfluidAssetTypeLPShare":
      return SuperfluidAssetType.SuperfluidAssetTypeLPShare;
    case -1:
    case "UNRECOGNIZED":
    default:
      return SuperfluidAssetType.UNRECOGNIZED;
  }
}
export function superfluidAssetTypeToJSON(object: SuperfluidAssetType): string {
  switch (object) {
    case SuperfluidAssetType.SuperfluidAssetTypeNative:
      return "SuperfluidAssetTypeNative";
    case SuperfluidAssetType.SuperfluidAssetTypeLPShare:
      return "SuperfluidAssetTypeLPShare";
    case SuperfluidAssetType.UNRECOGNIZED:
    default:
      return "UNRECOGNIZED";
  }
}
/** SuperfluidAsset stores the pair of superfluid asset type and denom pair */
export interface SuperfluidAsset {
  denom: string;
  /**
   * AssetType indicates whether the superfluid asset is a native token or an lp
   * share
   */
  assetType: SuperfluidAssetType;
}
export interface SuperfluidAssetProtoMsg {
  typeUrl: "/osmosis.superfluid.SuperfluidAsset";
  value: Uint8Array;
}
/** SuperfluidAsset stores the pair of superfluid asset type and denom pair */
export interface SuperfluidAssetAmino {
  denom: string;
  /**
   * AssetType indicates whether the superfluid asset is a native token or an lp
   * share
   */
  asset_type: SuperfluidAssetType;
}
export interface SuperfluidAssetAminoMsg {
  type: "osmosis/superfluid-asset";
  value: SuperfluidAssetAmino;
}
/** SuperfluidAsset stores the pair of superfluid asset type and denom pair */
export interface SuperfluidAssetSDKType {
  denom: string;
  asset_type: SuperfluidAssetType;
}
/**
 * SuperfluidIntermediaryAccount takes the role of intermediary between LP token
 * and OSMO tokens for superfluid staking. The intermediary account is the
 * actual account responsible for delegation, not the validator account itself.
 */
export interface SuperfluidIntermediaryAccount {
  /** Denom indicates the denom of the superfluid asset. */
  denom: string;
  valAddr: string;
  /** perpetual gauge for rewards distribution */
  gaugeId: Long;
}
export interface SuperfluidIntermediaryAccountProtoMsg {
  typeUrl: "/osmosis.superfluid.SuperfluidIntermediaryAccount";
  value: Uint8Array;
}
/**
 * SuperfluidIntermediaryAccount takes the role of intermediary between LP token
 * and OSMO tokens for superfluid staking. The intermediary account is the
 * actual account responsible for delegation, not the validator account itself.
 */
export interface SuperfluidIntermediaryAccountAmino {
  /** Denom indicates the denom of the superfluid asset. */
  denom: string;
  val_addr: string;
  /** perpetual gauge for rewards distribution */
  gauge_id: string;
}
export interface SuperfluidIntermediaryAccountAminoMsg {
  type: "osmosis/superfluid-intermediary-account";
  value: SuperfluidIntermediaryAccountAmino;
}
/**
 * SuperfluidIntermediaryAccount takes the role of intermediary between LP token
 * and OSMO tokens for superfluid staking. The intermediary account is the
 * actual account responsible for delegation, not the validator account itself.
 */
export interface SuperfluidIntermediaryAccountSDKType {
  denom: string;
  val_addr: string;
  gauge_id: Long;
}
/**
 * The Osmo-Equivalent-Multiplier Record for epoch N refers to the osmo worth we
 * treat an LP share as having, for all of epoch N. Eventually this is intended
 * to be set as the Time-weighted-average-osmo-backing for the entire duration
 * of epoch N-1. (Thereby locking whats in use for epoch N as based on the prior
 * epochs rewards) However for now, this is not the TWAP but instead the spot
 * price at the boundary. For different types of assets in the future, it could
 * change.
 */
export interface OsmoEquivalentMultiplierRecord {
  epochNumber: Long;
  /** superfluid asset denom, can be LP token or native token */
  denom: string;
  multiplier: string;
}
export interface OsmoEquivalentMultiplierRecordProtoMsg {
  typeUrl: "/osmosis.superfluid.OsmoEquivalentMultiplierRecord";
  value: Uint8Array;
}
/**
 * The Osmo-Equivalent-Multiplier Record for epoch N refers to the osmo worth we
 * treat an LP share as having, for all of epoch N. Eventually this is intended
 * to be set as the Time-weighted-average-osmo-backing for the entire duration
 * of epoch N-1. (Thereby locking whats in use for epoch N as based on the prior
 * epochs rewards) However for now, this is not the TWAP but instead the spot
 * price at the boundary. For different types of assets in the future, it could
 * change.
 */
export interface OsmoEquivalentMultiplierRecordAmino {
  epoch_number: string;
  /** superfluid asset denom, can be LP token or native token */
  denom: string;
  multiplier: string;
}
export interface OsmoEquivalentMultiplierRecordAminoMsg {
  type: "osmosis/osmo-equivalent-multiplier-record";
  value: OsmoEquivalentMultiplierRecordAmino;
}
/**
 * The Osmo-Equivalent-Multiplier Record for epoch N refers to the osmo worth we
 * treat an LP share as having, for all of epoch N. Eventually this is intended
 * to be set as the Time-weighted-average-osmo-backing for the entire duration
 * of epoch N-1. (Thereby locking whats in use for epoch N as based on the prior
 * epochs rewards) However for now, this is not the TWAP but instead the spot
 * price at the boundary. For different types of assets in the future, it could
 * change.
 */
export interface OsmoEquivalentMultiplierRecordSDKType {
  epoch_number: Long;
  denom: string;
  multiplier: string;
}
/**
 * SuperfluidDelegationRecord is a struct used to indicate superfluid
 * delegations of an account in the state machine in a user friendly form.
 */
export interface SuperfluidDelegationRecord {
  delegatorAddress: string;
  validatorAddress: string;
  delegationAmount?: Coin;
  equivalentStakedAmount?: Coin;
}
export interface SuperfluidDelegationRecordProtoMsg {
  typeUrl: "/osmosis.superfluid.SuperfluidDelegationRecord";
  value: Uint8Array;
}
/**
 * SuperfluidDelegationRecord is a struct used to indicate superfluid
 * delegations of an account in the state machine in a user friendly form.
 */
export interface SuperfluidDelegationRecordAmino {
  delegator_address: string;
  validator_address: string;
  delegation_amount?: CoinAmino;
  equivalent_staked_amount?: CoinAmino;
}
export interface SuperfluidDelegationRecordAminoMsg {
  type: "osmosis/superfluid-delegation-record";
  value: SuperfluidDelegationRecordAmino;
}
/**
 * SuperfluidDelegationRecord is a struct used to indicate superfluid
 * delegations of an account in the state machine in a user friendly form.
 */
export interface SuperfluidDelegationRecordSDKType {
  delegator_address: string;
  validator_address: string;
  delegation_amount?: CoinSDKType;
  equivalent_staked_amount?: CoinSDKType;
}
/**
 * LockIdIntermediaryAccountConnection is a struct used to indicate the
 * relationship between the underlying lock id and superfluid delegation done
 * via lp shares.
 */
export interface LockIdIntermediaryAccountConnection {
  lockId: Long;
  intermediaryAccount: string;
}
export interface LockIdIntermediaryAccountConnectionProtoMsg {
  typeUrl: "/osmosis.superfluid.LockIdIntermediaryAccountConnection";
  value: Uint8Array;
}
/**
 * LockIdIntermediaryAccountConnection is a struct used to indicate the
 * relationship between the underlying lock id and superfluid delegation done
 * via lp shares.
 */
export interface LockIdIntermediaryAccountConnectionAmino {
  lock_id: string;
  intermediary_account: string;
}
export interface LockIdIntermediaryAccountConnectionAminoMsg {
  type: "osmosis/lock-id-intermediary-account-connection";
  value: LockIdIntermediaryAccountConnectionAmino;
}
/**
 * LockIdIntermediaryAccountConnection is a struct used to indicate the
 * relationship between the underlying lock id and superfluid delegation done
 * via lp shares.
 */
export interface LockIdIntermediaryAccountConnectionSDKType {
  lock_id: Long;
  intermediary_account: string;
}
export interface UnpoolWhitelistedPools {
  ids: Long[];
}
export interface UnpoolWhitelistedPoolsProtoMsg {
  typeUrl: "/osmosis.superfluid.UnpoolWhitelistedPools";
  value: Uint8Array;
}
export interface UnpoolWhitelistedPoolsAmino {
  ids: string[];
}
export interface UnpoolWhitelistedPoolsAminoMsg {
  type: "osmosis/unpool-whitelisted-pools";
  value: UnpoolWhitelistedPoolsAmino;
}
export interface UnpoolWhitelistedPoolsSDKType {
  ids: Long[];
}
function createBaseSuperfluidAsset(): SuperfluidAsset {
  return {
    denom: "",
    assetType: 0,
  };
}
export const SuperfluidAsset = {
  typeUrl: "/osmosis.superfluid.SuperfluidAsset",
  encode(
    message: SuperfluidAsset,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.assetType !== 0) {
      writer.uint32(16).int32(message.assetType);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): SuperfluidAsset {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSuperfluidAsset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        case 2:
          message.assetType = reader.int32() as any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SuperfluidAsset>): SuperfluidAsset {
    const message = createBaseSuperfluidAsset();
    message.denom = object.denom ?? "";
    message.assetType = object.assetType ?? 0;
    return message;
  },
  fromAmino(object: SuperfluidAssetAmino): SuperfluidAsset {
    return {
      denom: object.denom,
      assetType: isSet(object.asset_type)
        ? superfluidAssetTypeFromJSON(object.asset_type)
        : 0,
    };
  },
  toAmino(message: SuperfluidAsset): SuperfluidAssetAmino {
    const obj: any = {};
    obj.denom = message.denom;
    obj.asset_type = message.assetType;
    return obj;
  },
  fromAminoMsg(object: SuperfluidAssetAminoMsg): SuperfluidAsset {
    return SuperfluidAsset.fromAmino(object.value);
  },
  toAminoMsg(message: SuperfluidAsset): SuperfluidAssetAminoMsg {
    return {
      type: "osmosis/superfluid-asset",
      value: SuperfluidAsset.toAmino(message),
    };
  },
  fromProtoMsg(message: SuperfluidAssetProtoMsg): SuperfluidAsset {
    return SuperfluidAsset.decode(message.value);
  },
  toProto(message: SuperfluidAsset): Uint8Array {
    return SuperfluidAsset.encode(message).finish();
  },
  toProtoMsg(message: SuperfluidAsset): SuperfluidAssetProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.SuperfluidAsset",
      value: SuperfluidAsset.encode(message).finish(),
    };
  },
};
function createBaseSuperfluidIntermediaryAccount(): SuperfluidIntermediaryAccount {
  return {
    denom: "",
    valAddr: "",
    gaugeId: Long.UZERO,
  };
}
export const SuperfluidIntermediaryAccount = {
  typeUrl: "/osmosis.superfluid.SuperfluidIntermediaryAccount",
  encode(
    message: SuperfluidIntermediaryAccount,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.valAddr !== "") {
      writer.uint32(18).string(message.valAddr);
    }
    if (!message.gaugeId.isZero()) {
      writer.uint32(24).uint64(message.gaugeId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): SuperfluidIntermediaryAccount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSuperfluidIntermediaryAccount();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        case 2:
          message.valAddr = reader.string();
          break;
        case 3:
          message.gaugeId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<SuperfluidIntermediaryAccount>
  ): SuperfluidIntermediaryAccount {
    const message = createBaseSuperfluidIntermediaryAccount();
    message.denom = object.denom ?? "";
    message.valAddr = object.valAddr ?? "";
    message.gaugeId =
      object.gaugeId !== undefined && object.gaugeId !== null
        ? Long.fromValue(object.gaugeId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: SuperfluidIntermediaryAccountAmino
  ): SuperfluidIntermediaryAccount {
    return {
      denom: object.denom,
      valAddr: object.val_addr,
      gaugeId: Long.fromString(object.gauge_id),
    };
  },
  toAmino(
    message: SuperfluidIntermediaryAccount
  ): SuperfluidIntermediaryAccountAmino {
    const obj: any = {};
    obj.denom = message.denom;
    obj.val_addr = message.valAddr;
    obj.gauge_id = message.gaugeId ? message.gaugeId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: SuperfluidIntermediaryAccountAminoMsg
  ): SuperfluidIntermediaryAccount {
    return SuperfluidIntermediaryAccount.fromAmino(object.value);
  },
  toAminoMsg(
    message: SuperfluidIntermediaryAccount
  ): SuperfluidIntermediaryAccountAminoMsg {
    return {
      type: "osmosis/superfluid-intermediary-account",
      value: SuperfluidIntermediaryAccount.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SuperfluidIntermediaryAccountProtoMsg
  ): SuperfluidIntermediaryAccount {
    return SuperfluidIntermediaryAccount.decode(message.value);
  },
  toProto(message: SuperfluidIntermediaryAccount): Uint8Array {
    return SuperfluidIntermediaryAccount.encode(message).finish();
  },
  toProtoMsg(
    message: SuperfluidIntermediaryAccount
  ): SuperfluidIntermediaryAccountProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.SuperfluidIntermediaryAccount",
      value: SuperfluidIntermediaryAccount.encode(message).finish(),
    };
  },
};
function createBaseOsmoEquivalentMultiplierRecord(): OsmoEquivalentMultiplierRecord {
  return {
    epochNumber: Long.ZERO,
    denom: "",
    multiplier: "",
  };
}
export const OsmoEquivalentMultiplierRecord = {
  typeUrl: "/osmosis.superfluid.OsmoEquivalentMultiplierRecord",
  encode(
    message: OsmoEquivalentMultiplierRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.epochNumber.isZero()) {
      writer.uint32(8).int64(message.epochNumber);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    if (message.multiplier !== "") {
      writer.uint32(26).string(message.multiplier);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): OsmoEquivalentMultiplierRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOsmoEquivalentMultiplierRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.int64() as Long;
          break;
        case 2:
          message.denom = reader.string();
          break;
        case 3:
          message.multiplier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<OsmoEquivalentMultiplierRecord>
  ): OsmoEquivalentMultiplierRecord {
    const message = createBaseOsmoEquivalentMultiplierRecord();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? Long.fromValue(object.epochNumber)
        : Long.ZERO;
    message.denom = object.denom ?? "";
    message.multiplier = object.multiplier ?? "";
    return message;
  },
  fromAmino(
    object: OsmoEquivalentMultiplierRecordAmino
  ): OsmoEquivalentMultiplierRecord {
    return {
      epochNumber: Long.fromString(object.epoch_number),
      denom: object.denom,
      multiplier: object.multiplier,
    };
  },
  toAmino(
    message: OsmoEquivalentMultiplierRecord
  ): OsmoEquivalentMultiplierRecordAmino {
    const obj: any = {};
    obj.epoch_number = message.epochNumber
      ? message.epochNumber.toString()
      : undefined;
    obj.denom = message.denom;
    obj.multiplier = message.multiplier;
    return obj;
  },
  fromAminoMsg(
    object: OsmoEquivalentMultiplierRecordAminoMsg
  ): OsmoEquivalentMultiplierRecord {
    return OsmoEquivalentMultiplierRecord.fromAmino(object.value);
  },
  toAminoMsg(
    message: OsmoEquivalentMultiplierRecord
  ): OsmoEquivalentMultiplierRecordAminoMsg {
    return {
      type: "osmosis/osmo-equivalent-multiplier-record",
      value: OsmoEquivalentMultiplierRecord.toAmino(message),
    };
  },
  fromProtoMsg(
    message: OsmoEquivalentMultiplierRecordProtoMsg
  ): OsmoEquivalentMultiplierRecord {
    return OsmoEquivalentMultiplierRecord.decode(message.value);
  },
  toProto(message: OsmoEquivalentMultiplierRecord): Uint8Array {
    return OsmoEquivalentMultiplierRecord.encode(message).finish();
  },
  toProtoMsg(
    message: OsmoEquivalentMultiplierRecord
  ): OsmoEquivalentMultiplierRecordProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.OsmoEquivalentMultiplierRecord",
      value: OsmoEquivalentMultiplierRecord.encode(message).finish(),
    };
  },
};
function createBaseSuperfluidDelegationRecord(): SuperfluidDelegationRecord {
  return {
    delegatorAddress: "",
    validatorAddress: "",
    delegationAmount: undefined,
    equivalentStakedAmount: undefined,
  };
}
export const SuperfluidDelegationRecord = {
  typeUrl: "/osmosis.superfluid.SuperfluidDelegationRecord",
  encode(
    message: SuperfluidDelegationRecord,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.delegatorAddress !== "") {
      writer.uint32(10).string(message.delegatorAddress);
    }
    if (message.validatorAddress !== "") {
      writer.uint32(18).string(message.validatorAddress);
    }
    if (message.delegationAmount !== undefined) {
      Coin.encode(message.delegationAmount, writer.uint32(26).fork()).ldelim();
    }
    if (message.equivalentStakedAmount !== undefined) {
      Coin.encode(
        message.equivalentStakedAmount,
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): SuperfluidDelegationRecord {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSuperfluidDelegationRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.delegatorAddress = reader.string();
          break;
        case 2:
          message.validatorAddress = reader.string();
          break;
        case 3:
          message.delegationAmount = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.equivalentStakedAmount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<SuperfluidDelegationRecord>
  ): SuperfluidDelegationRecord {
    const message = createBaseSuperfluidDelegationRecord();
    message.delegatorAddress = object.delegatorAddress ?? "";
    message.validatorAddress = object.validatorAddress ?? "";
    message.delegationAmount =
      object.delegationAmount !== undefined && object.delegationAmount !== null
        ? Coin.fromPartial(object.delegationAmount)
        : undefined;
    message.equivalentStakedAmount =
      object.equivalentStakedAmount !== undefined &&
      object.equivalentStakedAmount !== null
        ? Coin.fromPartial(object.equivalentStakedAmount)
        : undefined;
    return message;
  },
  fromAmino(
    object: SuperfluidDelegationRecordAmino
  ): SuperfluidDelegationRecord {
    return {
      delegatorAddress: object.delegator_address,
      validatorAddress: object.validator_address,
      delegationAmount: object?.delegation_amount
        ? Coin.fromAmino(object.delegation_amount)
        : undefined,
      equivalentStakedAmount: object?.equivalent_staked_amount
        ? Coin.fromAmino(object.equivalent_staked_amount)
        : undefined,
    };
  },
  toAmino(
    message: SuperfluidDelegationRecord
  ): SuperfluidDelegationRecordAmino {
    const obj: any = {};
    obj.delegator_address = message.delegatorAddress;
    obj.validator_address = message.validatorAddress;
    obj.delegation_amount = message.delegationAmount
      ? Coin.toAmino(message.delegationAmount)
      : undefined;
    obj.equivalent_staked_amount = message.equivalentStakedAmount
      ? Coin.toAmino(message.equivalentStakedAmount)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: SuperfluidDelegationRecordAminoMsg
  ): SuperfluidDelegationRecord {
    return SuperfluidDelegationRecord.fromAmino(object.value);
  },
  toAminoMsg(
    message: SuperfluidDelegationRecord
  ): SuperfluidDelegationRecordAminoMsg {
    return {
      type: "osmosis/superfluid-delegation-record",
      value: SuperfluidDelegationRecord.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SuperfluidDelegationRecordProtoMsg
  ): SuperfluidDelegationRecord {
    return SuperfluidDelegationRecord.decode(message.value);
  },
  toProto(message: SuperfluidDelegationRecord): Uint8Array {
    return SuperfluidDelegationRecord.encode(message).finish();
  },
  toProtoMsg(
    message: SuperfluidDelegationRecord
  ): SuperfluidDelegationRecordProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.SuperfluidDelegationRecord",
      value: SuperfluidDelegationRecord.encode(message).finish(),
    };
  },
};
function createBaseLockIdIntermediaryAccountConnection(): LockIdIntermediaryAccountConnection {
  return {
    lockId: Long.UZERO,
    intermediaryAccount: "",
  };
}
export const LockIdIntermediaryAccountConnection = {
  typeUrl: "/osmosis.superfluid.LockIdIntermediaryAccountConnection",
  encode(
    message: LockIdIntermediaryAccountConnection,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.lockId.isZero()) {
      writer.uint32(8).uint64(message.lockId);
    }
    if (message.intermediaryAccount !== "") {
      writer.uint32(18).string(message.intermediaryAccount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): LockIdIntermediaryAccountConnection {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLockIdIntermediaryAccountConnection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lockId = reader.uint64() as Long;
          break;
        case 2:
          message.intermediaryAccount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<LockIdIntermediaryAccountConnection>
  ): LockIdIntermediaryAccountConnection {
    const message = createBaseLockIdIntermediaryAccountConnection();
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    message.intermediaryAccount = object.intermediaryAccount ?? "";
    return message;
  },
  fromAmino(
    object: LockIdIntermediaryAccountConnectionAmino
  ): LockIdIntermediaryAccountConnection {
    return {
      lockId: Long.fromString(object.lock_id),
      intermediaryAccount: object.intermediary_account,
    };
  },
  toAmino(
    message: LockIdIntermediaryAccountConnection
  ): LockIdIntermediaryAccountConnectionAmino {
    const obj: any = {};
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    obj.intermediary_account = message.intermediaryAccount;
    return obj;
  },
  fromAminoMsg(
    object: LockIdIntermediaryAccountConnectionAminoMsg
  ): LockIdIntermediaryAccountConnection {
    return LockIdIntermediaryAccountConnection.fromAmino(object.value);
  },
  toAminoMsg(
    message: LockIdIntermediaryAccountConnection
  ): LockIdIntermediaryAccountConnectionAminoMsg {
    return {
      type: "osmosis/lock-id-intermediary-account-connection",
      value: LockIdIntermediaryAccountConnection.toAmino(message),
    };
  },
  fromProtoMsg(
    message: LockIdIntermediaryAccountConnectionProtoMsg
  ): LockIdIntermediaryAccountConnection {
    return LockIdIntermediaryAccountConnection.decode(message.value);
  },
  toProto(message: LockIdIntermediaryAccountConnection): Uint8Array {
    return LockIdIntermediaryAccountConnection.encode(message).finish();
  },
  toProtoMsg(
    message: LockIdIntermediaryAccountConnection
  ): LockIdIntermediaryAccountConnectionProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.LockIdIntermediaryAccountConnection",
      value: LockIdIntermediaryAccountConnection.encode(message).finish(),
    };
  },
};
function createBaseUnpoolWhitelistedPools(): UnpoolWhitelistedPools {
  return {
    ids: [],
  };
}
export const UnpoolWhitelistedPools = {
  typeUrl: "/osmosis.superfluid.UnpoolWhitelistedPools",
  encode(
    message: UnpoolWhitelistedPools,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UnpoolWhitelistedPools {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnpoolWhitelistedPools();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint64() as Long);
            }
          } else {
            message.ids.push(reader.uint64() as Long);
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<UnpoolWhitelistedPools>): UnpoolWhitelistedPools {
    const message = createBaseUnpoolWhitelistedPools();
    message.ids = object.ids?.map((e) => Long.fromValue(e)) || [];
    return message;
  },
  fromAmino(object: UnpoolWhitelistedPoolsAmino): UnpoolWhitelistedPools {
    return {
      ids: Array.isArray(object?.ids) ? object.ids.map((e: any) => e) : [],
    };
  },
  toAmino(message: UnpoolWhitelistedPools): UnpoolWhitelistedPoolsAmino {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => e);
    } else {
      obj.ids = [];
    }
    return obj;
  },
  fromAminoMsg(object: UnpoolWhitelistedPoolsAminoMsg): UnpoolWhitelistedPools {
    return UnpoolWhitelistedPools.fromAmino(object.value);
  },
  toAminoMsg(message: UnpoolWhitelistedPools): UnpoolWhitelistedPoolsAminoMsg {
    return {
      type: "osmosis/unpool-whitelisted-pools",
      value: UnpoolWhitelistedPools.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UnpoolWhitelistedPoolsProtoMsg
  ): UnpoolWhitelistedPools {
    return UnpoolWhitelistedPools.decode(message.value);
  },
  toProto(message: UnpoolWhitelistedPools): Uint8Array {
    return UnpoolWhitelistedPools.encode(message).finish();
  },
  toProtoMsg(message: UnpoolWhitelistedPools): UnpoolWhitelistedPoolsProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.UnpoolWhitelistedPools",
      value: UnpoolWhitelistedPools.encode(message).finish(),
    };
  },
};
