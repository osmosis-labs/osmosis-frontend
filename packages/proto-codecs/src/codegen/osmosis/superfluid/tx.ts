//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Coin, CoinAmino, CoinSDKType } from "../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../google/protobuf/timestamp";
import { fromTimestamp, Long, toTimestamp } from "../../helpers";
export interface MsgSuperfluidDelegate {
  sender: string;
  lockId: Long;
  valAddr: string;
}
export interface MsgSuperfluidDelegateProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate";
  value: Uint8Array;
}
export interface MsgSuperfluidDelegateAmino {
  sender: string;
  lock_id: string;
  val_addr: string;
}
export interface MsgSuperfluidDelegateAminoMsg {
  type: "osmosis/superfluid-delegate";
  value: MsgSuperfluidDelegateAmino;
}
export interface MsgSuperfluidDelegateSDKType {
  sender: string;
  lock_id: Long;
  val_addr: string;
}
export interface MsgSuperfluidDelegateResponse {}
export interface MsgSuperfluidDelegateResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegateResponse";
  value: Uint8Array;
}
export interface MsgSuperfluidDelegateResponseAmino {}
export interface MsgSuperfluidDelegateResponseAminoMsg {
  type: "osmosis/superfluid-delegate-response";
  value: MsgSuperfluidDelegateResponseAmino;
}
export interface MsgSuperfluidDelegateResponseSDKType {}
export interface MsgSuperfluidUndelegate {
  sender: string;
  lockId: Long;
}
export interface MsgSuperfluidUndelegateProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate";
  value: Uint8Array;
}
export interface MsgSuperfluidUndelegateAmino {
  sender: string;
  lock_id: string;
}
export interface MsgSuperfluidUndelegateAminoMsg {
  type: "osmosis/superfluid-undelegate";
  value: MsgSuperfluidUndelegateAmino;
}
export interface MsgSuperfluidUndelegateSDKType {
  sender: string;
  lock_id: Long;
}
export interface MsgSuperfluidUndelegateResponse {}
export interface MsgSuperfluidUndelegateResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateResponse";
  value: Uint8Array;
}
export interface MsgSuperfluidUndelegateResponseAmino {}
export interface MsgSuperfluidUndelegateResponseAminoMsg {
  type: "osmosis/superfluid-undelegate-response";
  value: MsgSuperfluidUndelegateResponseAmino;
}
export interface MsgSuperfluidUndelegateResponseSDKType {}
export interface MsgSuperfluidUnbondLock {
  sender: string;
  lockId: Long;
}
export interface MsgSuperfluidUnbondLockProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock";
  value: Uint8Array;
}
export interface MsgSuperfluidUnbondLockAmino {
  sender: string;
  lock_id: string;
}
export interface MsgSuperfluidUnbondLockAminoMsg {
  type: "osmosis/superfluid-unbond-lock";
  value: MsgSuperfluidUnbondLockAmino;
}
export interface MsgSuperfluidUnbondLockSDKType {
  sender: string;
  lock_id: Long;
}
export interface MsgSuperfluidUnbondLockResponse {}
export interface MsgSuperfluidUnbondLockResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLockResponse";
  value: Uint8Array;
}
export interface MsgSuperfluidUnbondLockResponseAmino {}
export interface MsgSuperfluidUnbondLockResponseAminoMsg {
  type: "osmosis/superfluid-unbond-lock-response";
  value: MsgSuperfluidUnbondLockResponseAmino;
}
export interface MsgSuperfluidUnbondLockResponseSDKType {}
export interface MsgSuperfluidUndelegateAndUnbondLock {
  sender: string;
  lockId: Long;
  /** Amount of unlocking coin. */
  coin?: Coin;
}
export interface MsgSuperfluidUndelegateAndUnbondLockProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock";
  value: Uint8Array;
}
export interface MsgSuperfluidUndelegateAndUnbondLockAmino {
  sender: string;
  lock_id: string;
  /** Amount of unlocking coin. */
  coin?: CoinAmino;
}
export interface MsgSuperfluidUndelegateAndUnbondLockAminoMsg {
  type: "osmosis/superfluid-undelegate-and-unbond-lock";
  value: MsgSuperfluidUndelegateAndUnbondLockAmino;
}
export interface MsgSuperfluidUndelegateAndUnbondLockSDKType {
  sender: string;
  lock_id: Long;
  coin?: CoinSDKType;
}
export interface MsgSuperfluidUndelegateAndUnbondLockResponse {
  /**
   * lock id of the new lock created for the remaining amount.
   * returns the original lockid if the unlocked amount is equal to the
   * original lock's amount.
   */
  lockId: Long;
}
export interface MsgSuperfluidUndelegateAndUnbondLockResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLockResponse";
  value: Uint8Array;
}
export interface MsgSuperfluidUndelegateAndUnbondLockResponseAmino {
  /**
   * lock id of the new lock created for the remaining amount.
   * returns the original lockid if the unlocked amount is equal to the
   * original lock's amount.
   */
  lock_id: string;
}
export interface MsgSuperfluidUndelegateAndUnbondLockResponseAminoMsg {
  type: "osmosis/superfluid-undelegate-and-unbond-lock-response";
  value: MsgSuperfluidUndelegateAndUnbondLockResponseAmino;
}
export interface MsgSuperfluidUndelegateAndUnbondLockResponseSDKType {
  lock_id: Long;
}
/**
 * MsgLockAndSuperfluidDelegate locks coins with the unbonding period duration,
 * and then does a superfluid lock from the newly created lockup, to the
 * specified validator addr.
 */
export interface MsgLockAndSuperfluidDelegate {
  sender: string;
  coins: Coin[];
  valAddr: string;
}
export interface MsgLockAndSuperfluidDelegateProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate";
  value: Uint8Array;
}
/**
 * MsgLockAndSuperfluidDelegate locks coins with the unbonding period duration,
 * and then does a superfluid lock from the newly created lockup, to the
 * specified validator addr.
 */
export interface MsgLockAndSuperfluidDelegateAmino {
  sender: string;
  coins: CoinAmino[];
  val_addr: string;
}
export interface MsgLockAndSuperfluidDelegateAminoMsg {
  type: "osmosis/lock-and-superfluid-delegate";
  value: MsgLockAndSuperfluidDelegateAmino;
}
/**
 * MsgLockAndSuperfluidDelegate locks coins with the unbonding period duration,
 * and then does a superfluid lock from the newly created lockup, to the
 * specified validator addr.
 */
export interface MsgLockAndSuperfluidDelegateSDKType {
  sender: string;
  coins: CoinSDKType[];
  val_addr: string;
}
export interface MsgLockAndSuperfluidDelegateResponse {
  ID: Long;
}
export interface MsgLockAndSuperfluidDelegateResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse";
  value: Uint8Array;
}
export interface MsgLockAndSuperfluidDelegateResponseAmino {
  ID: string;
}
export interface MsgLockAndSuperfluidDelegateResponseAminoMsg {
  type: "osmosis/lock-and-superfluid-delegate-response";
  value: MsgLockAndSuperfluidDelegateResponseAmino;
}
export interface MsgLockAndSuperfluidDelegateResponseSDKType {
  ID: Long;
}
/**
 * MsgCreateFullRangePositionAndSuperfluidDelegate creates a full range position
 * in a concentrated liquidity pool, then superfluid delegates.
 */
