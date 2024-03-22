//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../binary";
import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import {
  SyntheticLock,
  SyntheticLockAmino,
  SyntheticLockSDKType,
} from "../lockup/lock";
/**
 * SuperfluidAssetType indicates whether the superfluid asset is
 * a native token, lp share of a pool, or concentrated share of a pool
 */
export enum SuperfluidAssetType {
  SuperfluidAssetTypeNative = 0,
  SuperfluidAssetTypeLPShare = 1,
  SuperfluidAssetTypeConcentratedShare = 2,
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
    case 2:
    case "SuperfluidAssetTypeConcentratedShare":
      return SuperfluidAssetType.SuperfluidAssetTypeConcentratedShare;
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
    case SuperfluidAssetType.SuperfluidAssetTypeConcentratedShare:
      return "SuperfluidAssetTypeConcentratedShare";
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
  denom?: string;
  /**
   * AssetType indicates whether the superfluid asset is a native token or an lp
   * share
   */
  asset_type?: SuperfluidAssetType;
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
  gaugeId: bigint;
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
  denom?: string;
  val_addr?: string;
  /** perpetual gauge for rewards distribution */
  gauge_id?: string;
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
  gauge_id: bigint;
}
/**
 * The Osmo-Equivalent-Multiplier Record for epoch N refers to the osmo worth we
 * treat an LP share as having, for all of epoch N. Eventually this is intended
 * to be set as the Time-weighted-average-osmo-backing for the entire duration
 * of epoch N-1. (Thereby locking what's in use for epoch N as based on the
 * prior epochs rewards) However for now, this is not the TWAP but instead the
 * spot price at the boundary. For different types of assets in the future, it
 * could change.
 */
