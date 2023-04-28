//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../helpers";
import {
  PeriodLock,
  PeriodLockAmino,
  PeriodLockSDKType,
  SyntheticLock,
  SyntheticLockAmino,
  SyntheticLockSDKType,
} from "./lock";
/** GenesisState defines the lockup module's genesis state. */
export interface GenesisState {
  lastLockId: Long;
  locks: PeriodLock[];
  syntheticLocks: SyntheticLock[];
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.lockup.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the lockup module's genesis state. */
export interface GenesisStateAmino {
  last_lock_id: string;
  locks: PeriodLockAmino[];
  synthetic_locks: SyntheticLockAmino[];
}
export interface GenesisStateAminoMsg {
  type: "osmosis/lockup/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the lockup module's genesis state. */
export interface GenesisStateSDKType {
  last_lock_id: Long;
  locks: PeriodLockSDKType[];
  synthetic_locks: SyntheticLockSDKType[];
}
function createBaseGenesisState(): GenesisState {
  return {
    lastLockId: Long.UZERO,
    locks: [],
    syntheticLocks: [],
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.lockup.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.lastLockId.isZero()) {
      writer.uint32(8).uint64(message.lastLockId);
    }
    for (const v of message.locks) {
      PeriodLock.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.syntheticLocks) {
      SyntheticLock.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.lastLockId = reader.uint64() as Long;
          break;
        case 2:
          message.locks.push(PeriodLock.decode(reader, reader.uint32()));
          break;
        case 3:
          message.syntheticLocks.push(
            SyntheticLock.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.lastLockId =
      object.lastLockId !== undefined && object.lastLockId !== null
        ? Long.fromValue(object.lastLockId)
        : Long.UZERO;
    message.locks = object.locks?.map((e) => PeriodLock.fromPartial(e)) || [];
    message.syntheticLocks =
      object.syntheticLocks?.map((e) => SyntheticLock.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      lastLockId: Long.fromString(object.last_lock_id),
      locks: Array.isArray(object?.locks)
        ? object.locks.map((e: any) => PeriodLock.fromAmino(e))
        : [],
      syntheticLocks: Array.isArray(object?.synthetic_locks)
        ? object.synthetic_locks.map((e: any) => SyntheticLock.fromAmino(e))
        : [],
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.last_lock_id = message.lastLockId
      ? message.lastLockId.toString()
      : undefined;
    if (message.locks) {
      obj.locks = message.locks.map((e) =>
        e ? PeriodLock.toAmino(e) : undefined
      );
    } else {
      obj.locks = [];
    }
    if (message.syntheticLocks) {
      obj.synthetic_locks = message.syntheticLocks.map((e) =>
        e ? SyntheticLock.toAmino(e) : undefined
      );
    } else {
      obj.synthetic_locks = [];
    }
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/lockup/genesis-state",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/osmosis.lockup.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