export interface MsgCreateFullRangePositionAndSuperfluidDelegate {
  sender: string;
  coins: Coin[];
  valAddr: string;
  poolId: Long;
}
export interface MsgCreateFullRangePositionAndSuperfluidDelegateProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgCreateFullRangePositionAndSuperfluidDelegate";
  value: Uint8Array;
}
/**
 * MsgCreateFullRangePositionAndSuperfluidDelegate creates a full range position
 * in a concentrated liquidity pool, then superfluid delegates.
 */
export interface MsgCreateFullRangePositionAndSuperfluidDelegateAmino {
  sender: string;
  coins: CoinAmino[];
  val_addr: string;
  pool_id: string;
}
export interface MsgCreateFullRangePositionAndSuperfluidDelegateAminoMsg {
  type: "osmosis/create-full-range-position-and-superfluid-delegate";
  value: MsgCreateFullRangePositionAndSuperfluidDelegateAmino;
}
/**
 * MsgCreateFullRangePositionAndSuperfluidDelegate creates a full range position
 * in a concentrated liquidity pool, then superfluid delegates.
 */
export interface MsgCreateFullRangePositionAndSuperfluidDelegateSDKType {
  sender: string;
  coins: CoinSDKType[];
  val_addr: string;
  pool_id: Long;
}
export interface MsgCreateFullRangePositionAndSuperfluidDelegateResponse {
  lockID: Long;
  positionID: Long;
}
export interface MsgCreateFullRangePositionAndSuperfluidDelegateResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgCreateFullRangePositionAndSuperfluidDelegateResponse";
  value: Uint8Array;
}
export interface MsgCreateFullRangePositionAndSuperfluidDelegateResponseAmino {
  lockID: string;
  positionID: string;
}
export interface MsgCreateFullRangePositionAndSuperfluidDelegateResponseAminoMsg {
  type: "osmosis/create-full-range-position-and-superfluid-delegate-response";
  value: MsgCreateFullRangePositionAndSuperfluidDelegateResponseAmino;
}
export interface MsgCreateFullRangePositionAndSuperfluidDelegateResponseSDKType {
  lockID: Long;
  positionID: Long;
}
/**
 * MsgUnPoolWhitelistedPool Unpools every lock the sender has, that is
 * associated with pool pool_id. If pool_id is not approved for unpooling by
 * governance, this is a no-op. Unpooling takes the locked gamm shares, and runs
 * "ExitPool" on it, to get the constituent tokens. e.g. z gamm/pool/1 tokens
 * ExitPools into constituent tokens x uatom, y uosmo. Then it creates a new
 * lock for every constituent token, with the duration associated with the lock.
 * If the lock was unbonding, the new lockup durations should be the time left
 * until unbond completion.
 */
export interface MsgUnPoolWhitelistedPool {
  sender: string;
  poolId: Long;
}
export interface MsgUnPoolWhitelistedPoolProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool";
  value: Uint8Array;
}
/**
 * MsgUnPoolWhitelistedPool Unpools every lock the sender has, that is
 * associated with pool pool_id. If pool_id is not approved for unpooling by
 * governance, this is a no-op. Unpooling takes the locked gamm shares, and runs
 * "ExitPool" on it, to get the constituent tokens. e.g. z gamm/pool/1 tokens
 * ExitPools into constituent tokens x uatom, y uosmo. Then it creates a new
 * lock for every constituent token, with the duration associated with the lock.
 * If the lock was unbonding, the new lockup durations should be the time left
 * until unbond completion.
 */
export interface MsgUnPoolWhitelistedPoolAmino {
  sender: string;
  pool_id: string;
}
export interface MsgUnPoolWhitelistedPoolAminoMsg {
  type: "osmosis/unpool-whitelisted-pool";
  value: MsgUnPoolWhitelistedPoolAmino;
}
/**
 * MsgUnPoolWhitelistedPool Unpools every lock the sender has, that is
 * associated with pool pool_id. If pool_id is not approved for unpooling by
 * governance, this is a no-op. Unpooling takes the locked gamm shares, and runs
 * "ExitPool" on it, to get the constituent tokens. e.g. z gamm/pool/1 tokens
 * ExitPools into constituent tokens x uatom, y uosmo. Then it creates a new
 * lock for every constituent token, with the duration associated with the lock.
 * If the lock was unbonding, the new lockup durations should be the time left
 * until unbond completion.
 */