export interface OsmoEquivalentMultiplierRecord {
  epochNumber: bigint;
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
 * of epoch N-1. (Thereby locking what's in use for epoch N as based on the
 * prior epochs rewards) However for now, this is not the TWAP but instead the
 * spot price at the boundary. For different types of assets in the future, it
 * could change.
 */
export interface OsmoEquivalentMultiplierRecordAmino {
  epoch_number?: string;
  /** superfluid asset denom, can be LP token or native token */
  denom?: string;
  multiplier?: string;
}
export interface OsmoEquivalentMultiplierRecordAminoMsg {
  type: "osmosis/osmo-equivalent-multiplier-record";
  value: OsmoEquivalentMultiplierRecordAmino;
}
/**
 * The Osmo-Equivalent-Multiplier Record for epoch N refers to the osmo worth we
 * treat an LP share as having, for all of epoch N. Eventually this is intended
 * to be set as the Time-weighted-average-osmo-backing for the entire duration
 * of epoch N-1. (Thereby locking what's in use for epoch N as based on the
 * prior epochs rewards) However for now, this is not the TWAP but instead the
 * spot price at the boundary. For different types of assets in the future, it
 * could change.
 */
export interface OsmoEquivalentMultiplierRecordSDKType {
  epoch_number: bigint;
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
  delegationAmount: Coin;
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
  delegator_address?: string;
  validator_address?: string;
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
  delegation_amount: CoinSDKType;
  equivalent_staked_amount?: CoinSDKType;
}
/**
 * LockIdIntermediaryAccountConnection is a struct used to indicate the
 * relationship between the underlying lock id and superfluid delegation done
 * via lp shares.
 */
export interface LockIdIntermediaryAccountConnection {
  lockId: bigint;
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
  lock_id?: string;
  intermediary_account?: string;
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
  lock_id: bigint;
  intermediary_account: string;
}
export interface UnpoolWhitelistedPools {
  ids: bigint[];
}
export interface UnpoolWhitelistedPoolsProtoMsg {
  typeUrl: "/osmosis.superfluid.UnpoolWhitelistedPools";
  value: Uint8Array;
}
export interface UnpoolWhitelistedPoolsAmino {
  ids?: string[];
}
export interface UnpoolWhitelistedPoolsAminoMsg {
  type: "osmosis/unpool-whitelisted-pools";
  value: UnpoolWhitelistedPoolsAmino;
}
export interface UnpoolWhitelistedPoolsSDKType {
  ids: bigint[];
}
export interface ConcentratedPoolUserPositionRecord {
  validatorAddress: string;
  positionId: bigint;
  lockId: bigint;
  syntheticLock: SyntheticLock;
  delegationAmount: Coin;
  equivalentStakedAmount?: Coin;
}
export interface ConcentratedPoolUserPositionRecordProtoMsg {
  typeUrl: "/osmosis.superfluid.ConcentratedPoolUserPositionRecord";
  value: Uint8Array;
}
export interface ConcentratedPoolUserPositionRecordAmino {
  validator_address?: string;
  position_id?: string;
  lock_id?: string;
  synthetic_lock?: SyntheticLockAmino;
  delegation_amount?: CoinAmino;
  equivalent_staked_amount?: CoinAmino;
}
export interface ConcentratedPoolUserPositionRecordAminoMsg {
  type: "osmosis/concentrated-pool-user-position-record";
  value: ConcentratedPoolUserPositionRecordAmino;
}
export interface ConcentratedPoolUserPositionRecordSDKType {
  validator_address: string;
  position_id: bigint;
  lock_id: bigint;
  synthetic_lock: SyntheticLockSDKType;
  delegation_amount: CoinSDKType;
  equivalent_staked_amount?: CoinSDKType;
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.assetType !== 0) {
      writer.uint32(16).int32(message.assetType);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SuperfluidAsset {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    const message = createBaseSuperfluidAsset();
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    }
    if (object.asset_type !== undefined && object.asset_type !== null) {
      message.assetType = object.asset_type;
    }
    return message;
  },
  toAmino(message: SuperfluidAsset): SuperfluidAssetAmino {
    const obj: any = {};
    obj.denom = message.denom === "" ? undefined : message.denom;
    obj.asset_type = message.assetType === 0 ? undefined : message.assetType;
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
    gaugeId: BigInt(0),
  };
}
export const SuperfluidIntermediaryAccount = {
  typeUrl: "/osmosis.superfluid.SuperfluidIntermediaryAccount",
  encode(
    message: SuperfluidIntermediaryAccount,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.valAddr !== "") {
      writer.uint32(18).string(message.valAddr);
    }
    if (message.gaugeId !== BigInt(0)) {
      writer.uint32(24).uint64(message.gaugeId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): SuperfluidIntermediaryAccount {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
          message.gaugeId = reader.uint64();
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
        ? BigInt(object.gaugeId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: SuperfluidIntermediaryAccountAmino
  ): SuperfluidIntermediaryAccount {
    const message = createBaseSuperfluidIntermediaryAccount();
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    }
    if (object.val_addr !== undefined && object.val_addr !== null) {
      message.valAddr = object.val_addr;
    }
    if (object.gauge_id !== undefined && object.gauge_id !== null) {
      message.gaugeId = BigInt(object.gauge_id);
    }
    return message;
  },
  toAmino(
    message: SuperfluidIntermediaryAccount
  ): SuperfluidIntermediaryAccountAmino {
    const obj: any = {};
    obj.denom = message.denom === "" ? undefined : message.denom;
    obj.val_addr = message.valAddr === "" ? undefined : message.valAddr;
    obj.gauge_id =
      message.gaugeId !== BigInt(0) ? message.gaugeId.toString() : undefined;
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
    epochNumber: BigInt(0),
    denom: "",
    multiplier: "",
  };
}
export const OsmoEquivalentMultiplierRecord = {
  typeUrl: "/osmosis.superfluid.OsmoEquivalentMultiplierRecord",
  encode(
    message: OsmoEquivalentMultiplierRecord,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.epochNumber !== BigInt(0)) {
      writer.uint32(8).int64(message.epochNumber);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    if (message.multiplier !== "") {
      writer
        .uint32(26)
        .string(Decimal.fromUserInput(message.multiplier, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): OsmoEquivalentMultiplierRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOsmoEquivalentMultiplierRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochNumber = reader.int64();
          break;
        case 2:
          message.denom = reader.string();
          break;
        case 3:
          message.multiplier = Decimal.fromAtomics(
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
  fromPartial(
    object: Partial<OsmoEquivalentMultiplierRecord>
  ): OsmoEquivalentMultiplierRecord {
    const message = createBaseOsmoEquivalentMultiplierRecord();
    message.epochNumber =
      object.epochNumber !== undefined && object.epochNumber !== null
        ? BigInt(object.epochNumber.toString())
        : BigInt(0);
    message.denom = object.denom ?? "";
    message.multiplier = object.multiplier ?? "";
    return message;
  },
  fromAmino(
    object: OsmoEquivalentMultiplierRecordAmino
  ): OsmoEquivalentMultiplierRecord {
    const message = createBaseOsmoEquivalentMultiplierRecord();
    if (object.epoch_number !== undefined && object.epoch_number !== null) {
      message.epochNumber = BigInt(object.epoch_number);
    }
    if (object.denom !== undefined && object.denom !== null) {
      message.denom = object.denom;
    }
    if (object.multiplier !== undefined && object.multiplier !== null) {
      message.multiplier = object.multiplier;
    }
    return message;
  },
  toAmino(
    message: OsmoEquivalentMultiplierRecord
  ): OsmoEquivalentMultiplierRecordAmino {
    const obj: any = {};
    obj.epoch_number =
      message.epochNumber !== BigInt(0)
        ? message.epochNumber.toString()
        : undefined;
    obj.denom = message.denom === "" ? undefined : message.denom;
    obj.multiplier = message.multiplier === "" ? undefined : message.multiplier;
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
    delegationAmount: Coin.fromPartial({}),
    equivalentStakedAmount: undefined,
  };
}
export const SuperfluidDelegationRecord = {
  typeUrl: "/osmosis.superfluid.SuperfluidDelegationRecord",
  encode(
    message: SuperfluidDelegationRecord,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
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
    input: BinaryReader | Uint8Array,
    length?: number
  ): SuperfluidDelegationRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
    const message = createBaseSuperfluidDelegationRecord();
    if (
      object.delegator_address !== undefined &&
      object.delegator_address !== null
    ) {
      message.delegatorAddress = object.delegator_address;
    }
    if (
      object.validator_address !== undefined &&
      object.validator_address !== null
    ) {
      message.validatorAddress = object.validator_address;
    }
    if (
      object.delegation_amount !== undefined &&
      object.delegation_amount !== null
    ) {
      message.delegationAmount = Coin.fromAmino(object.delegation_amount);
    }
    if (
      object.equivalent_staked_amount !== undefined &&
      object.equivalent_staked_amount !== null
    ) {
      message.equivalentStakedAmount = Coin.fromAmino(
        object.equivalent_staked_amount
      );
    }
    return message;
  },
  toAmino(
    message: SuperfluidDelegationRecord
  ): SuperfluidDelegationRecordAmino {
    const obj: any = {};
    obj.delegator_address =
      message.delegatorAddress === "" ? undefined : message.delegatorAddress;
    obj.validator_address =
      message.validatorAddress === "" ? undefined : message.validatorAddress;
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
    lockId: BigInt(0),
    intermediaryAccount: "",
  };
}
export const LockIdIntermediaryAccountConnection = {
  typeUrl: "/osmosis.superfluid.LockIdIntermediaryAccountConnection",
  encode(
    message: LockIdIntermediaryAccountConnection,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.lockId !== BigInt(0)) {
      writer.uint32(8).uint64(message.lockId);
    }
    if (message.intermediaryAccount !== "") {
      writer.uint32(18).string(message.intermediaryAccount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): LockIdIntermediaryAccountConnection {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLockIdIntermediaryAccountConnection();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lockId = reader.uint64();
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
        ? BigInt(object.lockId.toString())
        : BigInt(0);
    message.intermediaryAccount = object.intermediaryAccount ?? "";
    return message;
  },
  fromAmino(
    object: LockIdIntermediaryAccountConnectionAmino
  ): LockIdIntermediaryAccountConnection {
    const message = createBaseLockIdIntermediaryAccountConnection();
    if (object.lock_id !== undefined && object.lock_id !== null) {
      message.lockId = BigInt(object.lock_id);
    }
    if (
      object.intermediary_account !== undefined &&
      object.intermediary_account !== null
    ) {
      message.intermediaryAccount = object.intermediary_account;
    }
    return message;
  },
  toAmino(
    message: LockIdIntermediaryAccountConnection
  ): LockIdIntermediaryAccountConnectionAmino {
    const obj: any = {};
    obj.lock_id =
      message.lockId !== BigInt(0) ? message.lockId.toString() : undefined;
    obj.intermediary_account =
      message.intermediaryAccount === ""
        ? undefined
        : message.intermediaryAccount;
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UnpoolWhitelistedPools {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUnpoolWhitelistedPools();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint64());
            }
          } else {
            message.ids.push(reader.uint64());
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
    message.ids = object.ids?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(object: UnpoolWhitelistedPoolsAmino): UnpoolWhitelistedPools {
    const message = createBaseUnpoolWhitelistedPools();
    message.ids = object.ids?.map((e) => BigInt(e)) || [];
    return message;
  },
  toAmino(message: UnpoolWhitelistedPools): UnpoolWhitelistedPoolsAmino {
    const obj: any = {};
    if (message.ids) {
      obj.ids = message.ids.map((e) => e.toString());
    } else {
      obj.ids = message.ids;
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
function createBaseConcentratedPoolUserPositionRecord(): ConcentratedPoolUserPositionRecord {
  return {
    validatorAddress: "",
    positionId: BigInt(0),
    lockId: BigInt(0),
    syntheticLock: SyntheticLock.fromPartial({}),
    delegationAmount: Coin.fromPartial({}),
    equivalentStakedAmount: undefined,
  };
}
export const ConcentratedPoolUserPositionRecord = {
  typeUrl: "/osmosis.superfluid.ConcentratedPoolUserPositionRecord",
  encode(
    message: ConcentratedPoolUserPositionRecord,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.validatorAddress !== "") {
      writer.uint32(10).string(message.validatorAddress);
    }
    if (message.positionId !== BigInt(0)) {
      writer.uint32(16).uint64(message.positionId);
    }
    if (message.lockId !== BigInt(0)) {
      writer.uint32(24).uint64(message.lockId);
    }
    if (message.syntheticLock !== undefined) {
      SyntheticLock.encode(
        message.syntheticLock,
        writer.uint32(34).fork()
      ).ldelim();
    }
    if (message.delegationAmount !== undefined) {
      Coin.encode(message.delegationAmount, writer.uint32(42).fork()).ldelim();
    }
    if (message.equivalentStakedAmount !== undefined) {
      Coin.encode(
        message.equivalentStakedAmount,
        writer.uint32(50).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): ConcentratedPoolUserPositionRecord {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConcentratedPoolUserPositionRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validatorAddress = reader.string();
          break;
        case 2:
          message.positionId = reader.uint64();
          break;
        case 3:
          message.lockId = reader.uint64();
          break;
        case 4:
          message.syntheticLock = SyntheticLock.decode(reader, reader.uint32());
          break;
        case 5:
          message.delegationAmount = Coin.decode(reader, reader.uint32());
          break;
        case 6:
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
    object: Partial<ConcentratedPoolUserPositionRecord>
  ): ConcentratedPoolUserPositionRecord {
    const message = createBaseConcentratedPoolUserPositionRecord();
    message.validatorAddress = object.validatorAddress ?? "";
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? BigInt(object.positionId.toString())
        : BigInt(0);
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? BigInt(object.lockId.toString())
        : BigInt(0);
    message.syntheticLock =
      object.syntheticLock !== undefined && object.syntheticLock !== null
        ? SyntheticLock.fromPartial(object.syntheticLock)
        : undefined;
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
    object: ConcentratedPoolUserPositionRecordAmino
  ): ConcentratedPoolUserPositionRecord {
    const message = createBaseConcentratedPoolUserPositionRecord();
    if (
      object.validator_address !== undefined &&
      object.validator_address !== null
    ) {
      message.validatorAddress = object.validator_address;
    }
    if (object.position_id !== undefined && object.position_id !== null) {
      message.positionId = BigInt(object.position_id);
    }
    if (object.lock_id !== undefined && object.lock_id !== null) {
      message.lockId = BigInt(object.lock_id);
    }
    if (object.synthetic_lock !== undefined && object.synthetic_lock !== null) {
      message.syntheticLock = SyntheticLock.fromAmino(object.synthetic_lock);
    }
    if (
      object.delegation_amount !== undefined &&
      object.delegation_amount !== null
    ) {
      message.delegationAmount = Coin.fromAmino(object.delegation_amount);
    }
    if (
      object.equivalent_staked_amount !== undefined &&
      object.equivalent_staked_amount !== null
    ) {
      message.equivalentStakedAmount = Coin.fromAmino(
        object.equivalent_staked_amount
      );
    }
    return message;
  },
  toAmino(
    message: ConcentratedPoolUserPositionRecord
  ): ConcentratedPoolUserPositionRecordAmino {
    const obj: any = {};
    obj.validator_address =
      message.validatorAddress === "" ? undefined : message.validatorAddress;
    obj.position_id =
      message.positionId !== BigInt(0)
        ? message.positionId.toString()
        : undefined;
    obj.lock_id =
      message.lockId !== BigInt(0) ? message.lockId.toString() : undefined;
    obj.synthetic_lock = message.syntheticLock
      ? SyntheticLock.toAmino(message.syntheticLock)
      : undefined;
    obj.delegation_amount = message.delegationAmount
      ? Coin.toAmino(message.delegationAmount)
      : undefined;
    obj.equivalent_staked_amount = message.equivalentStakedAmount
      ? Coin.toAmino(message.equivalentStakedAmount)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: ConcentratedPoolUserPositionRecordAminoMsg
  ): ConcentratedPoolUserPositionRecord {
    return ConcentratedPoolUserPositionRecord.fromAmino(object.value);
  },
  toAminoMsg(
    message: ConcentratedPoolUserPositionRecord
  ): ConcentratedPoolUserPositionRecordAminoMsg {
    return {
      type: "osmosis/concentrated-pool-user-position-record",
      value: ConcentratedPoolUserPositionRecord.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ConcentratedPoolUserPositionRecordProtoMsg
  ): ConcentratedPoolUserPositionRecord {
    return ConcentratedPoolUserPositionRecord.decode(message.value);
  },
  toProto(message: ConcentratedPoolUserPositionRecord): Uint8Array {
    return ConcentratedPoolUserPositionRecord.encode(message).finish();
  },
  toProtoMsg(
    message: ConcentratedPoolUserPositionRecord
  ): ConcentratedPoolUserPositionRecordProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.ConcentratedPoolUserPositionRecord",
      value: ConcentratedPoolUserPositionRecord.encode(message).finish(),
    };
  },
};