export interface MsgUnPoolWhitelistedPoolSDKType {
  sender: string;
  pool_id: Long;
}
export interface MsgUnPoolWhitelistedPoolResponse {
  exitedLockIds: Long[];
}
export interface MsgUnPoolWhitelistedPoolResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse";
  value: Uint8Array;
}
export interface MsgUnPoolWhitelistedPoolResponseAmino {
  exited_lock_ids: string[];
}
export interface MsgUnPoolWhitelistedPoolResponseAminoMsg {
  type: "osmosis/un-pool-whitelisted-pool-response";
  value: MsgUnPoolWhitelistedPoolResponseAmino;
}
export interface MsgUnPoolWhitelistedPoolResponseSDKType {
  exited_lock_ids: Long[];
}
/**
 * =====================
 * MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
 */
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition {
  sender: string;
  lockId: Long;
  sharesToMigrate?: Coin;
  /** token_out_mins indicates minimum token to exit Balancer pool with. */
  tokenOutMins: Coin[];
}
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition";
  value: Uint8Array;
}
/**
 * =====================
 * MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
 */
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionAmino {
  sender: string;
  lock_id: string;
  shares_to_migrate?: CoinAmino;
  /** token_out_mins indicates minimum token to exit Balancer pool with. */
  token_out_mins: CoinAmino[];
}
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionAminoMsg {
  type: "osmosis/unlock-and-migrate-shares-to-full-range-concentrated-position";
  value: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionAmino;
}
/**
 * =====================
 * MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
 */
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionSDKType {
  sender: string;
  lock_id: Long;
  shares_to_migrate?: CoinSDKType;
  token_out_mins: CoinSDKType[];
}
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse {
  amount0: string;
  amount1: string;
  liquidityCreated: string;
  joinTime?: Date;
}
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse";
  value: Uint8Array;
}
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseAmino {
  amount0: string;
  amount1: string;
  liquidity_created: string;
  join_time?: Date;
}
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseAminoMsg {
  type: "osmosis/unlock-and-migrate-shares-to-full-range-concentrated-position-response";
  value: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseAmino;
}
export interface MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseSDKType {
  amount0: string;
  amount1: string;
  liquidity_created: string;
  join_time?: Date;
}
/** ===================== MsgAddToConcentratedLiquiditySuperfluidPosition */
export interface MsgAddToConcentratedLiquiditySuperfluidPosition {
  positionId: Long;
  sender: string;
  tokenDesired0?: Coin;
  tokenDesired1?: Coin;
}
export interface MsgAddToConcentratedLiquiditySuperfluidPositionProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPosition";
  value: Uint8Array;
}
/** ===================== MsgAddToConcentratedLiquiditySuperfluidPosition */
export interface MsgAddToConcentratedLiquiditySuperfluidPositionAmino {
  position_id: string;
  sender: string;
  token_desired0?: CoinAmino;
  token_desired1?: CoinAmino;
}
export interface MsgAddToConcentratedLiquiditySuperfluidPositionAminoMsg {
  type: "osmosis/add-to-concentrated-liquidity-superfluid-position";
  value: MsgAddToConcentratedLiquiditySuperfluidPositionAmino;
}
/** ===================== MsgAddToConcentratedLiquiditySuperfluidPosition */
export interface MsgAddToConcentratedLiquiditySuperfluidPositionSDKType {
  position_id: Long;
  sender: string;
  token_desired0?: CoinSDKType;
  token_desired1?: CoinSDKType;
}
export interface MsgAddToConcentratedLiquiditySuperfluidPositionResponse {
  positionId: Long;
  amount0: string;
  amount1: string;
  /**
   * new_liquidity is the final liquidity after the add.
   * It includes the liquidity that existed before in the position
   * and the new liquidity that was added to the position.
   */
  newLiquidity: string;
  lockId: Long;
}
export interface MsgAddToConcentratedLiquiditySuperfluidPositionResponseProtoMsg {
  typeUrl: "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPositionResponse";
  value: Uint8Array;
}
export interface MsgAddToConcentratedLiquiditySuperfluidPositionResponseAmino {
  position_id: string;
  amount0: string;
  amount1: string;
  /**
   * new_liquidity is the final liquidity after the add.
   * It includes the liquidity that existed before in the position
   * and the new liquidity that was added to the position.
   */
  new_liquidity: string;
  lock_id: string;
}
export interface MsgAddToConcentratedLiquiditySuperfluidPositionResponseAminoMsg {
  type: "osmosis/add-to-concentrated-liquidity-superfluid-position-response";
  value: MsgAddToConcentratedLiquiditySuperfluidPositionResponseAmino;
}
export interface MsgAddToConcentratedLiquiditySuperfluidPositionResponseSDKType {
  position_id: Long;
  amount0: string;
  amount1: string;
  new_liquidity: string;
  lock_id: Long;
}
function createBaseMsgSuperfluidDelegate(): MsgSuperfluidDelegate {
  return {
    sender: "",
    lockId: Long.UZERO,
    valAddr: "",
  };
}
export const MsgSuperfluidDelegate = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
  encode(
    message: MsgSuperfluidDelegate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.lockId.isZero()) {
      writer.uint32(16).uint64(message.lockId);
    }
    if (message.valAddr !== "") {
      writer.uint32(26).string(message.valAddr);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidDelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.lockId = reader.uint64() as Long;
          break;
        case 3:
          message.valAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSuperfluidDelegate>): MsgSuperfluidDelegate {
    const message = createBaseMsgSuperfluidDelegate();
    message.sender = object.sender ?? "";
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    message.valAddr = object.valAddr ?? "";
    return message;
  },
  fromAmino(object: MsgSuperfluidDelegateAmino): MsgSuperfluidDelegate {
    return {
      sender: object.sender,
      lockId: Long.fromString(object.lock_id),
      valAddr: object.val_addr,
    };
  },
  toAmino(message: MsgSuperfluidDelegate): MsgSuperfluidDelegateAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    obj.val_addr = message.valAddr;
    return obj;
  },
  fromAminoMsg(object: MsgSuperfluidDelegateAminoMsg): MsgSuperfluidDelegate {
    return MsgSuperfluidDelegate.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSuperfluidDelegate): MsgSuperfluidDelegateAminoMsg {
    return {
      type: "osmosis/superfluid-delegate",
      value: MsgSuperfluidDelegate.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSuperfluidDelegateProtoMsg): MsgSuperfluidDelegate {
    return MsgSuperfluidDelegate.decode(message.value);
  },
  toProto(message: MsgSuperfluidDelegate): Uint8Array {
    return MsgSuperfluidDelegate.encode(message).finish();
  },
  toProtoMsg(message: MsgSuperfluidDelegate): MsgSuperfluidDelegateProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
      value: MsgSuperfluidDelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgSuperfluidDelegateResponse(): MsgSuperfluidDelegateResponse {
  return {};
}
export const MsgSuperfluidDelegateResponse = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegateResponse",
  encode(
    _: MsgSuperfluidDelegateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidDelegateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidDelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgSuperfluidDelegateResponse>
  ): MsgSuperfluidDelegateResponse {
    const message = createBaseMsgSuperfluidDelegateResponse();
    return message;
  },
  fromAmino(
    _: MsgSuperfluidDelegateResponseAmino
  ): MsgSuperfluidDelegateResponse {
    return {};
  },
  toAmino(
    _: MsgSuperfluidDelegateResponse
  ): MsgSuperfluidDelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSuperfluidDelegateResponseAminoMsg
  ): MsgSuperfluidDelegateResponse {
    return MsgSuperfluidDelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSuperfluidDelegateResponse
  ): MsgSuperfluidDelegateResponseAminoMsg {
    return {
      type: "osmosis/superfluid-delegate-response",
      value: MsgSuperfluidDelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSuperfluidDelegateResponseProtoMsg
  ): MsgSuperfluidDelegateResponse {
    return MsgSuperfluidDelegateResponse.decode(message.value);
  },
  toProto(message: MsgSuperfluidDelegateResponse): Uint8Array {
    return MsgSuperfluidDelegateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSuperfluidDelegateResponse
  ): MsgSuperfluidDelegateResponseProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegateResponse",
      value: MsgSuperfluidDelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSuperfluidUndelegate(): MsgSuperfluidUndelegate {
  return {
    sender: "",
    lockId: Long.UZERO,
  };
}
export const MsgSuperfluidUndelegate = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
  encode(
    message: MsgSuperfluidUndelegate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.lockId.isZero()) {
      writer.uint32(16).uint64(message.lockId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidUndelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidUndelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.lockId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSuperfluidUndelegate>
  ): MsgSuperfluidUndelegate {
    const message = createBaseMsgSuperfluidUndelegate();
    message.sender = object.sender ?? "";
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgSuperfluidUndelegateAmino): MsgSuperfluidUndelegate {
    return {
      sender: object.sender,
      lockId: Long.fromString(object.lock_id),
    };
  },
  toAmino(message: MsgSuperfluidUndelegate): MsgSuperfluidUndelegateAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgSuperfluidUndelegateAminoMsg
  ): MsgSuperfluidUndelegate {
    return MsgSuperfluidUndelegate.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSuperfluidUndelegate
  ): MsgSuperfluidUndelegateAminoMsg {
    return {
      type: "osmosis/superfluid-undelegate",
      value: MsgSuperfluidUndelegate.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSuperfluidUndelegateProtoMsg
  ): MsgSuperfluidUndelegate {
    return MsgSuperfluidUndelegate.decode(message.value);
  },
  toProto(message: MsgSuperfluidUndelegate): Uint8Array {
    return MsgSuperfluidUndelegate.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSuperfluidUndelegate
  ): MsgSuperfluidUndelegateProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
      value: MsgSuperfluidUndelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgSuperfluidUndelegateResponse(): MsgSuperfluidUndelegateResponse {
  return {};
}
export const MsgSuperfluidUndelegateResponse = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateResponse",
  encode(
    _: MsgSuperfluidUndelegateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidUndelegateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidUndelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgSuperfluidUndelegateResponse>
  ): MsgSuperfluidUndelegateResponse {
    const message = createBaseMsgSuperfluidUndelegateResponse();
    return message;
  },
  fromAmino(
    _: MsgSuperfluidUndelegateResponseAmino
  ): MsgSuperfluidUndelegateResponse {
    return {};
  },
  toAmino(
    _: MsgSuperfluidUndelegateResponse
  ): MsgSuperfluidUndelegateResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSuperfluidUndelegateResponseAminoMsg
  ): MsgSuperfluidUndelegateResponse {
    return MsgSuperfluidUndelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSuperfluidUndelegateResponse
  ): MsgSuperfluidUndelegateResponseAminoMsg {
    return {
      type: "osmosis/superfluid-undelegate-response",
      value: MsgSuperfluidUndelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSuperfluidUndelegateResponseProtoMsg
  ): MsgSuperfluidUndelegateResponse {
    return MsgSuperfluidUndelegateResponse.decode(message.value);
  },
  toProto(message: MsgSuperfluidUndelegateResponse): Uint8Array {
    return MsgSuperfluidUndelegateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSuperfluidUndelegateResponse
  ): MsgSuperfluidUndelegateResponseProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateResponse",
      value: MsgSuperfluidUndelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSuperfluidUnbondLock(): MsgSuperfluidUnbondLock {
  return {
    sender: "",
    lockId: Long.UZERO,
  };
}
export const MsgSuperfluidUnbondLock = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
  encode(
    message: MsgSuperfluidUnbondLock,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.lockId.isZero()) {
      writer.uint32(16).uint64(message.lockId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidUnbondLock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidUnbondLock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.lockId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSuperfluidUnbondLock>
  ): MsgSuperfluidUnbondLock {
    const message = createBaseMsgSuperfluidUnbondLock();
    message.sender = object.sender ?? "";
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgSuperfluidUnbondLockAmino): MsgSuperfluidUnbondLock {
    return {
      sender: object.sender,
      lockId: Long.fromString(object.lock_id),
    };
  },
  toAmino(message: MsgSuperfluidUnbondLock): MsgSuperfluidUnbondLockAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgSuperfluidUnbondLockAminoMsg
  ): MsgSuperfluidUnbondLock {
    return MsgSuperfluidUnbondLock.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSuperfluidUnbondLock
  ): MsgSuperfluidUnbondLockAminoMsg {
    return {
      type: "osmosis/superfluid-unbond-lock",
      value: MsgSuperfluidUnbondLock.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSuperfluidUnbondLockProtoMsg
  ): MsgSuperfluidUnbondLock {
    return MsgSuperfluidUnbondLock.decode(message.value);
  },
  toProto(message: MsgSuperfluidUnbondLock): Uint8Array {
    return MsgSuperfluidUnbondLock.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSuperfluidUnbondLock
  ): MsgSuperfluidUnbondLockProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
      value: MsgSuperfluidUnbondLock.encode(message).finish(),
    };
  },
};
function createBaseMsgSuperfluidUnbondLockResponse(): MsgSuperfluidUnbondLockResponse {
  return {};
}
export const MsgSuperfluidUnbondLockResponse = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLockResponse",
  encode(
    _: MsgSuperfluidUnbondLockResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidUnbondLockResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidUnbondLockResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgSuperfluidUnbondLockResponse>
  ): MsgSuperfluidUnbondLockResponse {
    const message = createBaseMsgSuperfluidUnbondLockResponse();
    return message;
  },
  fromAmino(
    _: MsgSuperfluidUnbondLockResponseAmino
  ): MsgSuperfluidUnbondLockResponse {
    return {};
  },
  toAmino(
    _: MsgSuperfluidUnbondLockResponse
  ): MsgSuperfluidUnbondLockResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSuperfluidUnbondLockResponseAminoMsg
  ): MsgSuperfluidUnbondLockResponse {
    return MsgSuperfluidUnbondLockResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSuperfluidUnbondLockResponse
  ): MsgSuperfluidUnbondLockResponseAminoMsg {
    return {
      type: "osmosis/superfluid-unbond-lock-response",
      value: MsgSuperfluidUnbondLockResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSuperfluidUnbondLockResponseProtoMsg
  ): MsgSuperfluidUnbondLockResponse {
    return MsgSuperfluidUnbondLockResponse.decode(message.value);
  },
  toProto(message: MsgSuperfluidUnbondLockResponse): Uint8Array {
    return MsgSuperfluidUnbondLockResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSuperfluidUnbondLockResponse
  ): MsgSuperfluidUnbondLockResponseProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLockResponse",
      value: MsgSuperfluidUnbondLockResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSuperfluidUndelegateAndUnbondLock(): MsgSuperfluidUndelegateAndUnbondLock {
  return {
    sender: "",
    lockId: Long.UZERO,
    coin: undefined,
  };
}
export const MsgSuperfluidUndelegateAndUnbondLock = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock",
  encode(
    message: MsgSuperfluidUndelegateAndUnbondLock,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.lockId.isZero()) {
      writer.uint32(16).uint64(message.lockId);
    }
    if (message.coin !== undefined) {
      Coin.encode(message.coin, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidUndelegateAndUnbondLock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidUndelegateAndUnbondLock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.lockId = reader.uint64() as Long;
          break;
        case 3:
          message.coin = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSuperfluidUndelegateAndUnbondLock>
  ): MsgSuperfluidUndelegateAndUnbondLock {
    const message = createBaseMsgSuperfluidUndelegateAndUnbondLock();
    message.sender = object.sender ?? "";
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    message.coin =
      object.coin !== undefined && object.coin !== null
        ? Coin.fromPartial(object.coin)
        : undefined;
    return message;
  },
  fromAmino(
    object: MsgSuperfluidUndelegateAndUnbondLockAmino
  ): MsgSuperfluidUndelegateAndUnbondLock {
    return {
      sender: object.sender,
      lockId: Long.fromString(object.lock_id),
      coin: object?.coin ? Coin.fromAmino(object.coin) : undefined,
    };
  },
  toAmino(
    message: MsgSuperfluidUndelegateAndUnbondLock
  ): MsgSuperfluidUndelegateAndUnbondLockAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    obj.coin = message.coin ? Coin.toAmino(message.coin) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgSuperfluidUndelegateAndUnbondLockAminoMsg
  ): MsgSuperfluidUndelegateAndUnbondLock {
    return MsgSuperfluidUndelegateAndUnbondLock.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSuperfluidUndelegateAndUnbondLock
  ): MsgSuperfluidUndelegateAndUnbondLockAminoMsg {
    return {
      type: "osmosis/superfluid-undelegate-and-unbond-lock",
      value: MsgSuperfluidUndelegateAndUnbondLock.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSuperfluidUndelegateAndUnbondLockProtoMsg
  ): MsgSuperfluidUndelegateAndUnbondLock {
    return MsgSuperfluidUndelegateAndUnbondLock.decode(message.value);
  },
  toProto(message: MsgSuperfluidUndelegateAndUnbondLock): Uint8Array {
    return MsgSuperfluidUndelegateAndUnbondLock.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSuperfluidUndelegateAndUnbondLock
  ): MsgSuperfluidUndelegateAndUnbondLockProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLock",
      value: MsgSuperfluidUndelegateAndUnbondLock.encode(message).finish(),
    };
  },
};
function createBaseMsgSuperfluidUndelegateAndUnbondLockResponse(): MsgSuperfluidUndelegateAndUnbondLockResponse {
  return {
    lockId: Long.UZERO,
  };
}
export const MsgSuperfluidUndelegateAndUnbondLockResponse = {
  typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLockResponse",
  encode(
    message: MsgSuperfluidUndelegateAndUnbondLockResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.lockId.isZero()) {
      writer.uint32(8).uint64(message.lockId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSuperfluidUndelegateAndUnbondLockResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSuperfluidUndelegateAndUnbondLockResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lockId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSuperfluidUndelegateAndUnbondLockResponse>
  ): MsgSuperfluidUndelegateAndUnbondLockResponse {
    const message = createBaseMsgSuperfluidUndelegateAndUnbondLockResponse();
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgSuperfluidUndelegateAndUnbondLockResponseAmino
  ): MsgSuperfluidUndelegateAndUnbondLockResponse {
    return {
      lockId: Long.fromString(object.lock_id),
    };
  },
  toAmino(
    message: MsgSuperfluidUndelegateAndUnbondLockResponse
  ): MsgSuperfluidUndelegateAndUnbondLockResponseAmino {
    const obj: any = {};
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgSuperfluidUndelegateAndUnbondLockResponseAminoMsg
  ): MsgSuperfluidUndelegateAndUnbondLockResponse {
    return MsgSuperfluidUndelegateAndUnbondLockResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSuperfluidUndelegateAndUnbondLockResponse
  ): MsgSuperfluidUndelegateAndUnbondLockResponseAminoMsg {
    return {
      type: "osmosis/superfluid-undelegate-and-unbond-lock-response",
      value: MsgSuperfluidUndelegateAndUnbondLockResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSuperfluidUndelegateAndUnbondLockResponseProtoMsg
  ): MsgSuperfluidUndelegateAndUnbondLockResponse {
    return MsgSuperfluidUndelegateAndUnbondLockResponse.decode(message.value);
  },
  toProto(message: MsgSuperfluidUndelegateAndUnbondLockResponse): Uint8Array {
    return MsgSuperfluidUndelegateAndUnbondLockResponse.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgSuperfluidUndelegateAndUnbondLockResponse
  ): MsgSuperfluidUndelegateAndUnbondLockResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.superfluid.MsgSuperfluidUndelegateAndUnbondLockResponse",
      value:
        MsgSuperfluidUndelegateAndUnbondLockResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgLockAndSuperfluidDelegate(): MsgLockAndSuperfluidDelegate {
  return {
    sender: "",
    coins: [],
    valAddr: "",
  };
}
export const MsgLockAndSuperfluidDelegate = {
  typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
  encode(
    message: MsgLockAndSuperfluidDelegate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.valAddr !== "") {
      writer.uint32(26).string(message.valAddr);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgLockAndSuperfluidDelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLockAndSuperfluidDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.valAddr = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgLockAndSuperfluidDelegate>
  ): MsgLockAndSuperfluidDelegate {
    const message = createBaseMsgLockAndSuperfluidDelegate();
    message.sender = object.sender ?? "";
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    message.valAddr = object.valAddr ?? "";
    return message;
  },
  fromAmino(
    object: MsgLockAndSuperfluidDelegateAmino
  ): MsgLockAndSuperfluidDelegate {
    return {
      sender: object.sender,
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromAmino(e))
        : [],
      valAddr: object.val_addr,
    };
  },
  toAmino(
    message: MsgLockAndSuperfluidDelegate
  ): MsgLockAndSuperfluidDelegateAmino {
    const obj: any = {};
    obj.sender = message.sender;
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = [];
    }
    obj.val_addr = message.valAddr;
    return obj;
  },
  fromAminoMsg(
    object: MsgLockAndSuperfluidDelegateAminoMsg
  ): MsgLockAndSuperfluidDelegate {
    return MsgLockAndSuperfluidDelegate.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgLockAndSuperfluidDelegate
  ): MsgLockAndSuperfluidDelegateAminoMsg {
    return {
      type: "osmosis/lock-and-superfluid-delegate",
      value: MsgLockAndSuperfluidDelegate.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgLockAndSuperfluidDelegateProtoMsg
  ): MsgLockAndSuperfluidDelegate {
    return MsgLockAndSuperfluidDelegate.decode(message.value);
  },
  toProto(message: MsgLockAndSuperfluidDelegate): Uint8Array {
    return MsgLockAndSuperfluidDelegate.encode(message).finish();
  },
  toProtoMsg(
    message: MsgLockAndSuperfluidDelegate
  ): MsgLockAndSuperfluidDelegateProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
      value: MsgLockAndSuperfluidDelegate.encode(message).finish(),
    };
  },
};
function createBaseMsgLockAndSuperfluidDelegateResponse(): MsgLockAndSuperfluidDelegateResponse {
  return {
    ID: Long.UZERO,
  };
}
export const MsgLockAndSuperfluidDelegateResponse = {
  typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse",
  encode(
    message: MsgLockAndSuperfluidDelegateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.ID.isZero()) {
      writer.uint32(8).uint64(message.ID);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgLockAndSuperfluidDelegateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgLockAndSuperfluidDelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ID = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgLockAndSuperfluidDelegateResponse>
  ): MsgLockAndSuperfluidDelegateResponse {
    const message = createBaseMsgLockAndSuperfluidDelegateResponse();
    message.ID =
      object.ID !== undefined && object.ID !== null
        ? Long.fromValue(object.ID)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgLockAndSuperfluidDelegateResponseAmino
  ): MsgLockAndSuperfluidDelegateResponse {
    return {
      ID: Long.fromString(object.ID),
    };
  },
  toAmino(
    message: MsgLockAndSuperfluidDelegateResponse
  ): MsgLockAndSuperfluidDelegateResponseAmino {
    const obj: any = {};
    obj.ID = message.ID ? message.ID.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgLockAndSuperfluidDelegateResponseAminoMsg
  ): MsgLockAndSuperfluidDelegateResponse {
    return MsgLockAndSuperfluidDelegateResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgLockAndSuperfluidDelegateResponse
  ): MsgLockAndSuperfluidDelegateResponseAminoMsg {
    return {
      type: "osmosis/lock-and-superfluid-delegate-response",
      value: MsgLockAndSuperfluidDelegateResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgLockAndSuperfluidDelegateResponseProtoMsg
  ): MsgLockAndSuperfluidDelegateResponse {
    return MsgLockAndSuperfluidDelegateResponse.decode(message.value);
  },
  toProto(message: MsgLockAndSuperfluidDelegateResponse): Uint8Array {
    return MsgLockAndSuperfluidDelegateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgLockAndSuperfluidDelegateResponse
  ): MsgLockAndSuperfluidDelegateResponseProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegateResponse",
      value: MsgLockAndSuperfluidDelegateResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateFullRangePositionAndSuperfluidDelegate(): MsgCreateFullRangePositionAndSuperfluidDelegate {
  return {
    sender: "",
    coins: [],
    valAddr: "",
    poolId: Long.UZERO,
  };
}
export const MsgCreateFullRangePositionAndSuperfluidDelegate = {
  typeUrl:
    "/osmosis.superfluid.MsgCreateFullRangePositionAndSuperfluidDelegate",
  encode(
    message: MsgCreateFullRangePositionAndSuperfluidDelegate,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.coins) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.valAddr !== "") {
      writer.uint32(26).string(message.valAddr);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(32).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateFullRangePositionAndSuperfluidDelegate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateFullRangePositionAndSuperfluidDelegate();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.coins.push(Coin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.valAddr = reader.string();
          break;
        case 4:
          message.poolId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreateFullRangePositionAndSuperfluidDelegate>
  ): MsgCreateFullRangePositionAndSuperfluidDelegate {
    const message = createBaseMsgCreateFullRangePositionAndSuperfluidDelegate();
    message.sender = object.sender ?? "";
    message.coins = object.coins?.map((e) => Coin.fromPartial(e)) || [];
    message.valAddr = object.valAddr ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgCreateFullRangePositionAndSuperfluidDelegateAmino
  ): MsgCreateFullRangePositionAndSuperfluidDelegate {
    return {
      sender: object.sender,
      coins: Array.isArray(object?.coins)
        ? object.coins.map((e: any) => Coin.fromAmino(e))
        : [],
      valAddr: object.val_addr,
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: MsgCreateFullRangePositionAndSuperfluidDelegate
  ): MsgCreateFullRangePositionAndSuperfluidDelegateAmino {
    const obj: any = {};
    obj.sender = message.sender;
    if (message.coins) {
      obj.coins = message.coins.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.coins = [];
    }
    obj.val_addr = message.valAddr;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateFullRangePositionAndSuperfluidDelegateAminoMsg
  ): MsgCreateFullRangePositionAndSuperfluidDelegate {
    return MsgCreateFullRangePositionAndSuperfluidDelegate.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: MsgCreateFullRangePositionAndSuperfluidDelegate
  ): MsgCreateFullRangePositionAndSuperfluidDelegateAminoMsg {
    return {
      type: "osmosis/create-full-range-position-and-superfluid-delegate",
      value: MsgCreateFullRangePositionAndSuperfluidDelegate.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateFullRangePositionAndSuperfluidDelegateProtoMsg
  ): MsgCreateFullRangePositionAndSuperfluidDelegate {
    return MsgCreateFullRangePositionAndSuperfluidDelegate.decode(
      message.value
    );
  },
  toProto(
    message: MsgCreateFullRangePositionAndSuperfluidDelegate
  ): Uint8Array {
    return MsgCreateFullRangePositionAndSuperfluidDelegate.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgCreateFullRangePositionAndSuperfluidDelegate
  ): MsgCreateFullRangePositionAndSuperfluidDelegateProtoMsg {
    return {
      typeUrl:
        "/osmosis.superfluid.MsgCreateFullRangePositionAndSuperfluidDelegate",
      value:
        MsgCreateFullRangePositionAndSuperfluidDelegate.encode(
          message
        ).finish(),
    };
  },
};
function createBaseMsgCreateFullRangePositionAndSuperfluidDelegateResponse(): MsgCreateFullRangePositionAndSuperfluidDelegateResponse {
  return {
    lockID: Long.UZERO,
    positionID: Long.UZERO,
  };
}
export const MsgCreateFullRangePositionAndSuperfluidDelegateResponse = {
  typeUrl:
    "/osmosis.superfluid.MsgCreateFullRangePositionAndSuperfluidDelegateResponse",
  encode(
    message: MsgCreateFullRangePositionAndSuperfluidDelegateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.lockID.isZero()) {
      writer.uint32(8).uint64(message.lockID);
    }
    if (!message.positionID.isZero()) {
      writer.uint32(16).uint64(message.positionID);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message =
      createBaseMsgCreateFullRangePositionAndSuperfluidDelegateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lockID = reader.uint64() as Long;
          break;
        case 2:
          message.positionID = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreateFullRangePositionAndSuperfluidDelegateResponse>
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponse {
    const message =
      createBaseMsgCreateFullRangePositionAndSuperfluidDelegateResponse();
    message.lockID =
      object.lockID !== undefined && object.lockID !== null
        ? Long.fromValue(object.lockID)
        : Long.UZERO;
    message.positionID =
      object.positionID !== undefined && object.positionID !== null
        ? Long.fromValue(object.positionID)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgCreateFullRangePositionAndSuperfluidDelegateResponseAmino
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponse {
    return {
      lockID: Long.fromString(object.lockID),
      positionID: Long.fromString(object.positionID),
    };
  },
  toAmino(
    message: MsgCreateFullRangePositionAndSuperfluidDelegateResponse
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponseAmino {
    const obj: any = {};
    obj.lockID = message.lockID ? message.lockID.toString() : undefined;
    obj.positionID = message.positionID
      ? message.positionID.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateFullRangePositionAndSuperfluidDelegateResponseAminoMsg
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponse {
    return MsgCreateFullRangePositionAndSuperfluidDelegateResponse.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: MsgCreateFullRangePositionAndSuperfluidDelegateResponse
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponseAminoMsg {
    return {
      type: "osmosis/create-full-range-position-and-superfluid-delegate-response",
      value:
        MsgCreateFullRangePositionAndSuperfluidDelegateResponse.toAmino(
          message
        ),
    };
  },
  fromProtoMsg(
    message: MsgCreateFullRangePositionAndSuperfluidDelegateResponseProtoMsg
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponse {
    return MsgCreateFullRangePositionAndSuperfluidDelegateResponse.decode(
      message.value
    );
  },
  toProto(
    message: MsgCreateFullRangePositionAndSuperfluidDelegateResponse
  ): Uint8Array {
    return MsgCreateFullRangePositionAndSuperfluidDelegateResponse.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgCreateFullRangePositionAndSuperfluidDelegateResponse
  ): MsgCreateFullRangePositionAndSuperfluidDelegateResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.superfluid.MsgCreateFullRangePositionAndSuperfluidDelegateResponse",
      value:
        MsgCreateFullRangePositionAndSuperfluidDelegateResponse.encode(
          message
        ).finish(),
    };
  },
};
function createBaseMsgUnPoolWhitelistedPool(): MsgUnPoolWhitelistedPool {
  return {
    sender: "",
    poolId: Long.UZERO,
  };
}
export const MsgUnPoolWhitelistedPool = {
  typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
  encode(
    message: MsgUnPoolWhitelistedPool,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnPoolWhitelistedPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnPoolWhitelistedPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgUnPoolWhitelistedPool>
  ): MsgUnPoolWhitelistedPool {
    const message = createBaseMsgUnPoolWhitelistedPool();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: MsgUnPoolWhitelistedPoolAmino): MsgUnPoolWhitelistedPool {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: MsgUnPoolWhitelistedPool): MsgUnPoolWhitelistedPoolAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgUnPoolWhitelistedPoolAminoMsg
  ): MsgUnPoolWhitelistedPool {
    return MsgUnPoolWhitelistedPool.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgUnPoolWhitelistedPool
  ): MsgUnPoolWhitelistedPoolAminoMsg {
    return {
      type: "osmosis/unpool-whitelisted-pool",
      value: MsgUnPoolWhitelistedPool.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgUnPoolWhitelistedPoolProtoMsg
  ): MsgUnPoolWhitelistedPool {
    return MsgUnPoolWhitelistedPool.decode(message.value);
  },
  toProto(message: MsgUnPoolWhitelistedPool): Uint8Array {
    return MsgUnPoolWhitelistedPool.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUnPoolWhitelistedPool
  ): MsgUnPoolWhitelistedPoolProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
      value: MsgUnPoolWhitelistedPool.encode(message).finish(),
    };
  },
};
function createBaseMsgUnPoolWhitelistedPoolResponse(): MsgUnPoolWhitelistedPoolResponse {
  return {
    exitedLockIds: [],
  };
}
export const MsgUnPoolWhitelistedPoolResponse = {
  typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse",
  encode(
    message: MsgUnPoolWhitelistedPoolResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.exitedLockIds) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnPoolWhitelistedPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgUnPoolWhitelistedPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.exitedLockIds.push(reader.uint64() as Long);
            }
          } else {
            message.exitedLockIds.push(reader.uint64() as Long);
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgUnPoolWhitelistedPoolResponse>
  ): MsgUnPoolWhitelistedPoolResponse {
    const message = createBaseMsgUnPoolWhitelistedPoolResponse();
    message.exitedLockIds =
      object.exitedLockIds?.map((e) => Long.fromValue(e)) || [];
    return message;
  },
  fromAmino(
    object: MsgUnPoolWhitelistedPoolResponseAmino
  ): MsgUnPoolWhitelistedPoolResponse {
    return {
      exitedLockIds: Array.isArray(object?.exited_lock_ids)
        ? object.exited_lock_ids.map((e: any) => e)
        : [],
    };
  },
  toAmino(
    message: MsgUnPoolWhitelistedPoolResponse
  ): MsgUnPoolWhitelistedPoolResponseAmino {
    const obj: any = {};
    if (message.exitedLockIds) {
      obj.exited_lock_ids = message.exitedLockIds.map((e) => e);
    } else {
      obj.exited_lock_ids = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgUnPoolWhitelistedPoolResponseAminoMsg
  ): MsgUnPoolWhitelistedPoolResponse {
    return MsgUnPoolWhitelistedPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgUnPoolWhitelistedPoolResponse
  ): MsgUnPoolWhitelistedPoolResponseAminoMsg {
    return {
      type: "osmosis/un-pool-whitelisted-pool-response",
      value: MsgUnPoolWhitelistedPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgUnPoolWhitelistedPoolResponseProtoMsg
  ): MsgUnPoolWhitelistedPoolResponse {
    return MsgUnPoolWhitelistedPoolResponse.decode(message.value);
  },
  toProto(message: MsgUnPoolWhitelistedPoolResponse): Uint8Array {
    return MsgUnPoolWhitelistedPoolResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgUnPoolWhitelistedPoolResponse
  ): MsgUnPoolWhitelistedPoolResponseProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPoolResponse",
      value: MsgUnPoolWhitelistedPoolResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgUnlockAndMigrateSharesToFullRangeConcentratedPosition(): MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition {
  return {
    sender: "",
    lockId: Long.UZERO,
    sharesToMigrate: undefined,
    tokenOutMins: [],
  };
}
export const MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition = {
  typeUrl:
    "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition",
  encode(
    message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.lockId.isZero()) {
      writer.uint32(16).uint64(message.lockId);
    }
    if (message.sharesToMigrate !== undefined) {
      Coin.encode(message.sharesToMigrate, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.tokenOutMins) {
      Coin.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message =
      createBaseMsgUnlockAndMigrateSharesToFullRangeConcentratedPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.lockId = reader.uint64() as Long;
          break;
        case 3:
          message.sharesToMigrate = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.tokenOutMins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition>
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition {
    const message =
      createBaseMsgUnlockAndMigrateSharesToFullRangeConcentratedPosition();
    message.sender = object.sender ?? "";
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    message.sharesToMigrate =
      object.sharesToMigrate !== undefined && object.sharesToMigrate !== null
        ? Coin.fromPartial(object.sharesToMigrate)
        : undefined;
    message.tokenOutMins =
      object.tokenOutMins?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionAmino
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition {
    return {
      sender: object.sender,
      lockId: Long.fromString(object.lock_id),
      sharesToMigrate: object?.shares_to_migrate
        ? Coin.fromAmino(object.shares_to_migrate)
        : undefined,
      tokenOutMins: Array.isArray(object?.token_out_mins)
        ? object.token_out_mins.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    obj.shares_to_migrate = message.sharesToMigrate
      ? Coin.toAmino(message.sharesToMigrate)
      : undefined;
    if (message.tokenOutMins) {
      obj.token_out_mins = message.tokenOutMins.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.token_out_mins = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionAminoMsg
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition {
    return MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionAminoMsg {
    return {
      type: "osmosis/unlock-and-migrate-shares-to-full-range-concentrated-position",
      value:
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.toAmino(
          message
        ),
    };
  },
  fromProtoMsg(
    message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionProtoMsg
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition {
    return MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.decode(
      message.value
    );
  },
  toProto(
    message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
  ): Uint8Array {
    return MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition
  ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionProtoMsg {
    return {
      typeUrl:
        "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition",
      value:
        MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.encode(
          message
        ).finish(),
    };
  },
};
function createBaseMsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse(): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse {
  return {
    amount0: "",
    amount1: "",
    liquidityCreated: "",
    joinTime: undefined,
  };
}
export const MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse =
  {
    typeUrl:
      "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse",
    encode(
      message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse,
      writer: _m0.Writer = _m0.Writer.create()
    ): _m0.Writer {
      if (message.amount0 !== "") {
        writer.uint32(10).string(message.amount0);
      }
      if (message.amount1 !== "") {
        writer.uint32(18).string(message.amount1);
      }
      if (message.liquidityCreated !== "") {
        writer.uint32(26).string(message.liquidityCreated);
      }
      if (message.joinTime !== undefined) {
        Timestamp.encode(
          toTimestamp(message.joinTime),
          writer.uint32(34).fork()
        ).ldelim();
      }
      return writer;
    },
    decode(
      input: _m0.Reader | Uint8Array,
      length?: number
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse {
      const reader =
        input instanceof _m0.Reader ? input : new _m0.Reader(input);
      const end = length === undefined ? reader.len : reader.pos + length;
      const message =
        createBaseMsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse();
      while (reader.pos < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.amount0 = reader.string();
            break;
          case 2:
            message.amount1 = reader.string();
            break;
          case 3:
            message.liquidityCreated = reader.string();
            break;
          case 4:
            message.joinTime = fromTimestamp(
              Timestamp.decode(reader, reader.uint32())
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
      object: Partial<MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse>
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse {
      const message =
        createBaseMsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse();
      message.amount0 = object.amount0 ?? "";
      message.amount1 = object.amount1 ?? "";
      message.liquidityCreated = object.liquidityCreated ?? "";
      message.joinTime = object.joinTime ?? undefined;
      return message;
    },
    fromAmino(
      object: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseAmino
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse {
      return {
        amount0: object.amount0,
        amount1: object.amount1,
        liquidityCreated: object.liquidity_created,
        joinTime: object?.join_time
          ? Timestamp.fromAmino(object.join_time)
          : undefined,
      };
    },
    toAmino(
      message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseAmino {
      const obj: any = {};
      obj.amount0 = message.amount0;
      obj.amount1 = message.amount1;
      obj.liquidity_created = message.liquidityCreated;
      obj.join_time = message.joinTime
        ? Timestamp.toAmino(message.joinTime)
        : undefined;
      return obj;
    },
    fromAminoMsg(
      object: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseAminoMsg
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse {
      return MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.fromAmino(
        object.value
      );
    },
    toAminoMsg(
      message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseAminoMsg {
      return {
        type: "osmosis/unlock-and-migrate-shares-to-full-range-concentrated-position-response",
        value:
          MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.toAmino(
            message
          ),
      };
    },
    fromProtoMsg(
      message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseProtoMsg
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse {
      return MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.decode(
        message.value
      );
    },
    toProto(
      message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse
    ): Uint8Array {
      return MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.encode(
        message
      ).finish();
    },
    toProtoMsg(
      message: MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse
    ): MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponseProtoMsg {
      return {
        typeUrl:
          "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse",
        value:
          MsgUnlockAndMigrateSharesToFullRangeConcentratedPositionResponse.encode(
            message
          ).finish(),
      };
    },
  };
function createBaseMsgAddToConcentratedLiquiditySuperfluidPosition(): MsgAddToConcentratedLiquiditySuperfluidPosition {
  return {
    positionId: Long.UZERO,
    sender: "",
    tokenDesired0: undefined,
    tokenDesired1: undefined,
  };
}
export const MsgAddToConcentratedLiquiditySuperfluidPosition = {
  typeUrl:
    "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPosition",
  encode(
    message: MsgAddToConcentratedLiquiditySuperfluidPosition,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.sender !== "") {
      writer.uint32(18).string(message.sender);
    }
    if (message.tokenDesired0 !== undefined) {
      Coin.encode(message.tokenDesired0, writer.uint32(26).fork()).ldelim();
    }
    if (message.tokenDesired1 !== undefined) {
      Coin.encode(message.tokenDesired1, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAddToConcentratedLiquiditySuperfluidPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgAddToConcentratedLiquiditySuperfluidPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        case 2:
          message.sender = reader.string();
          break;
        case 3:
          message.tokenDesired0 = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.tokenDesired1 = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgAddToConcentratedLiquiditySuperfluidPosition>
  ): MsgAddToConcentratedLiquiditySuperfluidPosition {
    const message = createBaseMsgAddToConcentratedLiquiditySuperfluidPosition();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    message.sender = object.sender ?? "";
    message.tokenDesired0 =
      object.tokenDesired0 !== undefined && object.tokenDesired0 !== null
        ? Coin.fromPartial(object.tokenDesired0)
        : undefined;
    message.tokenDesired1 =
      object.tokenDesired1 !== undefined && object.tokenDesired1 !== null
        ? Coin.fromPartial(object.tokenDesired1)
        : undefined;
    return message;
  },
  fromAmino(
    object: MsgAddToConcentratedLiquiditySuperfluidPositionAmino
  ): MsgAddToConcentratedLiquiditySuperfluidPosition {
    return {
      positionId: Long.fromString(object.position_id),
      sender: object.sender,
      tokenDesired0: object?.token_desired0
        ? Coin.fromAmino(object.token_desired0)
        : undefined,
      tokenDesired1: object?.token_desired1
        ? Coin.fromAmino(object.token_desired1)
        : undefined,
    };
  },
  toAmino(
    message: MsgAddToConcentratedLiquiditySuperfluidPosition
  ): MsgAddToConcentratedLiquiditySuperfluidPositionAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    obj.sender = message.sender;
    obj.token_desired0 = message.tokenDesired0
      ? Coin.toAmino(message.tokenDesired0)
      : undefined;
    obj.token_desired1 = message.tokenDesired1
      ? Coin.toAmino(message.tokenDesired1)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgAddToConcentratedLiquiditySuperfluidPositionAminoMsg
  ): MsgAddToConcentratedLiquiditySuperfluidPosition {
    return MsgAddToConcentratedLiquiditySuperfluidPosition.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: MsgAddToConcentratedLiquiditySuperfluidPosition
  ): MsgAddToConcentratedLiquiditySuperfluidPositionAminoMsg {
    return {
      type: "osmosis/add-to-concentrated-liquidity-superfluid-position",
      value: MsgAddToConcentratedLiquiditySuperfluidPosition.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgAddToConcentratedLiquiditySuperfluidPositionProtoMsg
  ): MsgAddToConcentratedLiquiditySuperfluidPosition {
    return MsgAddToConcentratedLiquiditySuperfluidPosition.decode(
      message.value
    );
  },
  toProto(
    message: MsgAddToConcentratedLiquiditySuperfluidPosition
  ): Uint8Array {
    return MsgAddToConcentratedLiquiditySuperfluidPosition.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgAddToConcentratedLiquiditySuperfluidPosition
  ): MsgAddToConcentratedLiquiditySuperfluidPositionProtoMsg {
    return {
      typeUrl:
        "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPosition",
      value:
        MsgAddToConcentratedLiquiditySuperfluidPosition.encode(
          message
        ).finish(),
    };
  },
};
function createBaseMsgAddToConcentratedLiquiditySuperfluidPositionResponse(): MsgAddToConcentratedLiquiditySuperfluidPositionResponse {
  return {
    positionId: Long.UZERO,
    amount0: "",
    amount1: "",
    newLiquidity: "",
    lockId: Long.UZERO,
  };
}
export const MsgAddToConcentratedLiquiditySuperfluidPositionResponse = {
  typeUrl:
    "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPositionResponse",
  encode(
    message: MsgAddToConcentratedLiquiditySuperfluidPositionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.positionId.isZero()) {
      writer.uint32(8).uint64(message.positionId);
    }
    if (message.amount0 !== "") {
      writer.uint32(18).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(26).string(message.amount1);
    }
    if (message.newLiquidity !== "") {
      writer.uint32(42).string(message.newLiquidity);
    }
    if (!message.lockId.isZero()) {
      writer.uint32(32).uint64(message.lockId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message =
      createBaseMsgAddToConcentratedLiquiditySuperfluidPositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.positionId = reader.uint64() as Long;
          break;
        case 2:
          message.amount0 = reader.string();
          break;
        case 3:
          message.amount1 = reader.string();
          break;
        case 5:
          message.newLiquidity = reader.string();
          break;
        case 4:
          message.lockId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgAddToConcentratedLiquiditySuperfluidPositionResponse>
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponse {
    const message =
      createBaseMsgAddToConcentratedLiquiditySuperfluidPositionResponse();
    message.positionId =
      object.positionId !== undefined && object.positionId !== null
        ? Long.fromValue(object.positionId)
        : Long.UZERO;
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    message.newLiquidity = object.newLiquidity ?? "";
    message.lockId =
      object.lockId !== undefined && object.lockId !== null
        ? Long.fromValue(object.lockId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgAddToConcentratedLiquiditySuperfluidPositionResponseAmino
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponse {
    return {
      positionId: Long.fromString(object.position_id),
      amount0: object.amount0,
      amount1: object.amount1,
      newLiquidity: object.new_liquidity,
      lockId: Long.fromString(object.lock_id),
    };
  },
  toAmino(
    message: MsgAddToConcentratedLiquiditySuperfluidPositionResponse
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponseAmino {
    const obj: any = {};
    obj.position_id = message.positionId
      ? message.positionId.toString()
      : undefined;
    obj.amount0 = message.amount0;
    obj.amount1 = message.amount1;
    obj.new_liquidity = message.newLiquidity;
    obj.lock_id = message.lockId ? message.lockId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgAddToConcentratedLiquiditySuperfluidPositionResponseAminoMsg
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponse {
    return MsgAddToConcentratedLiquiditySuperfluidPositionResponse.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: MsgAddToConcentratedLiquiditySuperfluidPositionResponse
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponseAminoMsg {
    return {
      type: "osmosis/add-to-concentrated-liquidity-superfluid-position-response",
      value:
        MsgAddToConcentratedLiquiditySuperfluidPositionResponse.toAmino(
          message
        ),
    };
  },
  fromProtoMsg(
    message: MsgAddToConcentratedLiquiditySuperfluidPositionResponseProtoMsg
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponse {
    return MsgAddToConcentratedLiquiditySuperfluidPositionResponse.decode(
      message.value
    );
  },
  toProto(
    message: MsgAddToConcentratedLiquiditySuperfluidPositionResponse
  ): Uint8Array {
    return MsgAddToConcentratedLiquiditySuperfluidPositionResponse.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgAddToConcentratedLiquiditySuperfluidPositionResponse
  ): MsgAddToConcentratedLiquiditySuperfluidPositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.superfluid.MsgAddToConcentratedLiquiditySuperfluidPositionResponse",
      value:
        MsgAddToConcentratedLiquiditySuperfluidPositionResponse.encode(
          message
        ).finish(),
    };
  },
};
